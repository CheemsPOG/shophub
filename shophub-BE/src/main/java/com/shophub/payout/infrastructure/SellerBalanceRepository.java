package com.shophub.payout.infrastructure;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shophub.payout.domain.SellerBalance;

public interface SellerBalanceRepository extends JpaRepository<SellerBalance, UUID> {
}
