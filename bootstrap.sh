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
mkdir -p "${GOINFRE_DIR}/pnpm-virtual-store/frontend"
mkdir -p "${GOINFRE_DIR}/pnpm-store"
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

  # Keep the tracked pnpm-workspace.yaml untouched. Override the virtual store
  # and build policy via CLI flags instead (avoids dirtying git).
  echo "⚡ Running pnpm install with goinfre virtual store..."
  pnpm install \
    --store-dir "${GOINFRE_DIR}/pnpm-store" \
    --config.virtual-store-dir="${GOINFRE_DIR}/pnpm-virtual-store/gateway-svc" \
    --config.dangerously-allow-all-builds=true

  cd ..
else
  echo "⚠️  Directory 'gateway-svc' not found. Skipping..."
fi

# -----------------------------------------------------------------
# STEP 2b: Configure Frontend (Next.js) with PNPM
# -----------------------------------------------------------------
echo ""
echo "🖥️  Step 2b: Configuring Frontend (Next.js) with PNPM..."
if [ -d "frontend" ]; then
  cd frontend

  echo "🧹 Wiping old frontend node_modules..."
  rm -rf node_modules

  echo "⚡ Running pnpm install with goinfre virtual store..."
  pnpm install \
    --store-dir "${GOINFRE_DIR}/pnpm-store" \
    --config.virtual-store-dir="${GOINFRE_DIR}/pnpm-virtual-store/frontend" \
    --config.dangerously-allow-all-builds=true

  cd ..
else
  echo "⚠️  Directory 'frontend' not found. Skipping..."
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
# -----------------------------------------------------------------
# STEP 4: Install Bruno (AppImage) in Goinfre
# -----------------------------------------------------------------
echo ""
echo "🐶 Step 4: Installing Bruno API client..."
BRUNO_DIR="${GOINFRE_DIR}/bruno"
BRUNO_BIN="${BRUNO_DIR}/bruno_4.2.1_x86_64_linux.AppImage"
mkdir -p "${BRUNO_DIR}"

if [ ! -f "${BRUNO_BIN}" ]; then
  curl -L -o "${BRUNO_BIN}" \
    https://github.com/usebruno/bruno/releases/download/v4.2.1/bruno_4.2.1_x86_64_linux.AppImage
  chmod +x "${BRUNO_BIN}"
else
  echo "✅ Bruno already downloaded. Skipping..."
fi

ALIAS_LINE="alias bruno='${BRUNO_BIN} --appimage-extract-and-run --no-sandbox'"
if ! grep -qF "alias bruno=" ~/.zshrc 2>/dev/null; then
  echo "${ALIAS_LINE}" >>~/.zshrc
  echo "🔗 Added 'bruno' alias to ~/.zshrc (run: source ~/.zshrc)"
fi
