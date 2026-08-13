CREATE TABLE disputes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL REFERENCES orders (id),
    checkout_id     UUID NOT NULL REFERENCES checkouts (id),
    buyer_id        UUID NOT NULL REFERENCES users (id),
    shop_id         UUID NOT NULL REFERENCES shops (id),
    reason          TEXT NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'open',
    amount          NUMERIC(12, 2) NOT NULL,
    opened_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at     TIMESTAMPTZ,
    resolution      VARCHAR(20),
    notes           TEXT,
    CONSTRAINT disputes_status_chk CHECK (status IN ('open', 'under_review', 'resolved', 'rejected')),
    CONSTRAINT disputes_resolution_chk CHECK (resolution IS NULL OR resolution IN ('buyer', 'seller'))
);

CREATE INDEX idx_disputes_status ON disputes (status);
