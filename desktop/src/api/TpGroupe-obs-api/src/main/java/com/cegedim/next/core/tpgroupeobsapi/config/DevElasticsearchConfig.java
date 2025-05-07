package com.cegedim.next.core.tpgroupeobsapi.config;

import org.springframework.context.annotation.Configuration;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.CredentialsProvider;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.apache.http.HttpHost;
import org.elasticsearch.client.RestClient;
import org.elasticsearch.client.RestHighLevelClient;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;

@Configuration
public class DevElasticsearchConfig {
    @Bean
    @Qualifier("devEsClient")
    public RestHighLevelClient devEsClient(
            @Value("${storage.elasticsearch.host}") String host,
            @Value("${storage.elasticsearch.port}") int port,
            @Value("${storage.elasticsearch.scheme}") String scheme,
            @Value("${storage.elasticsearch.user}") String user,
            @Value("${storage.elasticsearch.password}") String pass
    ) {
        CredentialsProvider creds = new BasicCredentialsProvider();
        creds.setCredentials(AuthScope.ANY, new UsernamePasswordCredentials(user, pass));

        return new RestHighLevelClient(
                RestClient.builder(new HttpHost(host, port, scheme))
                        .setHttpClientConfigCallback(hc -> hc.setDefaultCredentialsProvider(creds))
        );
    }
}
