import { render } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { createMemoryRouter } from 'react-router';
import { AppProviders } from '../src/App';
import { routes } from '../src/routes';

/** Renders the whole app at `path`, with an in-memory router and a fresh query cache. */
export function renderApp(path = '/') {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return { router, ...render(<AppProviders router={router} queryClient={queryClient} />) };
}
