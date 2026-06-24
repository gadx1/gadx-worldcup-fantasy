import { useEffect, useState } from 'react'
import type { ApiMatch } from '../lib/apiClient'
import { fetchMatchesByTournamentId } from '../lib/apiClient'

interface BackendMatchesPanelProps {
  tournamentId: string
}

type BackendMatchesStatus = 'loading' | 'ready' | 'error'

function formatDate(dateIso: string) {
  return new Intl.DateTimeFormat('en-IE', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Dublin',
  }).format(new Date(dateIso))
}

function getStatusLabel(status: string) {
  return status.replace('_', ' ')
}

export function BackendMatchesPanel({ tournamentId }: BackendMatchesPanelProps) {
  const [status, setStatus] = useState<BackendMatchesStatus>('loading')
  const [matches, setMatches] = useState<ApiMatch[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadMatches() {
      try {
        const response = await fetchMatchesByTournamentId(tournamentId)

        if (!isMounted) {
          return
        }

        setMatches(response.matches)
        setStatus('ready')
        setErrorMessage(null)
      } catch (error) {
        if (!isMounted) {
          return
        }

        setMatches([])
        setStatus('error')
        setErrorMessage(error instanceof Error ? error.message : 'Unknown API error')
      }
    }

    loadMatches()

    return () => {
      isMounted = false
    }
  }, [tournamentId])

  const statusLabel =
    status === 'loading' ? 'Loading' : status === 'ready' ? 'D1 Read Ready' : 'API Error'

  return (
    <article className="rounded-3xl border border-slate-900/10 bg-white/80 p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">
            Backend Matches Read
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">
            Match data from D1.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            This panel reads match records from the Cloudflare Worker API. Manual score editing
            still uses local prototype state until the backend replacement step.
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
          Could not load matches from the Worker API. Start the Worker with{' '}
          <code>npm run worker:dev</code>. Error: {errorMessage}
        </div>
      )}

      {status === 'ready' && matches.length === 0 && (
        <div className="mt-5 rounded-2xl border border-slate-900/10 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
          No matches were returned from D1.
        </div>
      )}

      {matches.length > 0 && (
        <div className="mt-5 grid gap-4">
          {matches.map((match) => (
            <section
              key={match.id}
              className="rounded-2xl border border-slate-900/10 bg-slate-50 p-5"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    {match.roundName}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">{formatDate(match.kickoffUtc)}</p>
                </div>

                <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 shadow-sm">
                  {getStatusLabel(match.status)}
                </span>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
                <div className="rounded-xl bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Home</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {match.homeTeamFlagEmoji} {match.homeTeamName}
                  </p>
                </div>

                <div className="text-center text-2xl font-semibold text-slate-950">
                  {match.homeScore} - {match.awayScore}
                </div>

                <div className="rounded-xl bg-white p-4 md:text-right">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Away</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {match.awayTeamFlagEmoji} {match.awayTeamName}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-white p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Backend ID</p>
                <p className="mt-2 break-all text-sm font-medium text-slate-700">{match.id}</p>
              </div>
            </section>
          ))}
        </div>
      )}
    </article>
  )
}