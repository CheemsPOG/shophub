CREATE TABLE conversations (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id            UUID NOT NULL REFERENCES users (id),
    shop_id             UUID REFERENCES shops (id),
    support             BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_message_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_conversations_buyer ON conversations (buyer_id, last_message_at DESC);
CREATE INDEX idx_conversations_shop ON conversations (shop_id, last_message_at DESC);

CREATE TABLE messages (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id     UUID NOT NULL REFERENCES conversations (id) ON DELETE CASCADE,
    sender_id           UUID NOT NULL REFERENCES users (id),
    body                TEXT NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_conversation ON messages (conversation_id, created_at);
