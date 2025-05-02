package com.cegedim.next.core.tpgroupeobsapi.config;

import org.apache.http.HttpHost;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.CredentialsProvider;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.elasticsearch.client.RestClient;
import org.elasticsearch.client.RestHighLevelClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ElasticsearchConfig {
    @Bean
    public RestHighLevelClient esClient(@Value("${elasticsearch.host}") String host,
                                        @Value("${elasticsearch.port}") int port,
                                        @Value("${elasticsearch.scheme}") String scheme,
                                        @Value("${elasticsearch.user}") String user,
                                        @Value("${elasticsearch.pass}") String pass) {
        final CredentialsProvider credentials = new BasicCredentialsProvider();
        credentials.setCredentials(AuthScope.ANY, new UsernamePasswordCredentials(user, pass));

        return new RestHighLevelClient(RestClient.builder(new HttpHost(host, port, scheme))
                .setHttpClientConfigCallback(builder -> builder.setDefaultCredentialsProvider(credentials)));
    }
}
