#!/bin/bash
set -e

echo "[entrypoint] Initializing database..."
php bin/console doctrine:database:create --if-not-exists --no-interaction || true
php bin/console doctrine:schema:update --force --no-interaction

echo "[entrypoint] Generating JWT keys..."
php bin/console lexik:jwt:generate-keypair --skip-if-exists --no-interaction

echo "[entrypoint] Loading demo data..."
php bin/console app:load-demo-data --no-interaction || true

echo "[entrypoint] Starting web server..."
exec "$@"
