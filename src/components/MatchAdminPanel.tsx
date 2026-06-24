import type { Match, MatchStatus, Team } from '../types/domain'

interface MatchAdminPanelProps {
  isReadOnly?: boolean
  matches: Match[]
  onResetMatches: () => void
  onUpdateMatch: (matchId: string, updates: Partial<Match>) => void
  readOnlyReason?: string
  statusLabel?: string
  teams: Team[]
}

const matchStatuses: MatchStatus[] = [
  'scheduled',
  'live',
  'halftime',
  'fulltime',
  'postponed',
  'cancelled',
]

function getTeamLabel(teams: Team[], teamId: string) {
  const team = teams.find((item) => item.id === teamId)

  if (!team) {
    return 'Unknown Team'
  }

  return `${team.flagEmoji} ${team.countryName}`
}

function formatKickoffDate(dateIso: string) {
  return new Intl.DateTimeFormat('en-IE', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Dublin',
  }).format(new Date(dateIso))
}

export function MatchAdminPanel({
  matches,
  teams,
  onUpdateMatch,
  onResetMatches,
  isReadOnly = false,
  readOnlyReason,
  statusLabel,
}: MatchAdminPanelProps) {
  const visibleStatusLabel = statusLabel ?? (isReadOnly ? 'Read Only' : 'Editable')

  return (
    <article className="rounded-3xl border border-slate-900/10 bg-white/80 p-8 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">
            Match Admin
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">
            Update match results manually.
          </h2>
          <p className="mt-4 max-w-2xl leading-7 text-slate-600">
            Match results can be edited even after the draw is locked. The leaderboard recalculates
            automatically from the latest saved scores.
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 md:items-end">
          <span
            className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${
              isReadOnly ? 'bg-slate-950 text-white' : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {visibleStatusLabel}
          </span>

          <button
            className="w-fit rounded-full border border-slate-900/10 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-700 hover:text-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
            disabled={isReadOnly}
            onClick={onResetMatches}
            type="button"
          >
            Reset Results
          </button>
        </div>
      </div>

      {isReadOnly && readOnlyReason && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-700">
          {readOnlyReason}
        </div>
      )}

      <div className="mt-6 grid gap-4">
        {matches.map((match) => (
          <section
            key={match.id}
            className="rounded-2xl border border-slate-900/10 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  {match.roundName}
                </p>
                <p className="mt-1 text-sm text-slate-500">{formatKickoffDate(match.kickoffUtc)}</p>
              </div>

              <p className="text-sm font-semibold text-slate-700">
                {getTeamLabel(teams, match.homeTeamId)} vs {getTeamLabel(teams, match.awayTeamId)}
              </p>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Status
                <select
                  className="rounded-xl border border-slate-900/10 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                  disabled={isReadOnly}
                  onChange={(event) =>
                    onUpdateMatch(match.id, {
                      status: event.target.value as MatchStatus,
                    })
                  }
                  value={match.status}
                >
                  {matchStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Home score
                <input
                  className="rounded-xl border border-slate-900/10 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                  disabled={isReadOnly}
                  min={0}
                  onChange={(event) =>
                    onUpdateMatch(match.id, {
                      homeScore: Number(event.target.value),
                    })
                  }
                  type="number"
                  value={match.homeScore}
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Away score
                <input
                  className="rounded-xl border border-slate-900/10 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                  disabled={isReadOnly}
                  min={0}
                  onChange={(event) =>
                    onUpdateMatch(match.id, {
                      awayScore: Number(event.target.value),
                    })
                  }
                  type="number"
                  value={match.awayScore}
                />
              </label>
            </div>
          </section>
        ))}
      </div>
    </article>
  )
}