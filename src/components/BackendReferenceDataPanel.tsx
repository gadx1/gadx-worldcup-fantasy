import { useEffect, useState } from 'react'
import type { ApiScoringRules, ApiTeam } from '../lib/apiClient'
import { fetchScoringRulesByTournamentId, fetchTeams } from '../lib/apiClient'

interface BackendReferenceDataPanelProps {
  tournamentId: string
}

type BackendReferenceDataStatus = 'loading' | 'ready' | 'error'

export function BackendReferenceDataPanel({ tournamentId }: BackendReferenceDataPanelProps) {
  const [status, setStatus] = useState<BackendReferenceDataStatus>('loading')
  const [teams, setTeams] = useState<ApiTeam[]>([])
  const [scoringRules, setScoringRules] = useState<ApiScoringRules | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadReferenceData() {
      try {
        const [teamsResponse, scoringRulesResponse] = await Promise.all([
          fetchTeams(),
          fetchScoringRulesByTournamentId(tournamentId),
        ])

        if (!isMounted) {
          return
        }

        setTeams(teamsResponse.teams)
        setScoringRules(scoringRulesResponse.scoringRules)
        setStatus('ready')
        setErrorMessage(null)
      } catch (error) {
        if (!isMounted) {
          return
        }

        setTeams([])
        setScoringRules(null)
        setStatus('error')
        setErrorMessage(error instanceof Error ? error.message : 'Unknown API error')
      }
    }

    loadReferenceData()

    return () => {
      isMounted = false
    }
  }, [tournamentId])

  const statusLabel =
    status === 'loading' ? 'Loading' : status === 'ready' ? 'D1 Read Ready' : 'API Error'

  const activeTeamCount = teams.filter((team) => team.isActive).length

  return (
    <article className="rounded-3xl border border-slate-900/10 bg-white/80 p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">
            Backend Reference Data
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">
            Teams and scoring rules from D1.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            This panel validates backend reads for national teams and tournament scoring rules. These
            are the reference datasets needed before replacing the local scoring and eligibility
            state.
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
          Could not load backend reference data. Start the Worker with{' '}
          <code>npm run worker:dev</code>. Error: {errorMessage}
        </div>
      )}

      {status === 'ready' && (
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-900/10 bg-slate-50 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Teams</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{teams.length}</p>
            <p className="mt-1 text-sm text-slate-600">{activeTeamCount} active</p>
          </div>

          <div className="rounded-2xl border border-slate-900/10 bg-slate-50 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Win Points</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">
              {scoringRules?.winPoints ?? '-'}
            </p>
            <p className="mt-1 text-sm text-slate-600">from scoring rules</p>
          </div>

          <div className="rounded-2xl border border-slate-900/10 bg-slate-50 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Goal Points</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">
              {scoringRules?.goalPoints ?? '-'}
            </p>
            <p className="mt-1 text-sm text-slate-600">per goal scored</p>
          </div>
        </div>
      )}

      {scoringRules && (
        <div className="mt-5 rounded-2xl border border-slate-900/10 bg-slate-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Scoring Rules
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-white p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Win</p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {scoringRules.winPoints}
              </p>
            </div>

            <div className="rounded-xl bg-white p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Draw</p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {scoringRules.drawPoints}
              </p>
            </div>

            <div className="rounded-xl bg-white p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Goal</p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {scoringRules.goalPoints}
              </p>
            </div>

            <div className="rounded-xl bg-white p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Clean Sheet</p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {scoringRules.cleanSheetPoints}
              </p>
            </div>

            <div className="rounded-xl bg-white p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Qualification
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {scoringRules.qualificationBonusPoints}
              </p>
            </div>

            <div className="rounded-xl bg-white p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Group Winner</p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {scoringRules.groupWinnerBonusPoints}
              </p>
            </div>
          </div>
        </div>
      )}

      {teams.length > 0 && (
        <div className="mt-5 rounded-2xl border border-slate-900/10 bg-slate-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Teams from D1
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {teams.map((team) => (
              <div key={team.id} className="rounded-xl bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-slate-950">
                      {team.flagEmoji} {team.countryName}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {team.fifaCode} · {team.confederation}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      team.isActive
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {team.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  )
}