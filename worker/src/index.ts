interface Env {
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
      return jsonResponse({
        ok: true,
        service: 'gadx-worldcup-api',
        environment: env.ENVIRONMENT ?? 'local',
        version: '0.1.0',
        timestamp: new Date().toISOString(),
      })
    }

    return notFound(url.pathname)
  },
} satisfies ExportedHandler<Env>