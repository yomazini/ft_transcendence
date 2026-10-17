#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Dynamically grab the current logged-in user
USER_NAME=$(whoami)
GOINFRE_DIR="/goinfre/${USER_NAME}"

echo "=========================================================="
echo "🚀 42 Workstation Bootstrap: Setting up PNPM and UV in Goinfre"
echo "👤 User detected: ${USER_NAME}"
echo "📁 Using target:  ${GOINFRE_DIR}"
echo "=========================================================="

# -----------------------------------------------------------------
# STEP 1: Create physical directories in Goinfre
# -----------------------------------------------------------------
echo "🟢 Step 1: Creating directories in unlimited storage..."
mkdir -p "${GOINFRE_DIR}/pnpm-virtual-store/gateway-svc"
mkdir -p "${GOINFRE_DIR}/envs/analysis-svc-env"
mkdir -p "${GOINFRE_DIR}/.uv-cache"

# -----------------------------------------------------------------
# STEP 2: Configure NestJS (gateway-svc)
# -----------------------------------------------------------------
echo ""
echo "📦 Step 2: Configuring NestJS (gateway-svc) with PNPM..."
if [ -d "gateway-svc" ]; then
  cd gateway-svc

  # Force clean any old node_modules (directories or broken symlinks)
  echo "🧹 Wiping old gateway node_modules..."
  rm -rf node_modules

  # Write pnpm-workspace.yaml dynamically to bypass build blocks and symlink bugs
  echo "✍️  Writing pnpm-workspace.yaml..."
  cat <<EOF >pnpm-workspace.yaml
dangerouslyAllowAllBuilds: true
virtualStoreDir: ${GOINFRE_DIR}/pnpm-virtual-store/gateway-svc
EOF

  # Trigger fresh install
  echo "⚡ Running pnpm install..."
  pnpm install

  cd ..
else
  echo "⚠️  Directory 'gateway-svc' not found. Skipping..."
fi

# -----------------------------------------------------------------
# STEP 3: Configure FastAPI (analysis-svc)
# -----------------------------------------------------------------
echo ""
echo "🐍 Step 3: Configuring FastAPI (analysis-svc) with UV..."
if [ -d "analysis-svc" ]; then
  cd analysis-svc

  # Force clean old environments
  echo "🧹 Wiping old Python .venv..."
  rm -rf .venv

  # Create healthy symlink pointing directly to goinfre
  echo "🔗 Creating .venv symlink to goinfre..."
  ln -s "${GOINFRE_DIR}/envs/analysis-svc-env" .venv

  # Force uv cache to goinfre in this execution thread
  export UV_CACHE_DIR="${GOINFRE_DIR}/.uv-cache"

  # Run the CPU-optimized sync
  echo "⚡ Running uv sync..."
  uv sync

  cd ..
else
  echo "⚠️  Directory 'analysis-svc' not found. Skipping..."
fi

echo ""
echo "=========================================================="
echo "🎉 Setup complete! All packages installed successfully."
echo "💡 Neovim will follow the symlinks and provide autocomplete."
echo "💾 Home directory quota saved!"
echo "=========================================================="
