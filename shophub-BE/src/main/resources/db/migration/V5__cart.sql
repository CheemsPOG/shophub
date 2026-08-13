CREATE TABLE carts (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users (id),
    coupon_code VARCHAR(40),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT carts_user_unique UNIQUE (user_id)
);

CREATE TABLE cart_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id         UUID NOT NULL REFERENCES carts (id) ON DELETE CASCADE,
    product_id      UUID NOT NULL REFERENCES products (id),
    qty             INTEGER NOT NULL,
    variant_label   VARCHAR(120),
    CONSTRAINT cart_items_qty_chk CHECK (qty > 0),
    CONSTRAINT cart_items_line_unique UNIQUE (cart_id, product_id, variant_label)
);

CREATE TABLE wishlist_items (
    user_id     UUID NOT NULL REFERENCES users (id),
    product_id  UUID NOT NULL REFERENCES products (id),
    added_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, product_id)
);
