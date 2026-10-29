import { Link } from 'react-router';
import type { Competition } from '@enganche/shared';
import { useCompetitions } from '../queries';

export function CompetitionsPage() {
  const { data, isPending, isError } = useCompetitions();

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Competiciones</h1>
      {isPending && <p className="text-ink-500">Cargando competiciones…</p>}
      {isError && (
        <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-950 dark:text-red-200">
          No pudimos cargar las competiciones. Inténtalo de nuevo en unos minutos.
        </p>
      )}
      {data && (
        <div className="space-y-8">
          <CompetitionSection id="ligas" title="Ligas" items={data.data.leagues} />
          <CompetitionSection id="internacionales" title="Internacionales" items={data.data.international} />
        </div>
      )}
    </>
  );
}

function CompetitionSection({ id, title, items }: { id: string; title: string; items: Competition[] }) {
  return (
    <section aria-labelledby={`seccion-${id}`}>
      <h2 id={`seccion-${id}`} className="mb-3 text-sm font-semibold uppercase tracking-wider text-ink-500">
        {title}
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((c) => (
          <li key={c.id}>
            <Link
              to={`/competicion/${c.id}`}
              className="flex items-center gap-3 rounded-xl border border-pitch-200 bg-white p-3 shadow-sm transition hover:border-pitch-500 hover:shadow focus-visible:outline-2 focus-visible:outline-pitch-600 dark:border-pitch-800 dark:bg-pitch-900"
            >
              <CompetitionLogo competition={c} />
              <span className="min-w-0">
                <span className="block truncate font-semibold">{c.name}</span>
                <span className="block text-sm text-ink-500 dark:text-ink-400">{c.region}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function CompetitionLogo({ competition, size = 40 }: { competition: Competition; size?: number }) {
  return competition.logo ? (
    <img
      src={competition.logo}
      alt={`Logo de ${competition.name}`}
      width={size}
      height={size}
      loading="lazy"
      className="shrink-0 rounded-md bg-white object-contain p-1"
    />
  ) : (
    <span
      aria-hidden="true"
      style={{ width: size, height: size }}
      className="grid shrink-0 place-items-center rounded-md bg-pitch-100 font-bold text-pitch-700"
    >
      {competition.name.charAt(0)}
    </span>
  );
}
