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

if [[ ! -f /usr/local/bin/docker-compose ]]; then
  printf '#!/usr/bin/env bash\nexec docker compose "$@"\n' >/usr/local/bin/docker-compose
  chmod +x /usr/local/bin/docker-compose
fi

update-binfmts --enable qemu-aarch64 || true
docker run --rm --privileged multiarch/qemu-user-static --reset -p yes || true

REPO_DIR=/root/opentax
if [[ ! -d "$REPO_DIR/.git" ]]; then
  git clone --recurse-submodules https://github.com/tatonka21/opentax.git "$REPO_DIR"
else
  git -C "$REPO_DIR" pull --recurse-submodules
fi
git -C "$REPO_DIR" submodule update --init --recursive

"$REPO_DIR/scripts/install-ruby.sh"

cat <<'EOF'

OpenTAX VM ready.

Bring up the exchange:
  cd /root/opentax
  ./scripts/bringup.sh
EOF
