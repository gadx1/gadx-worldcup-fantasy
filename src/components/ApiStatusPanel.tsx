import { useEffect, useState } from 'react'
import type { ApiDebugCountsResponse, ApiHealthResponse } from '../lib/apiClient'
import { fetchApiHealth, fetchDebugCounts } from '../lib/apiClient'

type ApiStatus = 'loading' | 'connected' | 'disconnected'

export function ApiStatusPanel() {
  const [status, setStatus] = useState<ApiStatus>('loading')
  const [health, setHealth] = useState<ApiHealthResponse | null>(null)
  const [counts, setCounts] = useState<ApiDebugCountsResponse['counts']>([])
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
        setCounts(countsResponse.counts)
        setStatus('connected')
        setErrorMessage(null)
      } catch (error) {
        if (!isMounted) {
          return
        }

        setStatus('disconnected')
        setHealth(null)
        setCounts([])
        setErrorMessage(error instanceof Error ? error.message : 'Unknown API error')
      }
    }

    loadApiStatus()

    return () => {
      isMounted = false
    }
  }, [])

  const statusLabel =
    status === 'loading' ? 'Checking API' : status === 'connected' ? 'Connected' : 'Disconnected'

  return (
    <article className="rounded-3xl border border-slate-900/10 bg-white/80 p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">
            API Status
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">
            Frontend to Worker connection.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            This panel validates the first frontend connection to the Cloudflare Worker API and D1.
            The game UI still uses local prototype state for now.
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

      {status === 'disconnected' && (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
          API is not reachable. Start the Worker with <code>npm run worker:dev</code>. Error:{' '}
          {errorMessage}
        </div>
      )}

      {health && (
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-900/10 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Service</p>
            <p className="mt-2 font-semibold text-slate-950">{health.service}</p>
          </div>

          <div className="rounded-2xl border border-slate-900/10 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Environment</p>
            <p className="mt-2 font-semibold text-slate-950">{health.environment}</p>
          </div>

          <div className="rounded-2xl border border-slate-900/10 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Version</p>
            <p className="mt-2 font-semibold text-slate-950">{health.version}</p>
          </div>

          <div className="rounded-2xl border border-slate-900/10 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">D1</p>
            <p className="mt-2 font-semibold text-slate-950">
              {health.database.ok ? 'Healthy' : 'Unavailable'}
            </p>
          </div>
        </div>
      )}

      {counts.length > 0 && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {counts.map((count) => (
            <div
              key={count.table_name}
              className="rounded-2xl border border-slate-900/10 bg-slate-50 p-4"
            >
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
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