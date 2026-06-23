interface Env {
  DB: D1Database
  ENVIRONMENT?: string
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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

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

    return notFound(url.pathname)
  },
} satisfies ExportedHandler<Env>