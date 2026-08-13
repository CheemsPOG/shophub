package com.shophub.shop.infrastructure;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shophub.shop.domain.SellerApplication;

public interface SellerApplicationRepository extends JpaRepository<SellerApplication, UUID> {

    List<SellerApplication> findByUserId(UUID userId);

    Optional<SellerApplication> findByShopId(UUID shopId);

    List<SellerApplication> findByStatusOrderBySubmittedAtDesc(String status);

    long countByStatus(String status);
}
