import { useState } from 'react';
import type { RoundsSchedule } from '@enganche/shared';
import { roundLabel } from '../rounds';
import { MatchRow } from './MatchRow';

const navButton =
  'grid size-10 place-items-center rounded-full border border-pitch-200 bg-white text-lg hover:bg-pitch-100 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-pitch-600 dark:border-pitch-800 dark:bg-pitch-900 dark:hover:bg-pitch-800';

/** One round at a time, opened on the current one, with previous/next navigation (HU-013). */
export function RoundSchedule({ schedule }: { schedule: RoundsSchedule }) {
  const [index, setIndex] = useState(schedule.current);
  const round = schedule.rounds[index];
  if (!round) return <p className="text-ink-500">No hay partidos para esta competición.</p>;
  const label = roundLabel(round.name, round.leg);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          className={navButton}
          aria-label="Jornada anterior"
          disabled={index === 0}
          onClick={() => setIndex(index - 1)}
        >
          <span aria-hidden="true">‹</span>
        </button>
        <h2 aria-live="polite" className="text-center text-base font-semibold">
          {label}
        </h2>
        <button
          type="button"
          className={navButton}
          aria-label="Jornada siguiente"
          disabled={index === schedule.rounds.length - 1}
          onClick={() => setIndex(index + 1)}
        >
          <span aria-hidden="true">›</span>
        </button>
      </div>
      <ul
        aria-label={`Partidos de ${label}`}
        className="divide-y divide-pitch-100 rounded-xl border border-pitch-200 bg-white dark:divide-pitch-800 dark:border-pitch-800 dark:bg-pitch-900"
      >
        {round.matches.map((m) => (
          <MatchRow key={m.id} match={m} />
        ))}
      </ul>
    </section>
  );
}
