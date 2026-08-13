package com.shophub.promotion.infrastructure;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shophub.promotion.domain.CouponRedemption;

public interface CouponRedemptionRepository extends JpaRepository<CouponRedemption, UUID> {

    Optional<CouponRedemption> findByCouponIdAndUserId(UUID couponId, UUID userId);

    List<CouponRedemption> findByUserId(UUID userId);

    List<CouponRedemption> findByCouponId(UUID couponId);

    boolean existsByCouponIdAndUserId(UUID couponId, UUID userId);
}
