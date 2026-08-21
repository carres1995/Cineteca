# scripts/verify.sh
#!/usr/bin/env bash
# =============================================================================
# verify.sh — EL gate de calidad.
# Contrato: exit 0 ⇒ formato + linter sin advertencias + tipos estrictos +
#           pruebas verdes + build + sin dependencias deprecadas.
# Lo usan: .husky/pre-commit (--quick), .husky/pre-push (--full) y el CI (--full).
# Nunca se saltea y nunca se debilita un paso "para que pase": se arregla el código.
# =============================================================================
set -euo pipefail
cd "$(dirname "$0")/.."

MODE="${1:---full}"
case "$MODE" in --quick|--full) ;; *) echo "uso: verify.sh [--quick|--full]"; exit 2 ;; esac

BLUE='\033[1;34m'; GREEN='\033[0;32m'; RED='\033[0;31m'; NC='\033[0m'
step() { printf '\n%b▶ %s%b\n' "$BLUE" "$1" "$NC"; }
fail() { printf '\n%b✖ GATE EN ROJO — %s%b\n' "$RED" "$1" "$NC"; exit 1; }
START=$(date +%s)

step "[1/5] Formato — Prettier"
pnpm format:check || fail "hay archivos sin formatear (corran: pnpm format)"

step "[2/5] Linter — ESLint, cero advertencias"
pnpm lint || fail "el linter encontró problemas"

step "[3/5] Tipos — tsc --noEmit"
pnpm check-types || fail "errores de tipos"

if [ "$MODE" = "--quick" ]; then
  printf '\n%b✔ GATE RÁPIDO EN VERDE en %ss%b\n' "$GREEN" "$(( $(date +%s) - START ))" "$NC"; exit 0
fi

step "[4/5] Pruebas — Vitest"
pnpm test || fail "pruebas rojas o cobertura por debajo del umbral"

step "[5/5] Build de producción"
pnpm build || fail "el build falló"

bash scripts/check-versions.sh --gate || fail "hay una dependencia deprecada"

printf '\n%b✔ GATE COMPLETO EN VERDE en %ss%b\n' "$GREEN" "$(( $(date +%s) - START ))" "$NC"