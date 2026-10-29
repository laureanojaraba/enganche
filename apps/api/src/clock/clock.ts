import type { ClockMode } from '@enganche/shared';

/**
 * "Data time" is the time inside the provider's data (season 2024 in development);
 * "display time" is what users see. The simulated clock maps one onto the other (TRD ADR-5).
 */
export interface Clock {
  readonly mode: ClockMode;
  /** Current instant in data time (ms). */
  dataNow(): number;
  /** Converts a data-time ISO date to display time. */
  project(iso: string): string;
}

export class RealClock implements Clock {
  readonly mode = 'real' as const;
  constructor(private readonly realNow: () => number = Date.now) {}
  dataNow() {
    return this.realNow();
  }
  project(iso: string) {
    return iso;
  }
}

export class SimulatedClock implements Clock {
  readonly mode = 'simulated' as const;
  private readonly anchor: number;
  private readonly startedAt: number;
  private readonly realNow: () => number;

  /** `anchor` (data time) corresponds to `startedAt` (real time); both then advance together. */
  constructor(opts: { anchor: string; startedAt?: number; realNow?: () => number }) {
    this.realNow = opts.realNow ?? Date.now;
    this.anchor = Date.parse(opts.anchor);
    this.startedAt = opts.startedAt ?? this.realNow();
  }

  dataNow() {
    return this.anchor + (this.realNow() - this.startedAt);
  }

  project(iso: string) {
    return new Date(Date.parse(iso) + (this.startedAt - this.anchor)).toISOString();
  }
}

export function createClock(config: { clockMode: ClockMode; simAnchor: string }): Clock {
  return config.clockMode === 'simulated'
    ? new SimulatedClock({ anchor: config.simAnchor })
    : new RealClock();
}
