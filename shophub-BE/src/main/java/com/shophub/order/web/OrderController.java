package com.shophub.order.web;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shophub.order.application.OrderService;
import com.shophub.shared.security.ShopHubPrincipal;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public List<Map<String, Object>> list(@AuthenticationPrincipal ShopHubPrincipal principal) {
        return orderService.listBuyer(principal.getUserId());
    }

    @GetMapping("/{id}")
    public Map<String, Object> get(@AuthenticationPrincipal ShopHubPrincipal principal, @PathVariable UUID id) {
        return orderService.getBuyer(principal.getUserId(), id);
    }

    @PostMapping("/{id}/cancel")
    public Map<String, Object> cancel(@AuthenticationPrincipal ShopHubPrincipal principal, @PathVariable UUID id) {
        return orderService.cancelBuyer(principal.getUserId(), id);
    }
}
