#!/usr/bin/env bash
set -euo pipefail

if [[ "$EUID" -ne 0 ]]; then
  echo "Run as root (sudo)."
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y docker.io docker-compose-plugin git curl ca-certificates \
  qemu-user-static binfmt-support

systemctl enable --now docker
usermod -aG docker "${SUDO_USER:-$USER}"

update-binfmts --enable qemu-aarch64 || true
docker run --rm --privileged multiarch/qemu-user-static --reset -p yes || true

REPO_DIR=/root/opentax
if [[ ! -d "$REPO_DIR/.git" ]]; then
  git clone --recurse-submodules https://github.com/tatonka21/opentax.git "$REPO_DIR"
else
  git -C "$REPO_DIR" pull --recurse-submodules
fi

git -C "$REPO_DIR" submodule update --init --recursive

cat <<'EOF'

OpenTAX VM ready.

Next steps (see docs/DEPLOYMENT.md):
  cd "$REPO_DIR/vendor/opendax"
  cp ../../infra/docker-compose.overrides.yml docker-compose.override.yml
  # edit config/app.yml, then render configs, then:
  rake service:proxy[start]
  rake service:backend[start]
  rake service:influxdb[start]
  rake service:setup[start]
  rake service:app[start]
  rake service:frontend[start]
  docker-compose up -d rango matching order_processor trade_executor barong_sidekiq
EOF
