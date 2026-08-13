package com.shophub.catalog.infrastructure;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shophub.catalog.domain.ReviewHelpful;

public interface ReviewHelpfulRepository extends JpaRepository<ReviewHelpful, ReviewHelpful.Id> {

    List<ReviewHelpful> findByIdReviewId(UUID reviewId);

    boolean existsByIdReviewIdAndIdUserId(UUID reviewId, UUID userId);

    void deleteByIdReviewId(UUID reviewId);
}
