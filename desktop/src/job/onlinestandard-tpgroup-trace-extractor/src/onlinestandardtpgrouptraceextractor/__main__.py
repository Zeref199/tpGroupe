import os
import time
import logging as log
from datetime import datetime, timezone, timedelta
from typing import List, Tuple, Optional

from elasticsearch.helpers import bulk
from elasticsearch import Elasticsearch
from elasticsearch_dsl import Search
from elasticsearch_dsl.query import Bool, Range, Nested, Term, Prefix

# Clean
# fix ees username,password format

SPAN_SERVICE_NAME = "next-onlinestandard-tpgroup-api"
TPGROUP_ES = os.getenv("TPGROUP_ES_URL", "https://beyond-int.es.cegedim.cloud:443")
TPGROUP_ES_USERNAME = os.getenv("TPGROUP_ES_USERNAME")
TPGROUP_ES_PASSWORD = os.getenv("TPGROUP_ES_PASSWORD")

CLIENT_ES = os.getenv("CLIENT_ES_URL", "http://localhost:9200")
CLIENT_ES_USERNAME = os.getenv("CLIENT_ES_USERNAME")
CLIENT_ES_PASSWORD = os.getenv("CLIENT_ES_PASSWORD")

tpgroup_span_index_name_prefix = os.getenv("TPGROUP_SPAN_INDEX_NAME_PREFIX", "jaeger-dev-jaeger-span-")
tpgroup_index_pattern = tpgroup_span_index_name_prefix  # + "*"
client_span_index_name = os.getenv("CLIENT_SPAN_INDEX_NAME_PREFIX", "client_index-")

log_level = os.getenv("LOG_LEVEL", "INFO").upper()
time_out = int(os.getenv("TIMEOUT", 200))
DOCUMENT_PAGINATION_SIZE = int(os.getenv("DOCUMENT_PAGINATION_SIZE", "100"))

log.basicConfig(format='%(levelname)s :: %(message)s', level=log.getLevelName(log_level))


def create_elasticsearch_client(url: str, credentials: Optional[str] = None, timeout: int = 200) -> Elasticsearch:
    """Create and return an Elasticsearch client."""
    auth = {'http_auth': credentials.split(',')} if credentials else {}
    return Elasticsearch(hosts=url, timeout=timeout, **auth)


tpgroup_es = create_elasticsearch_client(TPGROUP_ES, f"{TPGROUP_ES_USERNAME}:{TPGROUP_ES_PASSWORD}", time_out)
client_es = create_elasticsearch_client(CLIENT_ES, f"{CLIENT_ES_USERNAME}:{CLIENT_ES_PASSWORD}", time_out)

saved_jaeger_services = []

page_ = 0
default_start_time = time.mktime((1970, 1, 1, 0, 0, 0, 0, 0, 0)) * 1e6

def extract_and_map(offset):
    query = build_span_search_query(offset)
    results = query.execute()
    dtos = []
    for hit in results.hits.hits:
        span = hit['_source']
        if is_external_call(span):
            try:
                dto = map_to_dto(span)
                dtos.append(dto)
            except Exception as ex:
                log.error("could not map " + str(ex) + " ,span: " + str(span))
    has_next = len(results.hits.hits) == DOCUMENT_PAGINATION_SIZE
    return dtos, has_next


def build_span_search_query(start_time):
    """Build and return a search query for spans."""
    query = Bool(
        must=[
            Prefix(_index=tpgroup_index_pattern),
            Term(**{'process.serviceName': SPAN_SERVICE_NAME}),
            Range(startTime={"gte": start_time}),
        ],
        must_not=[
            Nested(
                path="references",
                query=Term(**{"references.refType": "CHILD_OF"})
            )
        ]
    )
    return Search(using=tpgroup_es) \
        .sort({"startTime": {"order": "asc"}}) \
        .extra(size=DOCUMENT_PAGINATION_SIZE, from_=page_ * DOCUMENT_PAGINATION_SIZE) \
        .query(query)


def get_last_starttime():
    result = Search(using=client_es) \
        .sort({"parentTrace.processingdateMicroSeconds": {"order": "desc", 'unmapped_type': 'long'}}) \
        .extra(size=1) \
        .query(Prefix(_index=client_span_index_name)) \
        .execute()
    try:
        return result['hits']['hits'][0]['_source']['parentTrace']['processingdateMicroSeconds']
    except (KeyError, IndexError):
        return None


def migrate():
    global page_
    log.info("Extracting started at " + str(datetime.now()))
    last_starttime = get_last_starttime() or default_start_time
    offset = last_starttime
    log.info("Start with offset " + str(offset))

    while True:
        client_spans, has_next = extract_and_map(offset)
        log.info(f"extracted {len(client_spans)} spans")
        if client_spans:
            bulk(client_es, [{'_index': client_span_index_name, '_source': trace} for trace in client_spans])
        page_ += 1
        if not has_next:
            break
    log.info("Migration Finished at " + str(datetime.now()))


def get_trace_spans(trace_id):
    query = Term(**{'traceID': trace_id})
    result = Search(using=tpgroup_es).query(query).execute()
    if not (hasattr(result, 'hits') and hasattr(result['hits'], 'hits')):
        return None
    return [
        hit['_source']
        for hit in result['hits']['hits']
    ]


def is_external_call(span):
    return get_span_tag_value(span, 'isExternalCall') == "true"


def get_span_tag_value(span, name: str):
    return next((tag['value'] for tag in span.tags if tag['key'] == name), None)

def map_span(span):
    dto_span = {
        "serviceName": span['operationName'],
        "processingdate": datetime.fromtimestamp(span['startTime'] / 1e6, timezone(timedelta(hours=1))).replace(
            tzinfo=None).isoformat(timespec='milliseconds'),
        "processingdateMicroSeconds": span['startTime'],
        "responseTime": int(span['duration']) if span['duration'] is not None else None,
        "providerNumber": get_span_tag_value(span, 'request.num.ps'),
        "organizationNumber": get_span_tag_value(span, 'request.num.amc'),
        "beneficiaryIdentificationNumber": get_span_tag_value(span, 'request.insee.beneficiaire'),
        "cgpassExternalReference": get_span_tag_value(span, 'request.reference.externe'),
        "returnCode": get_span_tag_value(span, 'response.fault.sub-code'),
        "returnlabel": get_span_tag_value(span, 'response.fault.string'),
        "url": get_span_tag_value(span, 'request.uri'),
        "request": get_span_tag_value(span, 'request.content'),
        "response": get_span_tag_value(span, 'response.content'),
        'traceId': span['traceID'],
        'spanId': span['spanID']
    }
    if any(r['refType'] == "CHILD_OF" for r in span['references']):
        dto_span['parentId'] = span['references'][0]['spanID']

    return dto_span

def map_to_dto(parent_span):
    spans = get_trace_spans(parent_span['traceID'])
    child_traces = [map_span(child) for child in spans if len(child['references']) != 0 and is_external_call(child)]
    return {
        "childTrace": child_traces,
        "parentTrace": map_span(parent_span)
    }
migrate()
