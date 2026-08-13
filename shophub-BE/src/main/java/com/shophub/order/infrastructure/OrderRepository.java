package com.shophub.order.infrastructure;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shophub.order.domain.Order;

public interface OrderRepository extends JpaRepository<Order, UUID> {

    List<Order> findByBuyerIdOrderByPlacedAtDesc(UUID buyerId);

    org.springframework.data.domain.Page<Order> findByBuyerId(UUID buyerId, org.springframework.data.domain.Pageable pageable);

    List<Order> findByShopId(UUID shopId);

    org.springframework.data.domain.Page<Order> findByShopId(UUID shopId, org.springframework.data.domain.Pageable pageable);

    List<Order> findByShopIdAndStatus(UUID shopId, String status);

    List<Order> findByCheckoutId(UUID checkoutId);

    Optional<Order> findByOrderNumber(String orderNumber);

    Optional<Order> findByIdAndBuyerId(UUID id, UUID buyerId);

    Optional<Order> findByIdAndShopId(UUID id, UUID shopId);

    long countByShopId(UUID shopId);

    long countByShopIdAndStatus(UUID shopId, String status);

    long countByStatus(String status);

    long countByBuyerId(UUID buyerId);
}
