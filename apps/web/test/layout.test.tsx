import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from './render';

describe('main navigation', () => {
  it('has the four destinations in order', async () => {
    renderApp('/competiciones');
    const nav = await screen.findByRole('navigation', { name: 'Principal' });
    expect(
      within(nav)
        .getAllByRole('link')
        .map((a) => a.textContent),
    ).toEqual(['Mis partidos', 'Competiciones', 'Favoritos', 'Ajustes']);
  });

  it('marks the current destination and navigates', async () => {
    const user = userEvent.setup();
    renderApp('/competiciones');
    const nav = await screen.findByRole('navigation', { name: 'Principal' });
    expect(within(nav).getByRole('link', { name: 'Competiciones' })).toHaveAttribute('aria-current', 'page');

    await user.click(within(nav).getByRole('link', { name: 'Favoritos' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Favoritos' })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: 'Favoritos' })).toHaveAttribute('aria-current', 'page');
  });

  it('keeps the competition section active inside a competition page', async () => {
    renderApp('/competicion/39');
    const nav = await screen.findByRole('navigation', { name: 'Principal' });
    expect(within(nav).getByRole('link', { name: 'Competiciones' })).toHaveAttribute('aria-current', 'page');
  });
});
