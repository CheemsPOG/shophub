CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users (id),
    type            VARCHAR(20) NOT NULL,
    title           VARCHAR(255) NOT NULL,
    body            TEXT NOT NULL,
    read_at         TIMESTAMPTZ,
    entity_type     VARCHAR(40),
    entity_id       UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT notifications_type_chk CHECK (type IN ('order', 'system', 'promo', 'review', 'payout', 'dispute'))
);

CREATE INDEX idx_notifications_user_read ON notifications (user_id, read_at, created_at DESC);
