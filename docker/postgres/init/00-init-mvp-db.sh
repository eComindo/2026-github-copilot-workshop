#!/usr/bin/env sh
set -eu

echo "[initdb] Running baseline migration..."
psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f /workspace/db/migrations/001_init_procurement_mvp.sql

echo "[initdb] Seeding sample data..."
psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f /workspace/db/seeds/002_seed_procurement_mvp.sql

echo "[initdb] Database initialization complete."
