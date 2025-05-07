import logging
from io import StringIO
import xml.etree.ElementTree as ET

log = logging.getLogger(__name__)

def _local_name(tag: str) -> str:
    """Strip namespace from an XML tag."""
    return tag.rsplit("}", 1)[-1] if "}" in tag else tag

def extract_xml_value(xml: str, *path: str) -> str:
    """
    Stream-parse `xml` looking for nested elements matching `path`
    (e.g. extract_xml_value(res, "Body","Fault","Reason","Text","__text")).
    Returns first matching element text or "".
    """
    if not xml:
        return ""
    try:
        level = 0
        # iterparse over start/end keeps memory small
        for event, elem in ET.iterparse(StringIO(xml), events=("start","end")):
            if event == "start" and _local_name(elem.tag) == path[level]:
                level += 1
                if level == len(path):
                    # next event should carry text
                    text = (elem.text or "").strip()
                    return text
            elif event == "end" and level and _local_name(elem.tag) == path[level-1]:
                # popping back if we stepped into other branches
                level -= 1
        return ""
    except Exception as e:
        log.debug(f"StAX extraction failed for {'/'.join(path)}: {e}")
        return ""

def extract_abonnement(tags: dict) -> dict:
    info = {}
    req, res = tags.get("request.content",""), tags.get("response.content","")
    ackCode    = extract_xml_value(res, "Body","DemandeAbonPSResponse","Acquittement","AckCode")
    ackMessage = extract_xml_value(res, "Body","DemandeAbonPSResponse","Acquittement","AckMessage")
    typeDemande= extract_xml_value(req, "Body","DemandeAbonPSRequest","ModeAppel","TypeDemande")
    statusCode = tags.get("status.code","0")
    info.update({
        "TypeDemande": typeDemande,
        "AckCode":     ackCode,
        "AckMessage":  ackMessage,
        "request.num.ps": tags.get("request.num.ps")
    })
    failed = ackCode.upper()=="KO" or statusCode!="0"
    info["status"] = "FAILED" if failed else "PASSED"
    return info

def extract_simple(tags: dict) -> dict:
    info = {}
    res         = tags.get("response.content","")
    faultStr    = tags.get("response.fault.string","")
    statusCode  = tags.get("status.code","0")
    failed = faultStr.upper()!="RETOUR OK" or statusCode!="0"
    info["status"] = "FAILED" if failed else "PASSED"
    if failed:
        reason = extract_xml_value(res, "Body","Fault","Reason","Text","__text")
        if reason:
            info["failure.reason"]        = reason
            info["response.fault.string"] = faultStr
    info.update({
        "request.insee.beneficiaire": tags.get("request.insee.beneficiaire"),
        "request.num.amc":            tags.get("request.num.amc"),
        "request.num.ps":             tags.get("request.num.ps"),
        "request.uri":                tags.get("request.uri"),
    })
    return info

def extract_dmde_pratique(tags: dict) -> dict:
    info = {}
    res         = tags.get("response.content","")
    ackCode     = extract_xml_value(res, "Body","DonneesPSResponse","AckCode")
    ackMessage  = extract_xml_value(res, "Body","DonneesPSResponse","AckMessage")
    statusCode  = tags.get("status.code","0")
    failed = ackCode.upper()=="KO" or statusCode!="0"
    info.update({
        "request.num.ps": tags.get("request.num.ps"),
        "request.uri":    tags.get("request.uri"),
        "AckCode":        ackCode,
        "AckMessage":     ackMessage,
        "status":         "FAILED" if failed else "PASSED"
    })
    return info

def extract_convention(tags: dict) -> dict:
    info = {}
    faultString = tags.get("response.fault.string","")
    statusCode  = tags.get("status.code","0")
    failed = faultString.upper()!="RETOUR OK" or statusCode!="0"
    info.update({
        "request.num.amc": tags.get("request.num.amc"),
        "request.num.ps":  tags.get("request.num.ps"),
        "status":          "FAILED" if failed else "PASSED"
    })
    if failed:
        info["response.fault.string"] = faultString
    return info

def extract_restitution(tags: dict) -> dict:
    info = {}
    faultString = tags.get("response.fault.string","")
    faultCode   = tags.get("response.fault.code","")
    statusCode  = tags.get("status.code","0")
    failed = faultString.upper()!="RETOUR OK" or statusCode!="0"
    info["request.num.ps"] = tags.get("request.num.ps")
    info["status"]         = "FAILED" if failed else "PASSED"
    if failed:
        info["response.fault.code"]   = faultCode
        info["response.fault.string"] = faultString
    return info

def extract_inter_amc(tags: dict) -> dict:
    info = {}
    res         = tags.get("response.content","")
    codeRetour  = extract_xml_value(res,
                   "Body","searchResponse","searchResult","etat_demande","code_retour")
    message     = extract_xml_value(res,
                   "Body","searchResponse","searchResult","etat_demande","message")
    failed = codeRetour!="1"
    info["status"]      = "FAILED" if failed else "PASSED"
    if failed:
        info["code_retour"] = codeRetour
        info["message"]     = message
    return info

def extract_signature(tags: dict) -> dict:
    info = {}
    res         = tags.get("response.content","")
    faultString = tags.get("response.fault.string","")
    statusCode  = tags.get("status.code","0")
    status_failed = faultString.upper()!="RETOUR OK" or statusCode!="0"
    statusCodeOut  = extract_xml_value(res,
                     "Body","Simt101","SignatureResponseUrl","StatusCode")
    resultCodeOut  = extract_xml_value(res,
                     "Body","Simt101","SignatureResponseUrl","ResultCode")
    info.update({
        "StatusCode": statusCodeOut,
        "ResultCode": resultCodeOut,
        "status":     "FAILED" if status_failed else "PASSED"
    })
    if status_failed:
        info["response.fault.string"] = faultString
    return info

# Map of operation → extractor
_EXTRACTORS = {
    "AbonnementPS":   extract_abonnement,
    "IDB":            extract_simple,
    "CLC":            extract_simple,
    "DmdePratique":   extract_dmde_pratique,
    "ConventionPS":   extract_convention,
    "restitutionAMC": extract_restitution,
    "InterAMC":       extract_inter_amc,
    "DmdeSignature":  extract_signature,
}

def extract_details(operation: str, tags: dict) -> dict:
    """
    Dispatch to the right function by operation name.
    """
    try:
        return _EXTRACTORS.get(operation, lambda t: {})(tags)
    except Exception as e:
        log.warn(f"Failed to extract for {operation}: {e}")
        return {}