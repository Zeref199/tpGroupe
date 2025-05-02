package com.cegedim.next.core.tpgroupeobsapi.config;

import com.cegedim.next.core.tpgroupeobsapi.helpers.TraceDetailsExtractor;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TraceWorkerConfig {
    @Bean
    public TraceDetailsExtractor traceDetailsExtractor() {
        return new TraceDetailsExtractor(new XmlMapper());
    }
}
