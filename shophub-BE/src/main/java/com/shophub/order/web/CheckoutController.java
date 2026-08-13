package com.shophub.order.web;

import java.util.Map;
import java.util.UUID;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shophub.order.application.CheckoutService;
import com.shophub.shared.security.ShopHubPrincipal;

@RestController
@RequestMapping("/api/v1/checkout")
public class CheckoutController {

    private final CheckoutService checkoutService;

    public CheckoutController(CheckoutService checkoutService) {
        this.checkoutService = checkoutService;
    }

    @PostMapping
    public Map<String, Object> checkout(
            @AuthenticationPrincipal ShopHubPrincipal principal,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @RequestBody CheckoutRequest request) {
        return checkoutService.checkout(
                principal.getUserId(),
                request.addressId(),
                request.deliveryMethod(),
                request.paymentMethod(),
                idempotencyKey);
    }

    public record CheckoutRequest(UUID addressId, String deliveryMethod, String paymentMethod) {
    }
}
