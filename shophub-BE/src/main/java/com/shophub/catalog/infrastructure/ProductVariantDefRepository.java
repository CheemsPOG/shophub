package com.shophub.catalog.infrastructure;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shophub.catalog.domain.ProductVariantDef;

public interface ProductVariantDefRepository extends JpaRepository<ProductVariantDef, UUID> {

    List<ProductVariantDef> findByProductId(UUID productId);

    List<ProductVariantDef> findByProductIdIn(java.util.Collection<UUID> productIds);

    void deleteByProductId(UUID productId);
}
