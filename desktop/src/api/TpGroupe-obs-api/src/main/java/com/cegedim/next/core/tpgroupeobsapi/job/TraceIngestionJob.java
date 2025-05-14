package com.cegedim.next.core.tpgroupeobsapi.job;

import com.cegedim.next.core.tpgroupeobsapi.helpers.TraceDetailsExtractor;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.http.HttpHost;
import org.elasticsearch.action.index.IndexRequest;
import org.elasticsearch.action.search.*;
import org.elasticsearch.client.RequestOptions;
import org.elasticsearch.client.RestClient;
import org.elasticsearch.client.RestHighLevelClient;
import org.elasticsearch.client.Request;
import org.elasticsearch.common.unit.TimeValue;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.search.Scroll;
import org.elasticsearch.search.SearchHit;
import org.elasticsearch.search.builder.SearchSourceBuilder;
import org.elasticsearch.search.sort.SortOrder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.Instant;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Service
@EnableScheduling
public class TraceIngestionJob {
    private static final Logger log = LoggerFactory.getLogger(TraceIngestionJob.class);

    // only the small fields we need
    private static final String[] BACKFILL_INCLUDES = {
            "traceID", "operationName", "startTimeMillis", "duration", "tags"
    };

    private static final int BATCH_SIZE = 10;

    private final RestHighLevelClient prodEsClient;
    private final RestHighLevelClient devEsClient;
    private final TraceDetailsExtractor extractor;
    private final String indexPrefix;


    public TraceIngestionJob(
            @Qualifier("esClient") RestHighLevelClient prodEsClient,
            @Qualifier("devEsClient") RestHighLevelClient devEsClient,
            TraceDetailsExtractor extractor,
            @Value("${storage.elasticsearch.indexPrefix}") String indexPrefix
    ) {
        this.prodEsClient = prodEsClient;
        this.devEsClient  = devEsClient;
        this.extractor    = extractor;
        this.indexPrefix  = indexPrefix;
    }

    /**
     * Fetches every span in prod with startTimeMillis > sinceTs, pages by search_after,
     * and indexes them locally. Stops when no more hits.
     */
    private void backfillSince(long sinceTs) throws IOException {
        List<Object> lastSort = null;

        while (true) {
            SearchSourceBuilder src = new SearchSourceBuilder()
                    // only spans strictly newer than what we have
                    .query(QueryBuilders.rangeQuery("startTimeMillis").gt(sinceTs))
                    .fetchSource(BACKFILL_INCLUDES, null)
                    .size(BATCH_SIZE)
                    .sort("startTimeMillis", SortOrder.ASC)
                    .sort("traceID",       SortOrder.ASC);

            if (lastSort != null) {
                src.searchAfter(lastSort.toArray());
            }

            SearchRequest req = new SearchRequest("rp00-es14-jaeger-span-*");
            req.source(src).setMaxConcurrentShardRequests(1);

            SearchResponse resp = prodEsClient.search(req, RequestOptions.DEFAULT);
            SearchHit[] hits = resp.getHits().getHits();

            if (hits.length == 0) {
                log.info("backfillSince({}) complete.", sinceTs);
                break;
            }

            processHits(hits);

            // prepare the search_after cursor for the next page
            lastSort = Arrays.asList(hits[hits.length - 1].getSortValues());
        }
    }

    /** Kick off the historical backfill after the app is ready. */
    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        new Thread(() -> {
            try {
                // 1) Determine where to resume from
                SearchRequest maxReq = new SearchRequest(indexPrefix + "-traces*")
                        .source(new SearchSourceBuilder()
                                .size(1)
                                .sort("startTimeMillis", SortOrder.DESC)
                                .fetchSource(false));
                SearchResponse maxResp = devEsClient.search(maxReq, RequestOptions.DEFAULT);
                SearchHit[] maxHits = maxResp.getHits().getHits();

                if (maxHits.length > 0) {
                    long sinceTs = ((Number)maxHits[0].getSortValues()[0]).longValue();
                    log.info("Resuming from {}", sinceTs);
                    // 2) Backfill *only* the spans newer than that
                    backfillSince(sinceTs);
                } else {
                    log.info("No existing docs, doing full backfill");
                    backfillHistorical();
                }

                pollNew();

            } catch (Exception e) {
                log.error("Historical backfill initialization failed", e);
            }
        }, "trace-backfill").start();
    }

    @Scheduled(initialDelayString = "0", fixedDelayString = "${poll.delay.ms:30000}")
    public void pollNew() {
        try {
            SearchSourceBuilder localSrc = new SearchSourceBuilder()
                    .size(1)
                    .sort("startTimeMillis", SortOrder.DESC)
                    .fetchSource(false);
            SearchRequest localReq = new SearchRequest(indexPrefix + "-traces*")
                    .source(localSrc);
            SearchResponse localResp = devEsClient.search(localReq, RequestOptions.DEFAULT);

            long sinceTs = 0L;
            SearchHit[] localHits = localResp.getHits().getHits();
            if (localHits.length > 0) {
                sinceTs = ((Number) localHits[0].getSortValues()[0]).longValue();
            }

            // 2) Now page through prod for everything newer than sinceTs
            List<Object> lastSort = null;
            while (true) {
                SearchSourceBuilder prodSrc = new SearchSourceBuilder()
                        .query(QueryBuilders.rangeQuery("startTimeMillis").gt(sinceTs))
                        .fetchSource(BACKFILL_INCLUDES, null)
                        .size(BATCH_SIZE)
                        .sort("startTimeMillis", SortOrder.ASC)
                        .sort("traceID",       SortOrder.ASC);

                if (lastSort != null) {
                    prodSrc.searchAfter(lastSort.toArray());
                }

                SearchRequest prodReq = new SearchRequest("rp00-es14-jaeger-span-*");
                prodReq.source(prodSrc);
                prodReq.setMaxConcurrentShardRequests(1);

                SearchResponse prodResp = prodEsClient.search(prodReq, RequestOptions.DEFAULT);
                SearchHit[] hits = prodResp.getHits().getHits();
                if (hits.length == 0) {
                    break;
                }
                processHits(hits);
                lastSort = Arrays.asList(hits[hits.length - 1].getSortValues());
            }

        } catch (Exception e) {
            log.warn("Incremental poll failed", e);
        }
    }

    /** Page‐by‐page backfill via search_after (no max_result_window issues). */
    private void backfillHistorical() throws IOException {
        List<Object> lastSort = null;

        while (true) {
            SearchSourceBuilder src = new SearchSourceBuilder()
                    .query(QueryBuilders.matchAllQuery())
                    .fetchSource(BACKFILL_INCLUDES, null)
                    .size(BATCH_SIZE)
                    .sort("startTimeMillis", SortOrder.ASC)
                    .sort("traceID",       SortOrder.ASC);

            if (lastSort != null) {
                src.searchAfter(lastSort.toArray());
            }

            SearchRequest req = new SearchRequest("rp00-es14-jaeger-span-*");
            req.source(src);
            req.setMaxConcurrentShardRequests(1);

            SearchResponse resp = prodEsClient.search(req, RequestOptions.DEFAULT);
            SearchHit[] hits = resp.getHits().getHits();
            if (hits.length == 0) {
                log.info("Backfill complete.");
                break;
            }

            processHits(hits);

            // capture the sort values for the *last* hit
            lastSort = Arrays.asList(hits[hits.length - 1].getSortValues());
        }
    }

    /** Applies your TraceDetailsExtractor and upserts each hit into the dev ES index. */
    @SuppressWarnings("unchecked")
    private void processHits(SearchHit[] hits) {
        RestClient lowLevel = devEsClient.getLowLevelClient();
        ObjectMapper mapper = new ObjectMapper();
        String indexName   = indexPrefix + "-traces";

        for (SearchHit hit : hits) {
            try {
                Map<String,Object> src = hit.getSourceAsMap();
                String spanId  = hit.getId();
                String traceId = (String) src.get("traceID");
                String op      = (String) src.get("operationName");
                long start     = ((Number) src.get("startTimeMillis")).longValue();
                long dur       = ((Number) src.get("duration")).longValue();
                List<Map<String,Object>> rawTags =
                        (List<Map<String,Object>>) src.get("tags");

                Map<String,String> tags = rawTags.stream().collect(Collectors.toMap(
                        t -> (String) t.get("key"),
                        t -> t.get("value").toString(),
                        (a, b) -> b
                ));

                Map<String,String> details = extractor.extract(op, tags);

                Map<String,Object> json = Map.of(
                        "traceID",         traceId,
                        "operation",       op,
                        "startTimeMillis", start,
                        "duration",        dur,
                        "details",         details
                );

                Request req = new Request("PUT", "/" + indexName + "/_doc/" + spanId);
                req.addParameter("timeout", "1m");
                req.setJsonEntity(mapper.writeValueAsString(json));
                lowLevel.performRequest(req);
            } catch (Exception e) {
                log.warn("Failed to index trace {}: {}", hit.getId(), e.getMessage());
            }
        }
        // once this method returns, 'hits' is out of scope and can be GC'd
    }
}
