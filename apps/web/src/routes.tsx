import { Navigate, type RouteObject } from 'react-router';
import { Layout } from './components/Layout';
import { CompetitionPage } from './pages/CompetitionPage';
import { CompetitionsPage } from './pages/CompetitionsPage';

export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      // The home screen ("Mis partidos") arrives with HU-012; until then the catalog is the entry point.
      { index: true, element: <Navigate to="/competiciones" replace /> },
      { path: 'competiciones', element: <CompetitionsPage /> },
      { path: 'competicion/:id', element: <CompetitionPage /> },
    ],
  },
];
