import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { routes } from './routes';

type Router = Parameters<typeof RouterProvider>[0]['router'];

export function AppProviders({ router, queryClient }: { router: Router; queryClient: QueryClient }) {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

const queryClient = new QueryClient();
const router = createBrowserRouter(routes);

export function App() {
  return <AppProviders router={router} queryClient={queryClient} />;
}
