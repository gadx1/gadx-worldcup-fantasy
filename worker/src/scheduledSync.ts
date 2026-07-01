/**
 * M7 — Scheduled sync runner (Cloudflare Cron Trigger).
 *
 * Wire this into the Worker's default export as a `scheduled` handler:
 *
 *   import { runScheduledSync } from './scheduledSync'
 *   export default {
 *     async fetch(request, env, ctx) { ... existing ... },
 *     async scheduled(event, env, ctx) {
 *       ctx.waitUntil(runScheduledSync(env))
 *     },
 *   }
 *
 * Env must include:
 *   DB: D1Database
 *   FOOTBALL_DATA_API_KEY: string   (set as a Worker secret)
 *   SURVIVOR_TOURNAMENT_ID?: string (defaults to 'tournament_wc_survivor')
 */

import {
  fetchWorldCupMatches,
  syncFinishedResults,
  type MinimalDb,
  type SyncSummary,
} from './sync'

export interface SyncEnv {
  DB: D1Database
  FOOTBALL_DATA_API_KEY?: string
  SURVIVOR_TOURNAMENT_ID?: string
}

/**
 * Adapts the real D1 binding to the MinimalDb interface the sync logic needs.
 */
function makeD1Adapter(db: D1Database, tournamentId: string): MinimalDb {
  return {
    async findMatch(tId, teamIdA, teamIdB) {
      const row = await db
        .prepare(
          `SELECT id, home_team_id, away_team_id
             FROM matches
            WHERE tournament_id = ?
              AND (
                (home_team_id = ? AND away_team_id = ?)
                OR (home_team_id = ? AND away_team_id = ?)
              )
            LIMIT 1`,
        )
        .bind(tId, teamIdA, teamIdB, teamIdB, teamIdA)
        .first<{ id: string; home_team_id: string; away_team_id: string }>()

      return row ?? null
    },

    async updateMatchResult(matchId, homeScore, awayScore) {
      await db
        .prepare(
          `UPDATE matches
              SET home_score = ?, away_score = ?, status = 'fulltime', updated_at = datetime('now')
            WHERE id = ?`,
        )
        .bind(homeScore, awayScore, matchId)
        .run()
    },

    async markTeamEliminated(teamId) {
      await db
        .prepare(
          `UPDATE teams
              SET tournament_status = 'eliminated', updated_at = datetime('now')
            WHERE id = ?`,
        )
        .bind(teamId)
        .run()
    },
  }
}

/**
 * Runs one sync pass: fetch the feed, apply finished results to D1. Returns a
 * summary (also logged). Never throws — logs errors into the summary so a bad
 * run does not crash the scheduled worker.
 */
export async function runScheduledSync(env: SyncEnv): Promise<SyncSummary> {
  const tournamentId = env.SURVIVOR_TOURNAMENT_ID ?? 'tournament_wc_survivor'

  const empty: SyncSummary = {
    fetched: 0,
    finished: 0,
    updated: 0,
    eliminated: 0,
    skippedUnmapped: [],
    errors: [],
  }

  if (!env.FOOTBALL_DATA_API_KEY) {
    empty.errors.push('FOOTBALL_DATA_API_KEY is not set; skipping sync.')
    console.error(empty.errors[0])
    return empty
  }

  try {
    const feedMatches = await fetchWorldCupMatches(env.FOOTBALL_DATA_API_KEY)
    const db = makeD1Adapter(env.DB, tournamentId)
    const summary = await syncFinishedResults(feedMatches, tournamentId, db)

    console.log(
      `Sync: fetched=${summary.fetched} finished=${summary.finished} updated=${summary.updated} eliminated=${summary.eliminated} skipped=${summary.skippedUnmapped.length} errors=${summary.errors.length}`,
    )
    if (summary.skippedUnmapped.length > 0) {
      console.warn('Sync unmapped team names:', summary.skippedUnmapped.join(', '))
    }
    return summary
  } catch (error) {
    empty.errors.push(error instanceof Error ? error.message : 'Unknown sync error')
    console.error('Sync failed:', empty.errors[empty.errors.length - 1])
    return empty
  }
}
