#!/bin/sh
set -e
mkdir -p /app/data/dna
if [ ! -f /app/data/dna/SOUL.md ]; then
  cp /app/seed/SOUL.md /app/data/dna/SOUL.md
  echo "[entrypoint] seeded SOUL.md into data volume"
fi

# ─── self-patch crash-loop watchdog (Opus 29.06, hardened per review) ───
# Делает автономный самопатч ядра ВОССТАНАВЛИВАЕМЫМ: сломанный патч откатывается к last-good.
GOOD=/app/data/core_lastgood.py
FAILS=/app/data/.boot_fails
N=$(cat "$FAILS" 2>/dev/null || echo 0)
case "$N" in ''|*[!0-9]*) N=0 ;; esac

# 1) битый самопатч (core.py не парсится) + есть last-good → откат немедленно.
#    Форма "|| { ... }" безопасна под set -e (не убивает watchdog при ошибке пробника).
if [ -f "$GOOD" ]; then
  python -c "import ast; ast.parse(open('/app/core.py').read())" 2>/dev/null || {
    echo "[entrypoint] WATCHDOG: core.py AST broken -> restore last-good"
    cp "$GOOD" /app/core.py
    N=0
  }
fi

# 2) crash-loop: ядро падает (раньше чем за 90с пометит себя good) >=3 раз подряд → откат
if [ "$N" -ge 3 ] && [ -f "$GOOD" ]; then
  echo "[entrypoint] WATCHDOG: crash-loop ($N) -> restore last-good core.py"
  cp "$GOOD" /app/core.py
  N=0
fi

echo $((N + 1)) > "$FAILS"

# seed last-good ТОЛЬКО если текущий core.py ПАРСИТСЯ (не пометить битый baseline как good).
if [ ! -f "$GOOD" ]; then
  if python -c "import ast; ast.parse(open('/app/core.py').read())" 2>/dev/null; then
    cp /app/core.py "$GOOD"
    echo "[entrypoint] seeded last-good core.py"
  else
    echo "[entrypoint] WARN: core.py не парсится и нет last-good — нечего восстанавливать"
  fi
fi

exec python core.py
