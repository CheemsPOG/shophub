CREATE TABLE categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(120) NOT NULL,
    slug        VARCHAR(120) NOT NULL,
    icon        VARCHAR(80),
    parent_id   UUID REFERENCES categories (id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT categories_slug_unique UNIQUE (slug)
);

ALTER TABLE shops ADD COLUMN category_id UUID REFERENCES categories (id);

CREATE TABLE products (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id         UUID NOT NULL REFERENCES shops (id),
    title           VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) NOT NULL,
    description     TEXT NOT NULL,
    category_id     UUID NOT NULL REFERENCES categories (id),
    brand           VARCHAR(120),
    price           NUMERIC(12, 2) NOT NULL,
    compare_at      NUMERIC(12, 2),
    stock           INTEGER NOT NULL DEFAULT 0,
    status          VARCHAR(20) NOT NULL DEFAULT 'draft',
    sales_count     INTEGER NOT NULL DEFAULT 0,
    rating_avg      NUMERIC(3, 2) NOT NULL DEFAULT 0,
    review_count    INTEGER NOT NULL DEFAULT 0,
    tags            TEXT[] NOT NULL DEFAULT '{}',
    search_vector   TSVECTOR,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    version         BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT products_slug_unique UNIQUE (slug),
    CONSTRAINT products_status_chk CHECK (status IN ('draft', 'pending', 'active', 'rejected')),
    CONSTRAINT products_stock_chk CHECK (stock >= 0),
    CONSTRAINT products_price_chk CHECK (price >= 0)
);

CREATE INDEX idx_products_status_category ON products (status, category_id);
CREATE INDEX idx_products_shop ON products (shop_id);
CREATE INDEX idx_products_search ON products USING GIN (search_vector);

CREATE TABLE product_images (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id  UUID NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    object_key  VARCHAR(512) NOT NULL,
    sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_product_images_product ON product_images (product_id);

CREATE TABLE product_variant_defs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id  UUID NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    name        VARCHAR(80) NOT NULL,
    options     TEXT[] NOT NULL DEFAULT '{}'
);

CREATE TABLE reviews (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id      UUID NOT NULL REFERENCES products (id),
    user_id         UUID NOT NULL REFERENCES users (id),
    order_id        UUID,
    rating          INTEGER NOT NULL,
    title           VARCHAR(255) NOT NULL,
    body            TEXT NOT NULL,
    verified        BOOLEAN NOT NULL DEFAULT FALSE,
    helpful_count   INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT reviews_rating_chk CHECK (rating BETWEEN 1 AND 5),
    CONSTRAINT reviews_user_product_unique UNIQUE (product_id, user_id)
);

CREATE TABLE review_helpful (
    review_id   UUID NOT NULL REFERENCES reviews (id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES users (id),
    PRIMARY KEY (review_id, user_id)
);
