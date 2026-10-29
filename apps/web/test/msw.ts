import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import type { Competition } from '@enganche/shared';

const meta = () => ({ updatedAt: new Date().toISOString(), stale: false, source: 'cache' as const });

export const healthOk = http.get('*/api/health', () =>
  HttpResponse.json({
    data: { status: 'ok', clockMode: 'simulated', version: '0.1.0' },
    meta: { ...meta(), source: 'live' },
  }),
);

const competition = (
  id: number,
  name: string,
  region: string,
  section: Competition['section'],
): Competition => ({
  id,
  name,
  region,
  section,
  type: section === 'leagues' ? 'league' : 'cup',
  season: 2024,
  logo: `https://media.api-sports.io/football/leagues/${id}.png`,
});

export const catalog = {
  leagues: [
    competition(239, 'Liga BetPlay', 'Colombia', 'leagues'),
    competition(128, 'Liga Profesional Argentina', 'Argentina', 'leagues'),
    competition(135, 'Serie A', 'Italia', 'leagues'),
    competition(39, 'Premier League', 'Inglaterra', 'leagues'),
    competition(140, 'LaLiga', 'España', 'leagues'),
    competition(71, 'Brasileirão Série A', 'Brasil', 'leagues'),
  ],
  international: [
    competition(13, 'Copa Libertadores', 'Sudamérica', 'international'),
    competition(11, 'Copa Sudamericana', 'Sudamérica', 'international'),
    competition(2, 'UEFA Champions League', 'Europa', 'international'),
    competition(3, 'UEFA Europa League', 'Europa', 'international'),
  ],
};

export const competitionsOk = http.get('*/api/competitions', () =>
  HttpResponse.json({ data: catalog, meta: meta() }),
);

export const server = setupServer(healthOk, competitionsOk);
