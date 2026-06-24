import { useEffect, useState } from 'react'
import type { ApiTournament } from '../lib/apiClient'
import { fetchTournaments } from '../lib/apiClient'

type BackendTournamentStatus = 'loading' | 'ready' | 'error'

function formatDate(dateIso: string) {
  return new Intl.DateTimeFormat('en-IE', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Dublin',
  }).format(new Date(dateIso))
}

export function BackendTournamentPanel() {
  const [status, setStatus] = useState<BackendTournamentStatus>('loading')
  const [tournaments, setTournaments] = useState<ApiTournament[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadTournaments() {
      try {
        const response = await fetchTournaments()

        if (!isMounted) {
          return
        }

        setTournaments(response.tournaments)
        setStatus('ready')
        setErrorMessage(null)
      } catch (error) {
        if (!isMounted) {
          return
        }

        setTournaments([])
        setStatus('error')
        setErrorMessage(error instanceof Error ? error.message : 'Unknown API error')
      }
    }

    loadTournaments()

    return () => {
      isMounted = false
    }
  }, [])

  const statusLabel =
    status === 'loading' ? 'Loading' : status === 'ready' ? 'D1 Read Ready' : 'API Error'

  return (
    <article className="rounded-3xl border border-slate-900/10 bg-white/80 p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">
            Backend Tournament Read
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">
            Tournament data from D1.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            This panel reads tournament records from the Cloudflare Worker API. The editable game UI
            still uses local prototype state until the next replacement step.
          </p>
        </div>

        <span
          className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${
            status === 'ready'
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
          Could not load tournaments from the Worker API. Start the Worker with{' '}
          <code>npm run worker:dev</code>. Error: {errorMessage}
        </div>
      )}

      {status === 'ready' && tournaments.length === 0 && (
        <div className="mt-5 rounded-2xl border border-slate-900/10 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
          No tournaments were returned from D1.
        </div>
      )}

      {tournaments.length > 0 && (
        <div className="mt-5 grid gap-4">
          {tournaments.map((tournament) => (
            <section
              key={tournament.id}
              className="rounded-2xl border border-slate-900/10 bg-slate-50 p-5"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    {tournament.id}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-950">
                    {tournament.name}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {tournament.roundName}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 shadow-sm">
                    {tournament.status}
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 shadow-sm">
                    {tournament.resultsMode}
                  </span>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Round Start
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">
                    {formatDate(tournament.roundStartDate)}
                  </p>
                </div>

                <div className="rounded-xl bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Round End
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">
                    {formatDate(tournament.roundEndDate)}
                  </p>
                </div>
              </div>
            </section>
          ))}
        </div>
      )}
    </article>
  )
}