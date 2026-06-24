export interface Env {
  DB: D1Database
  ENVIRONMENT?: string
}

const corsHeaders = {
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
  'Access-Control-Allow-Origin': '*',
}

function jsonResponse(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: corsHeaders,
  })
}

function notFound() {
  return jsonResponse(
    {
      ok: false,
      error: 'Not found',
    },
    404,
  )
}

function badRequest(message: string) {
  return jsonResponse(
    {
      ok: false,
      error: message,
    },
    400,
  )
}

async function parseJsonBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json()

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return null
    }

    return body as Record<string, unknown>
  } catch {
    return null
  }
}

async function getDatabaseHealth(env: Env) {
  const result = await env.DB.prepare('SELECT 1 AS ok').first<{ ok: number }>()

  return {
    ok: result?.ok === 1,
  }
}

async function getTableCount(env: Env, tableName: string) {
  const result = await env.DB.prepare(`SELECT COUNT(*) AS row_count FROM ${tableName}`).first<{
    row_count: number
  }>()

  return {
    table_name: tableName,
    row_count: result?.row_count ?? 0,
  }
}

async function getTableCounts(env: Env) {
  const tableNames = [
    'audit_log',
    'matches',
    'players',
    'scoring_rules',
    'teams',
    'tournament_users',
    'tournaments',
    'users',
  ]

  return Promise.all(tableNames.map((tableName) => getTableCount(env, tableName)))
}

async function getTournaments(env: Env) {
  const result = await env.DB.prepare(
    `
    SELECT
      id,
      name,
      round_name AS roundName,
      round_start_date AS roundStartDate,
      round_end_date AS roundEndDate,
      status,
      results_mode AS resultsMode,
      created_by_user_id AS createdByUserId,
      created_at AS createdAt,
      updated_at AS updatedAt
    FROM tournaments
    ORDER BY created_at DESC
    `,
  ).all()

  return result.results
}

async function getTournamentById(env: Env, tournamentId: string) {
  return env.DB.prepare(
    `
    SELECT
      id,
      name,
      round_name AS roundName,
      round_start_date AS roundStartDate,
      round_end_date AS roundEndDate,
      status,
      results_mode AS resultsMode,
      created_by_user_id AS createdByUserId,
      created_at AS createdAt,
      updated_at AS updatedAt
    FROM tournaments
    WHERE id = ?
    `,
  ).bind(tournamentId).first()
}

async function getPlayersByTournamentId(env: Env, tournamentId: string) {
  const result = await env.DB.prepare(
    `
    SELECT
      id,
      tournament_id AS tournamentId,
      first_name AS firstName,
      last_name AS lastName,
      display_name AS displayName,
      avatar_id AS avatarId,
      sort_order AS sortOrder,
      created_at AS createdAt,
      updated_at AS updatedAt
    FROM players
    WHERE tournament_id = ?
    ORDER BY sort_order ASC
    `,
  ).bind(tournamentId).all()

  return result.results
}

async function getTeams(env: Env) {
  const result = await env.DB.prepare(
    `
    SELECT
      id,
      country_name AS countryName,
      country_code AS countryCode,
      fifa_code AS fifaCode,
      flag_emoji AS flagEmoji,
      confederation,
      tournament_status AS tournamentStatus,
      is_active AS isActive,
      created_at AS createdAt,
      updated_at AS updatedAt
    FROM teams
    ORDER BY country_name ASC
    `,
  ).all()

  return result.results.map((team) => ({
    ...team,
    isActive: team.isActive === 1,
  }))
}

async function getMatchesByTournamentId(env: Env, tournamentId: string) {
  const result = await env.DB.prepare(
    `
    SELECT
      m.id,
      m.tournament_id AS tournamentId,
      m.round_name AS roundName,
      m.home_team_id AS homeTeamId,
      ht.country_name AS homeTeamName,
      ht.flag_emoji AS homeTeamFlagEmoji,
      m.away_team_id AS awayTeamId,
      at.country_name AS awayTeamName,
      at.flag_emoji AS awayTeamFlagEmoji,
      m.kickoff_utc AS kickoffUtc,
      m.status,
      m.home_score AS homeScore,
      m.away_score AS awayScore,
      m.created_at AS createdAt,
      m.updated_at AS updatedAt
    FROM matches m
    INNER JOIN teams ht ON ht.id = m.home_team_id
    INNER JOIN teams at ON at.id = m.away_team_id
    WHERE m.tournament_id = ?
    ORDER BY m.kickoff_utc ASC
    `,
  ).bind(tournamentId).all()

  return result.results
}

async function getScoringRulesByTournamentId(env: Env, tournamentId: string) {
  return env.DB.prepare(
    `
    SELECT
      id,
      tournament_id AS tournamentId,
      win_points AS winPoints,
      draw_points AS drawPoints,
      loss_points AS lossPoints,
      goal_points AS goalPoints,
      clean_sheet_points AS cleanSheetPoints,
      qualification_bonus_points AS qualificationBonusPoints,
      group_winner_bonus_points AS groupWinnerBonusPoints,
      created_at AS createdAt,
      updated_at AS updatedAt
    FROM scoring_rules
    WHERE tournament_id = ?
    `,
  ).bind(tournamentId).first()
}

async function updateTournament(env: Env, tournamentId: string, body: Record<string, unknown>) {
  const name = typeof body.name === 'string' ? body.name.trim() : null
  const roundName = typeof body.roundName === 'string' ? body.roundName.trim() : null
  const roundStartDate =
    typeof body.roundStartDate === 'string' ? body.roundStartDate.trim() : null
  const roundEndDate = typeof body.roundEndDate === 'string' ? body.roundEndDate.trim() : null
  const resultsMode = typeof body.resultsMode === 'string' ? body.resultsMode.trim() : null

  if (!name && !roundName && !roundStartDate && !roundEndDate && !resultsMode) {
    return badRequest('No valid tournament fields were provided.')
  }

  await env.DB.prepare(
    `
    UPDATE tournaments
    SET
      name = COALESCE(?, name),
      round_name = COALESCE(?, round_name),
      round_start_date = COALESCE(?, round_start_date),
      round_end_date = COALESCE(?, round_end_date),
      results_mode = COALESCE(?, results_mode),
      updated_at = datetime('now')
    WHERE id = ?
    `,
  )
    .bind(name, roundName, roundStartDate, roundEndDate, resultsMode, tournamentId)
    .run()

  const tournament = await getTournamentById(env, tournamentId)

  if (!tournament) {
    return notFound()
  }

  return jsonResponse({
    ok: true,
    tournament,
  })
}

async function updatePlayer(env: Env, playerId: string, body: Record<string, unknown>) {
  const firstName = typeof body.firstName === 'string' ? body.firstName.trim() : null
  const lastName = typeof body.lastName === 'string' ? body.lastName.trim() : null
  const displayName = typeof body.displayName === 'string' ? body.displayName.trim() : null
  const avatarId = typeof body.avatarId === 'string' ? body.avatarId.trim() : null

  if (!firstName && !lastName && !displayName && !avatarId) {
    return badRequest('No valid player fields were provided.')
  }

  await env.DB.prepare(
    `
    UPDATE players
    SET
      first_name = COALESCE(?, first_name),
      last_name = COALESCE(?, last_name),
      display_name = COALESCE(?, display_name),
      avatar_id = COALESCE(?, avatar_id),
      updated_at = datetime('now')
    WHERE id = ?
    `,
  )
    .bind(firstName, lastName, displayName, avatarId, playerId)
    .run()

  const player = await env.DB.prepare(
    `
    SELECT
      id,
      tournament_id AS tournamentId,
      first_name AS firstName,
      last_name AS lastName,
      display_name AS displayName,
      avatar_id AS avatarId,
      sort_order AS sortOrder,
      created_at AS createdAt,
      updated_at AS updatedAt
    FROM players
    WHERE id = ?
    `,
  ).bind(playerId).first()

  if (!player) {
    return notFound()
  }

  return jsonResponse({
    ok: true,
    player,
  })
}

async function updateMatch(env: Env, matchId: string, body: Record<string, unknown>) {
  const status = typeof body.status === 'string' ? body.status.trim() : null
  const homeScore = typeof body.homeScore === 'number' ? body.homeScore : null
  const awayScore = typeof body.awayScore === 'number' ? body.awayScore : null

  if (!status && homeScore === null && awayScore === null) {
    return badRequest('No valid match fields were provided.')
  }

  await env.DB.prepare(
    `
    UPDATE matches
    SET
      status = COALESCE(?, status),
      home_score = COALESCE(?, home_score),
      away_score = COALESCE(?, away_score),
      updated_at = datetime('now')
    WHERE id = ?
    `,
  )
    .bind(status, homeScore, awayScore, matchId)
    .run()

  const match = await env.DB.prepare(
    `
    SELECT
      m.id,
      m.tournament_id AS tournamentId,
      m.round_name AS roundName,
      m.home_team_id AS homeTeamId,
      ht.country_name AS homeTeamName,
      ht.flag_emoji AS homeTeamFlagEmoji,
      m.away_team_id AS awayTeamId,
      at.country_name AS awayTeamName,
      at.flag_emoji AS awayTeamFlagEmoji,
      m.kickoff_utc AS kickoffUtc,
      m.status,
      m.home_score AS homeScore,
      m.away_score AS awayScore,
      m.created_at AS createdAt,
      m.updated_at AS updatedAt
    FROM matches m
    INNER JOIN teams ht ON ht.id = m.home_team_id
    INNER JOIN teams at ON at.id = m.away_team_id
    WHERE m.id = ?
    `,
  ).bind(matchId).first()

  if (!match) {
    return notFound()
  }

  return jsonResponse({
    ok: true,
    match,
  })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const pathname = url.pathname

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      })
    }

    try {
      if (request.method === 'GET' && pathname === '/api/health') {
        const database = await getDatabaseHealth(env)

        return jsonResponse({
          ok: true,
          service: 'gadx-worldcup-api',
          environment: env.ENVIRONMENT ?? 'unknown',
          version: '0.2.0',
          database,
          timestamp: new Date().toISOString(),
        })
      }

      if (request.method === 'GET' && pathname === '/api/debug/counts') {
        const counts = await getTableCounts(env)

        return jsonResponse({
          ok: true,
          counts,
        })
      }

      if (request.method === 'GET' && pathname === '/api/tournaments') {
        const tournaments = await getTournaments(env)

        return jsonResponse({
          ok: true,
          tournaments,
        })
      }

      if (request.method === 'GET' && pathname === '/api/teams') {
        const teams = await getTeams(env)

        return jsonResponse({
          ok: true,
          teams,
        })
      }

      const tournamentMatch = pathname.match(/^\/api\/tournaments\/([^/]+)$/)

      if (request.method === 'GET' && tournamentMatch) {
        const tournament = await getTournamentById(env, tournamentMatch[1])

        if (!tournament) {
          return notFound()
        }

        return jsonResponse({
          ok: true,
          tournament,
        })
      }

      if (request.method === 'PATCH' && tournamentMatch) {
        const body = await parseJsonBody(request)

        if (!body) {
          return badRequest('Invalid JSON body.')
        }

        return updateTournament(env, tournamentMatch[1], body)
      }

      const playersMatch = pathname.match(/^\/api\/tournaments\/([^/]+)\/players$/)

      if (request.method === 'GET' && playersMatch) {
        const players = await getPlayersByTournamentId(env, playersMatch[1])

        return jsonResponse({
          ok: true,
          players,
        })
      }

      const matchesMatch = pathname.match(/^\/api\/tournaments\/([^/]+)\/matches$/)

      if (request.method === 'GET' && matchesMatch) {
        const matches = await getMatchesByTournamentId(env, matchesMatch[1])

        return jsonResponse({
          ok: true,
          matches,
        })
      }

      const scoringRulesMatch = pathname.match(/^\/api\/tournaments\/([^/]+)\/scoring-rules$/)

      if (request.method === 'GET' && scoringRulesMatch) {
        const scoringRules = await getScoringRulesByTournamentId(env, scoringRulesMatch[1])

        return jsonResponse({
          ok: true,
          scoringRules,
        })
      }

      const playerMatch = pathname.match(/^\/api\/players\/([^/]+)$/)

      if (request.method === 'PATCH' && playerMatch) {
        const body = await parseJsonBody(request)

        if (!body) {
          return badRequest('Invalid JSON body.')
        }

        return updatePlayer(env, playerMatch[1], body)
      }

      const matchMatch = pathname.match(/^\/api\/matches\/([^/]+)$/)

      if (request.method === 'PATCH' && matchMatch) {
        const body = await parseJsonBody(request)

        if (!body) {
          return badRequest('Invalid JSON body.')
        }

        return updateMatch(env, matchMatch[1], body)
      }

      return notFound()
    } catch (error) {
      return jsonResponse(
        {
          ok: false,
          error: error instanceof Error ? error.message : 'Unknown server error',
        },
        500,
      )
    }
  },
}