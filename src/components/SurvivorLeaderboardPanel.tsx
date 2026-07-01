import type { Player, Team } from '../types/domain'
import type { SurvivorStanding } from '../lib/survivorScoring'

interface SurvivorLeaderboardPanelProps {
  players: Player[]
  teams: Team[]
  standings: SurvivorStanding[]
}

/**
 * Small colored dot showing whether a player is still alive in the survivor
 * pool (green, at least one team remaining) or eliminated (red, every team
 * they own has lost). aria-label carries the meaning for screen readers since
 * color alone is not accessible.
 */
function StatusDot({ state }: { state: 'pending' | 'alive' | 'eliminated' }) {
  if (state === 'pending') {
    return (
      <span className="inline-flex items-center gap-2">
        <span
          aria-label="Pending"
          title="Waiting for the draw"
          className="h-2.5 w-2.5 rounded-full bg-slate-300"
        />
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">—</span>
      </span>
    )
  }

  const isAlive = state === 'alive'
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-label={isAlive ? 'Live' : 'Eliminated'}
        title={isAlive ? 'Live' : 'Eliminated'}
        className={`h-2.5 w-2.5 rounded-full ${
          isAlive ? 'bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.25)]' : 'bg-red-500'
        }`}
      />
      <span
        className={`text-xs font-semibold uppercase tracking-wide ${
          isAlive ? 'text-emerald-700' : 'text-red-600'
        }`}
      >
        {isAlive ? 'Live' : 'Out'}
      </span>
    </span>
  )
}

export function SurvivorLeaderboardPanel({
  players,
  teams,
  standings,
}: SurvivorLeaderboardPanelProps) {
  return (
    <article className="rounded-3xl border border-pitch-900/10 bg-white/85 p-6 shadow-sm sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-pitch-700">
        Survivor Standings
      </p>
      <div className="chalk-rule mt-3" />
      <h2 className="font-display mt-4 text-2xl font-bold uppercase tracking-tight text-ink-900 sm:text-3xl">
        Who's still alive
      </h2>
      <p className="mt-3 max-w-2xl leading-7 text-ink-600">
        Points come from each player's teams in the knockout stage, counted from July 1 onward.
        A player is eliminated once every team they own has lost.
      </p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-pitch-900/10 [-webkit-overflow-scrolling:touch]">
        <table className="w-full min-w-[720px] border-collapse bg-white text-left text-sm">
          <thead className="bg-pitch-900 text-xs uppercase tracking-[0.18em] text-lime-300">
            <tr>
              <th className="px-4 py-4">Rank</th>
              <th className="px-4 py-4">Player</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">Teams</th>
              <th className="px-4 py-4 text-right">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pitch-900/10">
            {standings.map((standing) => {
              const player = players.find((item) => item.id === standing.playerId)
              const isLeader = standing.rank === 1

              return (
                <tr key={standing.playerId} className="align-top">
                  <td className="px-4 py-4">
                    <span
                      className={`font-display inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                        isLeader
                          ? 'bg-lime-400 text-pitch-900'
                          : 'bg-bone-100 text-ink-900'
                      }`}
                    >
                      {standing.rank}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-ink-900">{player?.displayName}</p>
                  </td>
                  <td className="px-4 py-4">
                    <StatusDot state={standing.state} />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      {standing.teamScores.map((teamScore) => {
                        const team = teams.find((item) => item.id === teamScore.teamId)
                        const isTeamAlive = teamScore.state === 'alive'

                        return (
                          <span
                            key={teamScore.teamId}
                            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
                              isTeamAlive
                                ? 'bg-pitch-700/10 text-pitch-800'
                                : 'bg-red-50 text-red-700 line-through decoration-red-400'
                            }`}
                            title={
                              isTeamAlive
                                ? 'Still in the tournament'
                                : `Eliminated${teamScore.eliminatedInRound ? ` — ${teamScore.eliminatedInRound}` : ''}`
                            }
                          >
                            {team?.flagEmoji} {team?.countryName ?? teamScore.teamId}
                          </span>
                        )
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="font-display text-lg font-bold text-ink-900">
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
