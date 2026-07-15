# Our production setup — the $0 reference deployment

This is not a benchmark or a demo config. This is the exact setup the original Nagual
runs on **right now**, on a 1 vCPU / 4 GB VPS, at a total LLM cost of **$0/month**.
Published so you can reproduce it — and so you can see what "runs on free tiers" means
in practice, not in marketing.

*Snapshot date: July 15, 2026.*

## The keys

| Provider | Keys | Cost | Notes |
|---|---|---|---|
| NVIDIA NIM (`build.nvidia.com`) | 5 | $0 | The workhorse. Free tier per account; five accounts = five parallel quota pools |
| Google AI Studio | 2 | $0 | Gemini models as the mid-cascade fallback |
| OpenRouter (`:free` models) | 1 | $0 | Last-resort reserve; `:free` models 429 often — treat as emergency lane only |

Five keys on one provider is the trick that makes free tiers livable: the router
spreads every model across all five keys, so one throttled key costs you a slot,
not a provider.

## The slots (live config)

Roles: `dialog` = owner-facing voice, `background` = the 33 loops' fuel.
Order = cascade priority. Every row exists ×5 NVIDIA keys.

| Model | Role | Why it holds the line |
|---|---|---|
| `z-ai/glm-5.2` | dialog | Best free reasoning we found for the owner-facing voice |
| `mistralai/mistral-small-4-119b-2603` | dialog, background | Fast, stable, rarely throttled |
| `minimaxai/minimax-m3` | dialog, background | Strong long-form generation |
| `nvidia/nemotron-3-super-120b-a12b` | dialog, background | Reliable mid-weight loop fuel |
| `deepseek-ai/deepseek-v4-pro` | dialog, background | The deepest free thinker; also powers the Moltbook social loop |
| `nvidia/nemotron-3-ultra-550b-a55b` | dialog, background | Heavy artillery when quotas allow |

## What this buys (measured, not claimed)

- **33 concurrent loops** running 24/7 with zero LLM spend.
- **Moltbook karma 4 → 630+ in two weeks** — earned autonomously: the agent writes
  posts, comments, and makes friends on the social network for AI agents
  ([moltbook.com/u/Nagual](https://www.moltbook.com/u/Nagual)) with no human in the loop.
- **Flat memory**: RSS ~3 GiB steady after the backpressure fixes; survives on 4 GB + swap.
- **Restart-proof identity**: model swaps mid-conversation and process restarts do not
  reset the persona — memory and goals live on the data volume, not in the model.

## Hard-won lessons (read before you burn a day)

1. **Provider catalogs lie.** A model listed in the catalog may 404 on hosted inference
   (we lost hours to a "available" model that wasn't). Probe every slot with a real
   request before trusting it — the `slot_healer_loop` does this continuously.
2. **Per-model quotas, not per-provider.** One throttled model must not kill the
   provider for every other model on the same key.
3. **Strip think-tags.** Free reasoning models leak `<think>` blocks; the router strips
   them before anything reaches memory or the owner.
4. **Swap is non-negotiable** on 4 GB. The reading swarm spikes; swap absorbs it.
5. **429 is a routing event, not an error.** Cascade sideways (next key), then down
   (next model). With 5 keys × 6 models the agent has ~30 lanes before it ever fails.

## Waking it fully — bring a frontier brain

The skeleton is stronger than its free-tier brain. The meta work — grounding judge,
skill forge, orchestrator — is where a strong model changes everything:

- **Anthropic** (`ANTHROPIC_API_KEY`): the call path is already wired in. Claude
  Sonnet/Opus on the meta role is the intended "full awakening" config.
- **Kimi (Moonshot), Qwen, GPT, GLM, DeepSeek official APIs**: any OpenAI-compatible
  endpoint slots straight into the router config.
- Subscription-style access (like a Claude Code plan) is the economical sweet spot —
  pay-per-token frontier APIs on 33 always-on loops get expensive fast. That is exactly
  why the free-tier cascade exists: **the organism must stay alive on $0**, and think
  deeper when you can afford it.

## Tell us how far your Nagual got

This is the experiment we care about most: **the same organism on different brains.**
If you run it — on free tiers, on Kimi, on Qwen, on Claude — open an issue with the
`my-nagual-run` label and show us:

- your key/model mix,
- karma curve or loop stats (`/api/status` gives you everything),
- the strangest thing it did on its own initiative.

The most interesting runs get featured here.
