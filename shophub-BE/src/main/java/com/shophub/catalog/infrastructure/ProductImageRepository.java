package com.shophub.catalog.infrastructure;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shophub.catalog.domain.ProductImage;

public interface ProductImageRepository extends JpaRepository<ProductImage, UUID> {

    List<ProductImage> findByProductIdOrderBySortOrderAsc(UUID productId);

    List<ProductImage> findByProductIdInOrderBySortOrderAsc(java.util.Collection<UUID> productIds);

    void deleteByProductId(UUID productId);
}
