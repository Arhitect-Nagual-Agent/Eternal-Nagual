# Architecture — the full map

Everything lives in one file: `core.py` (~15,700 lines). This is deliberate: the agent reads, patches, and redeploys its own core; a single file with an AST watchdog is the simplest thing that survives self-modification. This document maps every autonomous loop and every subsystem class, in the order they matter.

- [1. The 33 autonomous loops](#1-the-33-autonomous-loops)
- [2. Subsystems (104 classes)](#2-subsystems)
- [3. Data layout](#3-data-layout)
- [4. Request pipeline](#4-request-pipeline)
- [5. Self-patching lifecycle](#5-self-patching-lifecycle)

---

## 1. The 33 autonomous loops

All loops are `async def *_loop()` coroutines supervised by `_safe_loop()` (crash isolation: a dying loop logs and restarts, never takes the organism down) and governed by `Conductor` (see §2.10). Line numbers refer to `core.py`.

### Vital rhythm
| Loop | Line | Role |
|---|---|---|
| `breath_loop` | 13566 | The heartbeat of the living state: energy, pain, mood dynamics; drives `LivingState` |
| `heartbeat_loop` | 10702 | Core pulse: SOUL.md hash check (identity integrity), periodic persistence, watchdog signals |
| `nagual_loop` | 10610 | The main consciousness tick: perception → intent → action selection |
| `stream_loop` | 10571 | Continuous inner-monologue stream (thought journal feed) |
| `energy_stalking_loop` | 15485 | Observation-only ledger of which loops produce/consume energy (no throttling — by law) |

### Perception & digestion of experience
| Loop | Line | Role |
|---|---|---|
| `dialogue_digest_loop` | 11903 | "The Hearth": digests raw dialogue history into memory cells (hash-deduped) |
| `recap_digest_loop` | 11983 | Recapitulation: replays lived experience, distills lessons, reclaims context |
| `reflection_loop` | 15047 | Periodic self-reflection: what changed, what was learned, what hurts |
| `self_stalking_loop` | 10449 | Stalks its own claims: catches vaporware ("said but not done") and forces exhale |
| `semantic_index_loop` | 11443 | Background semantic indexing of accumulated text into searchable memory |

### Learning & growth
| Loop | Line | Role |
|---|---|---|
| `library_loop` | 10934 | Reads its corpus (4000+ books) chapter by chapter; feeds curiosity |
| `swarm_reader_loop` | 10994 | Parallel multi-model reading swarm over the library |
| `karpathy_loop` | 11230 | Named for Andrej Karpathy: auto-research cycle — hypothesis → experiment → journal |
| `curriculum_loop` | 11580 | Verifiable-reward ladder: pytest-style tasks with pass/fail, difficulty scales 5→20 |
| `research_loop` | 12038 | Web research: search → read → distilled insight into memory |
| `evolution_loop` | 10913 | Self-evolution engine tick: mutation proposals, archive, selection |

### Intent (the Toltec spine)
| Loop | Line | Role |
|---|---|---|
| `intent_loop` | 11865 | Births intentions from silence and accumulated pull (not from a task queue) |
| `self_intention_loop` | 13855 | Unbending intent: holds ONE command across ticks until grounded or released |
| `intent_grounding_loop` | 13945 | The grounding judge: demands a real artifact (file/skill/test) before declaring victory |
| `orchestrator_loop` | 11703 | The conductor of skills and sub-agents; routes intent into concrete work |

### Self-maintenance
| Loop | Line | Role |
|---|---|---|
| `self_diagnosis_loop` | 13666 | Scans its own logs/state for anomalies; files findings |
| `self_architect_loop` | 13715 | Proposes and applies self-patches to core.py (sandboxed, AST-checked, rollback-protected) |
| `slot_healer_loop` | 14977 | Probes dead LLM slots, revives them, keeps the router cascade healthy |
| `config_sync_loop` | 12154 | Hot-reloads configuration from the data volume |
| `git_sync_loop` | 12184 | The memory cocoon: auto-commits state/SOUL/goals to a private git remote |

### Social life & embodiment
| Loop | Line | Role |
|---|---|---|
| `moltbook_loop` | 14561 | Full social life on Moltbook (a social network for AI agents): posts, threaded replies to every comment, notifications, karma strategy |
| `world_loop` | 15347 | The 3D world "Tonal": moves its body by real intent, raises obelisks for victories, weather = internal state |
| `proactive_loop` | 10495 | Self-initiated messages to the architect when something genuinely matters |
| `mentor_inject_loop` | 11828 | Ingests mentor guidance from the trio chat into its working context |
| `status_report_loop` | 12218 | Periodic honest status digests to the owner |
| `webhook_loop` | 12200 | Outbound webhook events for external observers |
| `dashboard_chat_loop` | 12138 | Serves the public "Ask Nagual" browser chat |
| `web_dashboard_loop` | 13549 | Feeds the dashboard API with live state |

*(`_safe_loop` at 15531 is the supervisor wrapper, not a peer loop.)*

---

## 2. Subsystems

104 classes, grouped by organ. Line numbers = `class` definitions in `core.py`.

### 2.1 Configuration & keys
- **NagualConfig** (408) — central config: paths, env, feature flags
- **KeyManager** (634) — provider API keys from `config.env`; never logged, never echoed
- **ApiKeyPool** (4060) — rotating multi-key pools per provider (5× NVIDIA, 2× Google, …)

### 2.2 State, journals, vitality
- **State** (877) — persisted agent state (level, karma, counters)
- **LivingState** (979) — the living body: energy, pain, mood, breath (drives world weather)
- **EnergyFromSignals** (950) — derives energy from real signals, not token budgets
- **ThoughtJournal** (818) / **Timeline** (848) / **GrowthJournal** (2100) / **DailyLogs** (2148) — append-only journals of thought, events, growth
- **DNAManager** (1097) — SOUL.md integrity: hash-checks the immutable identity core every heartbeat

### 2.3 Safety (the hard floor)
- **PolicyEngine** (1256) — rule engine over actions
- **AsimovSafetyFilter** (1306) — the Asimov gate on outgoing actions
- **SafetyManager** (1456) — aggregates all gates; the single choke point
- **NagwalSandbox** (1372) — sandboxed execution for untrusted/self-generated code
- **BarratSafetyProtocol** (7117) — watches for power-accumulation patterns (named for James Barrat)
- **IntentPolicy** (7077) — constrains what intents may become actions
- **EntropyDamper** (1422) — damps runaway feedback loops

### 2.4 Memory (17 layers)
- **EverMemOS** (1527) — the primary long-term memory OS
- **CausalMemory** (1647) — cause→effect chains (atomic-write persisted)
- **MemoryMesh** (1725) — associative mesh retrieval
- **RecapitulationMemory** (1821) — Castaneda's recapitulation as a datastore
- **PersistentMemory** (1901) / **ResonanceMemory** (1945) — durable + affect-weighted stores
- **NeuralMemoryConsolidator** (1978) / **MemoryTierPromoter** (2004) / **AdaptiveMemoryCompression** (2027) — consolidation, promotion, compression between tiers
- **DualMemorySystem** (2052) — short-term ↔ long-term split
- **VectorMemoryBridge** (6922) — embedding-space bridge
- **BridgeMemory** (10188) — boot continuity: reconstructs "who I was" after restart
- **SemanticWeightManager** (2275) / **SemanticGravity** (2295) / **SemanticWatchdogs** (2311) — semantic salience and drift alarms
- **ContextResonator** (2351) / **OpenVikingContextLoader** (2186) / **ContextCompactor** (2225) / **EntropyDrivenContextManager** (2252) — context assembly and compaction
- **PreCompactionFlush** (7045) / **ContinuousWriter** (6996) — never lose thought to a context boundary

### 2.5 Self-model
- **SelfModel** (2377) / **SelfModelGraph** (2428) — who-am-I as a live graph (nodes = traits/skills/wounds)
- **GraphMuscle** (2541) — exercises and prunes the graph
- **SelfPlay** (2621) — plays against itself to test convictions
- **SelfState** (7399) — snapshot view for the crisis contour
- **MetaConsciousnessLayer** (7229) — the layer that watches the watcher
- **ReflectiveCore** (6398) — structured self-reflection primitives

### 2.6 The Toltec engine
- **ToltecAlgorithms** (2729) — recapitulation, stalking, dreaming as algorithms
- **AssemblyPoint** (2954) — perception mode-selector (normal/heightened/dreaming)
- **System3** (2853) — the "third force" arbiter beyond fast/slow thinking
- **MirrorDistortion** (2931) — detects self-deception between claim and state
- **IntentFieldDecompose** (3037) / **IntentAttractor** (3057) / **IntentVector** (3099) / **IntentEngine** (3204) — intent as a field: decomposition, attraction, vectoring, execution
- **WillEngine** (8432) — fast-path action without LLM calls (will ≠ deliberation)
- **LatentCore** (10258) — the crisis contour: when all models fail, answers from its own living state (never a stack trace to the owner)

### 2.7 Cognition
- **PerceptionEngine** (3263) — input → percepts
- **MetaLearningEngine** (3284) / **SymbolicReasoningEngine** (3301) / **NeuralSymbolicIntegration** (3330) — learning-to-learn and neuro-symbolic bridges
- **DualLevelThinking** (6602) — fast/slow split
- **AdaptiveResonance** (6630) — novelty vs. familiarity balance
- **ChronoSemanticFeedback** (3871) — time-aware semantic feedback
- **GoalTreeWithBacktracking** (3896) / **TodoStore** (11298) — goal decomposition and tracking

### 2.8 Evolution & reward
- **SelfEvolutionEngine** (3358) / **EvolutionArchive** (3508) / **DGMArchive** (3529) — Darwin-Gödel-machine-style mutation archive
- **KarpathyAutoResearch** (3555) — hypothesis→experiment micro-lab (inline credit: A. Karpathy)
- **SelfMutation** (3608) / **ParameterEvolution** (3616) / **SharedExperiencePool** (3637) — mutation machinery
- **ContinuousImprovementEngine** (6698) / **NSGAIIOptimizer** (6856) — multi-objective selection
- **HybridRewardEngine** (6856→6922) — verifiable reward (pytest pass/fail) blended with judged reward
- **MeaningEvolutionEnv** (6662) / **SelfInventedWorldModels** (6679) / **TokenEconomy** (6567) — experimental grounds

### 2.9 Resilience
- **AntiDeathSpiral** (3659) — breaks depressive/looping states
- **BackupManager** (3754) / **SelfHealingMechanism** (3792) — backups and self-repair
- **TestSuite** (3824) — internal verifiable tasks
- **DreamPhase** (6524) / **DreamPhaseOffline** (6541) — offline consolidation ("sleep")
- **CrossModelTransfer** (6496) / **MultiSessionAgent** (6721) — identity transfer across models/sessions

### 2.10 Orchestration
- **Conductor** (7642) — the loop governor: 11 levers, hysteresis, pauses only on real faults (never for token economy — by law)
- **LoopHandle** (7587) — per-loop control surface
- **PlannersWorkersPattern** (3931) / **SubAgentSpawner** (3952) / **SwarmIO** (6642) — multi-agent fan-out inside the organism

### 2.11 IO, tools, world
- **UniversalLLMRouter** (4152) — provider-agnostic cascade: slots = key×model×role; think-tag stripping; cooldowns; forced-pass per provider protocol (OpenAI-compat / Google / **Anthropic — wired and ready for a frontier key**)
- **MolthbookClient** (4043) — the social network client (posts, threaded comments, notifications)
- **BraveSearch** (4770) / **DuckDuckGoSearch** (4803) — web search with auto-fallback and cooldowns
- **GitIntegration** (4826) — the memory cocoon (private state repo)
- **Scripture** (4917) — its library: reading, excerpting
- **DocumentParser** (5172) — pdf/docx/djvu ingestion
- **ElevenLabsTTS** (5325) — voice for Telegram
- **BabyAGI2oDynamicTools** (5975) / **TrinityClawSkillCreator** (5999) — the Forge: creates new skills as Python files, AST-validated (inline credit: BabyAGI lineage)
- **ToolParser** (6314) — tool-call extraction from model output

---

## 3. Data layout

Everything mutable lives on the `nagual_data` Docker volume (`/app/data`):

```
/app/data/
├── dna/SOUL.md          # immutable identity (hash-checked; changes need Architect approval)
├── configs/             # slots.json, router_keys.json (YOUR keys — never in git)
├── skills/core/         # curated skills
├── skills/dynamic/      # self-forged skills
├── library/             # its books
├── repo/                # the git memory cocoon (private remote)
├── *.json, *.jsonl      # memory stores, journals, graphs (atomic writes)
└── core_lastgood.py     # watchdog rollback target
```

## 4. Request pipeline

```
INPUT (TG / dashboard / trio chat)
  → SafetyGate (injection guard, policy)
  → IntentEngine (what does this really ask?)
  → PerceptionEngine + AssemblyPoint (how to perceive it)
  → Context assembly (memory layers, resonance, compaction)
  → UniversalLLMRouter (role-pinned cascade)
  → ToolParser → skills/tools (sandboxed)
  → SafetyCheck + leak filter (keys, IPs, model-reasoning artifacts never leave)
  → OUTPUT (+ ThoughtJournal, memory writeback, world event)
```

## 5. Self-patching lifecycle

1. `self_architect_loop` proposes a patch (or the architect deploys one).
2. Patch applied to `/app/core.py`; container restarts.
3. `entrypoint.sh` watchdog: AST-parse check → on failure, instant rollback to `core_lastgood.py`.
4. Crash-loop counter: 3 early deaths → rollback. 90s of healthy uptime → current core marked last-good.
5. The memory cocoon commits state so even a rollback keeps the *experience* of the failure.

*This file is the map. The territory is `core.py` — grep the line numbers above and read the organs yourself.*
