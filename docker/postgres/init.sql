-- PostgreSQL initialization script
-- Runs once when the container starts fresh

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pg_stat_statements for query monitoring
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Set timezone
SET timezone = 'UTC';

-- Log a startup message
DO $$
BEGIN
    RAISE NOTICE 'Crypto Risk Platform database initialized at %', NOW();
END $$;
