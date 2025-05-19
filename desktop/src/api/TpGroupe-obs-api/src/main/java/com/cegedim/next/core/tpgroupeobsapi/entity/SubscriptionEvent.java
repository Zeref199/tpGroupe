package com.cegedim.next.core.tpgroupeobsapi.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "subscription_event")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionEvent {

    @Id
    @Column(name = "id", length = 250)
    private String id;

    @Column(name = "id_ps", nullable = false, length = 50)
    private String idPs;

    @Column(name = "event_code", nullable = false, length = 50)
    private String eventCode;

    @Column(name = "event_date", nullable = false)
    private Instant eventDate;

}
