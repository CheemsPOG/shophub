package com.shophub.cart.infrastructure;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shophub.cart.domain.CartItem;

public interface CartItemRepository extends JpaRepository<CartItem, UUID> {

    List<CartItem> findByCartId(UUID cartId);

    Optional<CartItem> findByCartIdAndProductIdAndVariantLabel(UUID cartId, UUID productId, String variantLabel);

    Optional<CartItem> findByCartIdAndProductIdAndVariantLabelIsNull(UUID cartId, UUID productId);

    Optional<CartItem> findByIdAndCartId(UUID id, UUID cartId);

    void deleteByCartId(UUID cartId);
}
