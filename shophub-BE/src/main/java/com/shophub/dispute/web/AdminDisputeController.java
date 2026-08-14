package com.shophub.dispute.web;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.shophub.dispute.domain.Dispute;
import com.shophub.dispute.infrastructure.DisputeRepository;
import com.shophub.identity.infrastructure.UserRepository;
import com.shophub.order.application.OrderService;
import com.shophub.order.domain.Order;
import com.shophub.order.infrastructure.OrderRepository;
import com.shophub.shared.error.ApiException;
import com.shophub.shared.security.ShopHubPrincipal;
import com.shophub.shop.infrastructure.ShopRepository;

@RestController
@RequestMapping("/api/v1/admin/disputes")
public class AdminDisputeController {

    private final DisputeRepository disputes;
    private final OrderRepository orders;
    private final OrderService orderService;
    private final ShopRepository shops;
    private final UserRepository users;

    public AdminDisputeController(
            DisputeRepository disputes,
            OrderRepository orders,
            OrderService orderService,
            ShopRepository shops,
            UserRepository users) {
        this.disputes = disputes;
        this.orders = orders;
        this.orderService = orderService;
        this.shops = shops;
        this.users = users;
    }

    @GetMapping
    public List<Map<String, Object>> list(@RequestParam(required = false) String status) {
        List<Dispute> rows = (status == null || status.isBlank()) ? disputes.findAll() : disputes.findByStatus(status);
        return rows.stream().map(this::toDto).toList();
    }

    @PostMapping("/{id}/resolve")
    @Transactional
    public Map<String, Object> resolve(
            @AuthenticationPrincipal ShopHubPrincipal principal,
            @PathVariable UUID id,
            @RequestBody ResolveRequest request) {
        return resolveInternal(principal, id, request == null ? null : request.resolution(), request == null ? null : request.notes());
    }

    @PostMapping("/{id}/resolve/buyer")
    @Transactional
    public Map<String, Object> resolveBuyer(
            @AuthenticationPrincipal ShopHubPrincipal principal,
            @PathVariable UUID id,
            @RequestBody(required = false) ResolveRequest request) {
        return resolveInternal(principal, id, "buyer", request == null ? null : request.notes());
    }

    @PostMapping("/{id}/resolve/seller")
    @Transactional
    public Map<String, Object> resolveSeller(
            @AuthenticationPrincipal ShopHubPrincipal principal,
            @PathVariable UUID id,
            @RequestBody(required = false) ResolveRequest request) {
        return resolveInternal(principal, id, "seller", request == null ? null : request.notes());
    }

    private Map<String, Object> resolveInternal(ShopHubPrincipal principal, UUID id, String resolution, String notes) {
        Dispute dispute = disputes.findById(id).orElseThrow(() -> ApiException.notFound("Dispute not found"));
        if ("resolved".equals(dispute.getStatus()) || "rejected".equals(dispute.getStatus())) {
            throw ApiException.badRequest("INVALID_STATE_TRANSITION", "Dispute is already closed");
        }
        if (!"buyer".equals(resolution) && !"seller".equals(resolution)) {
            throw ApiException.badRequest("INVALID_RESOLUTION", "Resolution must be buyer or seller");
        }
        dispute.setStatus("resolved");
        dispute.setResolution(resolution);
        dispute.setResolvedAt(Instant.now());
        dispute.setNotes(notes);
        if ("buyer".equals(resolution)) {
            Order order = orders.findById(dispute.getOrderId()).orElseThrow(() -> ApiException.notFound("Order not found"));
            orderService.refundOrder(order, principal.getUserId());
        }
        return toDto(dispute);
    }

    private Map<String, Object> toDto(Dispute dispute) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", dispute.getId().toString());
        Order order = orders.findById(dispute.getOrderId()).orElse(null);
        dto.put("orderNumber", order == null ? "" : order.getOrderNumber());
        dto.put("orderId", dispute.getOrderId().toString());
        dto.put("buyerId", dispute.getBuyerId().toString());
        dto.put("buyerName", users.findById(dispute.getBuyerId()).map(u -> u.getFullName()).orElse(""));
        dto.put("sellerId", dispute.getShopId().toString());
        dto.put("sellerName", shops.findById(dispute.getShopId()).map(s -> s.getBusinessName()).orElse(""));
        dto.put("reason", dispute.getReason());
        dto.put("status", dispute.getStatus());
        dto.put("amount", dispute.getAmount());
        dto.put("openedAt", dispute.getOpenedAt() == null ? null : dispute.getOpenedAt().toString());
        dto.put("resolution", dispute.getResolution());
        dto.put("notes", dispute.getNotes());
        return dto;
    }

    public record ResolveRequest(String resolution, String notes) {
    }
}
