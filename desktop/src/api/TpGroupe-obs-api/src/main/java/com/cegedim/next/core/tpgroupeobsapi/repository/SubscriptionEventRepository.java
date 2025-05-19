package com.cegedim.next.core.tpgroupeobsapi.repository;

import com.cegedim.next.core.tpgroupeobsapi.entity.SubscriptionEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SubscriptionEventRepository extends JpaRepository<SubscriptionEvent, String> {
    Optional<SubscriptionEvent> findFirstByIdPsOrderByEventDateDesc(String idPs);
}
