package com.shophub.payout.infrastructure;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shophub.payout.domain.Payout;

public interface PayoutRepository extends JpaRepository<Payout, UUID> {

    List<Payout> findByShopIdOrderByCreatedAtDesc(UUID shopId);

    List<Payout> findByShopIdAndStatus(UUID shopId, String status);

    List<Payout> findByStatus(String status);
}
