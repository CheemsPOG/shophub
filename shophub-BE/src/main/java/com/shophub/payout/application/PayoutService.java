package com.shophub.payout.application;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shophub.order.application.CheckoutService;
import com.shophub.payout.domain.LedgerEntry;
import com.shophub.payout.domain.Payout;
import com.shophub.payout.domain.PayoutMethod;
import com.shophub.payout.domain.SellerBalance;
import com.shophub.payout.infrastructure.LedgerEntryRepository;
import com.shophub.payout.infrastructure.PayoutMethodRepository;
import com.shophub.payout.infrastructure.PayoutRepository;
import com.shophub.payout.infrastructure.SellerBalanceRepository;
import com.shophub.platform.infrastructure.PlatformSettingRepository;
import com.shophub.shared.error.ApiException;
import com.shophub.shared.web.JsonMaps;

@Service
public class PayoutService {

    private final PayoutRepository payouts;
    private final PayoutMethodRepository methods;
    private final SellerBalanceRepository balances;
    private final LedgerEntryRepository ledger;
    private final PlatformSettingRepository settings;
    private final ObjectMapper objectMapper;

    public PayoutService(
            PayoutRepository payouts,
            PayoutMethodRepository methods,
            SellerBalanceRepository balances,
            LedgerEntryRepository ledger,
            PlatformSettingRepository settings,
            ObjectMapper objectMapper) {
        this.payouts = payouts;
        this.methods = methods;
        this.balances = balances;
        this.ledger = ledger;
        this.settings = settings;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> list(UUID shopId) {
        SellerBalance balance = balances.findById(shopId).orElse(null);
        List<Map<String, Object>> items = payouts.findByShopIdOrderByCreatedAtDesc(shopId).stream()
                .map(this::toDto)
                .toList();
        return JsonMaps.of(
                "available", balance == null ? BigDecimal.ZERO : balance.getAvailable(),
                "pending", balance == null ? BigDecimal.ZERO : balance.getPending(),
                "minPayout", minPayout(),
                "payouts", items);
    }

    @Transactional
    public Map<String, Object> withdraw(UUID shopId, BigDecimal amount, UUID methodId) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw ApiException.badRequest("INVALID_AMOUNT", "Withdrawal amount must be positive");
        }
        amount = CheckoutService.money(amount);
        BigDecimal min = minPayout();
        if (amount.compareTo(min) < 0) {
            throw ApiException.badRequest("BELOW_MINIMUM", "Minimum payout is " + min);
        }
        SellerBalance balance = balances.findById(shopId).orElseThrow(() -> ApiException.badRequest("NO_BALANCE", "No balance available"));
        if (balance.getAvailable().compareTo(amount) < 0) {
            throw ApiException.conflict("INSUFFICIENT_BALANCE", "Available balance is too low");
        }
        PayoutMethod method = null;
        if (methodId != null) {
            method = methods.findByIdAndShopId(methodId, shopId).orElseThrow(() -> ApiException.notFound("Payout method not found"));
        } else {
            method = methods.findByShopIdAndIsDefaultTrue(shopId).orElse(null);
        }
        balance.setAvailable(CheckoutService.money(balance.getAvailable().subtract(amount)));
        Payout payout = new Payout();
        payout.setShopId(shopId);
        payout.setAmount(amount);
        payout.setStatus("pending");
        payout.setMethodId(method == null ? null : method.getId());
        payouts.save(payout);
        LedgerEntry entry = new LedgerEntry();
        entry.setShopId(shopId);
        entry.setPayoutId(payout.getId());
        entry.setType("payout");
        entry.setAmount(amount);
        ledger.save(entry);
        return toDto(payout);
    }

    private Map<String, Object> toDto(Payout payout) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", payout.getId().toString());
        dto.put("sellerId", payout.getShopId().toString());
        dto.put("amount", payout.getAmount());
        dto.put("status", payout.getStatus());
        dto.put("methodId", payout.getMethodId() == null ? null : payout.getMethodId().toString());
        String methodLabel = "Bank Transfer";
        if (payout.getMethodId() != null) {
            methodLabel = methods.findById(payout.getMethodId())
                    .map(m -> "paypal".equals(m.getType()) ? "PayPal" : "Bank Transfer")
                    .orElse(methodLabel);
        }
        dto.put("method", methodLabel);
        dto.put("date", payout.getCreatedAt() == null ? Instant.now().toString() : payout.getCreatedAt().toString());
        dto.put("processedAt", payout.getProcessedAt() == null ? null : payout.getProcessedAt().toString());
        dto.put("failureReason", payout.getFailureReason());
        return dto;
    }

    private BigDecimal minPayout() {
        return settings.findById("min_payout")
                .map(s -> {
                    try {
                        return objectMapper.readTree(s.getValue()).decimalValue();
                    } catch (Exception ex) {
                        return new BigDecimal("50");
                    }
                })
                .orElse(new BigDecimal("50"));
    }
}
