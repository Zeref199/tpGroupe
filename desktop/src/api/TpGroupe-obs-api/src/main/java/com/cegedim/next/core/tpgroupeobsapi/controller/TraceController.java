package com.cegedim.next.core.tpgroupeobsapi.controller;

import com.cegedim.next.core.tpgroupeobsapi.dto.TraceEventDTO;
import com.cegedim.next.core.tpgroupeobsapi.service.TraceQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1")
public class TraceController {

    private final TraceQueryService traceQueryService;

    @GetMapping("/traces")
    public ResponseEntity<List<TraceEventDTO>> getTraces(
            @RequestParam(required = false) String operation,
            @RequestParam(required = false) Long from,
            @RequestParam(required = false) Long to,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) throws IOException {

        return ResponseEntity.ok(traceQueryService.getTraces(operation, from, to, page, size, status));
    }

    @GetMapping("/traces/by-trace-id/{traceId}")
    public ResponseEntity<List<TraceEventDTO>> getTracesByTraceId(@PathVariable String traceId) throws IOException {
        return ResponseEntity.ok(traceQueryService.findTracesByTraceId(traceId));
    }

    @GetMapping("/traces/count")
    public long countTraces(
            @RequestParam(required = false) String operation,
            @RequestParam(required = false) Long from,
            @RequestParam(required = false) Long to,
            @RequestParam(required = false) String status
    ) throws IOException {
        return traceQueryService.countTraces(operation, from, to, status);
    }

    @GetMapping("/uris")
    public ResponseEntity<List<String>> getUniqueUris() throws IOException {
        return ResponseEntity.ok(traceQueryService.getUniqueUris());
    }


    @GetMapping("/uris/details")
    public ResponseEntity<Map<String, Map<String, Object>>> getUniqueUrisdetails() throws IOException {
        return ResponseEntity.ok(traceQueryService.getUriPassFailDetails());
    }

}
