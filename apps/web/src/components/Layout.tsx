import { Link, Outlet, useLocation } from 'react-router';
import { useHealth } from '../queries';
import { BallIcon, SettingsIcon, StarIcon, TrophyIcon } from './icons';

// Texts are hard-coded in Spanish until i18n arrives with HU-021.
const DESTINATIONS = [
  { to: '/', label: 'Mis partidos', Icon: BallIcon, match: (p: string) => p === '/' },
  // A competition page (/competicion/:id) belongs to the Competiciones section.
  {
    to: '/competiciones',
    label: 'Competiciones',
    Icon: TrophyIcon,
    match: (p: string) => p.startsWith('/competici'),
  },
  { to: '/favoritos', label: 'Favoritos', Icon: StarIcon, match: (p: string) => p.startsWith('/favoritos') },
  { to: '/ajustes', label: 'Ajustes', Icon: SettingsIcon, match: (p: string) => p.startsWith('/ajustes') },
];

/**
 * One navigation landmark that changes position with the width (HU-023):
 * a bottom bar on phones (< md) and a sidebar from tablets up (≥ md, 768 px).
 */
export function Layout() {
  const { pathname } = useLocation();
  return (
    <div className="min-h-dvh bg-pitch-50 text-ink-900 md:pl-56 dark:bg-pitch-950 dark:text-ink-50">
      <header className="sticky top-0 z-10 border-b border-pitch-200 bg-white/90 px-4 py-3 backdrop-blur md:hidden dark:border-pitch-800 dark:bg-pitch-900/90">
        <Logo />
      </header>

      <nav
        aria-label="Principal"
        className="fixed inset-x-0 bottom-0 z-20 border-t border-pitch-200 bg-white pb-[env(safe-area-inset-bottom)] md:inset-y-0 md:right-auto md:flex md:w-56 md:flex-col md:border-t-0 md:border-r md:pb-0 dark:border-pitch-800 dark:bg-pitch-900"
      >
        {/* Plain text here: inside the nav only the four destinations are links ("Mis partidos" is home). */}
        <p
          aria-hidden="true"
          className="hidden px-5 py-5 text-xl font-extrabold tracking-tight text-pitch-700 md:block dark:text-pitch-300"
        >
          enganche
        </p>
        <ul className="grid grid-cols-4 md:flex md:flex-col md:gap-1 md:px-3">
          {DESTINATIONS.map(({ to, label, Icon, match }) => {
            const isActive = match(pathname);
            return (
              <li key={to}>
                <Link
                  to={to}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex flex-col items-center gap-0.5 px-1 py-2 text-[11px] font-medium focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-pitch-600 md:flex-row md:gap-3 md:rounded-lg md:px-3 md:py-2.5 md:text-sm ${
                    isActive
                      ? 'text-pitch-700 md:bg-pitch-100 dark:text-pitch-300 dark:md:bg-pitch-800'
                      : 'text-ink-500 hover:text-ink-900 md:hover:bg-pitch-100 dark:text-ink-400 dark:hover:text-ink-50 dark:md:hover:bg-pitch-800'
                  }`}
                >
                  <Icon className="size-6 md:size-5" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom padding keeps content clear of the fixed bar on phones (plus the iOS home indicator). */}
      <main className="mx-auto w-full max-w-5xl px-4 pt-6 pb-[calc(5rem+env(safe-area-inset-bottom))] md:px-8 md:pb-10">
        <Outlet />
        <div className="mt-10 text-center text-xs text-ink-500 dark:text-ink-400">
          <ApiStatus />
        </div>
      </main>
    </div>
  );
}

function Logo() {
  return (
    <Link
      to="/"
      className="rounded text-xl font-extrabold tracking-tight text-pitch-700 focus-visible:outline-2 focus-visible:outline-pitch-600 dark:text-pitch-300"
    >
      enganche
    </Link>
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
