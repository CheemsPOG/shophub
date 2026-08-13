package com.shophub.promotion.infrastructure;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shophub.promotion.domain.Coupon;

public interface CouponRepository extends JpaRepository<Coupon, UUID> {

    Optional<Coupon> findByCode(String code);

    List<Coupon> findByStatus(String status);

    boolean existsByCode(String code);

    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true, flushAutomatically = true)
    @org.springframework.data.jpa.repository.Query("update Coupon c set c.usedCount = c.usedCount + 1 where c.id = :id and c.usedCount < c.usageLimit")
    int incrementUsed(@org.springframework.data.repository.query.Param("id") UUID id);
}
