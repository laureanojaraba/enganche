import type { RouteObject } from 'react-router';
import { Layout } from './components/Layout';
import { CompetitionPage } from './pages/CompetitionPage';
import { CompetitionsPage } from './pages/CompetitionsPage';
import { PlaceholderPage } from './pages/PlaceholderPage';

export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      // Provisional until HU-012 (home), HU-009 (favourites) and the settings story.
      {
        index: true,
        element: (
          <PlaceholderPage
            title="Mis partidos"
            text="Aquí verás los partidos de tus equipos y competiciones favoritas. Mientras tanto, explora las competiciones."
          />
        ),
      },
      { path: 'competiciones', element: <CompetitionsPage /> },
      { path: 'competicion/:id', element: <CompetitionPage /> },
      {
        path: 'favoritos',
        element: (
          <PlaceholderPage
            title="Favoritos"
            text="Pronto podrás marcar equipos y competiciones como favoritos."
          />
        ),
      },
      {
        path: 'ajustes',
        element: (
          <PlaceholderPage
            title="Ajustes"
            text="Pronto podrás elegir idioma y país para saber dónde ver cada partido."
          />
        ),
      },
    ],
  },
];
