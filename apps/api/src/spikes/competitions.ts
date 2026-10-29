// Candidate competitions from TRD §3. IDs are API-Football league ids, confirmed by the coverage spike (HU-002).
export type CandidateCompetition = {
  id: number;
  name: string;
  section: 'leagues' | 'international';
};

export const COMPETITIONS: CandidateCompetition[] = [
  { id: 239, name: 'Liga BetPlay (Colombia)', section: 'leagues' },
  { id: 128, name: 'Liga Profesional Argentina', section: 'leagues' },
  { id: 135, name: 'Serie A', section: 'leagues' },
  { id: 39, name: 'Premier League', section: 'leagues' },
  { id: 140, name: 'LaLiga', section: 'leagues' },
  { id: 71, name: 'Brasileirão Série A', section: 'leagues' },
  { id: 13, name: 'Copa Libertadores', section: 'international' },
  { id: 11, name: 'Copa Sudamericana', section: 'international' },
  { id: 2, name: 'UEFA Champions League', section: 'international' },
  { id: 3, name: 'UEFA Europa League', section: 'international' },
];
