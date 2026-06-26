import type { Player, Standing, Team, TeamAssignment } from '../types/domain'

interface LeaderboardPanelProps {
  players: Player[]
  teams: Team[]
  assignments: TeamAssignment[]
  standings: Standing[]
}

export function LeaderboardPanel({
  players,
  teams,
  assignments,
  standings,
}: LeaderboardPanelProps) {
  return (
    <article className="rounded-3xl border border-slate-900/10 bg-white/80 p-6 shadow-sm sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">
        Leaderboard
      </p>
      <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
        Current player standings.
      </h2>
      <p className="mt-4 max-w-2xl leading-7 text-slate-600">
        Points are calculated from completed match results using the active scoring rules.
      </p>

      {/* overflow-x-auto enables horizontal scroll on mobile instead of truncating.
          -webkit-overflow-scrolling adds momentum scroll on iOS. min-w on the table
          forces the scroll container to overflow rather than squashing columns. */}
      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-900/10 [-webkit-overflow-scrolling:touch]">
        <table className="w-full min-w-[640px] border-collapse bg-white text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
            <tr>
              <th className="px-4 py-4">Rank</th>
              <th className="px-4 py-4">Player</th>
              <th className="px-4 py-4">Teams</th>
              <th className="px-4 py-4 text-right">Match</th>
              <th className="px-4 py-4 text-right">Bonus</th>
              <th className="px-4 py-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900/10">
            {standings.map((standing) => {
              const player = players.find((item) => item.id === standing.playerId)
              const playerAssignments = assignments.filter(
                (assignment) => assignment.playerId === standing.playerId,
              )
              const playerTeams = playerAssignments
                .map((assignment) => teams.find((team) => team.id === assignment.teamId))
                .filter(Boolean)

              return (
                <tr key={standing.playerId} className="align-top">
                  <td className="px-4 py-4 font-semibold text-slate-950">#{standing.rank}</td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-950">{player?.displayName}</p>
                    <p className="text-xs text-slate-500">{player?.avatarId}</p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      {playerTeams.map((team) =>
                        team ? (
                          <span
                            key={team.id}
                            className="whitespace-nowrap rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800"
                          >
                            {team.flagEmoji} {team.countryName}
                          </span>
                        ) : null,
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right font-medium">{standing.matchPoints}</td>
                  <td className="px-4 py-4 text-right font-medium">{standing.bonusPoints}</td>
                  <td className="px-4 py-4 text-right text-lg font-semibold text-slate-950">
                    {standing.totalPoints}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </article>
  )
}