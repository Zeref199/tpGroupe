package com.cegedim.next.core.tpgroupeobsapi.config;

import org.apache.http.HttpHost;
import org.elasticsearch.client.RestClient;
import org.elasticsearch.client.RestHighLevelClient;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class LocalElasticsearchConfig {
    @Bean
    @Qualifier("localEsClient")
    public RestHighLevelClient localEsClient(
            @Value("${local.elasticsearch.host}") String host,
            @Value("${local.elasticsearch.port}") int port,
            @Value("${local.elasticsearch.scheme}") String scheme
    ) {
        // no auth assumed for local Docker OpenSearch; adjust if needed
        return new RestHighLevelClient(
                RestClient.builder(new HttpHost(host, port, scheme))
        );
    }
}
