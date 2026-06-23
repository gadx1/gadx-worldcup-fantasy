import type { DrawReadiness } from '../lib/draw'
import type { Team } from '../types/domain'

interface EligibleTeamsPanelProps {
  eligibleTeams: Team[]
  ineligibleTeams: Team[]
  drawReadiness: DrawReadiness
}

export function EligibleTeamsPanel({
  eligibleTeams,
  ineligibleTeams,
  drawReadiness,
}: EligibleTeamsPanelProps) {
  return (
    <article className="rounded-3xl border border-slate-900/10 bg-white/80 p-8 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">
            Eligible Teams
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">
            Teams available for the current draw.
          </h2>
          <p className="mt-4 max-w-2xl leading-7 text-slate-600">
            A team is eligible when it is still active and has a scheduled, live, or halftime
            match inside the tournament round window.
          </p>
        </div>

        <span
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            drawReadiness.canRunDraw
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          {drawReadiness.canRunDraw ? 'Draw Ready' : 'Action Required'}
        </span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {eligibleTeams.map((team) => (
          <div
            key={team.id}
            className="flex items-center justify-between rounded-2xl border border-emerald-900/10 bg-emerald-50 px-4 py-3"
          >
            <div>
              <p className="font-semibold text-slate-950">
                {team.flagEmoji} {team.countryName}
              </p>
              <p className="text-sm text-slate-500">{team.countryCode}</p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-800">
              Eligible
            </span>
          </div>
        ))}
      </div>

      {ineligibleTeams.length > 0 && (
        <div className="mt-6 rounded-2xl border border-slate-900/10 bg-slate-50 p-5">
          <p className="font-semibold text-slate-950">Not currently eligible</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {ineligibleTeams.map((team) => (
              <span
                key={team.id}
                className="rounded-full border border-slate-900/10 bg-white px-3 py-1 text-sm text-slate-600"
              >
                {team.flagEmoji} {team.countryName}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  )
}