import { z } from 'zod';

// Favourites live in the browser (TRD §3), versioned so they can migrate to accounts later.
// This module only reads them; marking favourites arrives with HU-009.
export const FAVORITES_KEY = 'enganche:favorites';

const Favorites = z.object({
  version: z.literal(1),
  teams: z.array(z.object({ id: z.number().int(), name: z.string() })),
  competitions: z.array(z.number().int()),
});
export type Favorites = z.infer<typeof Favorites>;

const EMPTY: Favorites = { version: 1, teams: [], competitions: [] };

/** Reads favourites; missing, corrupt or unknown-version data counts as "no favourites". */
export function readFavorites(): Favorites {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return EMPTY;
    const parsed = Favorites.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : EMPTY;
  } catch {
    return EMPTY;
  }
}

export function favoriteTeamIds(): Set<number> {
  return new Set(readFavorites().teams.map((t) => t.id));
}
