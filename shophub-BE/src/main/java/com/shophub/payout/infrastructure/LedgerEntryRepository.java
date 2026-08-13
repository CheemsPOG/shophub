package com.shophub.payout.infrastructure;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shophub.payout.domain.LedgerEntry;

public interface LedgerEntryRepository extends JpaRepository<LedgerEntry, UUID> {

    List<LedgerEntry> findByShopIdOrderByCreatedAtDesc(UUID shopId);

    List<LedgerEntry> findByOrderId(UUID orderId);

    List<LedgerEntry> findByPayoutId(UUID payoutId);
}
