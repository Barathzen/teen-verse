#!/usr/bin/env bash
# =============================================================================
# TeenVerse – PostgreSQL Bootstrap Script
# =============================================================================
# Run this ONCE as the 'postgres' superuser to create the role, database,
# and apply the schema.
#
# Usage:
#   sudo -u postgres bash setup_db.sh
#
# Or supply your own credentials:
#   DB_USER=myuser DB_PASS=mypass DB_NAME=mydb bash setup_db.sh
# =============================================================================

set -euo pipefail

DB_USER="${DB_USER:-teenverse_user}"
DB_PASS="${DB_PASS:-teenverse_pass}"
DB_NAME="${DB_NAME:-teenverse_db}"

echo "▶ Creating role '${DB_USER}' (if not exists)..."
psql -v ON_ERROR_STOP=1 --username postgres <<-EOSQL
    DO \$\$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER}') THEN
            CREATE ROLE "${DB_USER}" LOGIN PASSWORD '${DB_PASS}';
        ELSE
            ALTER ROLE "${DB_USER}" WITH PASSWORD '${DB_PASS}';
        END IF;
    END
    \$\$;
EOSQL

echo "▶ Creating database '${DB_NAME}' (if not exists)..."
psql -v ON_ERROR_STOP=1 --username postgres <<-EOSQL
    SELECT 'CREATE DATABASE "${DB_NAME}" OWNER "${DB_USER}"'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}')
    \gexec
EOSQL

echo "▶ Granting privileges..."
psql -v ON_ERROR_STOP=1 --username postgres --dbname "${DB_NAME}" <<-EOSQL
    GRANT ALL PRIVILEGES ON DATABASE "${DB_NAME}" TO "${DB_USER}";
    GRANT ALL ON SCHEMA public TO "${DB_USER}";
EOSQL

echo "▶ Applying schema..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
psql -v ON_ERROR_STOP=1 --username "${DB_USER}" --dbname "${DB_NAME}" \
    -f "${SCRIPT_DIR}/schema.sql"

echo ""
echo "✅ Done! Database '${DB_NAME}' is ready."
echo ""
echo "   Update your .env:"
echo "   DATABASE_URL=postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}"
