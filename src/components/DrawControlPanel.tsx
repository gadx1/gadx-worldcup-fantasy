import type { DrawReadiness } from '../lib/draw'
import type { Player, Team, TeamAssignment } from '../types/domain'

interface DrawControlPanelProps {
  players: Player[]
  teams: Team[]
  draftAssignments: TeamAssignment[]
  lockedAssignments: TeamAssignment[]
  drawReadiness: DrawReadiness
  onRunDraw: () => void
  onSaveAndLock: () => void
}

function getTeamById(teams: Team[], teamId: string) {
  return teams.find((team) => team.id === teamId)
}

export function DrawControlPanel({
  players,
  teams,
  draftAssignments,
  lockedAssignments,
  drawReadiness,
  onRunDraw,
  onSaveAndLock,
}: DrawControlPanelProps) {
  const hasDraft = draftAssignments.length > 0
  const hasLockedDraw = lockedAssignments.length > 0
  const visibleAssignments = hasLockedDraw ? lockedAssignments : draftAssignments

  return (
    <article className="rounded-3xl bg-slate-950 p-8 text-white shadow-xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Draw Control
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">
            {hasLockedDraw ? 'Locked team assignment.' : 'Generate a draft assignment.'}
          </h2>
          <p className="mt-4 max-w-2xl leading-7 text-slate-300">
            Run the draw to generate a temporary assignment. You can re-draw until you are ready.
            Once saved and locked, the tournament assignment cannot be changed.
          </p>
        </div>

        <span
          className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${
            hasLockedDraw
              ? 'bg-emerald-300 text-emerald-950'
              : hasDraft
                ? 'bg-amber-300 text-amber-950'
                : 'bg-white/10 text-slate-200'
          }`}
        >
          {hasLockedDraw ? 'Locked' : hasDraft ? 'Draft' : 'Not Started'}
        </span>
      </div>

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
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            className="rounded-full bg-emerald-300 px-5 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-slate-500"
            disabled={hasLockedDraw}
            onClick={onRunDraw}
            type="button"
          >
            {hasDraft ? 'Re-draw' : 'Run Draw'}
          </button>

          <button
            className="rounded-full border border-white/15 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-slate-500"
            disabled={!hasDraft || hasLockedDraw}
            onClick={onSaveAndLock}
            type="button"
          >
            Save & Lock Draw
          </button>
        </div>
      )}

      {!hasDraft && !hasLockedDraw && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-300">
          No draw has been generated yet. Run the draw to preview the first team assignment.
        </div>
      )}

      {visibleAssignments.length > 0 && (
        <div className="mt-6 space-y-4">
          {players.map((player) => {
            const playerAssignments = visibleAssignments.filter(
              (assignment) => assignment.playerId === player.id,
            )

            return (
              <div key={player.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-semibold">{player.displayName}</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    {hasLockedDraw ? 'Saved' : 'Preview'}
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {playerAssignments.map((assignment) => {
                    const team = getTeamById(teams, assignment.teamId)

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