# CLAUDE.md — operating rules for AI builders on this repo

Rules for Claude Code / any coding agent working in this repository.

## Hard constraints (NEVER violate)

1. `core.py` stays a single file. Do NOT split it into packages — the
   self-patching pipeline and the AST watchdog in `entrypoint.sh` depend on
   a single-file core.
2. `data/dna/SOUL.md` is the identity anchor. Do NOT modify its content.
3. `SafetyManager`, `AsimovSafetyFilter`, `BarratSafetyProtocol`,
   `PolicyEngine`, injection guards, and the leak filter accept
   hardening-only changes. Never weaken or bypass them.
4. `entrypoint.sh` watchdog logic (AST check + rollback-to-last-good) —
   do not touch without explicit maintainer approval.
5. Russian prompt strings inside `core.py` are runtime behaviour, not
   comments. Do not translate, rewrite, or remove them.

## Workflow

- Before committing any `core.py` change:
  `python -c "import ast; ast.parse(open('core.py', encoding='utf-8').read())"`
- Run the smoke tests: `pip install pytest && pytest tests/ -v`
- State files are written atomically only (`_atomic_write_text`,
  `os.replace`) — never add a direct `write_text` on JSON state.
- After deploying: `./deploy.sh update` and watch `docker logs -f nagual`
  for at least 2 minutes before calling it done.

## Do NOT without explicit maintainer approval

- Add new top-level classes or new `_loop` coroutines.
- Add new LLM providers to `UniversalLLMRouter`.
- Refactor the existing class hierarchy.
- Rename Toltec concepts (assemblage point, recapitulation, tonal/nagual…).

## Always welcome

- New tests in `tests/` (pytest, no heavy deps, extract units via AST —
  see `tests/conftest.py`).
- CI improvements in `.github/workflows/`.
- Documentation clarity, honest-status precision, comparison docs.
- Closing gaps between README claims and code reality.
