import { useEffect, useState } from 'react'
import type { ApiDebugCountsResponse, ApiHealthResponse } from '../lib/apiClient'
import { fetchApiHealth, fetchDebugCounts } from '../lib/apiClient'

type ApiStatus = 'loading' | 'connected' | 'error'

export function ApiStatusPanel() {
  const [status, setStatus] = useState<ApiStatus>('loading')
  const [health, setHealth] = useState<ApiHealthResponse | null>(null)
  const [debugCounts, setDebugCounts] = useState<ApiDebugCountsResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadApiStatus() {
      try {
        const [healthResponse, countsResponse] = await Promise.all([
          fetchApiHealth(),
          fetchDebugCounts(),
        ])

        if (!isMounted) {
          return
        }

        setHealth(healthResponse)
        setDebugCounts(countsResponse)
        setStatus('connected')
        setErrorMessage(null)
      } catch (error) {
        if (!isMounted) {
          return
        }

        setHealth(null)
        setDebugCounts(null)
        setStatus('error')
        setErrorMessage(error instanceof Error ? error.message : 'Unknown API error')
      }
    }

    loadApiStatus()

    return () => {
      isMounted = false
    }
  }, [])

  const statusLabel =
    status === 'loading' ? 'Checking' : status === 'connected' ? 'Connected' : 'Disconnected'

  return (
    <article className="rounded-3xl border border-slate-900/10 bg-white/80 p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">
            API Status
          </p>

          <h2 className="mt-3 text-2xl font-semibold tracking-tight">
            Production API connection.
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            This panel validates the live connection between the Cloudflare Pages frontend, the
            Cloudflare Worker API, and the Cloudflare D1 database.
          </p>
        </div>

        <span
          className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${
            status === 'connected'
              ? 'bg-emerald-100 text-emerald-800'
              : status === 'loading'
                ? 'bg-slate-100 text-slate-700'
                : 'bg-red-100 text-red-800'
          }`}
        >
          {statusLabel}
        </span>
      </div>

      {status === 'error' && (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
          Could not connect to the Worker API. In local development, start the Worker with{' '}
          <code>npm run worker:dev</code>. Error: {errorMessage}
        </div>
      )}

      {health && (
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-900/10 bg-slate-50 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Service</p>
            <p className="mt-2 break-words text-lg font-semibold text-slate-950">
              {health.service}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-900/10 bg-slate-50 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Environment</p>
            <p className="mt-2 text-lg font-semibold text-slate-950">{health.environment}</p>
          </div>

          <div className="rounded-2xl border border-slate-900/10 bg-slate-50 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Version</p>
            <p className="mt-2 text-lg font-semibold text-slate-950">{health.version}</p>
          </div>

          <div className="rounded-2xl border border-slate-900/10 bg-slate-50 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">D1</p>
            <p className="mt-2 text-lg font-semibold text-slate-950">
              {health.database.ok ? 'Healthy' : 'Issue detected'}
            </p>
          </div>
        </div>
      )}

      {debugCounts && (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {debugCounts.counts.map((count) => (
            <div key={count.table_name} className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                {count.table_name}
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{count.row_count}</p>
            </div>
          ))}
        </div>
      )}
    </article>
  )
}