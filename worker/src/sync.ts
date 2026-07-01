/**
 * M7 — Results sync from football-data.org (v4).
 *
 * Fetches World Cup matches from football-data.org and writes finished knockout
 * results into D1: updates the score + status of the matching match row, and
 * marks the losing team as eliminated. Designed to be idempotent (safe to run
 * every hour) and defensive (a name it cannot map is skipped, not fatal).
 *
 * The fragile part is name mapping: the feed uses names like "Türkiye",
 * "Korea Republic", "IR Iran"; our DB uses ids like "team_turkiye". The
 * TEAM_NAME_TO_ID table below is the single source of truth for that mapping.
 * Extend it whenever a new team appears in the tournament.
 */

// Maps a football-data.org team name (lowercased) to our internal team id.
// Keep keys lowercase; lookups lowercase the incoming name first.
export const TEAM_NAME_TO_ID: Record<string, string> = {
  // Round of 16 / knockout nations (extend as needed).
  brazil: 'team_brazil',
  argentina: 'team_argentina',
  spain: 'team_spain',
  england: 'team_england',
  portugal: 'team_portugal',
  france: 'team_france',
  netherlands: 'team_netherlands',
  morocco: 'team_morocco',
  croatia: 'team_croatia',
  colombia: 'team_colombia',
  mexico: 'team_mexico',
  uruguay: 'team_uruguay',
  belgium: 'team_belgium',
  switzerland: 'team_switzerland',
  norway: 'team_norway',
  ecuador: 'team_ecuador',
  germany: 'team_germany',
  japan: 'team_japan',
  sweden: 'team_sweden',
  senegal: 'team_senegal',
  australia: 'team_australia',
  egypt: 'team_egypt',
  ghana: 'team_ghana',
  panama: 'team_panama',
  algeria: 'team_algeria',
  austria: 'team_austria',
  paraguay: 'team_paraguay',
  canada: 'team_canada',
  'united states': 'team_united_states',
  usa: 'team_united_states',
  'south africa': 'team_south_africa',
  "côte d'ivoire": 'team_ivory_coast',
  "cote d'ivoire": 'team_ivory_coast',
  'ivory coast': 'team_ivory_coast',
  'dr congo': 'team_congo_dr',
  'congo dr': 'team_congo_dr',
  'cape verde': 'team_cape_verde',
  'cabo verde': 'team_cape_verde',
  uzbekistan: 'team_uzbekistan',
  jordan: 'team_jordan',
  iran: 'team_iran',
  'ir iran': 'team_iran',
  'saudi arabia': 'team_saudi_arabia',
  tunisia: 'team_tunisia',
  'new zealand': 'team_new_zealand',
  iraq: 'team_iraq',
  curacao: 'team_curacao',
  'curaçao': 'team_curacao',
  turkey: 'team_turkiye',
  'türkiye': 'team_turkiye',
  turkiye: 'team_turkiye',
  'bosnia and herzegovina': 'team_bosnia',
  bosnia: 'team_bosnia',
}

export function mapTeamNameToId(name: string | undefined): string | null {
  if (!name) return null
  const key = name.trim().toLowerCase()
  return TEAM_NAME_TO_ID[key] ?? null
}

// football-data.org match shape (only the fields we use).
export interface FdMatch {
  id: number
  status: string // 'SCHEDULED' | 'TIMED' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | ...
  stage: string // 'LAST_16' | 'QUARTER_FINALS' | 'SEMI_FINALS' | 'FINAL' | ...
  homeTeam: { name?: string }
  awayTeam: { name?: string }
  score: {
    winner: string | null // 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | null
    fullTime: { home: number | null; away: number | null }
  }
}

export interface SyncSummary {
  fetched: number
  finished: number
  updated: number
  eliminated: number
  skippedUnmapped: string[]
  errors: string[]
}

const FD_BASE = 'https://api.football-data.org/v4'
const WC_COMPETITION = 'WC'

/**
 * Fetch World Cup matches from football-data.org.
 */
export async function fetchWorldCupMatches(apiKey: string): Promise<FdMatch[]> {
  const response = await fetch(`${FD_BASE}/competitions/${WC_COMPETITION}/matches`, {
    headers: { 'X-Auth-Token': apiKey },
  })

  if (!response.ok) {
    throw new Error(`football-data.org responded ${response.status}`)
  }

  const data = (await response.json()) as { matches?: FdMatch[] }
  return data.matches ?? []
}

/**
 * Given the feed matches, update D1 for the survivor tournament:
 *  - find our match row whose two teams match the feed pair (either order),
 *  - if the feed match is FINISHED, write the score + status='fulltime',
 *  - mark the losing team's tournament_status='eliminated'.
 *
 * `db` is a minimal interface so this is testable without the real D1 binding.
 */
export interface MinimalDb {
  // Returns rows: { id, home_team_id, away_team_id, tournament_id }
  findMatch(
    tournamentId: string,
    teamIdA: string,
    teamIdB: string,
  ): Promise<{ id: string; home_team_id: string; away_team_id: string } | null>
  updateMatchResult(matchId: string, homeScore: number, awayScore: number): Promise<void>
  markTeamEliminated(teamId: string): Promise<void>
}

export async function syncFinishedResults(
  feedMatches: FdMatch[],
  tournamentId: string,
  db: MinimalDb,
): Promise<SyncSummary> {
  const summary: SyncSummary = {
    fetched: feedMatches.length,
    finished: 0,
    updated: 0,
    eliminated: 0,
    skippedUnmapped: [],
    errors: [],
  }

  for (const fd of feedMatches) {
    if (fd.status !== 'FINISHED') {
      continue
    }
    summary.finished += 1

    const homeId = mapTeamNameToId(fd.homeTeam?.name)
    const awayId = mapTeamNameToId(fd.awayTeam?.name)

    if (!homeId) {
      summary.skippedUnmapped.push(fd.homeTeam?.name ?? '(unknown home)')
      continue
    }
    if (!awayId) {
      summary.skippedUnmapped.push(fd.awayTeam?.name ?? '(unknown away)')
      continue
    }

    const feedHome = fd.score.fullTime.home
    const feedAway = fd.score.fullTime.away
    if (feedHome === null || feedAway === null) {
      continue
    }

    try {
      const ourMatch = await db.findMatch(tournamentId, homeId, awayId)
      if (!ourMatch) {
        // No matching fixture in our DB (e.g. not one of the survivor games).
        continue
      }

      // Our match row may store the pair in either order; align scores to it.
      const alignedHome = ourMatch.home_team_id === homeId ? feedHome : feedAway
      const alignedAway = ourMatch.home_team_id === homeId ? feedAway : feedHome

      await db.updateMatchResult(ourMatch.id, alignedHome, alignedAway)
      summary.updated += 1

      // Mark the loser eliminated. On a draw (decided by pens in reality) the
      // feed still reports a winner via score.winner; prefer that when present.
      let loserId: string | null = null
      if (fd.score.winner === 'HOME_TEAM') {
        loserId = awayId
      } else if (fd.score.winner === 'AWAY_TEAM') {
        loserId = homeId
      } else if (feedHome > feedAway) {
        loserId = awayId
      } else if (feedAway > feedHome) {
        loserId = homeId
      }

      if (loserId) {
        await db.markTeamEliminated(loserId)
        summary.eliminated += 1
      }
    } catch (error) {
      summary.errors.push(
        `${fd.homeTeam?.name} vs ${fd.awayTeam?.name}: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      )
    }
  }

  return summary
}
