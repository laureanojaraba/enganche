import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import type { Match, Round } from '@enganche/shared';
import { roundLabel } from '../src/rounds';
import { server } from './msw';
import { renderApp } from './render';

const match = (
  id: number,
  home: string,
  away: string,
  kickoffUtc: string,
  extra: Partial<Match> = {},
): Match => ({
  id,
  competitionId: 2,
  season: 2024,
  round: 'x',
  kickoffUtc,
  status: 'finished',
  home: { id: id * 10, name: home },
  away: { id: id * 10 + 1, name: away },
  score: { home: 2, away: 1 },
  ...extra,
});

const rounds: Round[] = [
  { name: 'League Stage - 3', matches: [match(1, 'Real Madrid', 'Dortmund', '2026-10-22T19:00:00Z')] },
  {
    name: 'League Stage - 4',
    matches: [
      match(2, 'Liverpool', 'Leverkusen', '2026-10-29T20:00:00Z', { status: 'live', minute: 61 }),
      match(3, 'Sporting CP', 'Man City', '2026-10-29T20:00:00Z', { status: 'scheduled', score: null }),
    ],
  },
  { name: 'Round of 16', leg: 1, matches: [match(4, 'PSG', 'Liverpool', '2026-11-05T20:00:00Z')] },
];

beforeEach(() => {
  server.use(
    http.get('*/api/competitions/:id/rounds', () =>
      HttpResponse.json({
        data: { current: 1, rounds },
        meta: { updatedAt: '2026-10-29T12:00:00.000Z', stale: false, source: 'snapshot' },
      }),
    ),
  );
});

describe('competition matches tab', () => {
  it('HU-013 AC1 opens on the current round with its matches', async () => {
    renderApp('/competicion/2');
    expect(
      await screen.findByRole('heading', { level: 2, name: 'Fase de liga – Jornada 4' }),
    ).toBeInTheDocument();
    const list = screen.getByRole('list', { name: 'Partidos de Fase de liga – Jornada 4' });
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent(/Liverpool.*2.*1.*Leverkusen/);
    expect(items[0]).toHaveTextContent("61'");
    expect(items[1]).toHaveTextContent(/Sporting CP.*Man City/);
  });

  it('HU-013 AC2 navigates between rounds and disables the buttons at the ends', async () => {
    const user = userEvent.setup();
    renderApp('/competicion/2');
    await screen.findByRole('heading', { level: 2, name: 'Fase de liga – Jornada 4' });

    await user.click(screen.getByRole('button', { name: 'Jornada anterior' }));
    expect(screen.getByRole('heading', { level: 2, name: 'Fase de liga – Jornada 3' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Jornada anterior' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Jornada siguiente' }));
    await user.click(screen.getByRole('button', { name: 'Jornada siguiente' }));
    expect(screen.getByRole('heading', { level: 2, name: 'Octavos – Ida' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Jornada siguiente' })).toBeDisabled();
  });
});

describe('roundLabel', () => {
  it.each([
    ['Regular Season - 9', undefined, 'Jornada 9'],
    ['League Stage - 4', undefined, 'Fase de liga – Jornada 4'],
    ['Group Stage - 2', undefined, 'Fase de grupos – Jornada 2'],
    ['Apertura - 5', undefined, 'Apertura – Jornada 5'],
    ['Clausura - Quadrangular - 3', undefined, 'Clausura – Cuadrangulares – Jornada 3'],
    ['Clausura - Final', undefined, 'Clausura – Final'],
    ['2nd Phase - 19', undefined, 'Segunda fase – Jornada 19'],
    ['Round of 16', 1, 'Octavos – Ida'],
    ['Round of 16', 2, 'Octavos – Vuelta'],
    ['Quarter-finals', undefined, 'Cuartos de final'],
    ['Semi-finals', 2, 'Semifinales – Vuelta'],
    ['Final', undefined, 'Final'],
    ['1st Qualifying Round', 1, '1.ª ronda previa – Ida'],
    ['Knockout Round Play-offs', 1, 'Playoffs de eliminatoria – Ida'],
    ['3rd Round', undefined, '3.ª ronda'],
    ['Something New', undefined, 'Something New'],
  ] as const)('HU-013 AC3 %s (leg %s) → %s', (name, leg, expected) => {
    expect(roundLabel(name, leg)).toBe(expected);
  });
});
