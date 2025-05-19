package com.cegedim.next.core.tpgroupeobsapi.dto;

import jakarta.persistence.Column;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ServiceProviderDTO {

    private String nationalId;
    private String firstName;
    private String lastName;
    private String email;
    private String lastEventCode;
    private Instant lastEventDate;
}
