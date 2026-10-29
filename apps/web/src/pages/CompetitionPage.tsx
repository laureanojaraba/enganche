import { useId, useState } from 'react';
import { Link, useParams } from 'react-router';
import { useCompetitions } from '../queries';
import { CompetitionLogo } from './CompetitionsPage';

const TABS = [
  { id: 'partidos', label: 'Partidos', placeholder: 'La agenda por jornada llega con la siguiente versión.' },
  {
    id: 'clasificacion',
    label: 'Clasificación',
    placeholder: 'La tabla de posiciones llega con la siguiente versión.',
  },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function CompetitionPage() {
  const { id } = useParams();
  const { data, isPending, isError } = useCompetitions();
  const [tab, setTab] = useState<TabId>('partidos');
  const baseId = useId();

  if (isPending) return <p className="text-ink-500">Cargando…</p>;
  if (isError) return <p role="alert">No pudimos cargar la competición.</p>;

  const competition = [...data.data.leagues, ...data.data.international].find((c) => String(c.id) === id);
  if (!competition) {
    return (
      <div className="space-y-3">
        <p>Esta competición no está disponible.</p>
        <Link to="/competiciones" className="font-medium text-pitch-700 underline dark:text-pitch-300">
          Ver competiciones disponibles
        </Link>
      </div>
    );
  }

  const active = TABS.find((t) => t.id === tab)!;
  return (
    <>
      <div className="mb-6 flex items-center gap-4">
        <CompetitionLogo competition={competition} size={56} />
        <div>
          <h1 className="text-2xl font-bold">{competition.name}</h1>
          <p className="text-ink-500 dark:text-ink-400">
            {competition.region} · Temporada {competition.season}
          </p>
        </div>
      </div>

      <div role="tablist" aria-label={`Secciones de ${competition.name}`} className="mb-4 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            id={`${baseId}-tab-${t.id}`}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            aria-controls={`${baseId}-panel`}
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              tab === t.id
                ? 'bg-pitch-600 text-white'
                : 'bg-white text-ink-700 hover:bg-pitch-100 dark:bg-pitch-900 dark:text-ink-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${tab}`}
        className="rounded-xl border border-dashed border-pitch-300 p-6 text-ink-500 dark:border-pitch-700"
      >
        {active.placeholder}
      </div>
    </>
  );
}
