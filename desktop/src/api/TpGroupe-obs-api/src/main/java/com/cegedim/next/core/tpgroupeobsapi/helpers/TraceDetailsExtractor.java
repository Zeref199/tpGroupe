package com.cegedim.next.core.tpgroupeobsapi.helpers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Slf4j
@RequiredArgsConstructor
public class TraceDetailsExtractor {
    private final XmlMapper xmlMapper;

    public Map<String, String> extract(String operation, Map<String, String> tags) {
        Map<String, Function<Map<String, String>, Map<String, String>>> extractors = Map.of(
                "AbonnementPS", this::extractAbonnement,
                "IDB", this::extractSimple,
                "CLC", this::extractSimple,
                "DmdePratique", this::extractDmdePratique,
                "ConventionPS", this::extractConvention,
                "restitutionAMC", this::extractRestitution,
                "InterAMC", this::extractInterAMC,
                "DmdeSignature", this::extractSignature
        );

        try {
            return extractors.getOrDefault(operation, m -> Map.of()).apply(tags);
        } catch (Exception e) {
            log.warn("Failed to extract details for operation {}: {}", operation, e.getMessage());
            return Map.of();
        }
    }

    private JsonNode fromXml(String xml) {
        try {
            return (xml != null && !xml.isBlank()) ? xmlMapper.readTree(xml) : null;
        } catch (Exception e) {
            return null;
        }
    }

    private Map<String, String> extractAbonnement(Map<String, String> tags) {
        Map<String, String> info = new HashMap<>();
        JsonNode req = fromXml(tags.get("request.content"));
        JsonNode res = fromXml(tags.get("response.content"));

        String ackCode = res != null ? res.at("/Body/DemandeAbonPSResponse/Acquittement/AckCode").asText("") : "";
        String ackMessage = res != null ? res.at("/Body/DemandeAbonPSResponse/Acquittement/AckMessage").asText("") : "";
        String typeDemande = req != null ? req.at("/Body/DemandeAbonPSRequest/ModeAppel/TypeDemande").asText("") : "";
        String statusCode = tags.getOrDefault("status.code", "0");

        info.put("TypeDemande", typeDemande);
        info.put("AckCode", ackCode);
        info.put("AckMessage", ackMessage);
        info.put("request.num.ps", tags.get("request.num.ps"));

        boolean failed = "KO".equalsIgnoreCase(ackCode) || !"0".equals(statusCode);
        info.put("status", failed ? "FAILED" : "PASSED");

        return info;
    }

    private Map<String, String> extractSimple(Map<String, String> tags) {
        Map<String, String> info = new HashMap<>();

        info.put("request.insee.beneficiaire", tags.get("request.insee.beneficiaire"));
        info.put("request.num.amc", tags.get("request.num.amc"));
        info.put("request.num.ps", tags.get("request.num.ps"));
        info.put("request.uri", tags.get("request.uri"));

        String faultStr = tags.getOrDefault("response.fault.string", "");
        String statusCode = tags.getOrDefault("status.code", "0");


        boolean isFailure = !"Retour OK".equalsIgnoreCase(faultStr) || !"0".equals(statusCode);
        info.put("status", isFailure ? "FAILED" : "PASSED");

        if (isFailure) {
            JsonNode res = fromXml(tags.get("response.content"));
            if (res != null) {
                String reason = res.at("/Body/Fault/Reason/Text/__text").asText(null);
                if (reason != null && !reason.isBlank()) {
                    info.put("failure.reason", reason);
                    info.put("response.fault.string", faultStr);
                }
            }
        }

        return info;
    }

    private Map<String, String> extractDmdePratique(Map<String, String> tags) {
        Map<String, String> info = new HashMap<>();
        JsonNode res = fromXml(tags.get("response.content"));

        String ackCode = res != null ? res.at("/Body/DonneesPSResponse/AckCode").asText("") : "";
        String ackMessage = res != null ? res.at("/Body/DonneesPSResponse/AckMessage").asText("") : "";
        String statusCode = tags.getOrDefault("status.code", "0");

        info.put("request.num.ps", tags.get("request.num.ps"));
        info.put("request.uri", tags.get("request.uri"));
        info.put("AckCode", ackCode);
        info.put("AckMessage", ackMessage);

        boolean failed = "KO".equalsIgnoreCase(ackCode) || !"0".equals(statusCode);
        info.put("status", failed ? "FAILED" : "PASSED");

        return info;
    }

    private Map<String, String> extractConvention(Map<String, String> tags) {
        Map<String, String> info = new HashMap<>();

        String faultString = tags.getOrDefault("response.fault.string", "");
        String statusCode = tags.getOrDefault("status.code", "0");

        boolean failed = !"Retour OK".equalsIgnoreCase(faultString) || !"0".equals(statusCode);

        info.put("request.num.amc", tags.get("request.num.amc"));
        info.put("request.num.ps", tags.get("request.num.ps"));
        info.put("status", failed ? "FAILED" : "PASSED");

        if (failed) {
            info.put("response.fault.string", faultString);
        }

        return info;
    }

    private Map<String, String> extractRestitution(Map<String, String> tags) {

        Map<String, String> info = new HashMap<>();

        String faultString = tags.getOrDefault("response.fault.string", "");
        String faultCode = tags.getOrDefault("response.fault.code", "");
        String statusCode = tags.getOrDefault("status.code", "0");

        boolean failed = !"Retour OK".equalsIgnoreCase(faultString) || !"0".equals(statusCode);

        info.put("request.num.ps", tags.get("request.num.ps"));
        info.put("status", failed ? "FAILED" : "PASSED");

        if (failed) {
            info.put("response.fault.string", faultString);
            info.put("response.fault.code", faultCode);
        }

        return info;
    }

    private Map<String, String> extractInterAMC(Map<String, String> tags) {
        Map<String, String> info = new HashMap<>();
        JsonNode res = fromXml(tags.get("response.content"));

        String codeRetour = "";
        String message = "";
        boolean failed = false;

        if (res != null) {
            codeRetour = res.at("/Body/searchResponse/searchResult/etat_demande/code_retour").asText("");
            message = res.at("/Body/searchResponse/searchResult/etat_demande/message").asText("");
            failed = !"1".equals(codeRetour);
        }

        info.put("status", failed ? "FAILED" : "PASSED");
        if (failed) {
            info.put("code_retour", codeRetour);
            info.put("message", message);
        }

        return info;
    }



    private Map<String, String> extractSignature(Map<String, String> tags) {
        Map<String, String> info = new HashMap<>();
        JsonNode res = fromXml(tags.get("response.content"));

        String faultString = tags.getOrDefault("response.fault.string", "");
        String statusCode = tags.getOrDefault("status.code", "0");

        boolean failed = !"Retour OK".equalsIgnoreCase(faultString) || !"0".equals(statusCode);

        info.put("StatusCode", res != null ? res.at("/Body/Simt101/SignatureResponseUrl/StatusCode").asText("") : "");
        info.put("ResultCode", res != null ? res.at("/Body/Simt101/SignatureResponseUrl/ResultCode").asText("") : "");
        info.put("status", failed ? "FAILED" : "PASSED");

        if (failed) {
            info.put("response.fault.string", faultString);
        }

        return info;
    }
}
