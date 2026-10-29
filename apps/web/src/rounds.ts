// Spanish names for API-Football rounds (HU-013 AC3). Lives in the web so i18n (HU-021) can translate it.

const KNOCKOUTS: Record<string, string> = {
  'Round of 32': 'Dieciseisavos',
  'Round of 16': 'Octavos',
  'Quarter-finals': 'Cuartos de final',
  'Semi-finals': 'Semifinales',
  Final: 'Final',
  'Play-offs': 'Playoffs',
  'Knockout Round Play-offs': 'Playoffs de eliminatoria',
  'Preliminary Round': 'Ronda preliminar',
};

const STAGES: Record<string, string> = {
  'Regular Season': '',
  'League Stage': 'Fase de liga',
  'Group Stage': 'Fase de grupos',
  Apertura: 'Apertura',
  Clausura: 'Clausura',
  '2nd Phase': 'Segunda fase',
  '1st Phase': 'Primera fase',
};

const ORDINAL = /^(\d+)(?:st|nd|rd|th) (Qualifying )?Round$/;

function base(name: string): string {
  if (KNOCKOUTS[name]) return KNOCKOUTS[name];

  const ordinal = name.match(ORDINAL);
  if (ordinal) return `${ordinal[1]}.ª ronda${ordinal[2] ? ' previa' : ''}`;

  // "Stage - N", "Stage - Final", "Stage - Quadrangular - N"
  const parts = name.split(' - ');
  const stage = STAGES[parts[0]!];
  if (stage === undefined || parts.length < 2) return name;
  const rest = parts.slice(1);
  const tail = rest
    .map((p) =>
      /^\d+$/.test(p) ? `Jornada ${p}` : p === 'Quadrangular' ? 'Cuadrangulares' : (KNOCKOUTS[p] ?? p),
    )
    .join(' – ');
  return stage ? `${stage} – ${tail}` : tail;
}

export function roundLabel(name: string, leg?: 1 | 2): string {
  const label = base(name);
  return leg ? `${label} – ${leg === 1 ? 'Ida' : 'Vuelta'}` : label;
}
