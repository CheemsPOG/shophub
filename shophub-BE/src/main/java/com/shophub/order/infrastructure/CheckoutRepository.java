package com.shophub.order.infrastructure;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shophub.order.domain.Checkout;

public interface CheckoutRepository extends JpaRepository<Checkout, UUID> {

    Optional<Checkout> findByCheckoutNumber(String checkoutNumber);

    List<Checkout> findByBuyerIdOrderByCreatedAtDesc(UUID buyerId);
}
