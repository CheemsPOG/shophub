CREATE TABLE shops (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users (id),
    business_name       VARCHAR(255) NOT NULL,
    slug                VARCHAR(255) NOT NULL,
    logo_key            VARCHAR(512),
    banner_key          VARCHAR(512),
    tagline             VARCHAR(255),
    description         TEXT,
    email               VARCHAR(255) NOT NULL,
    phone               VARCHAR(40),
    address             VARCHAR(512),
    plan                VARCHAR(20) NOT NULL DEFAULT 'standard',
    status              VARCHAR(20) NOT NULL DEFAULT 'pending',
    commission_rate     NUMERIC(5, 2),
    rating_avg          NUMERIC(3, 2) NOT NULL DEFAULT 0,
    total_sales         INTEGER NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT shops_user_unique UNIQUE (user_id),
    CONSTRAINT shops_slug_unique UNIQUE (slug),
    CONSTRAINT shops_plan_chk CHECK (plan IN ('standard', 'pro')),
    CONSTRAINT shops_status_chk CHECK (status IN ('pending', 'verified', 'rejected'))
);

CREATE TABLE seller_applications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users (id),
    shop_id         UUID NOT NULL REFERENCES shops (id),
    business_name   VARCHAR(255) NOT NULL,
    applicant_name  VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    category        VARCHAR(120),
    status          VARCHAR(20) NOT NULL DEFAULT 'pending',
    submitted_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_at     TIMESTAMPTZ,
    reviewer_id     UUID REFERENCES users (id),
    reject_reason   TEXT,
    CONSTRAINT seller_applications_status_chk CHECK (status IN ('pending', 'approved', 'rejected'))
);

CREATE INDEX idx_seller_applications_status ON seller_applications (status);
CREATE INDEX idx_shops_status ON shops (status);
