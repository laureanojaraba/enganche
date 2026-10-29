import type { Match, TeamRef } from '@enganche/shared';

// Simple match row for the round schedule; the full match card arrives with HU-011.
const dateFormat = new Intl.DateTimeFormat('es', { weekday: 'short', day: 'numeric', month: 'short' });
const timeFormat = new Intl.DateTimeFormat('es', { hour: '2-digit', minute: '2-digit' });

function Status({ match }: { match: Match }) {
  switch (match.status) {
    case 'live':
      return (
        <span className="font-bold text-red-700 dark:text-red-400">
          EN VIVO <span className="tabular-nums">{match.minute}&apos;</span>
        </span>
      );
    case 'halftime':
      return <span className="font-bold text-red-700 dark:text-red-400">Descanso</span>;
    case 'finished':
      return <span>Final</span>;
    case 'postponed':
      return <span>Aplazado</span>;
    case 'cancelled':
      return <span>Cancelado</span>;
    default:
      return <time dateTime={match.kickoffUtc}>{timeFormat.format(new Date(match.kickoffUtc))}</time>;
  }
}

function Team({ team, align }: { team: TeamRef; align: 'left' | 'right' }) {
  return (
    <span
      className={`flex min-w-0 items-center gap-2 ${align === 'right' ? 'flex-row-reverse text-right' : ''}`}
    >
      {team.logo && <img src={team.logo} alt="" width={22} height={22} loading="lazy" className="shrink-0" />}
      <span className="truncate font-medium">{team.name}</span>
    </span>
  );
}

export function MatchRow({ match }: { match: Match }) {
  return (
    <li className="grid grid-cols-[4.5rem_1fr_auto_1fr] items-center gap-2 px-3 py-3 text-sm sm:gap-3">
      <span className="flex flex-col text-xs text-ink-500 dark:text-ink-400">
        <span className="capitalize">{dateFormat.format(new Date(match.kickoffUtc))}</span>
        <Status match={match} />
      </span>
      <Team team={match.home} align="right" />
      <span className="min-w-12 rounded-md bg-pitch-100 px-2 py-1 text-center font-bold tabular-nums dark:bg-pitch-800">
        {match.score ? (
          <>
            {match.score.home}
            <span aria-hidden="true"> - </span>
            <span className="sr-only"> a </span>
            {match.score.away}
          </>
        ) : (
          <span className="font-normal text-ink-700 dark:text-ink-200">vs</span>
        )}
      </span>
      <Team team={match.away} align="left" />
    </li>
  );
}
