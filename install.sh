#!/usr/bin/env bash
set -euo pipefail

REPO="${DBSTUDIO_REPO:-mohxmd/dbstudio}"
BIN_NAME="dbstudio"
INSTALL_DIR="${DBSTUDIO_INSTALL_DIR:-${XDG_BIN_HOME:-$HOME/.local/bin}}"

# Detect OS + arch

OS="$(uname -s)"
ARCH="$(uname -m)"

case "$OS" in
  Linux)
    case "$ARCH" in
      x86_64) ASSET="dbstudio-linux-x64" ;;
      *) echo "❌ Unsupported architecture: $ARCH" && exit 1 ;;
    esac
    ;;
  Darwin)
    case "$ARCH" in
      x86_64)  ASSET="dbstudio-macos-x64" ;;
      arm64)   ASSET="dbstudio-macos-arm64" ;;
      *) echo "❌ Unsupported architecture: $ARCH" && exit 1 ;;
    esac
    ;;
  *)
    echo "❌ Unsupported OS: $OS"
    echo "   Windows users: download dbstudio-windows-x64.exe from"
    echo "   https://github.com/$REPO/releases/latest"
    exit 1
    ;;
esac

for cmd in curl mktemp uname; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "❌ Missing required command: $cmd"
    exit 1
  fi
done

# Get latest release URL

echo "→ Fetching latest release..."
LATEST_URL="https://github.com/$REPO/releases/latest/download/$ASSET"

# Download

TMP="$(mktemp)"
echo "→ Downloading $ASSET..."
curl -fsSL "$LATEST_URL" -o "$TMP"
chmod +x "$TMP"

# Install

mkdir -p "$INSTALL_DIR"
mv "$TMP" "$INSTALL_DIR/$BIN_NAME"

echo "✅ dbstudio installed to $INSTALL_DIR/$BIN_NAME"

# PATH check

case ":$PATH:" in
  *":$INSTALL_DIR:"*) ;;
  *)
  echo ""
  echo "⚠️  $INSTALL_DIR is not in your PATH."
  echo "   Add this to your ~/.bashrc or ~/.zshrc:"
  echo ""
  echo '   export PATH="$HOME/.local/bin:$PATH"'
  echo ""
  if [ -n "${ZSH_VERSION:-}" ]; then
    echo "   Then run: source ~/.zshrc"
  else
    echo "   Then run: source ~/.bashrc"
  fi
  ;;
esac

echo ""
echo "→ Run: dbstudio --help"
