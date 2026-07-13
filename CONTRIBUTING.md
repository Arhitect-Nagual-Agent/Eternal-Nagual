# Contributing

This is a living research system, published as it runs. Contributions are welcome — with the understanding that you are operating on an organism, not a library.

## Ground rules

1. **The SOUL is immutable.** PRs that weaken `SOUL.md`, the safety gates (`SafetyManager`, `AsimovSafetyFilter`, `BarratSafetyProtocol`, injection guards), or the leak filter will be closed. Hardening them is always welcome.
2. **No fake victories.** The project's core law is *grounding*: a feature "works" when there is a verifiable artifact (test, log, reproducible behavior) — not a claim. PR descriptions should show the artifact.
3. **One file is the design.** `core.py` stays a monolith on purpose (self-patching + AST watchdog). Don't split it into packages; improve it in place. Dashboard code lives in `dashboard/` and follows normal Next.js conventions.
4. **Respect the lineage.** Ideas borrowed from others are credited inline (see `KarpathyAutoResearch`, BabyAGI notes). Keep that habit.
5. **Russian prompts are not bugs.** The agent's inner voice is Russian by birth. i18n of prompts is a welcome contribution — as configuration, not as deletion.

## Good first territories

- Prompt i18n (extract inline prompts into a swappable locale layer)
- More providers in `UniversalLLMRouter` (the slot model makes this mechanical)
- Grounding judge hardening (execution-based verification of forged skills)
- Dashboard: new organs for the world, better mobile
- Tests: `TestSuite` tasks that verify loop behavior

## Dev loop

```bash
python -c "import ast; ast.parse(open('core.py').read())"   # the minimum bar — the watchdog's bar
./deploy.sh update                                           # run it; watch docker logs -f nagual
```

Open an issue before large changes — the architecture has laws (see ARCHITECTURE.md) that are not obvious from the code alone.
