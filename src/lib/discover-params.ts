/**
 * Helpers for constructing `/discover` search params from a click on a
 * clickable facet (genre pill, director name, cast member, keyword,
 * production company).
 *
 * The single source of truth for which params `/discover` accepts is
 * `discoverSearchSchema` in `src/routes/_authenticated/discover.tsx`. The
 * `DiscoverSearch` type below mirrors it; if you add a new facet there,
 * add it here too.
 *
 * URL encoding for facet params: each entry is `<id>|<name>` and entries
 * are comma-joined, so the URL stays self-contained for bookmarking and
 * share links (the active filter pill can display the name without an
 * extra round-trip to TMDB):
 *
 *   ?people=525|Christopher Nolan,31|Tom Hanks
 *
 * The route's loader strips the names (everything after `|`) before
 * forwarding IDs to TMDB's `/discover/movie` via `with_people` /
 * `with_genres` / `with_keywords` / `with_companies`.
 *
 * @example
 *   // Replace-mode (default): user clicks the facet, lands on a fresh
 *   // /discover filtered only by that facet.
 *   <Link
 *     to="/discover"
 *     search={discoverSearchFor({
 *       kind: 'person',
 *       id: 525,
 *       name: 'Christopher Nolan',
 *     })}
 *   >
 *     Christopher Nolan
 *   </Link>
 *
 * @example
 *   // Merge-mode: user is already on /discover with some filters and
 *   // clicks a facet; the new facet is added to whatever's already there.
 *   const current = Route.useSearch()
 *   <Link
 *     to="/discover"
 *     search={mergeFacets(current, { kind: 'genre', id: 28, name: 'Action' })}
 *   >
 *     Action
 *   </Link>
 *
 * @example
 *   // String form for non-Link contexts (e.g. clipboard copy, share dialog).
 *   discoverHrefFor({ kind: 'keyword', id: 825, name: 'heist' })
 *   // → '/discover?keywords=825%7Cheist'
 */

/**
 * Mirrors the validated search shape of `/discover`. Keep in sync with
 * `discoverSearchSchema` in `src/routes/_authenticated/discover.tsx`.
 */
export type DiscoverSearch = {
  search: string
  genres: string
  providers: string
  originalLanguage: string
  minRating: number
  maxRating: number
  sortBy: string
  people: string
  keywords: string
  companies: string
}

/**
 * A single clickable facet on a movie surface.
 *
 * - `id` is the TMDB entity ID (genre, person, keyword, or company).
 * - `name` is the human-readable label. Stored in the URL alongside the
 *   id so active filter pills can render without a TMDB round-trip.
 */
export type DiscoverFacet =
  | { kind: 'genre'; id: number; name: string }
  | { kind: 'person'; id: number; name: string }
  | { kind: 'keyword'; id: number; name: string }
  | { kind: 'company'; id: number; name: string }

export type FacetEntry = { id: number; name: string }

const FACET_TO_PARAM = {
  genre: 'genres',
  person: 'people',
  keyword: 'keywords',
  company: 'companies',
} as const satisfies Record<DiscoverFacet['kind'], keyof DiscoverSearch>

const FACET_PARAM_KEYS = [
  'genres',
  'people',
  'keywords',
  'companies',
] as const satisfies ReadonlyArray<keyof DiscoverSearch>

function appendCsv(existing: string | undefined, value: string): string {
  return existing ? `${existing},${value}` : value
}

function encodeFacetEntry(entry: FacetEntry): string {
  return `${entry.id}|${entry.name}`
}

/**
 * Build a partial `DiscoverSearch` from one or more facets.
 *
 * Each entry is encoded as `<id>|<name>`, comma-joined. Pass directly to
 * `<Link to="/discover" search={...}>`:
 *
 *   <Link to="/discover" search={discoverSearchFor(...facets)}>
 */
export function discoverSearchFor(
  ...facets: Array<DiscoverFacet>
): Partial<DiscoverSearch> {
  const result: Record<string, string> = {}
  for (const f of facets) {
    const key = FACET_TO_PARAM[f.kind]
    result[key] = appendCsv(result[key], encodeFacetEntry(f))
  }
  return result
}

/**
 * String form of `discoverSearchFor`. Useful for `href` props outside
 * TanStack Router contexts (clipboard copy, share dialog, OG image URLs).
 */
export function discoverHrefFor(...facets: Array<DiscoverFacet>): string {
  const search = discoverSearchFor(...facets)
  const params = new URLSearchParams()
  for (const key of FACET_PARAM_KEYS) {
    const value = search[key]
    if (typeof value === 'string' && value.length > 0) {
      params.set(key, value)
    }
  }
  const qs = params.toString()
  return qs ? `/discover?${qs}` : '/discover'
}

/**
 * Merge new facets into an existing `DiscoverSearch`. Preserves every other
 * field (rating range, sort, search text, providers, language). Multiple
 * facets of the same kind append to the existing CSV value.
 *
 * Use this when the user is already on `/discover` and you want clicking a
 * facet to ADD to the active filter set rather than replace it.
 */
export function mergeFacets(
  base: DiscoverSearch,
  ...facets: Array<DiscoverFacet>
): DiscoverSearch {
  const result: DiscoverSearch = { ...base }
  for (const f of facets) {
    const key = FACET_TO_PARAM[f.kind]
    const current = result[key]
    result[key] = appendCsv(current, encodeFacetEntry(f))
  }
  return result
}

/**
 * Parse a facet CSV (`id|name,id|name`) back into structured entries.
 *
 * Tolerates the bare-id format (`id,id`) used by the very first version of
 * the helper so legacy bookmarks still load — those entries get an empty
 * name. Skips any entries with a non-numeric id.
 */
export function parseFacetCsv(
  csv: string | undefined | null,
): Array<FacetEntry> {
  if (!csv) return []
  return csv
    .split(',')
    .map((raw) => {
      const entry = raw.trim()
      if (entry.length === 0) return null
      const pipeIdx = entry.indexOf('|')
      if (pipeIdx === -1) {
        const id = Number(entry)
        return Number.isFinite(id) ? { id, name: '' } : null
      }
      const id = Number(entry.slice(0, pipeIdx).trim())
      const name = entry.slice(pipeIdx + 1).trim()
      return Number.isFinite(id) ? { id, name } : null
    })
    .filter((e): e is FacetEntry => e !== null)
}

/**
 * Serialize an array of facet entries back to the `id|name,id|name` CSV
 * format used in URLs.
 */
export function serializeFacetCsv(entries: Array<FacetEntry>): string {
  return entries.map(encodeFacetEntry).join(',')
}

/**
 * Extract just the IDs from a facet CSV — for forwarding to TMDB's
 * `/discover/movie` `with_*` params.
 */
export function facetIds(csv: string | undefined | null): string {
  return parseFacetCsv(csv)
    .map((e) => e.id)
    .join(',')
}

/**
 * Resolve a TMDB genre ID by name from the cached filter list returned by
 * `tmdbQueries.genres()` (which has the shape `{ label, value }[]`).
 *
 * Used by DB-backed surfaces — e.g. `/watched/$movieId` — where the row
 * stores genre names (`movie.genres: string[]`) but the `/discover` route
 * expects TMDB IDs.
 *
 * Returns `undefined` when the name is not present (TMDB occasionally
 * renames or drops genres). Callers should fall back to a non-link `<span>`
 * in that case so we never silently link to a broken filter URL.
 */
export function findGenreIdByName(
  name: string,
  genres: ReadonlyArray<{ label: string; value: string }>,
): number | undefined {
  const hit = genres.find((g) => g.label === name)
  if (!hit) return undefined
  const id = Number(hit.value)
  return Number.isFinite(id) ? id : undefined
}
