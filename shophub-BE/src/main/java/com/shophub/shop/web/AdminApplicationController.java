package com.shophub.shop.web;

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

import com.shophub.notification.domain.Notification;
import com.shophub.notification.infrastructure.NotificationRepository;
import com.shophub.payout.domain.SellerBalance;
import com.shophub.payout.infrastructure.SellerBalanceRepository;
import com.shophub.shared.error.ApiException;
import com.shophub.shared.security.ShopHubPrincipal;
import com.shophub.shop.domain.SellerApplication;
import com.shophub.shop.domain.Shop;
import com.shophub.shop.infrastructure.SellerApplicationRepository;
import com.shophub.shop.infrastructure.ShopRepository;

@RestController
@RequestMapping("/api/v1/admin/applications")
public class AdminApplicationController {

    private final SellerApplicationRepository applications;
    private final ShopRepository shops;
    private final SellerBalanceRepository balances;
    private final NotificationRepository notifications;

    public AdminApplicationController(
            SellerApplicationRepository applications,
            ShopRepository shops,
            SellerBalanceRepository balances,
            NotificationRepository notifications) {
        this.applications = applications;
        this.shops = shops;
        this.balances = balances;
        this.notifications = notifications;
    }

    @GetMapping
    public List<Map<String, Object>> list(@RequestParam(required = false) String status) {
        List<SellerApplication> rows = (status == null || status.isBlank())
                ? applications.findAll()
                : applications.findByStatusOrderBySubmittedAtDesc(status);
        return rows.stream().map(this::toDto).toList();
    }

    @PostMapping("/{id}/approve")
    @Transactional
    public Map<String, Object> approve(@AuthenticationPrincipal ShopHubPrincipal principal, @PathVariable UUID id) {
        SellerApplication application = applications.findById(id).orElseThrow(() -> ApiException.notFound("Application not found"));
        if (!"pending".equals(application.getStatus())) {
            throw ApiException.badRequest("INVALID_STATE_TRANSITION", "Only pending applications can be approved");
        }
        application.setStatus("approved");
        application.setReviewedAt(Instant.now());
        application.setReviewerId(principal.getUserId());
        Shop shop = shops.findById(application.getShopId()).orElseThrow(() -> ApiException.notFound("Shop not found"));
        shop.setStatus("verified");
        if (!balances.existsById(shop.getId())) {
            SellerBalance balance = new SellerBalance();
            balance.setShopId(shop.getId());
            balance.setAvailable(java.math.BigDecimal.ZERO);
            balance.setPending(java.math.BigDecimal.ZERO);
            balances.save(balance);
        }
        notify(application.getUserId(), "Your shop was approved", shop.getBusinessName() + " is now verified.");
        return toDto(application);
    }

    @PostMapping("/{id}/reject")
    @Transactional
    public Map<String, Object> reject(
            @AuthenticationPrincipal ShopHubPrincipal principal,
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body) {
        SellerApplication application = applications.findById(id).orElseThrow(() -> ApiException.notFound("Application not found"));
        if (!"pending".equals(application.getStatus())) {
            throw ApiException.badRequest("INVALID_STATE_TRANSITION", "Only pending applications can be rejected");
        }
        String reason = body == null ? "" : body.getOrDefault("reason", "");
        application.setStatus("rejected");
        application.setReviewedAt(Instant.now());
        application.setReviewerId(principal.getUserId());
        application.setRejectReason(reason);
        Shop shop = shops.findById(application.getShopId()).orElseThrow(() -> ApiException.notFound("Shop not found"));
        shop.setStatus("rejected");
        notify(application.getUserId(), "Your shop application was rejected",
                reason.isBlank() ? shop.getBusinessName() + " was not approved." : reason);
        return toDto(application);
    }

    private Map<String, Object> toDto(SellerApplication application) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", application.getId().toString());
        dto.put("businessName", application.getBusinessName());
        dto.put("applicant", application.getApplicantName());
        dto.put("email", application.getEmail());
        dto.put("category", application.getCategory() == null ? "" : application.getCategory());
        dto.put("status", application.getStatus());
        dto.put("submittedAt", application.getSubmittedAt() == null ? null : application.getSubmittedAt().toString());
        dto.put("shopId", application.getShopId().toString());
        dto.put("rejectReason", application.getRejectReason());
        return dto;
    }

    private void notify(UUID userId, String title, String body) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setType("system");
        notification.setTitle(title);
        notification.setBody(body);
        notifications.save(notification);
    }
}
