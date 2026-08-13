package com.shophub.order.infrastructure;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shophub.order.domain.Payment;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    List<Payment> findByCheckoutId(UUID checkoutId);
}
