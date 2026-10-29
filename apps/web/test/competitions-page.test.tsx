import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from './msw';
import { renderApp } from './render';

describe('CompetitionsPage', () => {
  it('HU-006 AC1 shows the leagues and international sections with logo and region', async () => {
    renderApp('/competiciones');

    const leagues = await screen.findByRole('region', { name: 'Ligas' });
    const leagueItems = within(leagues).getAllByRole('listitem');
    expect(leagueItems.map((li) => li.textContent)).toEqual([
      'Liga BetPlayColombia',
      'Liga Profesional ArgentinaArgentina',
      'Serie AItalia',
      'Premier LeagueInglaterra',
      'LaLigaEspaña',
      'Brasileirão Série ABrasil',
    ]);
    expect(within(leagues).getByRole('img', { name: 'Logo de Liga BetPlay' })).toHaveAttribute(
      'src',
      'https://media.api-sports.io/football/leagues/239.png',
    );

    const international = screen.getByRole('region', { name: 'Internacionales' });
    expect(within(international).getAllByRole('listitem')).toHaveLength(4);
    expect(within(international).getByText('Copa Libertadores')).toBeInTheDocument();
    expect(within(international).getByText('UEFA Europa League')).toBeInTheDocument();
  });

  it('HU-006 AC3 opens a competition page with Partidos and Clasificación tabs', async () => {
    const user = userEvent.setup();
    renderApp('/competiciones');

    await user.click(await screen.findByRole('link', { name: /Premier League/ }));

    expect(await screen.findByRole('heading', { level: 1, name: 'Premier League' })).toBeInTheDocument();
    const tabs = screen.getAllByRole('tab');
    expect(tabs.map((t) => t.textContent)).toEqual(['Partidos', 'Clasificación']);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');

    await user.click(screen.getByRole('tab', { name: 'Clasificación' }));
    expect(screen.getByRole('tab', { name: 'Clasificación' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Clasificación');
  });

  it('shows a provisional home ("Mis partidos") that links to the catalog', async () => {
    renderApp('/');
    expect(await screen.findByRole('heading', { level: 1, name: 'Mis partidos' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver competiciones' })).toHaveAttribute('href', '/competiciones');
  });

  it('shows an error message when the catalog cannot be loaded', async () => {
    server.use(http.get('*/api/competitions', () => HttpResponse.error()));
    renderApp('/competiciones');
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos cargar las competiciones');
  });

  it('shows a not-available message for an unknown competition', async () => {
    renderApp('/competicion/242');
    expect(await screen.findByText('Esta competición no está disponible.')).toBeInTheDocument();
  });
});
