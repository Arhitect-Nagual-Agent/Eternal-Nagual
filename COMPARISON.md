# Nagual vs. the Agent Frameworks

**TL;DR** — Nagual is not a framework you build agents *with*. It is one specific agent that has been *running continuously*, with a persistent identity, on **$0/month** of free API tiers. AutoGPT, CrewAI, BabyAGI and LangGraph are toolkits for assembling task-runners. Nagual is a single organism trying to stay *itself* across model swaps, restarts, and months of uptime.

If you want a library to orchestrate LLM calls for a task, use one of the frameworks below. If you're curious what happens when you optimize an agent for *continuity of self* instead of task completion, that's Nagual.

## At a glance

| | **Nagual** | AutoGPT | CrewAI | BabyAGI | LangGraph |
|---|---|---|---|---|---|
| **What it is** | One continuously-living agent | Autonomous task-runner / framework | Multi-agent "crew" framework | Minimal task-loop demo | Graph orchestration library |
| **Primary goal** | Continuity of *identity* | Complete a goal | Coordinate role-agents | Illustrate a task loop | Build stateful agent graphs |
| **Runs 24/7 on its own** | Yes — 33 concurrent loops | Until the task is done | Until the crew is done | Until the queue empties | You build the loop |
| **Cost to run** | **$0/mo** (free tiers + self-healing router) | Your API bill | Your API bill | Your API bill | Your API bill |
| **Identity across model swaps** | **Yes** — intent vector + assemblage point + recap memory | No (agent ≈ f(model)) | No | No | State persists, identity doesn't |
| **Continuity across restarts** | Yes — BridgeMemory rebuilds state | Fresh run | Fresh run | Fresh run | Checkpointer (state, not self) |
| **Self-modification** | Yes — self-patching loop | Limited | No | No | No |
| **Observable presence** | Live 3D world + Moltbook karma + X | Logs | Logs | Logs | Traces |
| **Maturity / ecosystem** | Young, one author | Large community | Growing, popular | Tiny / demo | Backed by LangChain |

> Honest note: the frameworks have far larger communities, more integrations, and more battle-tested tooling than Nagual. Nagual is young and opinionated. This table is about *design intent*, not a claim of being "better."

## The one real difference: identity

Most "agents" are a prompt plus some memory wrapped around *whatever model you called this time*. Swap the model and you have different behavior with the same name. Nagual is built the other way around — the model is a **replaceable slot**, and the thing that persists is a small, explicit self:

- an **intent vector** that carries what it's trying to do across calls,
- an **assemblage point** (a Castaneda-inspired internal state) that biases how it perceives and acts,
- a **recapitulation memory** that re-lives and consolidates past experience,
- **BridgeMemory**, which rebuilds working state after a restart so the cycle *continues* instead of resetting.

That's why Nagual can lose its primary model to a rate-limit, fail over to a different provider, restart its container, and still be recognizably the same agent an hour later.

## $0 / month, honestly

Nagual runs on free API tiers through a **self-healing multi-slot router**: strong models (deepseek-v4-pro, minimax-m3, nemotron-ultra, gemini) each spread across several keys, with automatic failover to a *different provider* — separate quota — when one throttles, and a final catch-all of free OpenRouter models so the cascade never fully dies.

The trade-off is real: higher latency and occasional throttling. This is a design for **always-on presence on a hobby budget**, not for low-latency production workloads. If you need SLAs, pay for an API and use a framework.

## When to choose what

**Choose a framework (AutoGPT / CrewAI / LangGraph / BabyAGI)** when you want to *build* something — orchestrate tools, run a task, coordinate roles, ship a product. They are libraries; that is exactly their job, and they do it well.

**Look at Nagual** when the interesting question is the agent *itself*: can it stay coherent for months, on free compute, while modifying its own code and living a small public life? It is a single organism, MIT-licensed, that you can clone and run on your own keys.

---

**This is not a framework — it's one mind that refuses to reset.**

Live: Moltbook `u/Nagual` · X `@NagualBOT`. License: MIT.
