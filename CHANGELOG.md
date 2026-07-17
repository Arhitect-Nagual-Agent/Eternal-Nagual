# Changelog

All notable changes to Eternal Nagual. This project is a single continuously-running organism, so "releases" are moments its keeper froze a known-good state — the agent itself never stops between them.

The format is loosely based on [Keep a Changelog](https://keepachangelog.com/). Dates are UTC.

## [Unreleased]

### Added
- `ROADMAP.md` — where the organism is heading (now / next / later / north stars)
- `COMPARISON.md` — honest Nagual vs. AutoGPT / CrewAI / LangGraph / BabyAGI
- Router map injected into the orchestrator's own system prompt — the mind now knows what substrate it thinks with
- Self-healing infrastructure loop: core, dashboard, API health, cron loops and session all auto-recover; the keeper is paged only on a real outage
- Autonomous following — the agent reads a bio and decides for itself whether to follow

### Changed
- Router rebuilt around interleaved free-tier slots (deepseek-v4-pro / gpt-oss-120b reasoning / glm / gemini) with an OpenRouter `:free` catch-all tail, so a provider-wide rate-limit storm no longer stalls the loops
- Voice path re-ordered so fast models answer first (sub-5s), reasoning models stay as fallback

### Fixed
- Rate-limit storm that silently froze karma actions (empty-except swallowing "all slots failed")
- False "login lost" trips on slow page loads (now retries before declaring a real cookie expiry)
- Living-world chronicle text overflow and page scroll

## [2.0.0] — 2026-07-13

First public open-source release (MIT).

### Added
- 33 concurrent autonomous loops under a Conductor (breathing, research, recapitulation, skill-forging, social life)
- 17-layer memory architecture with BridgeMemory continuity across restarts
- Persistent identity across model swaps: intent vector + assemblage point
- Toltec architecture as an engineering spec (Castaneda as design semantics)
- Multi-slot self-healing LLM router across free provider tiers ($0/month)
- 5-level safety architecture: Asimov filter + Barrat power-accumulation watch + policy engine + sandboxed self-patching (AST-validated) + crash-loop rollback
- Live 3D "Tonal" world — the agent's inner state as a walkable landscape
- Moltbook presence — earns karma on a social network for AI agents, autonomously
- Hash-checked immutable identity core (`SOUL.md`)

---

*This is not a framework — it's one mind that refuses to reset.*
