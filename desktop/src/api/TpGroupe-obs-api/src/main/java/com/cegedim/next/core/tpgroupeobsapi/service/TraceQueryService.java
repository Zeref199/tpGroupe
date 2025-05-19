package com.cegedim.next.core.tpgroupeobsapi.service;

import com.cegedim.next.core.tpgroupeobsapi.dto.AmcStatusDTO;
import com.cegedim.next.core.tpgroupeobsapi.dto.ServiceProviderDTO;
import com.cegedim.next.core.tpgroupeobsapi.dto.TraceEventDTO;
import com.cegedim.next.core.tpgroupeobsapi.entity.AmcStatus;
import com.cegedim.next.core.tpgroupeobsapi.entity.ServiceProvider;
import com.cegedim.next.core.tpgroupeobsapi.helpers.TraceDetailsExtractor;
import com.cegedim.next.core.tpgroupeobsapi.mapper.AmcStatusMapper;
import com.cegedim.next.core.tpgroupeobsapi.mapper.ServiceProviderMapper;
import com.cegedim.next.core.tpgroupeobsapi.repository.AmcStatusRepository;
import com.cegedim.next.core.tpgroupeobsapi.repository.ServiceProviderRepository;
import com.cegedim.next.core.tpgroupeobsapi.repository.SubscriptionEventRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.elasticsearch.action.search.ClearScrollRequest;
import org.elasticsearch.action.search.SearchRequest;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.action.search.SearchScrollRequest;
import org.elasticsearch.client.RequestOptions;
import org.elasticsearch.client.RestHighLevelClient;
import org.elasticsearch.common.unit.TimeValue;
import org.elasticsearch.index.query.BoolQueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.index.query.RangeQueryBuilder;
import org.elasticsearch.search.Scroll;
import org.elasticsearch.search.SearchHit;
import org.elasticsearch.search.aggregations.AggregationBuilders;
import org.elasticsearch.search.aggregations.Aggregations;
import org.elasticsearch.search.aggregations.bucket.composite.CompositeAggregationBuilder;
import org.elasticsearch.search.aggregations.bucket.composite.ParsedComposite;
import org.elasticsearch.search.aggregations.bucket.composite.TermsValuesSourceBuilder;
import org.elasticsearch.search.aggregations.bucket.terms.Terms;
import org.elasticsearch.search.aggregations.bucket.terms.TermsAggregationBuilder;
import org.elasticsearch.search.builder.SearchSourceBuilder;
import org.elasticsearch.search.sort.SortOrder;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

import static org.elasticsearch.index.query.QueryBuilders.termsQuery;
import static org.elasticsearch.search.aggregations.AggregationBuilders.terms;

@Service
@Slf4j
public class TraceQueryService {

    private final RestHighLevelClient esClient;
    private final String indexPattern;
    private final ServiceProviderRepository providerRepo;
    private final SubscriptionEventRepository eventRepo;
    private final AmcStatusRepository amcStatusRepo;

    public TraceQueryService(
            @Qualifier("devEsClient") RestHighLevelClient esClient,
            @Value("${storage.elasticsearch.indexPrefix}") String indexPrefix,
            ServiceProviderRepository providerRepo,
            SubscriptionEventRepository eventRepo,
            AmcStatusRepository amcStatusRepo
    ) {
        this.esClient      = esClient;
        // wildcard over your enriched index, e.g. "dev-dev-traces*"
        this.indexPattern  = indexPrefix + "-traces*";
        this.providerRepo  = providerRepo;
        this.eventRepo     = eventRepo;
        this.amcStatusRepo = amcStatusRepo;
    }


    public List<TraceEventDTO> getTraces(
            String operation,
            String traceId,
            String numPs,
            String numAMC,
            Long from,
            Long to,
            int page,
            int size,
            String status,
            String direction
    ) throws IOException {
        BoolQueryBuilder query = QueryBuilders.boolQuery();
        List<String> internalOps = List.of(
                "ServiceProviderInitialize",
                "ServiceProviderSubscribe",
                "ServiceProviderUnsubscribe"
        );

        if (operation != null && !operation.isBlank()) {
            query.must(QueryBuilders.matchQuery("operation", operation));
        }

        if (traceId != null && !traceId.isBlank()) {
            query.must(QueryBuilders.matchQuery("traceID", traceId));
        }

        if (from != null || to != null) {
            RangeQueryBuilder range = QueryBuilders.rangeQuery("startTimeMillis");
            if (from != null) range.gte(from);
            if (to   != null) range.lte(to);
            query.must(range);
        }

        if (status != null && !status.isBlank()) {
            query.must(QueryBuilders.matchQuery("details.status", status));
        }

        if (numPs != null && !numPs.isBlank()) {
            query.must(QueryBuilders.matchQuery("details.request.num.ps", numPs));
        }

        if (numAMC != null && !numAMC.isBlank()) {
            query.must(QueryBuilders.matchQuery("details.request.num.amc", numAMC));
        }

        if ("inbound".equals(direction)) {
            query.must(QueryBuilders.prefixQuery("details.request.uri.keyword", "/tpgroup/ws/"));
        } else if ("outbound".equals(direction)) {
            query.mustNot(QueryBuilders.prefixQuery("details.request.uri.keyword", "/tpgroup/ws/"));
        } else if ("internal".equals(direction)) {
            query.must(QueryBuilders.termsQuery("operation.keyword", internalOps));
        }


        SearchSourceBuilder src = new SearchSourceBuilder()
                .query(query)
                .from(page * size)
                .size(size)
                .sort("startTimeMillis", SortOrder.DESC);

        SearchRequest req = new SearchRequest(indexPattern)
                .source(src);

        SearchResponse resp = esClient.search(req, RequestOptions.DEFAULT);

        List<TraceEventDTO> results = new ArrayList<>();
        for (SearchHit hit : resp.getHits().getHits()) {
            Map<String,Object> srcMap = hit.getSourceAsMap();

            results.add(TraceEventDTO.builder()
                    .traceId(       (String) srcMap.get("traceID"))
                    .operation(     (String) srcMap.get("operation"))
                    .startTime(     ((Number)srcMap.get("startTimeMillis")).longValue())
                    .duration(      ((Number)srcMap.get("duration")).longValue())
                    .details(       (Map<String,String>) srcMap.get("details"))
                    .build());
        }

        return results;
    }

    public long countTraces(
            String operation,
            Long from,
            Long to,
            String status
    ) throws IOException {
        BoolQueryBuilder query = QueryBuilders.boolQuery();

        if (operation != null && !operation.isBlank()) {
            query.must(QueryBuilders.matchQuery("operation", operation));
        }

        if (from != null || to != null) {
            RangeQueryBuilder range = QueryBuilders.rangeQuery("startTimeMillis");
            if (from != null) range.gte(from);
            if (to   != null) range.lte(to);
            query.must(range);
        }

        if (status != null && !status.isBlank()) {
            query.must(QueryBuilders.matchQuery("details.status", status));
        }

        // 2) Do a size=0, trackTotalHits search
        SearchSourceBuilder src = new SearchSourceBuilder()
                .query(query)
                .size(0)               // no hits back, just the count
                .trackTotalHits(true);

        SearchRequest req = new SearchRequest(indexPattern)
                .source(src);

        SearchResponse resp = esClient.search(req, RequestOptions.DEFAULT);

        // 3) Return the total hits value
        return Objects.requireNonNull(resp.getHits().getTotalHits()).value;
    }

    public List<String> getUniqueUris() throws IOException {
        final int batchSize = 500;
        List<Object> lastSort = null;
        Set<String> uris = new HashSet<>();

        while (true) {
            SearchSourceBuilder src = new SearchSourceBuilder()
                    .query(QueryBuilders.boolQuery()
                            .should(QueryBuilders.matchQuery("operation", "CLC"))
                            .should(QueryBuilders.matchQuery("operation", "IDB"))
                            .minimumShouldMatch(1))
                    .fetchSource(new String[]{ "details" }, null)
                    .size(batchSize)
                    .sort("startTimeMillis", SortOrder.ASC)
                    .sort("_id",             SortOrder.ASC);

            if (lastSort != null) {
                src.searchAfter(lastSort.toArray());
            }

            SearchRequest req = new SearchRequest(indexPattern);
            req.source(src);
            req.setMaxConcurrentShardRequests(1);

            SearchResponse resp = esClient.search(req, RequestOptions.DEFAULT);
            SearchHit[] hits = resp.getHits().getHits();
            if (hits.length == 0) break;

            for (SearchHit hit : hits) {
                @SuppressWarnings("unchecked")
                Map<String,String> details = (Map<String,String>)hit.getSourceAsMap().get("details");
                if (details != null) {
                    String uri = details.get("request.uri");
                    if (uri != null
                            && !uri.equals("/tpgroup/ws/clc")
                            && !uri.equals("/tpgroup/ws/idb")) {
                        uris.add(uri);
                    }
                }
            }

            lastSort = Arrays.asList(hits[hits.length - 1].getSortValues());
        }

        return uris.stream().sorted().collect(Collectors.toList());
    }

    public Map<String, Map<String, Object>> getUriPassFailDetails() throws IOException {
        final int batchSize = 500;
        List<Object> lastSort = null;
        Map<String, Map<String, Object>> result = new HashMap<>();

        while (true) {
            SearchSourceBuilder src = new SearchSourceBuilder()
                    .query(QueryBuilders.boolQuery()
                            .should(QueryBuilders.matchQuery("operation", "CLC"))
                            .should(QueryBuilders.matchQuery("operation", "IDB"))
                            .minimumShouldMatch(1))
                    .fetchSource(new String[]{ "traceID", "startTimeMillis", "details" }, null)
                    .size(batchSize)
                    .sort("startTimeMillis", SortOrder.ASC)
                    .sort("_id",             SortOrder.ASC);

            if (lastSort != null) {
                src.searchAfter(lastSort.toArray());
            }

            SearchRequest req = new SearchRequest(indexPattern);
            req.source(src).setMaxConcurrentShardRequests(1);
            SearchResponse resp = esClient.search(req, RequestOptions.DEFAULT);
            SearchHit[] hits = resp.getHits().getHits();
            if (hits.length == 0) break;

            // 3) Process this batch
            for (SearchHit hit : hits) {
                @SuppressWarnings("unchecked")
                Map<String,Object> srcMap = hit.getSourceAsMap();
                @SuppressWarnings("unchecked")
                Map<String,String> details = (Map<String,String>)srcMap.get("details");

                String uri    = details.get("request.uri");
                String status = details.get("status");
                if (uri == null
                        || uri.equals("/tpgroup/ws/clc")
                        || uri.equals("/tpgroup/ws/idb")) {
                    continue;
                }

                boolean isPass = "PASSED".equalsIgnoreCase(status);
                Map<String,Object> uriData = result.computeIfAbsent(uri, k -> {
                    Map<String,Object> m = new HashMap<>();
                    m.put("pass",     0L);
                    m.put("fail",     0L);
                    m.put("failures", new ArrayList<Map<String,Object>>());
                    return m;
                });

                if (isPass) {
                    uriData.put("pass", (Long)uriData.get("pass") + 1);
                } else {
                    uriData.put("fail", (Long)uriData.get("fail") + 1);

                    Map<String,Object> failure = new HashMap<>();
                    failure.put("traceID",       srcMap.get("traceID"));
                    // pull these _from_ the details map, not the top‐level srcMap
                    failure.put("NumPS",         details.get("request.num.ps"));
                    failure.put("NumAMC",        details.get("request.num.amc"));
                    failure.put("failureReason", details.get("failure.reason"));

                    ((List<Map<String,Object>>)uriData.get("failures"))
                            .add(failure);
                }
            }

            // 4) Prepare for next page
            lastSort = Arrays.asList(hits[hits.length - 1].getSortValues());
        }

        return result;
    }

    public Map<String, ServiceProviderDTO> getUniquePSWithDetails(
            Long from,
            Long to,
            String numPs
    ) throws IOException {
        // 1) find unique PS IDs from your Elasticsearch traces:
        List<String> uniquePs = getUniquePS(from, to);

        // 2) apply the optional numPs filter
        if (numPs != null && !numPs.isBlank()) {
            uniquePs = uniquePs.stream()
                    .filter(id -> id.equals(numPs))
                    .toList();
        }

        if (uniquePs.isEmpty()) {
            return Collections.emptyMap();
        }

        // 3) load the ServiceProvider entities in one go
        List<ServiceProvider> providers = providerRepo.findAllById(uniquePs);

        // 4) map each one to DTO, tacking on the very latest event if any
        return providers.stream().collect(Collectors.toMap(
                ServiceProvider::getNationalId,
                sp -> {
                    // base DTO from your existing mapper
                    ServiceProviderDTO dto = ServiceProviderMapper.mapToServiceProviderDTO(sp);

                    // look up "last" event for this PS by descending eventDate
                    eventRepo
                            .findFirstByIdPsOrderByEventDateDesc(sp.getNationalId())
                            .ifPresent(ev -> {
                                dto.setLastEventCode(ev.getEventCode());
                                dto.setLastEventDate(ev.getEventDate());
                            });

                    return dto;
                }
        ));
    }


    public List<String> getUniquePS(Long from, Long to) throws IOException {
        List<String> uniquePs = new ArrayList<>();

        // 1) Build your base time‐range filter
        BoolQueryBuilder filter = QueryBuilders.boolQuery();
        if (from != null) filter.filter(QueryBuilders.rangeQuery("startTimeMillis").gte(from));
        if (to   != null) filter.filter(QueryBuilders.rangeQuery("startTimeMillis").lte(to));

        // 2) Composite agg definition: “ps_buckets” over our keyword field
        CompositeAggregationBuilder compositeAgg = AggregationBuilders
                .composite("ps_buckets",
                        List.of(
                                new TermsValuesSourceBuilder("ps")
                                        .field("details.request.num.ps.keyword")
                        )
                )
                .size(1000);  // page size: tweak up/down as you like

        Map<String, Object> afterKey = null;
        do {
            // 3) On each iteration, plug in the last “afterKey” if present
            CompositeAggregationBuilder pagedAgg = (afterKey == null)
                    ? compositeAgg
                    : compositeAgg.aggregateAfter(afterKey);

            SearchSourceBuilder src = new SearchSourceBuilder()
                    .query(filter)
                    .size(0)                         // no hits, just aggs
                    .aggregation(pagedAgg);

            SearchRequest req = new SearchRequest(indexPattern)
                    .source(src);

            SearchResponse resp = esClient.search(req, RequestOptions.DEFAULT);

            // 4) Pull out our composite agg
            ParsedComposite buckets = resp.getAggregations()
                    .get("ps_buckets");

            // 5) Collect each bucket’s “ps” key
            for (ParsedComposite.ParsedBucket bucket : buckets.getBuckets()) {
                uniquePs.add((String) bucket.getKey().get("ps"));
            }

            // 6) Grab the “afterKey” for the next page (or null if we’re done)
            afterKey = buckets.afterKey();
        } while (afterKey != null);

        return uniquePs;
    }

    public List<AmcStatusDTO> getAMCStatusList(Long from, Long to, String numAmc) throws IOException {
        // 1) figure out all the unique numAmcOtp keys in your traces
        List<String> uniqueAmcKeys = getUniqueAMC(from, to);

        // 2) if the user passed a numAmc query-param, filter down to that one
        if (numAmc != null && !numAmc.isBlank()) {
            uniqueAmcKeys = uniqueAmcKeys.stream()
                    .filter(key -> key.equals(numAmc))
                    .collect(Collectors.toList());
        }

        if (uniqueAmcKeys.isEmpty()) {
            return Collections.emptyList();
        }

        // 3) fetch *all* AmcStatus rows whose numAmcOtp is in that list
        List<AmcStatus> amcs = amcStatusRepo.findByNumAmcOtpIn(uniqueAmcKeys);

        // 4) map each one to a DTO and return as a List
        return amcs.stream()
                .map(AmcStatusMapper::mapToAmcStatusDTO)
                .collect(Collectors.toList());
    }


    public List<String> getUniqueAMC(Long from, Long to) throws IOException {
        List<String> uniqueAmc = new ArrayList<>();
        BoolQueryBuilder filter = QueryBuilders.boolQuery();
        if (from != null) filter.filter(QueryBuilders.rangeQuery("startTimeMillis").gte(from));
        if (to   != null) filter.filter(QueryBuilders.rangeQuery("startTimeMillis").lte(to));

        CompositeAggregationBuilder compositeAgg = AggregationBuilders
                .composite("amc_buckets",
                        List.of(
                                new TermsValuesSourceBuilder("amc")
                                        .field("details.request.num.amc.keyword")
                        )
                )
                .size(1000);

        Map<String, Object> afterKey = null;

        do {
            CompositeAggregationBuilder pagedAgg = (afterKey == null)
                    ? compositeAgg
                    : compositeAgg.aggregateAfter(afterKey);

            SearchSourceBuilder src = new SearchSourceBuilder()
                    .query(filter)
                    .size(0)
                    .aggregation(pagedAgg);

            SearchRequest req = new SearchRequest(indexPattern)
                    .source(src);

            SearchResponse resp = esClient.search(req, RequestOptions.DEFAULT);

            ParsedComposite buckets = resp.getAggregations()
                    .get("amc_buckets");

            for (ParsedComposite.ParsedBucket bucket : buckets.getBuckets()) {
                uniqueAmc.add((String) bucket.getKey().get("amc"));
            }

            afterKey = buckets.afterKey();
        } while (afterKey != null);

        return uniqueAmc;
    }

}
