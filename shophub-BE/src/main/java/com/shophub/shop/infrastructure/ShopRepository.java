package com.shophub.shop.infrastructure;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shophub.shop.domain.Shop;

public interface ShopRepository extends JpaRepository<Shop, UUID> {

    Optional<Shop> findByUserId(UUID userId);

    Optional<Shop> findBySlug(String slug);

    List<Shop> findByStatus(String status);

    long countByStatus(String status);

    boolean existsBySlug(String slug);

    boolean existsByUserId(UUID userId);
}
