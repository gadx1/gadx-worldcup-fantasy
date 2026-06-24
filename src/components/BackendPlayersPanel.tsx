import { useEffect, useState } from 'react'
import type { ApiPlayer } from '../lib/apiClient'
import { fetchPlayersByTournamentId } from '../lib/apiClient'

interface BackendPlayersPanelProps {
  tournamentId: string
}

type BackendPlayersStatus = 'loading' | 'ready' | 'error'

export function BackendPlayersPanel({ tournamentId }: BackendPlayersPanelProps) {
  const [status, setStatus] = useState<BackendPlayersStatus>('loading')
  const [players, setPlayers] = useState<ApiPlayer[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadPlayers() {
      try {
        const response = await fetchPlayersByTournamentId(tournamentId)

        if (!isMounted) {
          return
        }

        setPlayers(response.players)
        setStatus('ready')
        setErrorMessage(null)
      } catch (error) {
        if (!isMounted) {
          return
        }

        setPlayers([])
        setStatus('error')
        setErrorMessage(error instanceof Error ? error.message : 'Unknown API error')
      }
    }

    loadPlayers()

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
            Backend Players Read
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">
            Player data from D1.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            This panel reads player records from the Cloudflare Worker API. The editable player UI
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
          Could not load players from the Worker API. Start the Worker with{' '}
          <code>npm run worker:dev</code>. Error: {errorMessage}
        </div>
      )}

      {status === 'ready' && players.length === 0 && (
        <div className="mt-5 rounded-2xl border border-slate-900/10 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
          No players were returned from D1.
        </div>
      )}

      {players.length > 0 && (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((player) => (
            <section
              key={player.id}
              className="rounded-2xl border border-slate-900/10 bg-slate-50 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Player {player.sortOrder}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-950">
                    {player.displayName}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {player.firstName} {player.lastName}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-800">
                  {player.avatarId.replace('avatar-', 'A')}
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-white p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Backend ID</p>
                <p className="mt-2 break-all text-sm font-medium text-slate-700">{player.id}</p>
              </div>
            </section>
          ))}
        </div>
      )}
    </article>
  )
}