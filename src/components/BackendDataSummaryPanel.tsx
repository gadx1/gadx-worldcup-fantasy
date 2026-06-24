import { useEffect, useState } from 'react'
import type { ApiMatch, ApiPlayer, ApiScoringRules, ApiTeam, ApiTournament } from '../lib/apiClient'
import {
  fetchMatchesByTournamentId,
  fetchPlayersByTournamentId,
  fetchScoringRulesByTournamentId,
  fetchTeams,
  fetchTournamentById,
} from '../lib/apiClient'

interface BackendDataSummaryPanelProps {
  tournamentId: string
}

type BackendDataSummaryStatus = 'loading' | 'ready' | 'error'

type BackendDataSummary = {
  tournament: ApiTournament | null
  players: ApiPlayer[]
  matches: ApiMatch[]
  teams: ApiTeam[]
  scoringRules: ApiScoringRules | null
}

function formatDate(dateIso: string) {
  return new Intl.DateTimeFormat('en-IE', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Dublin',
  }).format(new Date(dateIso))
}

export function BackendDataSummaryPanel({ tournamentId }: BackendDataSummaryPanelProps) {
  const [status, setStatus] = useState<BackendDataSummaryStatus>('loading')
  const [data, setData] = useState<BackendDataSummary>({
    tournament: null,
    players: [],
    matches: [],
    teams: [],
    scoringRules: null,
  })
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadBackendData() {
      try {
        const [
          tournamentResponse,
          playersResponse,
          matchesResponse,
          teamsResponse,
          scoringRulesResponse,
        ] = await Promise.all([
          fetchTournamentById(tournamentId),
          fetchPlayersByTournamentId(tournamentId),
          fetchMatchesByTournamentId(tournamentId),
          fetchTeams(),
          fetchScoringRulesByTournamentId(tournamentId),
        ])

        if (!isMounted) {
          return
        }

        setData({
          tournament: tournamentResponse.tournament,
          players: playersResponse.players,
          matches: matchesResponse.matches,
          teams: teamsResponse.teams,
          scoringRules: scoringRulesResponse.scoringRules,
        })
        setStatus('ready')
        setErrorMessage(null)
      } catch (error) {
        if (!isMounted) {
          return
        }

        setData({
          tournament: null,
          players: [],
          matches: [],
          teams: [],
          scoringRules: null,
        })
        setStatus('error')
        setErrorMessage(error instanceof Error ? error.message : 'Unknown API error')
      }
    }

    loadBackendData()

    return () => {
      isMounted = false
    }
  }, [tournamentId])

  const statusLabel =
    status === 'loading' ? 'Loading' : status === 'ready' ? 'D1 Read Ready' : 'API Error'

  const completedMatches = data.matches.filter((match) => match.status === 'fulltime').length
  const activeTeams = data.teams.filter((team) => team.isActive).length

  return (
    <article className="rounded-3xl border border-slate-900/10 bg-white/80 p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">
            Backend Data Summary
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">
            Core data loaded from D1.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            This panel consolidates the backend read validation for tournament, players, matches,
            teams, and scoring rules. The main game UI still uses local prototype state until the
            replacement steps begin.
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
          Could not load backend data from the Worker API. Start the Worker with{' '}
          <code>npm run worker:dev</code>. Error: {errorMessage}
        </div>
      )}

      {status === 'ready' && data.tournament && (
        <>
          <section className="mt-5 rounded-2xl border border-slate-900/10 bg-slate-50 p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Tournament from D1
                </p>
                <h3 className="mt-2 text-xl font-semibold text-slate-950">
                  {data.tournament.name}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {data.tournament.roundName}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 shadow-sm">
                  {data.tournament.status}
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 shadow-sm">
                  {data.tournament.resultsMode}
                </span>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl bg-white p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Round Start</p>
                <p className="mt-2 text-sm font-semibold text-slate-950">
                  {formatDate(data.tournament.roundStartDate)}
                </p>
              </div>

              <div className="rounded-xl bg-white p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Round End</p>
                <p className="mt-2 text-sm font-semibold text-slate-950">
                  {formatDate(data.tournament.roundEndDate)}
                </p>
              </div>
            </div>
          </section>

          <section className="mt-5 grid gap-4 md:grid-cols-5">
            <div className="rounded-2xl border border-slate-900/10 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Players</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">{data.players.length}</p>
            </div>

            <div className="rounded-2xl border border-slate-900/10 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Teams</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">{data.teams.length}</p>
              <p className="mt-1 text-sm text-slate-600">{activeTeams} active</p>
            </div>

            <div className="rounded-2xl border border-slate-900/10 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Matches</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">{data.matches.length}</p>
              <p className="mt-1 text-sm text-slate-600">{completedMatches} completed</p>
            </div>

            <div className="rounded-2xl border border-slate-900/10 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Win Points</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">
                {data.scoringRules?.winPoints ?? '-'}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-900/10 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Goal Points</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">
                {data.scoringRules?.goalPoints ?? '-'}
              </p>
            </div>
          </section>

          <section className="mt-5 grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-900/10 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Players from D1
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {data.players.map((player) => (
                  <div key={player.id} className="rounded-xl bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Player {player.sortOrder}
                    </p>
                    <p className="mt-2 font-semibold text-slate-950">{player.displayName}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {player.firstName} {player.lastName}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-900/10 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Matches from D1
              </p>

              <div className="mt-4 grid gap-3">
                {data.matches.map((match) => (
                  <div key={match.id} className="rounded-xl bg-white p-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <p className="font-semibold text-slate-950">
                        {match.homeTeamFlagEmoji} {match.homeTeamName} {match.homeScore} -{' '}
                        {match.awayScore} {match.awayTeamFlagEmoji} {match.awayTeamName}
                      </p>
                      <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                        {match.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{formatDate(match.kickoffUtc)}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </article>
  )
}