package com.shophub.cart.infrastructure;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shophub.cart.domain.WishlistItem;

public interface WishlistItemRepository extends JpaRepository<WishlistItem, WishlistItem.Id> {

    List<WishlistItem> findByIdUserIdOrderByAddedAtDesc(UUID userId);

    boolean existsByIdUserIdAndIdProductId(UUID userId, UUID productId);

    void deleteByIdUserIdAndIdProductId(UUID userId, UUID productId);
}
