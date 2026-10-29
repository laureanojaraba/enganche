import type { StandingGroup, StandingRow } from '@enganche/shared';

const FORM = {
  W: { letter: 'G', word: 'ganado', className: 'bg-pitch-600 text-white' },
  D: { letter: 'E', word: 'empatado', className: 'bg-ink-400 text-white' },
  L: { letter: 'P', word: 'perdido', className: 'bg-red-600 text-white' },
} as const;

// Column order puts the essentials first (Pos, Team, PJ, DG, Pts) so they fit on a 390 px phone (AC4).
const COLUMNS = [
  { abbr: 'PJ', title: 'Partidos jugados', value: (r: StandingRow) => r.played },
  { abbr: 'DG', title: 'Diferencia de goles', value: (r: StandingRow) => signed(r.goalDiff) },
  { abbr: 'Pts', title: 'Puntos', value: (r: StandingRow) => r.points, strong: true },
  { abbr: 'G', title: 'Ganados', value: (r: StandingRow) => r.won },
  { abbr: 'E', title: 'Empatados', value: (r: StandingRow) => r.drawn },
  { abbr: 'P', title: 'Perdidos', value: (r: StandingRow) => r.lost },
  { abbr: 'GF', title: 'Goles a favor', value: (r: StandingRow) => r.goalsFor },
  { abbr: 'GC', title: 'Goles en contra', value: (r: StandingRow) => r.goalsAgainst },
];

const signed = (n: number) => (n > 0 ? `+${n}` : String(n));

/** Provider group names are in English ("Group A"); league table names stay as they are. */
export function groupLabel(name: string) {
  return name.replace(/^Group (\w+)$/, 'Grupo $1');
}

export function StandingsTable({ group, favorites }: { group: StandingGroup; favorites: Set<number> }) {
  return (
    // The wrapper scrolls sideways on narrow screens; the page itself never does.
    <div
      role="region"
      aria-label={`Tabla: ${groupLabel(group.name)}`}
      // Focusable so keyboard users can scroll the hidden columns with the arrow keys.
      tabIndex={0}
      className="overflow-x-auto rounded-xl focus-visible:outline-2 focus-visible:outline-pitch-600 border border-pitch-200 bg-white dark:border-pitch-800 dark:bg-pitch-900"
    >
      <table className="w-full min-w-[640px] border-collapse text-sm tabular-nums">
        <caption className="px-4 py-3 text-left font-semibold">{groupLabel(group.name)}</caption>
        <thead className="text-xs text-ink-500 dark:text-ink-400">
          <tr className="border-y border-pitch-100 dark:border-pitch-800">
            <th
              scope="col"
              title="Posición"
              className="sticky left-0 w-10 bg-white px-2 py-2 text-center dark:bg-pitch-900"
            >
              #
            </th>
            <th
              scope="col"
              title="Equipo"
              className="sticky left-10 bg-white px-2 py-2 text-left dark:bg-pitch-900"
            >
              Equipo
            </th>
            {COLUMNS.map((c) => (
              <th key={c.abbr} scope="col" title={c.title} className="px-2 py-2 text-center">
                <abbr title={c.title} className="no-underline">
                  {c.abbr}
                </abbr>
              </th>
            ))}
            <th scope="col" title="Últimos 5 partidos" className="px-2 py-2 text-center">
              Racha
            </th>
          </tr>
        </thead>
        <tbody>
          {group.rows.map((r) => {
            const fav = favorites.has(r.team.id);
            const bg = fav ? 'bg-amber-50 dark:bg-amber-950' : 'bg-white dark:bg-pitch-900';
            return (
              <tr
                key={r.team.id}
                data-favorite={fav ? 'true' : undefined}
                className={`border-b border-pitch-100 last:border-0 dark:border-pitch-800 ${bg}`}
              >
                <td
                  className={`sticky left-0 px-2 py-2 text-center font-semibold ${bg}`}
                  title={r.description}
                >
                  {r.rank}
                </td>
                <td className={`sticky left-10 px-2 py-2 ${bg}`}>
                  <span className="flex min-w-36 items-center gap-2">
                    {r.team.logo && (
                      <img
                        src={r.team.logo}
                        alt={`Escudo de ${r.team.name}`}
                        width={20}
                        height={20}
                        loading="lazy"
                        className="shrink-0"
                      />
                    )}
                    <span className="truncate font-medium">{r.team.name}</span>
                    {fav && (
                      <>
                        <span aria-hidden="true" className="text-amber-500">
                          ★
                        </span>
                        <span className="sr-only">(favorito)</span>
                      </>
                    )}
                  </span>
                </td>
                {COLUMNS.map((c) => (
                  <td key={c.abbr} className={`px-2 py-2 text-center ${c.strong ? 'font-bold' : ''}`}>
                    {c.value(r)}
                  </td>
                ))}
                <td className="px-2 py-2">
                  <span
                    role="img"
                    aria-label={`Racha: ${r.form.map((f) => FORM[f].word).join(', ')}`}
                    className="flex justify-center gap-1"
                  >
                    {r.form.map((f, i) => (
                      <span
                        key={i}
                        aria-hidden="true"
                        className={`grid size-5 place-items-center rounded text-[10px] font-bold ${FORM[f].className}`}
                      >
                        {FORM[f].letter}
                      </span>
                    ))}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
