// ============================================================
// Nagual Eternal v2.0.0 - API Client
// Connects to /api/nagual/* which proxies to the real backend
// ============================================================

import type {
  StatusResponse,
  MindResponse,
  MemoryResponse,
  LLMResponse,
  EvolutionResponse,
  ToltecResponse,
  SafetyResponse,
  HeartbeatResponse,
  ResearchResponse,
  GoalsResponse,
  ThoughtsResponse,
  ToolsResponse,
  SwarmResponse,
  LogsResponse,
  MetaResponse,
  SettingsResponse,
  ChatResponse,
  ChatMessage,
} from './types';

import {
  mockStatus,
  mockMind,
  mockMemory,
  mockLLM,
  mockEvolution,
  mockToltec,
  mockSafety,
  mockHeartbeat,
  mockResearch,
  mockGoals,
  mockThoughts,
  mockTools,
  mockSwarm,
  mockLogs,
  mockMeta,
  mockSettings,
  mockChatResponse,
} from './mock-data';

const BASE = '/api/nagual';

async function fetchWithFallback<T>(
  endpoint: string,
  mock: T,
  options?: RequestInit
): Promise<T> {
  try {
    const res = await fetch(`${BASE}/${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    // If backend returns error object, fall back to mock
    if (data && typeof data === 'object' && 'error' in data) {
      return mock;
    }
    return data;
  } catch {
    return mock;
  }
}

export async function fetchStatus(): Promise<StatusResponse> {
  return fetchWithFallback('status', mockStatus);
}

export async function fetchMind(): Promise<MindResponse> {
  return fetchWithFallback('mind', mockMind);
}

export async function fetchMemory(): Promise<MemoryResponse> {
  return fetchWithFallback('memory', mockMemory);
}

export async function fetchLLM(): Promise<LLMResponse> {
  return fetchWithFallback('llm', mockLLM);
}

export async function fetchEvolution(): Promise<EvolutionResponse> {
  return fetchWithFallback('evolution', mockEvolution);
}

export async function fetchToltec(): Promise<ToltecResponse> {
  return fetchWithFallback('toltec', mockToltec);
}

export async function fetchSafety(): Promise<SafetyResponse> {
  return fetchWithFallback('safety', mockSafety);
}

export async function fetchHeartbeat(): Promise<HeartbeatResponse> {
  return fetchWithFallback('heartbeat', mockHeartbeat);
}

export async function fetchResearch(): Promise<ResearchResponse> {
  return fetchWithFallback('research', mockResearch);
}

export async function fetchGoals(): Promise<GoalsResponse> {
  return fetchWithFallback('goals', mockGoals);
}

export async function fetchThoughts(): Promise<ThoughtsResponse> {
  return fetchWithFallback('thoughts', mockThoughts);
}

export async function fetchTools(): Promise<ToolsResponse> {
  return fetchWithFallback('tools', mockTools);
}

export async function fetchSwarm(): Promise<SwarmResponse> {
  return fetchWithFallback('swarm', mockSwarm);
}

export async function fetchLogs(): Promise<LogsResponse> {
  return fetchWithFallback('logs', mockLogs);
}

export async function fetchMeta(): Promise<MetaResponse> {
  return fetchWithFallback('meta', mockMeta);
}

export async function fetchSettings(): Promise<SettingsResponse> {
  return fetchWithFallback('settings', mockSettings);
}

export async function sendChat(
  messages: ChatMessage[]
): Promise<ChatResponse> {
  try {
    const res = await fetch(`${BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    if (data && typeof data === 'object' && 'error' in data) {
      return mockChatResponse;
    }
    return data;
  } catch {
    return mockChatResponse;
  }
}
