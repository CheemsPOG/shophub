CREATE TABLE platform_settings (
    key         VARCHAR(80) PRIMARY KEY,
    value       JSONB NOT NULL,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO platform_settings (key, value) VALUES
    ('platform_name', '"ShopHub"'::jsonb),
    ('support_email', '"support@shophub.com"'::jsonb),
    ('currency', '"USD"'::jsonb),
    ('timezone', '"UTC-08:00 (Pacific)"'::jsonb),
    ('commission_default', '8'::jsonb),
    ('commission_pro', '5'::jsonb),
    ('min_payout', '50'::jsonb),
    ('notify_seller_applications', 'true'::jsonb),
    ('notify_disputes', 'true'::jsonb),
    ('notify_large_orders', 'false'::jsonb),
    ('notify_daily_revenue', 'true'::jsonb);

CREATE TABLE outbox (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type      VARCHAR(80) NOT NULL,
    payload         JSONB NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    published_at    TIMESTAMPTZ,
    attempts        INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_outbox_unpublished ON outbox (created_at) WHERE published_at IS NULL;

CREATE TABLE audit_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id        UUID REFERENCES users (id),
    action          VARCHAR(80) NOT NULL,
    entity_type     VARCHAR(80) NOT NULL,
    entity_id       UUID,
    diff            JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_entity ON audit_log (entity_type, entity_id);
