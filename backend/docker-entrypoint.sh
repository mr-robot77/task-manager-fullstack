#!/bin/bash
set -e

echo "[entrypoint] Initializing database..."
php bin/console doctrine:database:create --if-not-exists --no-interaction || true
php bin/console doctrine:schema:update --force --no-interaction

echo "[entrypoint] Generating JWT keys..."
php bin/console lexik:jwt:generate-keypair --skip-if-exists --no-interaction

echo "[entrypoint] Loading demo data..."
for i in 1 2 3 4 5; do
  if php bin/console app:load-demo-data --no-interaction 2>/dev/null; then
    break
  fi
  echo "[entrypoint] Retry $i/5 for demo data..."
  sleep 5
done || true

echo "[entrypoint] Starting web server..."
exec "$@"
