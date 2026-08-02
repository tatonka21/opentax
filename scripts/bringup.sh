#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="${1:-/root/opentax}"
ODAX="$REPO_DIR/vendor/opendax"
export PATH="$HOME/.rbenv/bin:$HOME/.rbenv/shims:$PATH"

for c in docker docker-compose bundle; do
  if ! command -v "$c" >/dev/null 2>&1; then
    echo "Missing '$c' on PATH. Run scripts/bootstrap-vm.sh first."
    exit 1
  fi
done

cp "$REPO_DIR/config/opentax-app.yml" "$ODAX/config/app.yml"
cp "$REPO_DIR/infra/docker-compose.overrides.yml" "$ODAX/docker-compose.override.yml"

cd "$ODAX"
bundle config set path vendor/bundle
bundle install --quiet

run() {
  echo "==> $*"
  "$@"
}

run bundle exec rake render:config
run bundle exec rake service:proxy[start]
run bundle exec rake service:backend[start]
run bundle exec rake service:influxdb[start]
run bundle exec rake service:setup[start]
run bundle exec rake service:app[start]
run bundle exec rake service:frontend[start]
run docker-compose up -d rango matching order_processor trade_executor barong_sidekiq

cat <<'EOF'

OpenTAX exchange is up.

If using a real domain, add a DNS A record for www.<domain> -> this VM IP,
then set ssl.enabled: true and re-run bringup.sh to enable HTTPS.

Seeded logins:
  admin: admin@barong.io / 0lDHd9ufs9t@
  user:  john@barong.io / Am8icnzEI3d!
EOF
