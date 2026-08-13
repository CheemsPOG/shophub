CREATE TABLE checkouts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id            UUID NOT NULL REFERENCES users (id),
    checkout_number     VARCHAR(40) NOT NULL,
    shipping_address    JSONB NOT NULL,
    delivery_method     VARCHAR(20) NOT NULL,
    payment_method      VARCHAR(20) NOT NULL,
    coupon_id           UUID REFERENCES coupons (id),
    subtotal            NUMERIC(12, 2) NOT NULL,
    shipping            NUMERIC(12, 2) NOT NULL,
    tax                 NUMERIC(12, 2) NOT NULL,
    total               NUMERIC(12, 2) NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT checkouts_number_unique UNIQUE (checkout_number),
    CONSTRAINT checkouts_delivery_chk CHECK (delivery_method IN ('standard', 'express', 'pickup')),
    CONSTRAINT checkouts_payment_chk CHECK (payment_method IN ('card', 'paypal', 'cod'))
);

CREATE TABLE orders (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checkout_id         UUID NOT NULL REFERENCES checkouts (id),
    order_number        VARCHAR(40) NOT NULL,
    buyer_id            UUID NOT NULL REFERENCES users (id),
    shop_id             UUID NOT NULL REFERENCES shops (id),
    status              VARCHAR(20) NOT NULL,
    payment_status      VARCHAR(20) NOT NULL,
    subtotal            NUMERIC(12, 2) NOT NULL,
    shipping            NUMERIC(12, 2) NOT NULL,
    tax                 NUMERIC(12, 2) NOT NULL,
    total               NUMERIC(12, 2) NOT NULL,
    commission_rate     NUMERIC(5, 2) NOT NULL,
    shipping_address    JSONB NOT NULL,
    tracking_number     VARCHAR(80),
    placed_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT orders_number_unique UNIQUE (order_number),
    CONSTRAINT orders_status_chk CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
    CONSTRAINT orders_payment_chk CHECK (payment_status IN ('paid', 'pending', 'failed', 'refunded'))
);

CREATE INDEX idx_orders_buyer_placed ON orders (buyer_id, placed_at DESC);
CREATE INDEX idx_orders_shop_status ON orders (shop_id, status);

CREATE TABLE order_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL REFERENCES orders (id),
    product_id      UUID NOT NULL REFERENCES products (id),
    title           VARCHAR(255) NOT NULL,
    image_key       VARCHAR(512),
    unit_price      NUMERIC(12, 2) NOT NULL,
    qty             INTEGER NOT NULL,
    variant_label   VARCHAR(120)
);

CREATE INDEX idx_order_items_order ON order_items (order_id);

CREATE TABLE order_status_history (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id    UUID NOT NULL REFERENCES orders (id),
    from_status VARCHAR(20),
    to_status   VARCHAR(20) NOT NULL,
    actor_id    UUID REFERENCES users (id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checkout_id     UUID NOT NULL REFERENCES checkouts (id),
    provider        VARCHAR(40) NOT NULL,
    status          VARCHAR(20) NOT NULL,
    amount          NUMERIC(12, 2) NOT NULL,
    provider_ref    VARCHAR(120),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT payments_provider_chk CHECK (provider IN ('mock_card', 'mock_paypal', 'cod')),
    CONSTRAINT payments_status_chk CHECK (status IN ('pending', 'captured', 'failed', 'refunded'))
);

CREATE TABLE idempotency_keys (
    key             VARCHAR(80) PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES users (id),
    response_body   TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE reviews
    ADD CONSTRAINT reviews_order_fk FOREIGN KEY (order_id) REFERENCES orders (id);

ALTER TABLE coupon_redemptions
    ADD CONSTRAINT coupon_redemptions_order_fk FOREIGN KEY (order_id) REFERENCES orders (id);
