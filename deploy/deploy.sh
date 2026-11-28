#!/usr/bin/env bash
# Run on the droplet after the CI workflow copies a fresh .output/ into APP_DIR.
set -euo pipefail

APP_DIR="${APP_DIR:-/home/prime/sartorial-Ecommerce-FE}"

cd "$APP_DIR"
node --version
test -f .output/server/index.mjs

sudo systemctl restart sartorial-ecommerce-fe
sudo systemctl is-active sartorial-ecommerce-fe
