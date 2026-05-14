#!/usr/bin/env bash
# --------------------------------------------------------------
# mclinic_diagnose.sh  –  one‑shot diagnostics & auto‑restart
# --------------------------------------------------------------
# Run as a privileged user (root or sudo) on the VPS where the
# Mclinic containers live (e.g. /var/www/mclinicportal).
# --------------------------------------------------------------

set -euo pipefail

# -----------------------------------------------------------------
# 1️⃣  Define key locations / container names
# -----------------------------------------------------------------
REPO_DIR="/var/www/mclinicportal"
API_CONTAINER="mclinic-api"
WEB_CONTAINER="mclinic-web"

# -----------------------------------------------------------------
# 2️⃣  Show Docker container status
# -----------------------------------------------------------------
echo "=== Docker container status ==="
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# -----------------------------------------------------------------
# 3️⃣  Tail recent logs (last 100 lines each)
# -----------------------------------------------------------------
echo -e "\n=== Last 100 lines of API container logs ==="
docker logs "$API_CONTAINER" --tail 100 || echo "❌ Unable to fetch API logs"

echo -e "\n=== Last 100 lines of Web container logs ==="
docker logs "$WEB_CONTAINER" --tail 100 || echo "❌ Unable to fetch Web logs"

# -----------------------------------------------------------------
# 4️⃣  Health‑check the API endpoint (used by Apache reverse‑proxy)
# -----------------------------------------------------------------
echo -e "\n=== API health‑check ==="
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/health || echo "000")
if [[ "$HTTP_CODE" == "200" ]]; then
  echo "✅ API health‑check OK (200)"
else
  echo "⚠ API health‑check returned $HTTP_CODE (expected 200)"
fi

# -----------------------------------------------------------------
# 5️⃣  If any container is not running, or health‑check failed,
#     restart the whole stack and re‑run migrations
# -----------------------------------------------------------------
RESTART_NEEDED=false

# Check for any container not in "Up" state
while IFS=$'\t' read -r name status ports; do
  if [[ "$status" != Up* ]]; then
    echo "❌ Container $name is not running (status: $status)"
    RESTART_NEEDED=true
  fi
done < <(docker ps -a --format "{{.Names}}\t{{.Status}}\t{{.Ports}}")

if [[ "$HTTP_CODE" != "200" ]]; then
  RESTART_NEEDED=true
fi

if $RESTART_NEEDED; then
  echo -e "\n=== Restarting Docker stack ==="
  cd "$REPO_DIR"
  docker-compose down
  docker-compose up -d

  echo "Waiting 10s for services to become healthy..."
  sleep 10

  echo "=== Running pending TypeORM migrations ==="
  docker exec -i "$API_CONTAINER" npm run typeorm migration:run

  echo "=== Migration status after run ==="
  docker exec -i "$API_CONTAINER" npm run typeorm migration:show

  echo "=== Final API health‑check ==="
  FINAL_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/health || echo "000")
  if [[ "$FINAL_CODE" == "200" ]]; then
    echo "✅ All good – API returns 200"
  else
    echo "⚠ Still failing – API returned $FINAL_CODE"
  fi
else
  echo -e "\n✅ All containers are up and health‑check passed – no restart needed."
fi

echo -e "\n--- Diagnosis complete ---"
