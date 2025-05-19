package com.cegedim.next.core.tpgroupeobsapi.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "amc_otp_status", schema = "public")
@Data
@NoArgsConstructor
public class AmcStatus {
    @Id
    @Column(name = "id", length = 250)
    private String id;

    @Column(name = "num_amc_otp", length = 50)
    private String numAmcOtp;

    @Column(name = "label_amc_otp", length = 100)
    private String labelAmcOtp;

    @Column(name = "conv_type", length = 50)
    private String typeConv;

    @Column(name = "secondary_criteria", length = 50)
    private String critereSecondaire;

    @Column(name = "inter_amc")
    private Boolean interAmc;

    @Column(name = "registered")
    private Boolean inscritPF;

    @Column(name = "sel_inter_amc", length = 100)
    private String selInterAmc;

    public AmcStatus(String numAmcOtp, String labelAmcOtp, String typeConv, String critereSecondaire, Boolean interAmc, Boolean inscritPF, String selInterAmc) {
        this.numAmcOtp = numAmcOtp;
        this.labelAmcOtp = labelAmcOtp;
        this.typeConv = typeConv;
        this.critereSecondaire = critereSecondaire;
        this.interAmc = interAmc;
        this.inscritPF = inscritPF;
        this.selInterAmc = selInterAmc;
    }

}
