package com.cegedim.next.core.tpgroupeobsapi.controller;

import com.cegedim.next.core.tpgroupeobsapi.dto.AmcStatusDTO;
import com.cegedim.next.core.tpgroupeobsapi.dto.ServiceProviderDTO;
import com.cegedim.next.core.tpgroupeobsapi.dto.TraceEventDTO;
import com.cegedim.next.core.tpgroupeobsapi.service.TraceQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1")
public class TraceController {

    private final TraceQueryService traceQueryService;

    @GetMapping("/traces")
    public ResponseEntity<List<TraceEventDTO>> getTraces(
            @RequestParam(required = false) String operation,
            @RequestParam(required = false) String traceId,
            @RequestParam(required = false) Long from,
            @RequestParam(required = false) Long to,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String direction,
            @RequestParam(required = false) String numPS,
            @RequestParam(required = false) String numAMC,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) throws IOException {

        return ResponseEntity.ok(traceQueryService.getTraces(operation, traceId, numPS, numAMC, from, to, page, size, status, direction));

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

    @GetMapping("/ps")
    public ResponseEntity<List<ServiceProviderDTO>> getServiceProviders(
            @RequestParam(required = false) Long from,
            @RequestParam(required = false) Long to,
            @RequestParam(required = false) String numPs
    ) throws IOException {
        Map<String, ServiceProviderDTO> map = traceQueryService.getUniquePSWithDetails(from, to, numPs);
        List<ServiceProviderDTO> list = map.keySet().stream()
                .sorted()
                .map(map::get)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }



    @GetMapping("/amc")
    public ResponseEntity<List<AmcStatusDTO>> getAMCStatusList(
            @RequestParam(required = false) Long from,
            @RequestParam(required = false) Long to,
            @RequestParam(required = false) String numAmc
    ) throws IOException {
        List<AmcStatusDTO> list = traceQueryService.getAMCStatusList(from, to, numAmc);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/uris/details")
    public ResponseEntity<Map<String, Map<String, Object>>> getUniqueUrisdetails() throws IOException {
        return ResponseEntity.ok(traceQueryService.getUriPassFailDetails());
    }

}
