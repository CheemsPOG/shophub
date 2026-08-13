package com.shophub.messaging.application;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shophub.identity.infrastructure.UserRepository;
import com.shophub.messaging.domain.Conversation;
import com.shophub.messaging.domain.Message;
import com.shophub.messaging.infrastructure.ConversationRepository;
import com.shophub.messaging.infrastructure.MessageRepository;
import com.shophub.shared.error.ApiException;
import com.shophub.shared.security.ShopHubPrincipal;
import com.shophub.shop.domain.Shop;
import com.shophub.shop.infrastructure.ShopRepository;

@Service
public class MessagingService {

    private final ConversationRepository conversations;
    private final MessageRepository messages;
    private final ShopRepository shops;
    private final UserRepository users;

    public MessagingService(
            ConversationRepository conversations,
            MessageRepository messages,
            ShopRepository shops,
            UserRepository users) {
        this.conversations = conversations;
        this.messages = messages;
        this.shops = shops;
        this.users = users;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> list(ShopHubPrincipal principal) {
        List<Conversation> rows;
        if ("seller".equals(principal.getRole()) && principal.getShopId() != null) {
            rows = conversations.findByShopIdOrderByLastMessageAtDesc(principal.getShopId());
        } else {
            rows = conversations.findByBuyerIdOrderByLastMessageAtDesc(principal.getUserId());
        }
        return rows.stream().map(c -> toConversation(c, principal)).toList();
    }

    @Transactional
    public Map<String, Object> create(ShopHubPrincipal principal, UUID shopId, boolean support) {
        Conversation conversation;
        if (support) {
            conversation = conversations.findByBuyerIdAndSupportTrue(principal.getUserId()).orElseGet(() -> {
                Conversation created = new Conversation();
                created.setBuyerId(principal.getUserId());
                created.setSupport(true);
                created.setLastMessageAt(Instant.now());
                return conversations.save(created);
            });
        } else {
            if (shopId == null) {
                throw ApiException.badRequest("INVALID_SHOP", "shopId is required");
            }
            shops.findById(shopId).orElseThrow(() -> ApiException.notFound("Shop not found"));
            conversation = conversations.findByBuyerIdAndShopId(principal.getUserId(), shopId).orElseGet(() -> {
                Conversation created = new Conversation();
                created.setBuyerId(principal.getUserId());
                created.setShopId(shopId);
                created.setSupport(false);
                created.setLastMessageAt(Instant.now());
                return conversations.save(created);
            });
        }
        return toConversation(conversation, principal);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> messages(ShopHubPrincipal principal, UUID conversationId) {
        Conversation conversation = requireAccess(principal, conversationId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Message message : messages.findByConversationIdOrderByCreatedAtAsc(conversation.getId())) {
            Map<String, Object> dto = new LinkedHashMap<>();
            dto.put("id", message.getId().toString());
            dto.put("from", message.getSenderId().equals(principal.getUserId()) ? "me" : "them");
            dto.put("senderId", message.getSenderId().toString());
            dto.put("text", message.getBody());
            dto.put("at", message.getCreatedAt() == null ? null : message.getCreatedAt().toString());
            result.add(dto);
        }
        return result;
    }

    @Transactional
    public Map<String, Object> send(ShopHubPrincipal principal, UUID conversationId, String text) {
        if (text == null || text.isBlank()) {
            throw ApiException.badRequest("INVALID_MESSAGE", "Message text is required");
        }
        Conversation conversation = requireAccess(principal, conversationId);
        Message message = new Message();
        message.setConversationId(conversation.getId());
        message.setSenderId(principal.getUserId());
        message.setBody(text);
        messages.save(message);
        conversation.setLastMessageAt(Instant.now());
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", message.getId().toString());
        dto.put("from", "me");
        dto.put("senderId", principal.getUserId().toString());
        dto.put("text", message.getBody());
        dto.put("at", message.getCreatedAt() == null ? Instant.now().toString() : message.getCreatedAt().toString());
        return dto;
    }

    private Conversation requireAccess(ShopHubPrincipal principal, UUID conversationId) {
        Conversation conversation = conversations.findById(conversationId)
                .orElseThrow(() -> ApiException.notFound("Conversation not found"));
        boolean buyer = principal.getUserId().equals(conversation.getBuyerId());
        boolean seller = principal.getShopId() != null && principal.getShopId().equals(conversation.getShopId());
        boolean admin = "admin".equals(principal.getRole());
        if (!buyer && !seller && !admin) {
            throw ApiException.forbidden("You cannot access this conversation");
        }
        return conversation;
    }

    private Map<String, Object> toConversation(Conversation conversation, ShopHubPrincipal principal) {
        List<Message> thread = messages.findByConversationIdOrderByCreatedAtAsc(conversation.getId());
        Message last = thread.isEmpty() ? null : thread.get(thread.size() - 1);
        String withName;
        String withAvatar = "";
        String role;
        if (conversation.isSupport()) {
            withName = "ShopHub Support";
            role = "support";
        } else if ("seller".equals(principal.getRole())) {
            withName = users.findById(conversation.getBuyerId()).map(u -> u.getFullName()).orElse("Buyer");
            withAvatar = users.findById(conversation.getBuyerId())
                    .map(u -> com.shophub.shared.web.StockImages.orEmpty(u.getAvatarKey())).orElse("");
            role = "buyer";
        } else {
            Shop shop = conversation.getShopId() == null ? null : shops.findById(conversation.getShopId()).orElse(null);
            withName = shop == null ? "Shop" : shop.getBusinessName();
            withAvatar = shop == null ? "" : com.shophub.shared.web.StockImages.orEmpty(shop.getLogoKey());
            role = "seller";
        }
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", conversation.getId().toString());
        dto.put("withName", withName);
        dto.put("withAvatar", withAvatar);
        dto.put("role", role);
        dto.put("lastMessage", last == null ? "" : last.getBody());
        dto.put("lastAt", conversation.getLastMessageAt() == null ? null : conversation.getLastMessageAt().toString());
        dto.put("unread", 0);
        dto.put("shopId", conversation.getShopId() == null ? null : conversation.getShopId().toString());
        dto.put("support", conversation.isSupport());
        return dto;
    }
}
