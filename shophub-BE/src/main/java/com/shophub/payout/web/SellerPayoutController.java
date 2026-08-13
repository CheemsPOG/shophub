package com.shophub.payout.web;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shophub.payout.application.PayoutService;
import com.shophub.shared.error.ApiException;
import com.shophub.shared.security.ShopHubPrincipal;

@RestController
@RequestMapping("/api/v1/seller/payouts")
public class SellerPayoutController {

    private final PayoutService payoutService;

    public SellerPayoutController(PayoutService payoutService) {
        this.payoutService = payoutService;
    }

    @GetMapping
    public Map<String, Object> list(@AuthenticationPrincipal ShopHubPrincipal principal) {
        return payoutService.list(shopId(principal));
    }

    @PostMapping("/withdraw")
    public Map<String, Object> withdraw(
            @AuthenticationPrincipal ShopHubPrincipal principal,
            @RequestBody WithdrawRequest request) {
        return payoutService.withdraw(shopId(principal), request.amount(), request.methodId());
    }

    private UUID shopId(ShopHubPrincipal principal) {
        if (principal.getShopId() == null) {
            throw ApiException.forbidden("Seller shop not found");
        }
        return principal.getShopId();
    }

    public record WithdrawRequest(BigDecimal amount, UUID methodId) {
    }
}
