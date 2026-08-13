package com.shophub.cart.domain;

import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "wishlist_items")
public class WishlistItem {

    @EmbeddedId
    private Id id;

    @CreationTimestamp
    @Column(name = "added_at", nullable = false, updatable = false)
    private Instant addedAt;

    public Id getId() {
        return id;
    }

    public void setId(Id id) {
        this.id = id;
    }

    public Instant getAddedAt() {
        return addedAt;
    }

    public void setAddedAt(Instant addedAt) {
        this.addedAt = addedAt;
    }

    @Embeddable
    public static class Id implements Serializable {

        @Column(name = "user_id", nullable = false)
        private UUID userId;

        @Column(name = "product_id", nullable = false)
        private UUID productId;

        public Id() {
        }

        public Id(UUID userId, UUID productId) {
            this.userId = userId;
            this.productId = productId;
        }

        public UUID getUserId() {
            return userId;
        }

        public void setUserId(UUID userId) {
            this.userId = userId;
        }

        public UUID getProductId() {
            return productId;
        }

        public void setProductId(UUID productId) {
            this.productId = productId;
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
            return Objects.equals(userId, id.userId) && Objects.equals(productId, id.productId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(userId, productId);
        }
    }
}
