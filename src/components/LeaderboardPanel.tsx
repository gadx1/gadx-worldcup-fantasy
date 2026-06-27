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
    <article className="rounded-3xl border border-[var(--pitch-900)]/10 bg-white/85 p-6 shadow-sm sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--pitch-700)]">
        Leaderboard
      </p>
      <div className="chalk-rule mt-3" />
      <h2 className="font-display mt-4 text-2xl font-bold uppercase tracking-tight text-[var(--ink-900)] sm:text-3xl">
        Current standings
      </h2>
      <p className="mt-3 max-w-2xl leading-7 text-[var(--ink-600)]">
        Points come from completed match results using the active scoring rules.
      </p>

      {/*
        overflow-x-auto enables horizontal scrolling on mobile instead of clipping
        the table. min-w forces the table to overflow its container so the scroll
        bar appears rather than columns being squashed. The webkit utility gives a
        smooth momentum scroll on iOS Safari.
      */}
      <div className="mt-6 overflow-x-auto rounded-2xl border border-[var(--pitch-900)]/10 [-webkit-overflow-scrolling:touch]">
        <table className="w-full min-w-[640px] border-collapse bg-white text-left text-sm">
          <thead className="bg-[var(--pitch-900)] text-xs uppercase tracking-[0.18em] text-[var(--lime-300)]">
            <tr>
              <th className="px-4 py-4">Rank</th>
              <th className="px-4 py-4">Player</th>
              <th className="px-4 py-4">Teams</th>
              <th className="px-4 py-4 text-right">Match</th>
              <th className="px-4 py-4 text-right">Bonus</th>
              <th className="px-4 py-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--pitch-900)]/10">
            {standings.map((standing) => {
              const player = players.find((item) => item.id === standing.playerId)
              const playerAssignments = assignments.filter(
                (assignment) => assignment.playerId === standing.playerId,
              )
              const playerTeams = playerAssignments
                .map((assignment) => teams.find((team) => team.id === assignment.teamId))
                .filter(Boolean)

              const isLeader = standing.rank === 1

              return (
                <tr key={standing.playerId} className="align-top">
                  <td className="px-4 py-4">
                    <span
                      className={`font-display inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                        isLeader
                          ? 'bg-[var(--lime-400)] text-[var(--pitch-900)]'
                          : 'bg-[var(--bone-100)] text-[var(--ink-900)]'
                      }`}
                    >
                      {standing.rank}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-[var(--ink-900)]">{player?.displayName}</p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      {playerTeams.map((team) =>
                        team ? (
                          <span
                            key={team.id}
                            className="whitespace-nowrap rounded-full bg-[var(--pitch-700)]/10 px-3 py-1 text-xs font-medium text-[var(--pitch-800)]"
                          >
                            {team.flagEmoji} {team.countryName}
                          </span>
                        ) : null,
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right font-medium text-[var(--ink-900)]">
                    {standing.matchPoints}
                  </td>
                  <td className="px-4 py-4 text-right font-medium text-[var(--ink-900)]">
                    {standing.bonusPoints}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="font-display text-lg font-bold text-[var(--ink-900)]">
                      {standing.totalPoints}
                    </span>
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
