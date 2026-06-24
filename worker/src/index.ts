interface Env {
  DB: D1Database
  ENVIRONMENT?: string
}

type DbTeamRow = {
  id: string
  countryName: string
  countryCode: string
  fifaCode: string
  flagEmoji: string
  confederation: string
  tournamentStatus: string
  isActive: number
  createdAt: string
  updatedAt: string
}

const corsHeaders = {
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  'Access-Control-Allow-Origin': '*',
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json; charset=utf-8',
    },
    status,
  })
}

function notFound(pathname: string) {
  return jsonResponse(
    {
      ok: false,
      error: 'Not Found',
      pathname,
    },
    404,
  )
}

function badRequest(message: string) {
  return jsonResponse(
    {
      ok: false,
      error: 'Bad Request',
      message,
    },
    400,
  )
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
    ORDER BY created_at DESC;
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
    WHERE id = ?;
    `,
  )
    .bind(tournamentId)
    .first()
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
    ORDER BY sort_order ASC;
    `,
  )
    .bind(tournamentId)
    .all()

  return result.results
}

function mapTeamRow(row: DbTeamRow) {
  return {
    id: row.id,
    countryName: row.countryName,
    countryCode: row.countryCode,
    fifaCode: row.fifaCode,
    flagEmoji: row.flagEmoji,
    confederation: row.confederation,
    tournamentStatus: row.tournamentStatus,
    isActive: row.isActive === 1,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
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
    ORDER BY country_name ASC;
    `,
  ).all<DbTeamRow>()

  return result.results.map(mapTeamRow)
}

async function getMatchesByTournamentId(env: Env, tournamentId: string) {
  const result = await env.DB.prepare(
    `
    SELECT
      matches.id,
      matches.tournament_id AS tournamentId,
      matches.round_name AS roundName,
      matches.home_team_id AS homeTeamId,
      home_team.country_name AS homeTeamName,
      home_team.flag_emoji AS homeTeamFlagEmoji,
      matches.away_team_id AS awayTeamId,
      away_team.country_name AS awayTeamName,
      away_team.flag_emoji AS awayTeamFlagEmoji,
      matches.kickoff_utc AS kickoffUtc,
      matches.status,
      matches.home_score AS homeScore,
      matches.away_score AS awayScore,
      matches.created_at AS createdAt,
      matches.updated_at AS updatedAt
    FROM matches
    INNER JOIN teams AS home_team
      ON home_team.id = matches.home_team_id
    INNER JOIN teams AS away_team
      ON away_team.id = matches.away_team_id
    WHERE matches.tournament_id = ?
    ORDER BY matches.kickoff_utc ASC;
    `,
  )
    .bind(tournamentId)
    .all()

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
    LIMIT 1;
    `,
  )
    .bind(tournamentId)
    .first()
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/').filter(Boolean)

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders,
        status: 204,
      })
    }

    if (url.pathname === '/api/health' && request.method === 'GET') {
      const database = await getDatabaseHealth(env)

      return jsonResponse({
        ok: true,
        service: 'gadx-worldcup-api',
        environment: env.ENVIRONMENT ?? 'local',
        version: '0.1.0',
        database,
        timestamp: new Date().toISOString(),
      })
    }

    if (url.pathname === '/api/debug/counts' && request.method === 'GET') {
      const counts = await getTableCounts(env)

      return jsonResponse({
        ok: true,
        counts,
      })
    }

    if (url.pathname === '/api/tournaments' && request.method === 'GET') {
      const tournaments = await getTournaments(env)

      return jsonResponse({
        ok: true,
        tournaments,
      })
    }

    if (url.pathname === '/api/teams' && request.method === 'GET') {
      const teams = await getTeams(env)

      return jsonResponse({
        ok: true,
        teams,
      })
    }

    if (
      pathParts[0] === 'api' &&
      pathParts[1] === 'tournaments' &&
      pathParts.length === 3 &&
      request.method === 'GET'
    ) {
      const tournamentId = pathParts[2]

      if (!tournamentId) {
        return badRequest('Missing tournament id.')
      }

      const tournament = await getTournamentById(env, tournamentId)

      if (!tournament) {
        return notFound(url.pathname)
      }

      return jsonResponse({
        ok: true,
        tournament,
      })
    }

    if (
      pathParts[0] === 'api' &&
      pathParts[1] === 'tournaments' &&
      pathParts.length === 4 &&
      pathParts[3] === 'players' &&
      request.method === 'GET'
    ) {
      const tournamentId = pathParts[2]

      if (!tournamentId) {
        return badRequest('Missing tournament id.')
      }

      const players = await getPlayersByTournamentId(env, tournamentId)

      return jsonResponse({
        ok: true,
        players,
      })
    }

    if (
      pathParts[0] === 'api' &&
      pathParts[1] === 'tournaments' &&
      pathParts.length === 4 &&
      pathParts[3] === 'matches' &&
      request.method === 'GET'
    ) {
      const tournamentId = pathParts[2]

      if (!tournamentId) {
        return badRequest('Missing tournament id.')
      }

      const matches = await getMatchesByTournamentId(env, tournamentId)

      return jsonResponse({
        ok: true,
        matches,
      })
    }

    if (
      pathParts[0] === 'api' &&
      pathParts[1] === 'tournaments' &&
      pathParts.length === 4 &&
      pathParts[3] === 'scoring-rules' &&
      request.method === 'GET'
    ) {
      const tournamentId = pathParts[2]

      if (!tournamentId) {
        return badRequest('Missing tournament id.')
      }

      const scoringRules = await getScoringRulesByTournamentId(env, tournamentId)

      return jsonResponse({
        ok: true,
        scoringRules,
      })
    }

    return notFound(url.pathname)
  },
} satisfies ExportedHandler<Env>