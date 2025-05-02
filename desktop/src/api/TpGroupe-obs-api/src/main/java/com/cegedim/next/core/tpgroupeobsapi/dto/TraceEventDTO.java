package com.cegedim.next.core.tpgroupeobsapi.dto;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class TraceEventDTO {
    private String traceId;
    private String operation;
    private long startTime;
    private long duration;
    private Map<String, String> details;
}
