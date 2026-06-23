import type { DrawReadiness } from '../lib/draw'
import type { Player, Team, TeamAssignment } from '../types/domain'

interface FairDrawPreviewProps {
  players: Player[]
  teams: Team[]
  assignments: TeamAssignment[]
  drawReadiness: DrawReadiness
}

export function FairDrawPreview({
  players,
  teams,
  assignments,
  drawReadiness,
}: FairDrawPreviewProps) {
  return (
    <article className="rounded-3xl bg-slate-950 p-8 text-white shadow-xl">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">
        Fair Draw Preview
      </p>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight">
        Equal random team assignment.
      </h2>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Players</p>
          <p className="mt-2 text-2xl font-semibold">{drawReadiness.playerCount}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Teams</p>
          <p className="mt-2 text-2xl font-semibold">{drawReadiness.eligibleTeamCount}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Per Player</p>
          <p className="mt-2 text-2xl font-semibold">{drawReadiness.teamsPerPlayer}</p>
        </div>
      </div>

      {!drawReadiness.canRunDraw && (
        <div className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-5 text-amber-100">
          {drawReadiness.reason}
        </div>
      )}

      {drawReadiness.canRunDraw && (
        <div className="mt-6 space-y-4">
          {players.map((player) => {
            const playerAssignments = assignments.filter(
              (assignment) => assignment.playerId === player.id,
            )

            return (
              <div key={player.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="font-semibold">{player.displayName}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {playerAssignments.map((assignment) => {
                    const team = teams.find((item) => item.id === assignment.teamId)

                    if (!team) {
                      return null
                    }

                    return (
                      <span
                        key={`${assignment.playerId}-${assignment.teamId}`}
                        className="rounded-full bg-emerald-400/15 px-3 py-1 text-sm font-medium text-emerald-100"
                      >
                        {team.flagEmoji} {team.countryName}
                      </span>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </article>
  )
}