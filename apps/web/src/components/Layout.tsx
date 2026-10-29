import { Link, NavLink, Outlet } from 'react-router';
import { useHealth } from '../queries';

// Texts are hard-coded in Spanish until i18n arrives with HU-021.
export function Layout() {
  return (
    <div className="flex min-h-dvh flex-col bg-pitch-50 text-ink-900 dark:bg-pitch-950 dark:text-ink-50">
      <header className="border-b border-pitch-200 bg-white/80 backdrop-blur dark:border-pitch-800 dark:bg-pitch-900/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="text-xl font-extrabold tracking-tight text-pitch-700 dark:text-pitch-300">
            enganche
          </Link>
          <nav aria-label="Principal">
            <NavLink
              to="/competiciones"
              className={({ isActive }) =>
                `rounded-full px-3 py-1.5 text-sm font-medium ${
                  isActive
                    ? 'bg-pitch-600 text-white'
                    : 'text-ink-700 hover:bg-pitch-100 dark:text-ink-200 dark:hover:bg-pitch-800'
                }`
              }
            >
              Competiciones
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t border-pitch-200 px-4 py-3 text-center text-xs text-ink-500 dark:border-pitch-800 dark:text-ink-400">
        <ApiStatus />
      </footer>
    </div>
  );
}

function ApiStatus() {
  const health = useHealth();
  if (health.isPending) return <p>API: comprobando…</p>;
  if (health.isError) return <p role="alert">API: sin conexión</p>;
  const { status, clockMode, version } = health.data.data;
  return (
    <p>
      API: {status} · reloj {clockMode} · v{version}
    </p>
  );
}
