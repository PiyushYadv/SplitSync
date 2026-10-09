-- Accounts created through Google or GitHub have no password until the user sets one.
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Single-use tokens sent by email. Only a SHA-256 hash of the token is stored.
CREATE TABLE user_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    purpose VARCHAR(30) NOT NULL CHECK (purpose IN ('email_verification', 'password_reset', 'email_change')),
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    -- The address being confirmed, for email_change tokens.
    new_email VARCHAR(255),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_tokens_user_purpose ON user_tokens(user_id, purpose);

-- External sign-in accounts (Google, GitHub) linked to a SplitSync user.
CREATE TABLE user_identities (
    provider VARCHAR(20) NOT NULL CHECK (provider IN ('google', 'github')),
    provider_user_id VARCHAR(255) NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (provider, provider_user_id)
);

CREATE INDEX idx_user_identities_user ON user_identities(user_id);
