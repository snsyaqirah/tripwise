-- TripWise Database Schema
-- PostgreSQL 15+
-- Created: 2026-01-25

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE users (
    user_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255), -- NULL for OAuth users
    avatar VARCHAR(500),
    
    -- OAuth fields
    auth_provider VARCHAR(20) DEFAULT 'local', -- 'local', 'google'
    google_id VARCHAR(255) UNIQUE, -- Google's user ID for OAuth
    
    -- Profile
    country VARCHAR(2), -- ISO country code (US, MY, JP, etc)
    currency VARCHAR(3) DEFAULT 'USD', -- ISO currency code
    onboarding_completed BOOLEAN DEFAULT false,
    
    -- Soft delete
    is_deleted BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_is_deleted ON users(is_deleted);

-- Constraints for users
ALTER TABLE users ADD CONSTRAINT chk_users_auth_provider CHECK (auth_provider IN ('local', 'google'));

-- ============================================
-- 2. TRIPS TABLE
-- ============================================
CREATE TABLE trips (
    trip_id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    destination_country VARCHAR(2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- Budget configuration
    budget_type VARCHAR(20) DEFAULT 'shared', -- 'shared' or 'separated'
    total_budget DECIMAL(12, 2) NOT NULL,
    spent_amount DECIMAL(12, 2) DEFAULT 0.00,
    remaining_budget DECIMAL(12, 2) GENERATED ALWAYS AS (total_budget - spent_amount) STORED,
    
    currency VARCHAR(3) DEFAULT 'USD',
    season VARCHAR(20), -- 'spring', 'summer', 'autumn', 'winter', null
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Indexes for trips
CREATE INDEX idx_trips_owner ON trips(owner_id);
CREATE INDEX idx_trips_dates ON trips(start_date, end_date);
CREATE INDEX idx_trips_is_archived ON trips(is_archived);

-- Constraints for trips
ALTER TABLE trips ADD CONSTRAINT chk_trips_dates CHECK (end_date >= start_date);
ALTER TABLE trips ADD CONSTRAINT chk_trips_budget CHECK (total_budget > 0);
ALTER TABLE trips ADD CONSTRAINT chk_trips_budget_type CHECK (budget_type IN ('shared', 'separated'));

-- ============================================
-- 3. TRIP_MEMBERS TABLE (Collaboration)
-- ============================================
CREATE TABLE trip_members (
    member_id BIGSERIAL PRIMARY KEY,
    trip_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role VARCHAR(20) DEFAULT 'editor', -- 'owner', 'editor', 'viewer'
    is_deleted BOOLEAN DEFAULT false, -- false=active, true=removed/left
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE(trip_id, user_id)
);

-- Indexes for trip_members
CREATE INDEX idx_trip_members_trip ON trip_members(trip_id);
CREATE INDEX idx_trip_members_user ON trip_members(user_id);
CREATE INDEX idx_trip_members_is_deleted ON trip_members(is_deleted);

-- Constraints for trip_members
ALTER TABLE trip_members ADD CONSTRAINT chk_trip_members_role CHECK (role IN ('owner', 'editor', 'viewer'));

-- ============================================
-- 4. TRIP_MEMBER_BUDGETS TABLE (Separated Budget)
-- ============================================
CREATE TABLE trip_member_budgets (
    budget_id BIGSERIAL PRIMARY KEY,
    trip_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    allocated_budget DECIMAL(12, 2) NOT NULL,
    spent_amount DECIMAL(12, 2) DEFAULT 0.00,
    remaining_budget DECIMAL(12, 2) GENERATED ALWAYS AS (allocated_budget - spent_amount) STORED,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE(trip_id, user_id)
);

-- Indexes for trip_member_budgets
CREATE INDEX idx_trip_member_budgets_trip ON trip_member_budgets(trip_id);
CREATE INDEX idx_trip_member_budgets_user ON trip_member_budgets(user_id);
CREATE INDEX idx_trip_member_budgets_is_deleted ON trip_member_budgets(is_deleted);

-- Constraints for trip_member_budgets
ALTER TABLE trip_member_budgets ADD CONSTRAINT chk_trip_member_budgets_allocated CHECK (allocated_budget > 0);

-- ============================================
-- 5. EXPENSES TABLE
-- ============================================
CREATE TABLE expenses (
    expense_id BIGSERIAL PRIMARY KEY,
    trip_id BIGINT NOT NULL,
    added_by BIGINT,
    category VARCHAR(50) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    original_amount DECIMAL(12, 2) NOT NULL,
    original_currency VARCHAR(3) NOT NULL,
    converted_amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE,
    FOREIGN KEY (added_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Indexes for expenses
CREATE INDEX idx_expenses_trip ON expenses(trip_id);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expenses_added_by ON expenses(added_by);
CREATE INDEX idx_expenses_is_deleted ON expenses(is_deleted);

-- Constraints for expenses
ALTER TABLE expenses ADD CONSTRAINT chk_expenses_category CHECK (category IN (
    'accommodation', 'transportation', 'food', 'activities', 'shopping', 'other'
));
ALTER TABLE expenses ADD CONSTRAINT chk_expenses_amount CHECK (amount >= 0);

-- ============================================
-- 6. DESTINATION_NOTES TABLE
-- ============================================
CREATE TABLE destination_notes (
    note_id BIGSERIAL PRIMARY KEY,
    trip_id BIGINT NOT NULL,
    note_type VARCHAR(20) DEFAULT 'custom', -- 'quick_info' or 'custom'
    info_key VARCHAR(50), -- For quick_info: 'timezone', 'language', 'emergency', 'voltage', 'tipping'
    title VARCHAR(255), -- For custom notes
    content TEXT NOT NULL,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE
);

-- Indexes for destination_notes
CREATE INDEX idx_destination_notes_trip ON destination_notes(trip_id);
CREATE INDEX idx_destination_notes_type ON destination_notes(note_type);
CREATE INDEX idx_destination_notes_key ON destination_notes(info_key);
CREATE INDEX idx_destination_notes_is_deleted ON destination_notes(is_deleted);

-- Constraints for destination_notes
ALTER TABLE destination_notes ADD CONSTRAINT chk_destination_notes_type CHECK (note_type IN ('quick_info', 'custom'));

-- ============================================
-- 7. BUDGET_ALERTS TABLE (Optional)
-- ============================================
CREATE TABLE budget_alerts (
    alert_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    trip_id BIGINT NOT NULL,
    alert_type VARCHAR(50) NOT NULL,
    is_dismissed BOOLEAN DEFAULT false,
    dismissed_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE
);

-- Indexes for budget_alerts
CREATE INDEX idx_budget_alerts_user ON budget_alerts(user_id);
CREATE INDEX idx_budget_alerts_trip ON budget_alerts(trip_id);
CREATE INDEX idx_budget_alerts_is_deleted ON budget_alerts(is_deleted);

-- ============================================
-- 8. REFRESH_TOKENS TABLE (JWT Auth)
-- ============================================
CREATE TABLE refresh_tokens (
    token_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Indexes for refresh_tokens
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_is_revoked ON refresh_tokens(is_revoked);

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger 1: Update trip.spent_amount (for BOTH shared and separated budget modes)
CREATE OR REPLACE FUNCTION update_trip_spent()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        UPDATE trips 
        SET spent_amount = (
            SELECT COALESCE(SUM(amount), 0) 
            FROM expenses 
            WHERE trip_id = OLD.trip_id AND is_deleted = false
        ),
        updated_at = CURRENT_TIMESTAMP
        WHERE trip_id = OLD.trip_id;
        RETURN OLD;
    ELSE
        UPDATE trips 
        SET spent_amount = (
            SELECT COALESCE(SUM(amount), 0) 
            FROM expenses 
            WHERE trip_id = NEW.trip_id AND is_deleted = false
        ),
        updated_at = CURRENT_TIMESTAMP
        WHERE trip_id = NEW.trip_id;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_trip_spent
AFTER INSERT OR UPDATE OR DELETE ON expenses
FOR EACH ROW EXECUTE FUNCTION update_trip_spent();

-- Trigger 2: Update trip_member_budgets.spent_amount (for SEPARATED budget mode only)
CREATE OR REPLACE FUNCTION update_member_budget_spent()
RETURNS TRIGGER AS $$
DECLARE
    v_budget_type VARCHAR(20);
BEGIN
    -- Check if trip uses separated budget
    SELECT budget_type INTO v_budget_type FROM trips WHERE trip_id = NEW.trip_id;
    
    IF v_budget_type = 'separated' THEN
        IF TG_OP = 'DELETE' THEN
            UPDATE trip_member_budgets 
            SET spent_amount = (
                SELECT COALESCE(SUM(amount), 0) 
                FROM expenses 
                WHERE trip_id = OLD.trip_id 
                  AND added_by = OLD.added_by
                  AND is_deleted = false
            ),
            updated_at = CURRENT_TIMESTAMP
            WHERE trip_id = OLD.trip_id AND user_id = OLD.added_by;
            RETURN OLD;
        ELSE
            UPDATE trip_member_budgets 
            SET spent_amount = (
                SELECT COALESCE(SUM(amount), 0) 
                FROM expenses 
                WHERE trip_id = NEW.trip_id 
                  AND added_by = NEW.added_by
                  AND is_deleted = false
            ),
            updated_at = CURRENT_TIMESTAMP
            WHERE trip_id = NEW.trip_id AND user_id = NEW.added_by;
            RETURN NEW;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_member_budget_spent
AFTER INSERT OR UPDATE OR DELETE ON expenses
FOR EACH ROW EXECUTE FUNCTION update_member_budget_spent();

-- Trigger 3: Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update_at trigger to all tables
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_trips_updated_at BEFORE UPDATE ON trips FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_trip_members_updated_at BEFORE UPDATE ON trip_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_trip_member_budgets_updated_at BEFORE UPDATE ON trip_member_budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_destination_notes_updated_at BEFORE UPDATE ON destination_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_budget_alerts_updated_at BEFORE UPDATE ON budget_alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_refresh_tokens_updated_at BEFORE UPDATE ON refresh_tokens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTS (Documentation)
-- ============================================
COMMENT ON TABLE users IS 'User accounts with OAuth support';
COMMENT ON TABLE trips IS 'Trip planning with shared or separated budget modes';
COMMENT ON TABLE trip_members IS 'Trip collaboration and member management';
COMMENT ON TABLE trip_member_budgets IS 'Individual budget allocations for separated budget mode';
COMMENT ON TABLE expenses IS 'Expense tracking with currency conversion';
COMMENT ON TABLE destination_notes IS 'Trip notes and country quick info';
COMMENT ON TABLE budget_alerts IS 'Budget alerts and notifications';
COMMENT ON TABLE refresh_tokens IS 'JWT refresh tokens for authentication';

COMMENT ON COLUMN users.auth_provider IS 'Authentication method: local or google';
COMMENT ON COLUMN trips.budget_type IS 'shared=one budget pool, separated=individual budgets';
COMMENT ON COLUMN trips.remaining_budget IS 'Auto-calculated: total_budget - spent_amount';
COMMENT ON COLUMN trip_members.role IS 'owner=full control, editor=can edit, viewer=read-only';
COMMENT ON COLUMN expenses.added_by IS 'User who added this expense (for collaboration tracking)';
COMMENT ON COLUMN destination_notes.note_type IS 'quick_info=country info, custom=user notes';
