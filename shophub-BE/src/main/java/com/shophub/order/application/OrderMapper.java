package com.shophub.order.application;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shophub.identity.infrastructure.UserRepository;
import com.shophub.order.domain.Order;
import com.shophub.order.domain.OrderItem;
import com.shophub.order.infrastructure.OrderItemRepository;
import com.shophub.shop.infrastructure.ShopRepository;

@Component
public class OrderMapper {

    private final OrderItemRepository orderItems;
    private final ShopRepository shops;
    private final UserRepository users;
    private final ObjectMapper objectMapper;

    public OrderMapper(
            OrderItemRepository orderItems,
            ShopRepository shops,
            UserRepository users,
            ObjectMapper objectMapper) {
        this.orderItems = orderItems;
        this.shops = shops;
        this.users = users;
        this.objectMapper = objectMapper;
    }

    public Map<String, Object> toOrder(Order order) {
        List<OrderItem> items = orderItems.findByOrderId(order.getId());
        return toOrder(order, items);
    }

    public Map<String, Object> toOrder(Order order, List<OrderItem> items) {
        String sellerName = shops.findById(order.getShopId()).map(s -> s.getBusinessName()).orElse("");
        String buyerName = users.findById(order.getBuyerId()).map(u -> u.getFullName()).orElse("");
        List<Map<String, Object>> itemDtos = new ArrayList<>();
        for (OrderItem item : items) {
            Map<String, Object> dto = new LinkedHashMap<>();
            dto.put("id", item.getId().toString());
            dto.put("productId", item.getProductId().toString());
            dto.put("title", item.getTitle());
            dto.put("image", item.getImageKey() == null ? "" : item.getImageKey());
            dto.put("price", item.getUnitPrice());
            dto.put("qty", item.getQty());
            dto.put("sellerId", order.getShopId().toString());
            dto.put("variant", item.getVariantLabel());
            itemDtos.add(dto);
        }
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", order.getId().toString());
        dto.put("orderNumber", order.getOrderNumber());
        dto.put("checkoutId", order.getCheckoutId().toString());
        dto.put("buyerId", order.getBuyerId().toString());
        dto.put("buyerName", buyerName);
        dto.put("sellerId", order.getShopId().toString());
        dto.put("sellerName", sellerName);
        dto.put("items", itemDtos);
        dto.put("total", order.getTotal());
        dto.put("subtotal", order.getSubtotal());
        dto.put("shipping", order.getShipping());
        dto.put("tax", order.getTax());
        dto.put("status", order.getStatus());
        dto.put("paymentStatus", order.getPaymentStatus());
        dto.put("shippingAddress", parseAddress(order.getShippingAddress()));
        dto.put("placedAt", order.getPlacedAt() == null ? null : order.getPlacedAt().toString());
        dto.put("updatedAt", order.getUpdatedAt() == null ? null : order.getUpdatedAt().toString());
        dto.put("trackingNumber", order.getTrackingNumber());
        dto.put("commissionRate", order.getCommissionRate());
        return dto;
    }

    private Object parseAddress(String json) {
        if (json == null || json.isBlank()) {
            return Map.of();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {
            });
        } catch (Exception ex) {
            return json;
        }
    }
}
