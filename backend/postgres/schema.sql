-- =============================================================================
-- TeenVerse – PostgreSQL Schema
-- =============================================================================
-- Run this once against your PostgreSQL database to create all tables.
-- The application (SQLAlchemy) will also create these via Base.metadata.create_all()
-- on startup, so this file serves as an explicit reference / migration baseline.
--
-- Quickstart:
--   psql -U teenverse_user -d teenverse_db -f schema.sql
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- for gen_random_uuid() if needed

-- ---------------------------------------------------------------------------
-- Users
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255)        NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    password    VARCHAR(255)        NOT NULL,
    role        VARCHAR(50)         NOT NULL DEFAULT 'user',
    created_at  TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- ---------------------------------------------------------------------------
-- Assessments
-- ---------------------------------------------------------------------------
-- Per-field CHECK constraints mirror the Pydantic validators:
--   • each time-based field is in [0, 24]
--   • the sum of social_media_hours + sleep_hours + screen_time_before_sleep ≤ 24
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS assessments (
    id                          SERIAL PRIMARY KEY,
    user_id                     INTEGER REFERENCES users(id) ON DELETE CASCADE,

    name                        VARCHAR(255) DEFAULT '',

    age                         INTEGER,
    gender                      VARCHAR(50),

    -- Time-based fields (all in hours; individually ≤ 24, sum ≤ 24)
    social_media_hours          DOUBLE PRECISION,
    platform_usage              VARCHAR(100)    DEFAULT 'Instagram',
    sleep_hours                 DOUBLE PRECISION,
    screen_time_before_sleep    DOUBLE PRECISION,

    -- Numeric scores
    academic_performance        DOUBLE PRECISION,
    physical_activity           DOUBLE PRECISION,
    stress_level                DOUBLE PRECISION,
    anxiety_level               DOUBLE PRECISION,
    addiction_level             DOUBLE PRECISION,

    social_interaction_level    VARCHAR(50)     DEFAULT 'medium',

    created_at                  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    -- ── Constraints ────────────────────────────────────────────────────
    CONSTRAINT chk_social_media_hours_range
        CHECK (social_media_hours >= 0 AND social_media_hours <= 24),

    CONSTRAINT chk_sleep_hours_range
        CHECK (sleep_hours >= 0 AND sleep_hours <= 24),

    CONSTRAINT chk_screen_time_range
        CHECK (screen_time_before_sleep >= 0 AND screen_time_before_sleep <= 24),

    CONSTRAINT chk_total_hours_per_day
        CHECK (
            COALESCE(social_media_hours, 0)
            + COALESCE(sleep_hours, 0)
            + COALESCE(screen_time_before_sleep, 0)
            <= 24
        )
);

CREATE INDEX IF NOT EXISTS idx_assessments_user_id  ON assessments (user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_created  ON assessments (created_at DESC);

-- ---------------------------------------------------------------------------
-- Predictions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS predictions (
    id                  SERIAL PRIMARY KEY,
    assessment_id       INTEGER REFERENCES assessments(id) ON DELETE CASCADE,

    risk_score          DOUBLE PRECISION,
    risk_category       VARCHAR(100),
    predicted_label     INTEGER,
    confidence_score    DOUBLE PRECISION,

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_predictions_assessment ON predictions (assessment_id);

-- ---------------------------------------------------------------------------
-- Personas
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS personas (
    id              SERIAL PRIMARY KEY,
    assessment_id   INTEGER REFERENCES assessments(id) ON DELETE CASCADE,
    cluster_id      INTEGER,
    persona_name    VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_personas_assessment ON personas (assessment_id);

-- ---------------------------------------------------------------------------
-- Simulations
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS simulations (
    id                          SERIAL PRIMARY KEY,
    assessment_id               INTEGER REFERENCES assessments(id) ON DELETE CASCADE,
    name                        VARCHAR(255)    DEFAULT '',
    created_by                  INTEGER REFERENCES users(id) ON DELETE SET NULL,

    current_risk                DOUBLE PRECISION,
    future_risk                 DOUBLE PRECISION,

    modified_sleep_hours        DOUBLE PRECISION,
    modified_social_media_hours DOUBLE PRECISION,
    modified_physical_activity  DOUBLE PRECISION,

    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_simulations_assessment ON simulations (assessment_id);
CREATE INDEX IF NOT EXISTS idx_simulations_created_by ON simulations (created_by);
