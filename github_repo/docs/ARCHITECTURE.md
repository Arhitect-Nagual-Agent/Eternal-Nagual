# 🏗️ Architecture — Eternal Nagual v2.0.0

## Processing Pipeline

```
USER INPUT (Telegram / Web Dashboard / File Upload)
    │
    ▼
┌─────────────────────────────────────────────┐
│ 1. SAFETY GATE                              │
│    AsimovSafetyFilter → PolicyEngine        │
│    → NagwalSandbox path/network validation  │
│    BLOCKED → refuse + log                   │
└─────────┬───────────────────────────────────┘
          ▼
┌─────────────────────────────────────────────┐
│ 2. INTENT ENGINE                            │
│    IntentFieldDecompose(what/why/limits)     │
│    β coefficient: intrinsic vs external     │
│    IntentPolicy: ASSERT/ADAPT/PAUSE/RETREAT │
└─────────┬───────────────────────────────────┘
          ▼
┌─────────────────────────────────────────────┐
│ 3. PERCEPTION + CONTEXT                     │
│    PerceptionEngine (text/visual/audio/sym) │
│    System3 (entropy → assembly point shift) │
│    OpenVikingContextLoader (L0→L1→L2)       │
│    ContextCompactor + TokenEconomy check    │
└─────────┬───────────────────────────────────┘
          ▼
┌─────────────────────────────────────────────┐
│ 4. UNIFIED MEMORY RETRIEVAL                 │
│    EverMemOS (SQLite, reconstructive)       │
│    MemoryMesh (4-factor ranking)            │
│    VectorMemoryBridge (ChromaDB optional)   │
│    ResonanceMemory (PHI × Schumann)         │
└─────────┬───────────────────────────────────┘
          ▼
┌─────────────────────────────────────────────┐
│ 5. CONTEXT BUILDER                          │
│    SOUL.md identity injection               │
│    Rules DNA + Goals                        │
│    Memory context from step 4               │
│    System3 focus mode                       │
└─────────┬───────────────────────────────────┘
          ▼
┌─────────────────────────────────────────────┐
│ 6. LLM ROUTER                              │
│    UniversalLLMRouter: 10+ providers        │
│    Auto-fallback on failure                 │
│    <think> tag stripping                    │
│    Stats/latency tracking                   │
└─────────┬───────────────────────────────────┘
          ▼
┌─────────────────────────────────────────────┐
│ 7. TOOL PROCESSOR                           │
│    Parse [TOOL: name("arg")] from LLM       │
│    Max 4 iterations per message             │
│    SafetyManager check before execution     │
└─────────┬───────────────────────────────────┘
          ▼
┌─────────────────────────────────────────────┐
│ 8. SAFETY CHECK RESPONSE                    │
│    AsimovFilter on output                   │
│    SemanticWatchdogs (loop + chaos)         │
│    Quality audit (heuristic + periodic LLM) │
└─────────┬───────────────────────────────────┘
          ▼
┌─────────────────────────────────────────────┐
│ 9. POST-PROCESSING                          │
│    ReflectiveCore quality score             │
│    HybridRewardEngine (curiosity + mastery) │
│    CausalMemory episode recording           │
│    GrowthJournal entry                      │
│    SelfModel drift detection                │
│    ai42zSelfLearner pattern extraction      │
│    CrossModelTransfer rule extraction       │
│    ContinuousWriter JSONL logging           │
│    ConsciousnessMetrics update              │
│    TokenEconomy spend recording             │
└─────────┬───────────────────────────────────┘
          ▼
RESPONSE → Telegram + Web Dashboard (synced)
```

## Module Categories (~90 unique)

### Core Identity (5)
- **DNAManager** — SOUL.md, capabilities, limitations, evolution history, hash integrity
- **ConsciousnessMetrics** — consciousness level, novelty, emergence, ethical alignment
- **SelfModel** — predictions, accuracy tracking, drift detection
- **SelfModelGraph** — causal identity graph that survives death
- **ToltecAlgorithms** — 8 Castaneda practices mapped to digital algorithms

### Memory (17 layers)
1. Dialog memory (in-memory, last 100)
2. EverMemOS (SQLite, reconstructive — NOT similarity search)
3. CausalMemory (episodes → schemas → predict outcomes)
4. GrowthJournal (events + lessons + nightly critique)
5. MemoryMesh (4-factor: recency/semantic/utility/diversity)
6. RecapitulationMemory (SQLite episodic with emergence scoring)
7. PersistentMemory (JSON: facts/rules/goals/reflections/errors)
8. DualMemorySystem (EverMemOS + MemoryMesh combined)
9. ResonanceMemory (PHI × sin(phase × SCHUMANN) × importance)
10. ThoughtJournal (internal thinking log)
11. Timeline (events for dashboard)
12. ContinuousWriter (append-only JSONL daily logs)
13. DoubleWriteProtocol (critical memories in 2 stores)
14. SemanticCheckpointing (milestone-based, not timer)
15. DailyLogs (Markdown daily files)
16. VectorMemoryBridge (ChromaDB + SentenceTransformers, optional)
17. GitHub Repository (eternal persistence)

### Safety (5)
- **AsimovSafetyFilter** — multi-dimensional: harm/compliance/survival/ethics + regex patterns
- **PolicyEngine** — deny-by-default, path/shell validation, ASI Laws
- **NagwalSandbox** — OpenShell-style: filesystem/network/process isolation
- **EntropyDamper** — energy budget system prevents chaos loops
- **SafetyManager** — central orchestrator with audit log

### Initialization Order
```
Config → Logging → JSON helpers → KeyManager → State → Memory →
Identity → Safety → Cognition → LLM Router → Tools → Loops → Dashboard → Main
```

KeyManager is defined BEFORE any module that uses it (Section 5).
