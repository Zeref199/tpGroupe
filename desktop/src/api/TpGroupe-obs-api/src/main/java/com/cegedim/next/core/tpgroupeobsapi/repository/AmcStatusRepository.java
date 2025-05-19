package com.cegedim.next.core.tpgroupeobsapi.repository;

import com.cegedim.next.core.tpgroupeobsapi.entity.AmcStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AmcStatusRepository extends JpaRepository<AmcStatus, String> {
    List<AmcStatus> findByNumAmcOtpIn(List<String> numAmcOtps);
}
