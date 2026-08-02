#!/usr/bin/env bash
set -euo pipefail

RUBY_VERSION="${RUBY_VERSION:-2.6.10}"
export RBENV_ROOT="${RBENV_ROOT:-$HOME/.rbenv}"
export PATH="$RBENV_ROOT/bin:$RBENV_ROOT/shims:$PATH"

if [[ "$EUID" -ne 0 ]]; then
  echo "Run as root (sudo)."
  exit 1
fi

if ! command -v rbenv >/dev/null 2>&1; then
  export DEBIAN_FRONTEND=noninteractive
  apt-get update -y
  apt-get install -y autoconf bison build-essential libssl-dev libyaml-dev \
    libreadline-dev zlib1g-dev libncurses5-dev libffi-dev libgdbm-dev
  git clone --depth 1 https://github.com/rbenv/rbenv.git "$RBENV_ROOT"
  git clone --depth 1 https://github.com/rbenv/ruby-build.git "$RBENV_ROOT/plugins/ruby-build"
  "$RBENV_ROOT/plugins/ruby-build/install.sh" || true
fi

if [[ ! -d "$RBENV_ROOT/versions/$RUBY_VERSION" ]]; then
  rbenv install "$RUBY_VERSION"
fi
rbenv global "$RUBY_VERSION"
gem install bundler -v 2.1.4 --no-document

echo 'export PATH="$HOME/.rbenv/bin:$HOME/.rbenv/shims:$PATH"' >/etc/profile.d/rbenv.sh

ruby -v
bundle -v
