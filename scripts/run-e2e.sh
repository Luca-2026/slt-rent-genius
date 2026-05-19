#!/usr/bin/env bash
# Wrapper für `npx playwright test` mit nötigen Shared-Libs in
# Lovable-/Nix-Sandbox-Umgebungen. In normalen Linux-CI-Umgebungen
# (Ubuntu/Debian) ist dieser Wrapper nicht nötig – dort reicht
# `npx playwright install --with-deps chromium` einmalig, danach
# `npx playwright test`.
set -euo pipefail

# Fixture neu generieren (Standort × Kategorie × erstes Produkt).
npx vite-node ./e2e/generate-fixtures.ts

# Nix-Bibliotheken bereitstellen, falls glibc-Standard-Pfade fehlen.
if command -v nix >/dev/null 2>&1; then
  PATHS=$(nix build --no-link --print-out-paths \
    nixpkgs#glib.out nixpkgs#nss.out nixpkgs#nspr nixpkgs#at-spi2-core \
    nixpkgs#cups.lib nixpkgs#dbus.lib nixpkgs#libdrm.out nixpkgs#expat \
    nixpkgs#libxkbcommon nixpkgs#libgbm nixpkgs#xorg.libX11 \
    nixpkgs#xorg.libXcomposite nixpkgs#xorg.libXdamage nixpkgs#xorg.libXext \
    nixpkgs#xorg.libXfixes nixpkgs#xorg.libXrandr nixpkgs#xorg.libxcb \
    nixpkgs#xorg.libXrender nixpkgs#xorg.libXtst nixpkgs#xorg.libXi \
    nixpkgs#alsa-lib nixpkgs#pango.out nixpkgs#cairo.out \
    nixpkgs#fontconfig.lib nixpkgs#freetype.out nixpkgs#gtk3.out \
    nixpkgs#harfbuzz.out nixpkgs#gdk-pixbuf.out nixpkgs#libxshmfence \
    2>/dev/null | sort -u)
  LDP=$(echo "$PATHS" | sed 's|$|/lib|' | tr '\n' ':')
  export LD_LIBRARY_PATH="${LDP}${LD_LIBRARY_PATH:-}"
fi

export PLAYWRIGHT_BASE_URL="${PLAYWRIGHT_BASE_URL:-http://localhost:8080}"
exec npx playwright test "$@"
