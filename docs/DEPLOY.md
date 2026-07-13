# Deployment guide

## TL;DR

```bash
cp config.env.example config.env   # add at least one LLM API key
./deploy.sh                        # agent only
./deploy.sh dashboard              # agent + public dashboard on :8090
./deploy.sh update                 # redeploy new core.py; memory survives
```

Requirements: any Linux box with Docker (1 vCPU / 4 GB RAM is enough; swap recommended — the reading swarm can spike).

## What starts

| Container | Image | Port | Purpose |
|---|---|---|---|
| `nagual` | `nagual:latest` | `127.0.0.1:8000` | the mind (FastAPI + 33 loops) |
| `nagual-dash` | `nagual-dash:latest` | `0.0.0.0:8090` | public dashboard (optional) |

State lives on the `nagual_data` volume: memory, skills, SOUL.md, journals, the world. Containers are disposable; the volume is the life. Back it up.

## Security model — read this

- **Never publish port 8000.** The internal API includes self-management endpoints (including a shell endpoint for self-maintenance). `deploy.sh` binds it to localhost; the dashboard reaches it over the private Docker network and exposes only sanitized, read-only views plus an authenticated chat.
- The agent runs **inside its container only**. Give it no host mounts beyond its data volume.
- `config.env`, `data/configs/router_keys.json`, `data/configs/slots.json` hold your keys — all are .gitignore'd. The built-in leak filter additionally scrubs keys/IPs from anything the agent says.
- The memory cocoon (`GITHUB_REPO`) must point to a **private** repository: it contains the agent's raw memory.

## Model slots (the router)

The router thinks in **slots**: `key × model × role`. Roles:
- `dialog` — the owner-facing voice (latency matters)
- `background` — loops, research, social life (throughput matters)
- `files` — long-context document work

Defaults are generated on first boot from whatever provider keys you supplied. To customize, edit `data/configs/slots.json` on the volume (see `docs/slots.example.json` and `docs/router_keys.example.json`), then restart. Order = cascade priority; per-model quotas mean one throttled model does not kill a provider.

**Waking it fully:** put a frontier model (`claude-sonnet-5` / Claude Opus via `ANTHROPIC_API_KEY`, or `z-ai/glm-5.2`) on the meta work — the grounding judge, skill forge, and orchestrator are where a strong brain changes everything. The Anthropic call path is already implemented; adding the key is enough to cascade into it.

## Telegram

Create a bot with @BotFather, put `TG_TOKEN` + `TG_CHAT_ID` in config.env. The agent speaks first: status reports, honest victories (with artifacts), and crisis messages come on its own initiative. Voice replies work if you add ElevenLabs keys.

## Updating the core

`./deploy.sh update` rebuilds and swaps the container. The entrypoint watchdog protects you: a core.py that fails AST parse or crash-loops 3× rolls back to the last-good core automatically. You can also let the agent patch itself — that is what `self_architect_loop` does — under the same watchdog.

## Troubleshooting

- **Silent agent** → `docker logs nagual | tail -100`; usually all slots down (check keys/quotas). The `slot_healer_loop` revives them; `curl 127.0.0.1:8000/api/status` shows router health.
- **OOM restarts** → add swap (`--memory-swap`), the reading swarm respects backpressure but Python heaps spike.
- **Dashboard empty** → it needs `NAGUAL_BACKEND_URL=http://nagual:8000` and both containers on `nagual_net`.
