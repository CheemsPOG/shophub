package com.shophub.payout.infrastructure;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shophub.payout.domain.PayoutMethod;

public interface PayoutMethodRepository extends JpaRepository<PayoutMethod, UUID> {

    List<PayoutMethod> findByShopId(UUID shopId);

    Optional<PayoutMethod> findByShopIdAndIsDefaultTrue(UUID shopId);

    Optional<PayoutMethod> findByIdAndShopId(UUID id, UUID shopId);
}
