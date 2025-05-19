package com.cegedim.next.core.tpgroupeobsapi.helpers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamConstants;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;
import java.io.StringReader;
import java.util.*;
import java.util.function.Function;

@Slf4j
@RequiredArgsConstructor
public class TraceDetailsExtractor {
    private final XMLInputFactory xmlInputFactory = XMLInputFactory.newInstance();

    public Map<String, String> extract(String operation, Map<String, String> tags) {
        Map<String, Function<Map<String, String>, Map<String, String>>> extractors = new HashMap<>();
        extractors.put("AbonnementPS", this::extractAbonnement);
        extractors.put("IDB", this::extractSimple);
        extractors.put("CLC", this::extractSimple);
        extractors.put("DmdePratique", this::extractDmdePratique);
        extractors.put("ConventionPS", this::extractConvention);
        extractors.put("restitutionAMC", this::extractRestitution);
        extractors.put("InterAMC", this::extractInterAMC);
        extractors.put("DmdeSignature", this::extractDemandeSignature);
        extractors.put("NotifSignature", this::extractNotifSignature);
        extractors.put("ServiceProviderInitialize", this::extractServiceProviderInitialize);
        extractors.put("ServiceProviderSubscribe", this::extractServiceProviderSubscribe);
        extractors.put("ServiceProviderUnsubscribe", this::extractServiceProviderUnsubscribe);

        try {
            return extractors.getOrDefault(operation, m -> Map.of()).apply(tags);
        } catch (Exception e) {
            log.warn("Failed to extract details for operation {}: {}", operation, e.getMessage());
            return Map.of();
        }
    }

    private String extractXmlValue(String xml, String... path) {
        if (xml == null || xml.isBlank()) return "";
        try {
            XMLStreamReader reader = xmlInputFactory.createXMLStreamReader(new StringReader(xml));
            int level = 0;
            while (reader.hasNext()) {
                int event = reader.next();
                if (event == XMLStreamConstants.START_ELEMENT && reader.getLocalName().equals(path[level])) {
                    level++;
                    if (level == path.length) {
                        reader.next();
                        String value = reader.getEventType() == XMLStreamConstants.CHARACTERS ? reader.getText() : "";
                        reader.close();
                        return value;
                    }
                }
            }
        } catch (Exception e) {
            log.debug("StAX extraction failed for {}: {}", String.join("/", path), e.getMessage());
        }
        return "";
    }

    private Map<String, String> extractAbonnement(Map<String, String> tags) {
        Map<String, String> info = new HashMap<>();
        String req = tags.get("request.content");
        String res = tags.get("response.content");

        String ackCode = extractXmlValue(res, "Body", "DemandeAbonPSResponse", "Acquittement", "AckCode");
        String ackMessage = extractXmlValue(res, "Body", "DemandeAbonPSResponse", "Acquittement", "AckMessage");
        String typeDemande = extractXmlValue(req, "Body", "DemandeAbonPSRequest", "ModeAppel", "TypeDemande");
        String statusCode = tags.getOrDefault("status.code", "0");

        info.put("TypeDemande", typeDemande);
        info.put("AckCode", ackCode);
        info.put("AckMessage", ackMessage);
        info.put("request.num.ps", tags.get("request.num.ps"));
        info.put("request.uri", tags.get("request.uri"));

        boolean failed = "KO".equalsIgnoreCase(ackCode) || !"0".equals(statusCode);
        info.put("status", failed ? "FAILED" : "PASSED");
        return info;
    }

    private Map<String, String> extractSimple(Map<String, String> tags) {
        Map<String, String> info = new HashMap<>();
        String res = tags.get("response.content");
        String faultStr = tags.getOrDefault("response.fault.string", "");
        String statusCode = tags.getOrDefault("status.code", "0");

        boolean isFailure = !"Retour OK".equalsIgnoreCase(faultStr) || !"0".equals(statusCode);
        info.put("status", isFailure ? "FAILED" : "PASSED");

        if (isFailure) {
            String xmlReason = extractXmlValue(res,
                    "Body","Fault","Reason","Text");
            String failureReason =
                    !xmlReason.isBlank() ? xmlReason : faultStr;
            info.put("failure.reason", failureReason);
            info.put("response.fault.string", faultStr);
        }

        info.put("request.insee.beneficiaire", tags.get("request.insee.beneficiaire"));
        info.put("request.num.amc", tags.get("request.num.amc"));
        info.put("request.num.ps", tags.get("request.num.ps"));
        info.put("request.uri", tags.get("request.uri"));
        return info;
    }

    private Map<String, String> extractDmdePratique(Map<String, String> tags) {
        Map<String, String> info = new HashMap<>();
        String res = tags.get("response.content");
        String ackCode = extractXmlValue(res, "Body", "DonneesPSResponse", "AckCode");
        String ackMessage = extractXmlValue(res, "Body", "DonneesPSResponse", "AckMessage");
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
        info.put("request.uri", tags.get("request.uri"));
        info.put("status", failed ? "FAILED" : "PASSED");
        if (failed) info.put("response.fault.string", faultString);
        return info;
    }

    private Map<String, String> extractRestitution(Map<String, String> tags) {
        Map<String, String> info = new HashMap<>();
        String faultString = tags.getOrDefault("response.fault.string", "");
        String faultCode = tags.getOrDefault("response.fault.code", "");
        String statusCode = tags.getOrDefault("status.code", "0");

        boolean failed = !"Retour OK".equalsIgnoreCase(faultString) || !"0".equals(statusCode);
        info.put("request.num.ps", tags.get("request.num.ps"));
        info.put("request.uri", tags.get("request.uri"));
        info.put("status", failed ? "FAILED" : "PASSED");
        if (failed) {
            info.put("response.fault.string", faultString);
            info.put("response.fault.code", faultCode);
        }
        return info;
    }

    private Map<String, String> extractInterAMC(Map<String, String> tags) {
        Map<String, String> info = new HashMap<>();
        String res = tags.get("response.content");

        String codeRetour = extractXmlValue(res, "Body", "searchResponse", "searchResult", "etat_demande", "code_retour");
        String message = extractXmlValue(res, "Body", "searchResponse", "searchResult", "etat_demande", "message");

        boolean failed = !"1".equals(codeRetour);
        info.put("status", failed ? "FAILED" : "PASSED");
        info.put("request.uri", tags.get("request.uri"));
        if (failed) {
            info.put("code_retour", codeRetour);
            info.put("message", message);
        }
        return info;
    }

    private Map<String, String> extractDemandeSignature(Map<String, String> tags) {
        Map<String, String> info = new HashMap<>();
        String res = tags.get("response.content");

        String faultString = tags.getOrDefault("response.fault.string", "");
        String statusCode = tags.getOrDefault("status.code", "0");
        boolean failed = !"Retour OK".equalsIgnoreCase(faultString) || !"0".equals(statusCode);

        info.put("StatusCode", extractXmlValue(res, "Body", "Simt101", "SignatureResponseUrl", "StatusCode"));
        info.put("ResultCode", extractXmlValue(res, "Body", "Simt101", "SignatureResponseUrl", "ResultCode"));
        info.put("request.uri", tags.get("request.uri"));
        info.put("status", failed ? "FAILED" : "PASSED");
        if (failed) info.put("response.fault.string", faultString);
        return info;
    }

    private Map<String, String> extractNotifSignature(Map<String, String> tags) {
        Map<String, String> info = new HashMap<>();
        String res = tags.get("response.content");

        String faultString = tags.getOrDefault("response.fault.string", "");
        String statusCode = tags.getOrDefault("status.code", "0");
        String status = extractXmlValue(res, "Nomt201", "Status");
        boolean failed = !"Retour OK".equalsIgnoreCase(faultString) || !"0".equals(statusCode) || !"OK".equalsIgnoreCase(status);

        info.put("request.uri", tags.get("request.uri"));
        info.put("status", failed ? "FAILED" : "PASSED");
        if (failed) info.put("response.fault.string", faultString);
        return info;
    }

    private Map<String, String> extractServiceProviderInitialize(Map<String, String> tags) {

        Map<String, String> info = new HashMap<>();
        String numPs = tags.get("request.num.ps");
        String statusCode = tags.get("status.code");

        boolean failed = !"0".equals(statusCode);
        info.put("request.num.ps", numPs);
        info.put("status", failed ? "FAILED" : "PASSED");
        return info;
    }

    private Map<String, String> extractServiceProviderSubscribe(Map<String, String> tags) {

        Map<String, String> info = new HashMap<>();
        String numPs = tags.get("request.num.ps");
        String statusCode = tags.get("status.code");

        boolean failed = !"0".equals(statusCode);
        info.put("request.num.ps", numPs);
        info.put("status", failed ? "FAILED" : "PASSED");
        return info;
    }

    private Map<String, String> extractServiceProviderUnsubscribe(Map<String, String> tags) {

        Map<String, String> info = new HashMap<>();
        String numPs = tags.get("request.num.ps");
        String statusCode = tags.get("status.code");

        boolean failed = !"0".equals(statusCode);
        info.put("request.num.ps", numPs);
        info.put("status", failed ? "FAILED" : "PASSED");
        return info;
    }
}
