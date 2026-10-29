import { useQuery } from '@tanstack/react-query';
import { CompetitionCatalog, HealthStatus } from '@enganche/shared';
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
