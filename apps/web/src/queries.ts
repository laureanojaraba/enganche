import { useQuery } from '@tanstack/react-query';
import { CompetitionCatalog, HealthStatus, RoundsSchedule, StandingGroup } from '@enganche/shared';
import { z } from 'zod';
import { fetchApi } from './api';

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: ({ signal }) => fetchApi('/api/health', HealthStatus, signal),
  });
}

/** The catalog barely changes: keep it fresh for an hour. */
export function useCompetitions() {
  return useQuery({
    queryKey: ['competitions'],
    queryFn: ({ signal }) => fetchApi('/api/competitions', CompetitionCatalog, signal),
    staleTime: 60 * 60 * 1000,
  });
}

/** Standings change at most once per match day: keep them for 5 minutes. */
export function useStandings(competitionId: number, enabled = true) {
  return useQuery({
    queryKey: ['standings', competitionId],
    queryFn: ({ signal }) =>
      fetchApi(`/api/competitions/${competitionId}/standings`, z.array(StandingGroup), signal),
    staleTime: 5 * 60 * 1000,
    enabled,
  });
}

/** The whole season grouped by round; statuses move with the (simulated) clock, so refresh every minute. */
export function useRounds(competitionId: number) {
  return useQuery({
    queryKey: ['rounds', competitionId],
    queryFn: ({ signal }) => fetchApi(`/api/competitions/${competitionId}/rounds`, RoundsSchedule, signal),
    staleTime: 60 * 1000,
  });
}
