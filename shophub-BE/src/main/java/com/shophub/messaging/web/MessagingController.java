package com.shophub.messaging.web;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shophub.messaging.application.MessagingService;
import com.shophub.shared.security.ShopHubPrincipal;

@RestController
@RequestMapping("/api/v1/conversations")
public class MessagingController {

    private final MessagingService messagingService;

    public MessagingController(MessagingService messagingService) {
        this.messagingService = messagingService;
    }

    @GetMapping
    public List<Map<String, Object>> list(@AuthenticationPrincipal ShopHubPrincipal principal) {
        return messagingService.list(principal);
    }

    @PostMapping
    public Map<String, Object> create(
            @AuthenticationPrincipal ShopHubPrincipal principal,
            @RequestBody ConversationRequest request) {
        boolean support = request != null && Boolean.TRUE.equals(request.support());
        UUID shopId = request == null ? null : request.shopId();
        return messagingService.create(principal, shopId, support);
    }

    @GetMapping("/{id}/messages")
    public List<Map<String, Object>> messages(
            @AuthenticationPrincipal ShopHubPrincipal principal,
            @PathVariable UUID id) {
        return messagingService.messages(principal, id);
    }

    @PostMapping("/{id}/messages")
    public Map<String, Object> send(
            @AuthenticationPrincipal ShopHubPrincipal principal,
            @PathVariable UUID id,
            @RequestBody MessageRequest request) {
        String text = request == null ? null : (request.text() != null ? request.text() : request.body());
        return messagingService.send(principal, id, text);
    }

    public record ConversationRequest(UUID shopId, Boolean support) {
    }

    public record MessageRequest(String text, String body) {
    }
}
