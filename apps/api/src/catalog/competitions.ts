// Supported competitions (TRD §3), confirmed by the HU-002 spike. `id` is the API-Football league id;
// `season` is the development season (the free plan only allows 2022–2024).
export type CatalogCompetition = {
  id: number;
  name: string;
  section: 'leagues' | 'international';
  season: number;
};

export const CATALOG: CatalogCompetition[] = [
  { id: 239, name: 'Liga BetPlay (Colombia)', section: 'leagues', season: 2024 },
  { id: 128, name: 'Liga Profesional Argentina', section: 'leagues', season: 2024 },
  { id: 135, name: 'Serie A', section: 'leagues', season: 2024 },
  { id: 39, name: 'Premier League', section: 'leagues', season: 2024 },
  { id: 140, name: 'LaLiga', section: 'leagues', season: 2024 },
  { id: 71, name: 'Brasileirão Série A', section: 'leagues', season: 2024 },
  { id: 13, name: 'Copa Libertadores', section: 'international', season: 2024 },
  { id: 11, name: 'Copa Sudamericana', section: 'international', season: 2024 },
  { id: 2, name: 'UEFA Champions League', section: 'international', season: 2024 },
  { id: 3, name: 'UEFA Europa League', section: 'international', season: 2024 },
];
