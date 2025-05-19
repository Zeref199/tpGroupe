package com.cegedim.next.core.tpgroupeobsapi.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AmcStatusDTO {
    private String numAmcOtp;
    private String labelAmcOtp;
    private String convType;
    private String secondaryCriteria;
    private Boolean interAmc;
    private Boolean inscritPF;
    private String selInterAmc;
}
