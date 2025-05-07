import os
import time
import logging
from datetime import datetime, timezone, timedelta

from elasticsearch import Elasticsearch
from elasticsearch.helpers import bulk
from elasticsearch_dsl import Search, Q

from trace_details_extractor import extract_details

# ─── CONFIG FROM ENV ───────────────────────────────────────────────────────────

ES_SRC_URL     = os.getenv("ES_SRC_URL",     "https://beyond-log-prod.es.cegedim.cloud:443")
ES_SRC_USER    = os.getenv("ES_SRC_USER",    "admin")
ES_SRC_PASS    = os.getenv("ES_SRC_PASS",    "mVC%w=EzLo3+")
SRC_INDEX      = os.getenv("SRC_INDEX",      "rp00-es14-jaeger-span-*")

# ES_DST_URL     = os.getenv("ES_DST_URL",     "https://beyond-int.es.cegedim.cloud:443")
# ES_DST_USER    = os.getenv("ES_DST_USER",    "jaeger-dev")
# ES_DST_PASS    = os.getenv("ES_DST_PASS",    "jaeger-dev")
# DST_INDEX      = os.getenv("DST_INDEX",      "dev-obs-*")

ES_DST_URL   = "http://localhost:9200"
ES_DST_USER  = None    # no auth against your local Docker ES
ES_DST_PASS  = None
DST_INDEX    = "dev-obs-test"    # pick a concrete index name (no wildcard)

PAGE_SIZE      = int(os.getenv("PAGE_SIZE",      "100"))
POLL_INTERVAL  = int(os.getenv("POLL_INTERVAL",  "5"))
SERVICE_NAME   = os.getenv("SERVICE_NAME",     "next-onlinestandard-tpgroup-api")

# ─── LOGGER SETUP ──────────────────────────────────────────────────────────────

logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s %(levelname)-8s %(message)s")
log = logging.getLogger(__name__)

# ─── ES CLIENTS ────────────────────────────────────────────────────────────────

def make_client(url, user=None, pwd=None):
    kwargs = {
        "hosts": [url],
        "connection_class": RequestsHttpConnection,
        "request_timeout": 60,
        "headers": {
            "Content-Type": "application/json",
            "Accept":       "application/json"
        }
    }
    if user and pwd:
        kwargs["basic_auth"] = (user, pwd)
    return Elasticsearch(**kwargs)

es_src  = make_client(ES_SRC_URL, ES_SRC_USER, ES_SRC_PASS)
es_dest = make_client(ES_DST_URL, ES_DST_USER, ES_DST_PASS)

# ─── HELPERS ──────────────────────────────────────────────────────────────────

def get_last_starttime() -> int:
    """Highest processingdateMicroSeconds in dst, or 0."""
    s = Search(using=es_dest, index=DST_INDEX) \
        .sort({"parentTrace.processingdateMicroSeconds": {"order":"desc","unmapped_type":"long"}}) \
        .extra(size=1)
    resp = s.execute()
    try:
        return resp.hits[0]._source["parentTrace"]["processingdateMicroSeconds"]
    except Exception:
        return 0

def get_trace_spans(trace_id: str):
    """All spans for a traceID from source."""
    s = Search(using=es_src, index=SRC_INDEX) \
        .query("term", traceID=trace_id) \
        .extra(size=PAGE_SIZE)
    return [h.to_dict()["_source"] for h in s.execute().hits]

def map_span(span: dict) -> dict:
    """Build one span-DTO, injecting StAX‐extracted `details`."""
    tags = { t["key"]: t["value"] for t in span.get("tags", []) }
    details = extract_details(span.get("operationName",""), tags)

    iso = datetime.fromtimestamp(span["startTime"]/1e6,
                                timezone(timedelta(hours=1))) \
                 .replace(tzinfo=None) \
                 .isoformat(timespec="milliseconds")

    dto = {
        "traceId":   span.get("traceID"),
        "spanId":    span.get("spanID"),
        "operation": span.get("operationName"),
        "startTime": span.get("startTime"),
        "duration":  span.get("duration"),
        "details":   details,
        "parentTrace": {
            "processingdateMicroSeconds": span.get("startTime"),
            "processingdate": iso
        }
    }
    # propagate parentId if present
    for r in span.get("references", []):
        if r.get("refType") == "CHILD_OF":
            dto["parentId"] = r.get("spanID")
            break
    return dto

def map_to_dto(parent: dict) -> dict:
    """
    One parent + its external-child spans == one record.
    """
    children = []
    for child in get_trace_spans(parent["traceID"]):
        if any(r.get("refType")=="CHILD_OF" for r in child.get("references", [])) \
           and child.get("isExternalCall") == "true":
            children.append(map_span(child))

    return {
        "parentTrace": map_span(parent),
        "childTrace":  children
    }

def extract_and_map(offset: int, page: int):
    """
    One page of parent spans >= offset → list of DTOs, plus has_more flag.
    """
    s = Search(using=es_src, index=SRC_INDEX) \
        .query(
            Q("bool",
              must=[
                  Q("term", **{"process.serviceName": SERVICE_NAME}),
                  Q("range", startTime={"gte": offset})
              ],
              must_not=[
                  Q("nested",
                    path="references",
                    query=Q("term", **{"references.refType": "CHILD_OF"}))
              ]
            )
        ) \
        .sort({"startTime": {"order": "asc"}}) \
        .extra(from_=page*PAGE_SIZE, size=PAGE_SIZE)

    resp = s.execute()
    hits = resp.hits.hits
    dtos = [ map_to_dto(h.to_dict()["_source"]) for h in hits ]
    return dtos, (len(hits) == PAGE_SIZE)

# ─── MAIN: BACKFILL + TAIL ────────────────────────────────────────────────────

def migrate_and_tail():
    offset = get_last_starttime()
    log.info(f"Backfill starting from offset={offset}")
    page = 0

    # 1) Historical backfill
    while True:
        dtos, more = extract_and_map(offset, page)
        if not dtos:
            break
        log.info(f"Backfill: indexing {len(dtos)} traces (page {page})")
        bulk(es_dest, ({ "_index": DST_INDEX, "_source": d } for d in dtos),
             chunk_size=PAGE_SIZE)
        offset = max(d["parentTrace"]["processingdateMicroSeconds"] for d in dtos)
        page += 1
        if not more:
            break

    log.info("Backfill complete, entering tail loop…")

    # 2) Tail: poll forever for new spans
    while True:
        page = 0
        new_indexed = False

        while True:
            dtos, more = extract_and_map(offset, page)
            if not dtos:
                break
            log.info(f"Tail: indexing {len(dtos)} new traces (page {page})")
            bulk(es_dest, ({ "_index": DST_INDEX, "_source": d } for d in dtos),
                 chunk_size=PAGE_SIZE)
            offset = max(d["parentTrace"]["processingdateMicroSeconds"] for d in dtos)
            new_indexed = True
            page += 1
            if not more:
                break

        if not new_indexed:
            time.sleep(POLL_INTERVAL)

if __name__ == "__main__":
    migrate_and_tail()