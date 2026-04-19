-- TripWise Database Schema
-- PostgreSQL 15+ | Neon Tech
-- Run this once on a fresh database

-- ============================================
-- DROP (for re-runs during development)
-- ============================================
DROP TABLE IF EXISTS budget_alerts CASCADE;
DROP TABLE IF EXISTS destination_notes CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS trip_member_budgets CASCADE;
DROP TABLE IF EXISTS trip_members CASCADE;
DROP TABLE IF EXISTS trips CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS email_verification_codes CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE users (
    user_id         BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100),                        -- NULL until complete-signup
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255),                        -- NULL for Google OAuth users
    avatar          VARCHAR(500),

    -- Auth
    auth_provider   VARCHAR(20)  DEFAULT 'local',        -- 'local' | 'google'
    google_id       VARCHAR(255) UNIQUE,
    email_verified  BOOLEAN      DEFAULT false,

    -- Profile (set during onboarding)
    country         VARCHAR(2),                          -- ISO-2 (MY, US, JP …)
    currency        VARCHAR(3)   DEFAULT 'USD',          -- ISO-4217
    onboarding_completed BOOLEAN DEFAULT false,

    -- Soft delete
    is_deleted      BOOLEAN DEFAULT false,

    -- Timestamps
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_users_auth_provider CHECK (auth_provider IN ('local', 'google'))
);

CREATE INDEX idx_users_email       ON users(email);
CREATE INDEX idx_users_google_id   ON users(google_id);
CREATE INDEX idx_users_is_deleted  ON users(is_deleted);

-- ============================================
-- 2. EMAIL VERIFICATION CODES TABLE
-- (signup OTP + forgot-password OTP)
-- ============================================
CREATE TABLE email_verification_codes (
    id          BIGSERIAL PRIMARY KEY,
    email       VARCHAR(255) NOT NULL,
    code        VARCHAR(10)  NOT NULL,           -- 6-digit OTP
    purpose     VARCHAR(20)  NOT NULL,           -- 'signup' | 'forgot_password'
    expires_at  TIMESTAMP    NOT NULL,
    used        BOOLEAN      DEFAULT false,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_evc_purpose CHECK (purpose IN ('signup', 'forgot_password'))
);

CREATE INDEX idx_evc_email   ON email_verification_codes(email);
CREATE INDEX idx_evc_purpose ON email_verification_codes(purpose);

-- ============================================
-- 3. REFRESH TOKENS TABLE
-- ============================================
CREATE TABLE refresh_tokens (
    token_id    BIGSERIAL PRIMARY KEY,
    user_id     BIGINT       NOT NULL,
    token       VARCHAR(500) UNIQUE NOT NULL,
    expires_at  TIMESTAMP    NOT NULL,
    is_revoked  BOOLEAN      DEFAULT false,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_refresh_tokens_token      ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_user       ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_is_revoked ON refresh_tokens(is_revoked);

-- ============================================
-- 4. TRIPS TABLE
-- ============================================
CREATE TABLE trips (
    trip_id             BIGSERIAL PRIMARY KEY,
    owner_id            BIGINT       NOT NULL,
    name                VARCHAR(255) NOT NULL,
    destination_country VARCHAR(2)   NOT NULL,
    start_date          DATE         NOT NULL,
    end_date            DATE         NOT NULL,

    budget_type     VARCHAR(20)     DEFAULT 'solo',
    total_budget    DECIMAL(12, 2)  NOT NULL,
    spent_amount    DECIMAL(12, 2)  DEFAULT 0.00,
    remaining_budget DECIMAL(12, 2) GENERATED ALWAYS AS (total_budget - spent_amount) STORED,

    currency        VARCHAR(3)  DEFAULT 'USD',
    season          VARCHAR(20),
    description     TEXT,
    image           VARCHAR(500),
    notes           TEXT,
    status          VARCHAR(20) DEFAULT 'PLANNED',
    is_archived     BOOLEAN     DEFAULT false,
    created_at      TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT chk_trips_dates       CHECK (end_date >= start_date),
    CONSTRAINT chk_trips_budget      CHECK (total_budget > 0),
    CONSTRAINT chk_trips_budget_type CHECK (budget_type IN ('solo', 'shared', 'separated')),
    CONSTRAINT chk_trips_status      CHECK (status IN ('PLANNED', 'ONGOING', 'COMPLETED'))
);

CREATE INDEX idx_trips_owner       ON trips(owner_id);
CREATE INDEX idx_trips_dates       ON trips(start_date, end_date);
CREATE INDEX idx_trips_is_archived ON trips(is_archived);

-- ============================================
-- 5. TRIP_MEMBERS TABLE
-- ============================================
CREATE TABLE trip_members (
    member_id   BIGSERIAL PRIMARY KEY,
    trip_id     BIGINT      NOT NULL,
    user_id     BIGINT      NOT NULL,
    role        VARCHAR(20) DEFAULT 'editor',
    is_deleted  BOOLEAN     DEFAULT false,
    joined_at   TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    created_at  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (trip_id) REFERENCES trips(trip_id)  ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id)  ON DELETE CASCADE,
    UNIQUE(trip_id, user_id),
    CONSTRAINT chk_trip_members_role CHECK (role IN ('owner', 'editor', 'viewer'))
);

CREATE INDEX idx_trip_members_trip       ON trip_members(trip_id);
CREATE INDEX idx_trip_members_user       ON trip_members(user_id);
CREATE INDEX idx_trip_members_is_deleted ON trip_members(is_deleted);

-- ============================================
-- 6. TRIP_MEMBER_BUDGETS TABLE (separated budget)
-- ============================================
CREATE TABLE trip_member_budgets (
    budget_id        BIGSERIAL PRIMARY KEY,
    trip_id          BIGINT         NOT NULL,
    user_id          BIGINT         NOT NULL,
    allocated_budget DECIMAL(12, 2) NOT NULL,
    spent_amount     DECIMAL(12, 2) DEFAULT 0.00,
    remaining_budget DECIMAL(12, 2) GENERATED ALWAYS AS (allocated_budget - spent_amount) STORED,
    is_deleted       BOOLEAN        DEFAULT false,
    created_at       TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (trip_id) REFERENCES trips(trip_id)  ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id)  ON DELETE CASCADE,
    UNIQUE(trip_id, user_id),
    CONSTRAINT chk_tmb_allocated CHECK (allocated_budget > 0)
);

CREATE INDEX idx_tmb_trip       ON trip_member_budgets(trip_id);
CREATE INDEX idx_tmb_user       ON trip_member_budgets(user_id);
CREATE INDEX idx_tmb_is_deleted ON trip_member_budgets(is_deleted);

-- ============================================
-- 7. EXPENSES TABLE
-- ============================================
CREATE TABLE expenses (
    expense_id        BIGSERIAL PRIMARY KEY,
    trip_id           BIGINT         NOT NULL,
    added_by          BIGINT,
    category          VARCHAR(50)    NOT NULL,
    amount            DECIMAL(12, 2) NOT NULL,
    original_amount   DECIMAL(12, 2) NOT NULL,
    original_currency VARCHAR(3)     NOT NULL,
    converted_amount  DECIMAL(12, 2) NOT NULL,
    currency          VARCHAR(3)     NOT NULL,
    date              DATE           NOT NULL,
    description       TEXT,
    is_deleted        BOOLEAN        DEFAULT false,
    created_at        TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (trip_id)   REFERENCES trips(trip_id)  ON DELETE CASCADE,
    FOREIGN KEY (added_by)  REFERENCES users(user_id)  ON DELETE SET NULL,
    CONSTRAINT chk_expenses_category CHECK (category IN (
        'accommodation', 'transportation', 'food', 'activities', 'shopping', 'other'
    )),
    CONSTRAINT chk_expenses_amount CHECK (amount >= 0)
);

CREATE INDEX idx_expenses_trip       ON expenses(trip_id);
CREATE INDEX idx_expenses_category   ON expenses(category);
CREATE INDEX idx_expenses_date       ON expenses(date);
CREATE INDEX idx_expenses_added_by   ON expenses(added_by);
CREATE INDEX idx_expenses_is_deleted ON expenses(is_deleted);

-- ============================================
-- 8. DESTINATION_NOTES TABLE
-- ============================================
CREATE TABLE destination_notes (
    note_id     BIGSERIAL PRIMARY KEY,
    trip_id     BIGINT       NOT NULL,
    note_type   VARCHAR(20)  DEFAULT 'custom',
    info_key    VARCHAR(50),
    title       VARCHAR(255),
    content     TEXT         NOT NULL,
    is_deleted  BOOLEAN      DEFAULT false,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE,
    CONSTRAINT chk_dn_type CHECK (note_type IN ('quick_info', 'custom'))
);

CREATE INDEX idx_dn_trip       ON destination_notes(trip_id);
CREATE INDEX idx_dn_type       ON destination_notes(note_type);
CREATE INDEX idx_dn_key        ON destination_notes(info_key);
CREATE INDEX idx_dn_is_deleted ON destination_notes(is_deleted);

-- ============================================
-- 9. BUDGET_ALERTS TABLE
-- ============================================
CREATE TABLE budget_alerts (
    alert_id     BIGSERIAL PRIMARY KEY,
    user_id      BIGINT      NOT NULL,
    trip_id      BIGINT      NOT NULL,
    alert_type   VARCHAR(50) NOT NULL,
    is_dismissed BOOLEAN     DEFAULT false,
    dismissed_at TIMESTAMP,
    is_deleted   BOOLEAN     DEFAULT false,
    created_at   TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE
);

CREATE INDEX idx_ba_user       ON budget_alerts(user_id);
CREATE INDEX idx_ba_trip       ON budget_alerts(trip_id);
CREATE INDEX idx_ba_is_deleted ON budget_alerts(is_deleted);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update trips.spent_amount when expenses change
CREATE OR REPLACE FUNCTION update_trip_spent()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        UPDATE trips
        SET spent_amount = (
            SELECT COALESCE(SUM(amount), 0)
            FROM expenses
            WHERE trip_id = OLD.trip_id AND is_deleted = false
        ), updated_at = CURRENT_TIMESTAMP
        WHERE trip_id = OLD.trip_id;
        RETURN OLD;
    ELSE
        UPDATE trips
        SET spent_amount = (
            SELECT COALESCE(SUM(amount), 0)
            FROM expenses
            WHERE trip_id = NEW.trip_id AND is_deleted = false
        ), updated_at = CURRENT_TIMESTAMP
        WHERE trip_id = NEW.trip_id;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_trip_spent
AFTER INSERT OR UPDATE OR DELETE ON expenses
FOR EACH ROW EXECUTE FUNCTION update_trip_spent();

-- Update trip_member_budgets.spent_amount (separated mode)
CREATE OR REPLACE FUNCTION update_member_budget_spent()
RETURNS TRIGGER AS $$
DECLARE
    v_budget_type VARCHAR(20);
BEGIN
    SELECT budget_type INTO v_budget_type FROM trips WHERE trip_id = COALESCE(NEW.trip_id, OLD.trip_id);

    IF v_budget_type = 'separated' THEN
        IF TG_OP = 'DELETE' THEN
            UPDATE trip_member_budgets
            SET spent_amount = (
                SELECT COALESCE(SUM(amount), 0)
                FROM expenses
                WHERE trip_id = OLD.trip_id AND added_by = OLD.added_by AND is_deleted = false
            ), updated_at = CURRENT_TIMESTAMP
            WHERE trip_id = OLD.trip_id AND user_id = OLD.added_by;
            RETURN OLD;
        ELSE
            UPDATE trip_member_budgets
            SET spent_amount = (
                SELECT COALESCE(SUM(amount), 0)
                FROM expenses
                WHERE trip_id = NEW.trip_id AND added_by = NEW.added_by AND is_deleted = false
            ), updated_at = CURRENT_TIMESTAMP
            WHERE trip_id = NEW.trip_id AND user_id = NEW.added_by;
            RETURN NEW;
        END IF;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_member_budget_spent
AFTER INSERT OR UPDATE OR DELETE ON expenses
FOR EACH ROW EXECUTE FUNCTION update_member_budget_spent();

-- Auto-update updated_at on all tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at             BEFORE UPDATE ON users             FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_trips_updated_at             BEFORE UPDATE ON trips             FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_trip_members_updated_at      BEFORE UPDATE ON trip_members      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_tmb_updated_at               BEFORE UPDATE ON trip_member_budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_expenses_updated_at          BEFORE UPDATE ON expenses          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_dn_updated_at                BEFORE UPDATE ON destination_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_ba_updated_at                BEFORE UPDATE ON budget_alerts     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_refresh_tokens_updated_at    BEFORE UPDATE ON refresh_tokens    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
