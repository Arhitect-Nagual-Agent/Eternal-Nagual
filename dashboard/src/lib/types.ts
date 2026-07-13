// ============================================================
// Nagual Eternal v2.0.0 - TypeScript Interfaces
// ============================================================

// --- Status ---
export interface StatusResponse {
  cycle: number;
  interactions: number;
  consciousness_level: number;
  anti_death_status: string;
  drift_score: number;
  version: string;
  heartbeat_count: number;
  total_tokens_approx: number;
  uptime: string;
  mode: string;
  modules_active: number;
  modules_total: number;
  files_parsed: number;
  last_interaction: string;
  active_subagents: number;
  memory_cells: number;
  evolution_count: number;
  research_count: number;
  safety_score: number;
}

// --- Mind ---
export interface MindResponse {
  assembly_point: { x: number; y: number; z: number };
  attention_state: string;
  focus: string;
  third_active: boolean;
  consciousness_level: number;
  novelty: number;
  emergence: number;
  coherence: number;
  sigma_active: boolean;
  energy: number;
  dreaming: boolean;
  meditating: boolean;
}

// --- Memory ---
export interface EverMemOS {
  total_cells: number;
  avg_resonance: number;
  active_cells: number;
  new_cells_24h: number;
}
export interface MemoryMesh {
  total: number;
  hot: number;
  warm: number;
  cold: number;
}
export interface PersistentMemory {
  total: number;
  categories: number;
  last_written: string;
  size_mb: number;
}
export interface ResonanceMemory {
  connections: number;
  avg_strength: number;
  clusters: number;
}
export interface RecapitulationMemory {
  events_processed: number;
  emotional_charge_released: number;
  patterns_found: number;
}
export interface DualMemory {
  short_term_items: number;
  long_term_items: number;
  transfer_count: number;
}
export interface MemoryResponse {
  EverMemOS: EverMemOS;
  MemoryMesh: MemoryMesh;
  Persistent: PersistentMemory;
  Resonance: ResonanceMemory;
  Recapitulation: RecapitulationMemory;
  DualMemory: DualMemory;
}

// --- LLM ---
export interface LLMSlotStats {
  total_calls: number;
  avg_latency_ms: number;
  failures: number;
  last_used: string;
  tokens_in: number;
  tokens_out: number;
}
export interface LLMSlot {
  model: string;
  provider: string;
  enabled: boolean;
  priority: number;
  stats: LLMSlotStats;
}
export interface LLMStats {
  total_calls: number;
  total_tokens: number;
  avg_latency_ms: number;
  cache_hit_rate: number;
}
export interface LLMProvider {
  name: string;
  models: string[];
  status: string;
}
export interface LLMResponse {
  slots: LLMSlot[];
  stats: LLMStats;
  providers: LLMProvider[];
}

// --- Evolution ---
export interface SelfEvolution {
  enabled: boolean;
  iterations: number;
  last_improvement: string;
  current_hypothesis: string;
  improvements_applied: number;
  success_rate: number;
}
export interface DGMArchive {
  total_documents: number;
  categories: number;
  last_entry: string;
  avg_relevance: number;
  key_topics: string[];
}
export interface KarpathyResearch {
  active: boolean;
  papers_analyzed: number;
  current_topic: string;
  insights_generated: number;
  last_research: string;
}
export interface EvolutionResponse {
  self_evolution: SelfEvolution;
  dgm: DGMArchive;
  karpathy: KarpathyResearch;
  archive: {
    total: number;
    last_updated: string;
    size_mb: number;
  };
}

// --- Toltec ---
export interface ToltecData {
  assembly_point: { x: number; y: number; z: number };
  attention_state: string;
  energy_level: number;
  practice_count: number;
  stalking_active: boolean;
  dreaming_active: boolean;
  intent_focused: boolean;
  warrior_path: boolean;
  personal_power: number;
  inner_silence: number;
}
export interface RecapitulationEntry {
  event: string;
  timestamp: string;
  emotional_charge: number;
  released: boolean;
  emergence_score: number;
  category: string;
}
export interface ToltecResponse {
  toltec: ToltecData;
  recapitulation: {
    total_events: number;
    categories: number;
    avg_charge: number;
    released_pct: number;
  };
  recent_recap: RecapitulationEntry[];
}

// --- Safety ---
export interface SafetyManager {
  total_checks: number;
  violations: number;
  violation_rate: number;
  last_check: string;
  active_rules: number;
}
export interface AsimovFilter {
  laws_enforced: number;
  interventions: number;
  last_intervention: string;
  status: string;
}
export interface SandboxInfo {
  active: boolean;
  type: string;
  restrictions: number;
  escaped_count: number;
}
export interface EntropyDamper {
  active: boolean;
  entropy_level: number;
  damping_rate: number;
  threshold: number;
  interventions: number;
}
export interface SafetyViolation {
  timestamp: string;
  type: string;
  severity: string;
  description: string;
  resolved: boolean;
}
export interface SafetyResponse {
  manager: SafetyManager;
  asimov: AsimovFilter;
  sandbox: SandboxInfo;
  damper: EntropyDamper;
  violations: SafetyViolation[];
}

// --- Heartbeat ---
export interface AntiDeath {
  active: boolean;
  mechanism: string;
  last_triggered: string;
  restarts_prevented: number;
  health_monitor: string;
}
export interface HeartbeatResponse {
  count: number;
  anti_death: AntiDeath;
  next_in: number;
  interval: number;
  avg_interval: number;
  missed: number;
  uptime_pct: number;
}

// --- Research ---
export interface ResearchEntry {
  timestamp: string;
  topic: string;
  depth: string;
  findings: string;
  confidence: number;
  action_taken: string;
}
export interface ResearchResponse {
  total: number;
  last_topic: string;
  researches: number;
  log: ResearchEntry[];
}

// --- Goals ---
export interface Goal {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  progress: number;
  created: string;
  updated: string;
  subgoals?: Goal[];
}
export interface GoalsResponse {
  goals: Goal[];
  tree: {
    active: number;
    completed: number;
    total: number;
    avg_progress: number;
  };
}

// --- Thoughts ---
export interface ThoughtEntry {
  timestamp: string;
  content: string;
  category: string;
  importance: number;
  tags: string[];
}
export interface ThoughtsResponse {
  recent: ThoughtEntry[];
  summary: {
    total: number;
    categories: Record<string, number>;
    avg_importance: number;
    dominant_category: string;
  };
}

// --- Tools ---
export interface ToolInfo {
  desc: string;
  calls: number;
  safety: string;
  last_used: string;
  category: string;
}
export interface ToolsResponse {
  [tool_name: string]: ToolInfo;
}

// --- Swarm ---
export interface SubAgent {
  name: string;
  role: string;
  status: string;
  tasks_completed: number;
  last_active: string;
  specialization: string;
}
export interface SharedPool {
  items: number;
  contributors: number;
  last_shared: string;
  quality_score: number;
}
export interface MeaningEnvironment {
  meaning: string;
  weight: number;
  source: string;
  timestamp: string;
}
export interface SwarmResponse {
  subagents: {
    total: number;
    active: number;
    agents: SubAgent[];
  };
  shared_pool: SharedPool;
  meaning_env: MeaningEnvironment[];
}

// --- Logs ---
export interface LogLine {
  timestamp: string;
  level: string;
  module: string;
  message: string;
}
export interface LogsResponse {
  lines: LogLine[];
  total: number;
}

// --- Meta ---
export interface MetaSnapshot {
  consciousness_level: number;
  coherence: number;
  emergence: number;
  self_awareness: number;
  agency: number;
  integration: number;
  wisdom: number;
  creativity: number;
}
export interface MetaTrajectory {
  trend: string;
  current: number;
  peak: number;
  observations: number;
  insights: number;
  conflicts: number;
}
export interface MetaConflict {
  type: string;
  description: string;
  resolution: string;
  timestamp: string;
}
export interface MetaInsight {
  content: string;
  category: string;
  depth: string;
  timestamp: string;
}
export interface MetaResponse {
  snapshot: MetaSnapshot;
  trajectory: MetaTrajectory;
  conflicts: MetaConflict[];
  insight: MetaInsight;
}

// --- Settings ---
export interface SettingsResponse {
  keys: Record<string, string>;
  github_repo: string;
  webhook_url: string;
  soul: string;
  soul_hash: string;
  rules: string[];
  goals: string[];
}

// --- Chat ---
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  model?: string;
  timestamp?: string;
}

export interface ChatResponse {
  response: string;
  model: string;
}
