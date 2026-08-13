package com.shophub.catalog.domain;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "review_helpful")
public class ReviewHelpful {

    @EmbeddedId
    private Id id;

    public Id getId() {
        return id;
    }

    public void setId(Id id) {
        this.id = id;
    }

    @Embeddable
    public static class Id implements Serializable {

        @Column(name = "review_id", nullable = false)
        private UUID reviewId;

        @Column(name = "user_id", nullable = false)
        private UUID userId;

        public Id() {
        }

        public Id(UUID reviewId, UUID userId) {
            this.reviewId = reviewId;
            this.userId = userId;
        }

        public UUID getReviewId() {
            return reviewId;
        }

        public void setReviewId(UUID reviewId) {
            this.reviewId = reviewId;
        }

        public UUID getUserId() {
            return userId;
        }

        public void setUserId(UUID userId) {
            this.userId = userId;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) {
                return true;
            }
            if (o == null || getClass() != o.getClass()) {
                return false;
            }
            Id id = (Id) o;
            return Objects.equals(reviewId, id.reviewId) && Objects.equals(userId, id.userId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(reviewId, userId);
        }
    }
}
