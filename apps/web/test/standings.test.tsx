import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import type { StandingGroup, StandingRow } from '@enganche/shared';
import { server } from './msw';
import { renderApp } from './render';

const row = (rank: number, id: number, name: string, extra: Partial<StandingRow> = {}): StandingRow => ({
  rank,
  team: { id, name, logo: `https://media.api-sports.io/football/teams/${id}.png` },
  played: 10,
  won: 7,
  drawn: 2,
  lost: 1,
  goalsFor: 20,
  goalsAgainst: 8,
  goalDiff: 12,
  points: 23,
  form: ['W', 'W', 'D', 'L', 'W'],
  ...extra,
});

const tables: Record<string, StandingGroup[]> = {
  140: [
    {
      name: 'LaLiga',
      rows: [
        row(1, 529, 'Barcelona', { points: 88, goalDiff: 63, description: 'Champions League' }),
        row(2, 541, 'Real Madrid', { points: 84 }),
      ],
    },
  ],
  13: [
    { name: 'Group A', rows: [row(1, 1, 'Fluminense'), row(2, 2, 'Colo Colo')] },
    { name: 'Group B', rows: [row(1, 3, 'Atlético Nacional'), row(2, 4, 'River Plate')] },
  ],
  239: [
    { name: 'Primera A: Clausura', rows: [row(1, 1137, 'Atlético Nacional'), row(2, 1135, 'Millonarios')] },
  ],
};

beforeEach(() => {
  server.use(
    http.get('*/api/competitions/:id/standings', ({ params }) =>
      HttpResponse.json({
        data: tables[String(params.id)] ?? [],
        meta: { updatedAt: '2026-10-29T12:00:00.000Z', stale: false, source: 'snapshot' },
      }),
    ),
  );
  localStorage.clear();
});

async function openStandings(id: number) {
  const user = userEvent.setup();
  renderApp(`/competicion/${id}`);
  await user.click(await screen.findByRole('tab', { name: 'Clasificación' }));
}

describe('standings tab', () => {
  it('HU-007 AC1 shows position, crest, team, PJ, G, E, P, GF, GC, DG, Pts and streak', async () => {
    await openStandings(140);
    const table = await screen.findByRole('table', { name: 'LaLiga' });
    const headers = within(table)
      .getAllByRole('columnheader')
      .map((h) => h.getAttribute('title') ?? h.textContent);
    expect(headers).toEqual([
      'Posición',
      'Equipo',
      'Partidos jugados',
      'Diferencia de goles',
      'Puntos',
      'Ganados',
      'Empatados',
      'Perdidos',
      'Goles a favor',
      'Goles en contra',
      'Últimos 5 partidos',
    ]);
    const first = within(table).getAllByRole('row')[1]!;
    expect(
      within(first)
        .getAllByRole('cell')
        .map((c) => c.textContent),
    ).toEqual(['1', 'Barcelona', '10', '+63', '88', '7', '2', '1', '20', '8', 'GGEPG']);
    expect(within(first).getByRole('img', { name: 'Escudo de Barcelona' })).toBeInTheDocument();
    expect(
      within(first).getByLabelText('Racha: ganado, ganado, empatado, perdido, ganado'),
    ).toBeInTheDocument();
  });

  it('HU-007 AC2 shows one table per cup group with its name', async () => {
    await openStandings(13);
    expect(await screen.findByRole('table', { name: 'Grupo A' })).toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Grupo B' })).toBeInTheDocument();
  });

  it('HU-007 AC3 highlights favourite teams with a star, not only colour', async () => {
    localStorage.setItem(
      'enganche:favorites',
      JSON.stringify({ version: 1, teams: [{ id: 1137, name: 'Atlético Nacional' }], competitions: [] }),
    );
    await openStandings(239);
    const table = await screen.findByRole('table', { name: 'Primera A: Clausura' });
    const [, nacional, millonarios] = within(table).getAllByRole('row');
    expect(nacional).toHaveAttribute('data-favorite', 'true');
    expect(within(nacional!).getByText('(favorito)')).toBeInTheDocument();
    expect(within(nacional!).getByText('★')).toBeInTheDocument();
    expect(millonarios).not.toHaveAttribute('data-favorite');
  });

  it('ignores corrupt favourites without breaking the page', async () => {
    localStorage.setItem('enganche:favorites', '{not json');
    await openStandings(239);
    expect(await screen.findByRole('table', { name: 'Primera A: Clausura' })).toBeInTheDocument();
  });
});
