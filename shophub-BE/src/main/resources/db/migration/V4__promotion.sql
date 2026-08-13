CREATE TABLE coupons (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(40) NOT NULL,
    type            VARCHAR(20) NOT NULL,
    value           NUMERIC(12, 2) NOT NULL,
    usage_limit     INTEGER NOT NULL,
    used_count      INTEGER NOT NULL DEFAULT 0,
    expires_at      TIMESTAMPTZ NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT coupons_code_unique UNIQUE (code),
    CONSTRAINT coupons_type_chk CHECK (type IN ('percent', 'fixed')),
    CONSTRAINT coupons_status_chk CHECK (status IN ('active', 'expired', 'disabled'))
);

CREATE TABLE coupon_redemptions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id   UUID NOT NULL REFERENCES coupons (id),
    user_id     UUID NOT NULL REFERENCES users (id),
    order_id    UUID,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT coupon_redemptions_user_unique UNIQUE (coupon_id, user_id)
);
