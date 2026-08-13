CREATE TABLE seller_balances (
    shop_id     UUID PRIMARY KEY REFERENCES shops (id),
    available   NUMERIC(12, 2) NOT NULL DEFAULT 0,
    pending     NUMERIC(12, 2) NOT NULL DEFAULT 0,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    version     BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE payout_methods (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id         UUID NOT NULL REFERENCES shops (id),
    type            VARCHAR(20) NOT NULL,
    masked_display  VARCHAR(120) NOT NULL,
    details         VARCHAR(512),
    is_default      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT payout_methods_type_chk CHECK (type IN ('bank', 'paypal'))
);

CREATE TABLE payouts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id         UUID NOT NULL REFERENCES shops (id),
    amount          NUMERIC(12, 2) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'pending',
    method_id       UUID REFERENCES payout_methods (id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed_at    TIMESTAMPTZ,
    failure_reason  TEXT,
    CONSTRAINT payouts_status_chk CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

CREATE TABLE ledger_entries (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id     UUID NOT NULL REFERENCES shops (id),
    order_id    UUID REFERENCES orders (id),
    payout_id   UUID REFERENCES payouts (id),
    type        VARCHAR(40) NOT NULL,
    amount      NUMERIC(12, 2) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ledger_type_chk CHECK (type IN ('credit_pending', 'release_available', 'clawback', 'payout'))
);

CREATE INDEX idx_payouts_shop ON payouts (shop_id, created_at DESC);
CREATE INDEX idx_ledger_shop ON ledger_entries (shop_id, created_at DESC);
