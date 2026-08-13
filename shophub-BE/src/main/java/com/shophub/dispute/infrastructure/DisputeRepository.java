package com.shophub.dispute.infrastructure;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shophub.dispute.domain.Dispute;

public interface DisputeRepository extends JpaRepository<Dispute, UUID> {

    List<Dispute> findByOrderId(UUID orderId);

    List<Dispute> findByBuyerIdOrderByOpenedAtDesc(UUID buyerId);

    List<Dispute> findByShopIdOrderByOpenedAtDesc(UUID shopId);

    List<Dispute> findByStatus(String status);

    Optional<Dispute> findByIdAndBuyerId(UUID id, UUID buyerId);

    long countByStatus(String status);
}
