package com.cegedim.next.core.tpgroupeobsapi.entity;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "service_provider", schema = "public")
@Data
@NoArgsConstructor
public class ServiceProvider {

    @Id
    @Column(name = "national_id", length = 50)
    private String nationalId;

    @Column(name = "first_name", length = 100)
    private String firstName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    @Column(name = "email", length = 200)
    private String email;
}
