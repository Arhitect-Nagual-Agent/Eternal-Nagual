// ============================================================
// Nagual Eternal v2.0.0 - React Query Hooks
// ============================================================

import { useQuery, useMutation } from '@tanstack/react-query';
import {
  fetchStatus,
  fetchMind,
  fetchMemory,
  fetchLLM,
  fetchEvolution,
  fetchToltec,
  fetchSafety,
  fetchHeartbeat,
  fetchResearch,
  fetchGoals,
  fetchThoughts,
  fetchTools,
  fetchSwarm,
  fetchLogs,
  fetchMeta,
  fetchSettings,
  sendChat,
} from '@/lib/api';
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
} from '@/lib/types';

const REFETCH_INTERVAL = 10_000;

// Generic hook factory
function createNagualHook<T>(
  key: string,
  fetcher: () => Promise<T>,
  refetchInterval = REFETCH_INTERVAL
) {
  return () =>
    useQuery({
      queryKey: ['nagual', key],
      queryFn: fetcher,
      refetchInterval,
      staleTime: 5_000,
    });
}

export const useStatus = createNagualHook<StatusResponse>('status', fetchStatus);
export const useMind = createNagualHook<MindResponse>('mind', fetchMind);
export const useMemory = createNagualHook<MemoryResponse>('memory', fetchMemory);
export const useLLM = createNagualHook<LLMResponse>('llm', fetchLLM);
export const useEvolution = createNagualHook<EvolutionResponse>('evolution', fetchEvolution);
export const useToltec = createNagualHook<ToltecResponse>('toltec', fetchToltec);
export const useSafety = createNagualHook<SafetyResponse>('safety', fetchSafety);
export const useHeartbeat = createNagualHook<HeartbeatResponse>('heartbeat', fetchHeartbeat, 5_000);
export const useResearch = createNagualHook<ResearchResponse>('research', fetchResearch);
export const useGoals = createNagualHook<GoalsResponse>('goals', fetchGoals);
export const useThoughts = createNagualHook<ThoughtsResponse>('thoughts', fetchThoughts);
export const useTools = createNagualHook<ToolsResponse>('tools', fetchTools);
export const useSwarm = createNagualHook<SwarmResponse>('swarm', fetchSwarm);
export const useLogs = createNagualHook<LogsResponse>('logs', fetchLogs, 5_000);
export const useMeta = createNagualHook<MetaResponse>('meta', fetchMeta);
export const useSettings = createNagualHook<SettingsResponse>('settings', fetchSettings, 60_000);

// Chat mutation (not polling)
export function useChat() {
  return useMutation<ChatResponse, Error, ChatMessage[]>({
    mutationFn: (messages: ChatMessage[]) => sendChat(messages),
  });
}
