package com.shophub.notification.web;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shophub.notification.domain.Notification;
import com.shophub.notification.infrastructure.NotificationRepository;
import com.shophub.shared.error.ApiException;
import com.shophub.shared.security.ShopHubPrincipal;
import com.shophub.shared.web.JsonMaps;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationRepository notifications;

    public NotificationController(NotificationRepository notifications) {
        this.notifications = notifications;
    }

    @GetMapping
    public List<Map<String, Object>> list(@AuthenticationPrincipal ShopHubPrincipal principal) {
        return notifications.findByUserIdOrderByCreatedAtDesc(principal.getUserId()).stream()
                .map(this::toDto)
                .toList();
    }

    @GetMapping("/unread-count")
    public Map<String, Object> unreadCount(@AuthenticationPrincipal ShopHubPrincipal principal) {
        return JsonMaps.of("count", notifications.countByUserIdAndReadAtIsNull(principal.getUserId()));
    }

    @PatchMapping("/{id}/read")
    @Transactional
    public Map<String, Object> markRead(@AuthenticationPrincipal ShopHubPrincipal principal, @PathVariable UUID id) {
        Notification notification = notifications.findByIdAndUserId(id, principal.getUserId())
                .orElseThrow(() -> ApiException.notFound("Notification not found"));
        notification.setReadAt(Instant.now());
        return toDto(notification);
    }

    @PostMapping("/read-all")
    @Transactional
    public Map<String, String> readAll(@AuthenticationPrincipal ShopHubPrincipal principal) {
        Instant now = Instant.now();
        for (Notification notification : notifications.findByUserIdAndReadAtIsNull(principal.getUserId())) {
            notification.setReadAt(now);
        }
        return Map.of("status", "ok");
    }

    private Map<String, Object> toDto(Notification notification) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", notification.getId().toString());
        dto.put("type", notification.getType());
        dto.put("title", notification.getTitle());
        dto.put("body", notification.getBody());
        dto.put("date", notification.getCreatedAt() == null ? null : notification.getCreatedAt().toString());
        dto.put("read", notification.getReadAt() != null);
        dto.put("entityType", notification.getEntityType());
        dto.put("entityId", notification.getEntityId() == null ? null : notification.getEntityId().toString());
        return dto;
    }
}
