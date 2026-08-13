package com.shophub.order.web;

import java.util.Map;
import java.util.UUID;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.shophub.order.application.OrderService;
import com.shophub.shared.error.ApiException;
import com.shophub.shared.security.ShopHubPrincipal;

@RestController
@RequestMapping("/api/v1/seller/orders")
public class SellerOrderController {

    private final OrderService orderService;

    public SellerOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public Map<String, Object> list(
            @AuthenticationPrincipal ShopHubPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return orderService.listSeller(shopId(principal), page, size);
    }

    @GetMapping("/{id}")
    public Map<String, Object> get(@AuthenticationPrincipal ShopHubPrincipal principal, @PathVariable UUID id) {
        return orderService.getSeller(shopId(principal), id);
    }

    @PostMapping("/{id}/confirm")
    public Map<String, Object> confirm(@AuthenticationPrincipal ShopHubPrincipal principal, @PathVariable UUID id) {
        return orderService.confirm(shopId(principal), principal.getUserId(), id);
    }

    @PostMapping("/{id}/ship")
    public Map<String, Object> ship(
            @AuthenticationPrincipal ShopHubPrincipal principal,
            @PathVariable UUID id,
            @RequestBody(required = false) ShipRequest request) {
        String tracking = request == null ? null : request.trackingNumber();
        return orderService.ship(shopId(principal), principal.getUserId(), id, tracking);
    }

    @PostMapping("/{id}/deliver")
    public Map<String, Object> deliver(@AuthenticationPrincipal ShopHubPrincipal principal, @PathVariable UUID id) {
        return orderService.deliver(shopId(principal), principal.getUserId(), id);
    }

    @PostMapping("/{id}/cancel")
    public Map<String, Object> cancel(@AuthenticationPrincipal ShopHubPrincipal principal, @PathVariable UUID id) {
        return orderService.cancelSeller(shopId(principal), principal.getUserId(), id);
    }

    private UUID shopId(ShopHubPrincipal principal) {
        if (principal.getShopId() == null) {
            throw ApiException.forbidden("Seller shop not found");
        }
        return principal.getShopId();
    }

    public record ShipRequest(String trackingNumber) {
    }
}
