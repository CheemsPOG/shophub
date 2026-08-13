package com.shophub.catalog.infrastructure;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shophub.catalog.domain.Review;

public interface ReviewRepository extends JpaRepository<Review, UUID> {

    List<Review> findByProductIdOrderByCreatedAtDesc(UUID productId);

    Optional<Review> findByProductIdAndUserId(UUID productId, UUID userId);

    List<Review> findByUserId(UUID userId);

    boolean existsByProductIdAndUserId(UUID productId, UUID userId);
}
