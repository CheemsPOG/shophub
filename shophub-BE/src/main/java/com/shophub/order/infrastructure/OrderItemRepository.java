package com.shophub.order.infrastructure;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shophub.order.domain.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, UUID> {

    List<OrderItem> findByOrderId(UUID orderId);

    List<OrderItem> findByProductId(UUID productId);

    List<OrderItem> findByOrderIdIn(java.util.Collection<UUID> orderIds);

    @org.springframework.data.jpa.repository.Query("""
            select count(oi) > 0 from OrderItem oi, Order o
            where oi.orderId = o.id and oi.productId = :productId
              and o.buyerId = :buyerId and o.status = 'delivered'
            """)
    boolean hasDeliveredPurchase(
            @org.springframework.data.repository.query.Param("productId") UUID productId,
            @org.springframework.data.repository.query.Param("buyerId") UUID buyerId);
}
