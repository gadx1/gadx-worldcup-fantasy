import type { Match, Player, Team, TeamAssignment } from '../types/domain'

interface SurvivorBracketPanelProps {
  players: Player[]
  teams: Team[]
  matches: Match[]
  assignments: TeamAssignment[]
}

// Canonical knockout rounds, in order. Matches are bucketed by matching their
// roundName (case-insensitive substring) against these. Any round label that
// contains one of these keywords lands in that column.
const ROUND_DEFS: { key: string; label: string; keywords: string[] }[] = [
  { key: 'r16', label: 'Round of 16', keywords: ['round of 16', 'r16', 'octavos', 'last 16'] },
  { key: 'qf', label: 'Quarter-finals', keywords: ['quarter', 'qf', 'cuartos'] },
  { key: 'sf', label: 'Semi-finals', keywords: ['semi', 'sf', 'semis'] },
  { key: 'final', label: 'Final', keywords: ['final'] },
]

// A palette of distinct owner colors, assigned to players by their sort order.
const OWNER_COLORS = [
  '#2563eb', // blue
  '#db2777', // pink
  '#d97706', // amber
  '#7c3aed', // violet
  '#0d9488', // teal
  '#dc2626', // red
  '#4b5563', // slate (AI 1)
  '#0891b2', // cyan (AI 2)
]

function roundKeyForMatch(match: Match): string | null {
  const name = match.roundName.toLowerCase()
  // Check Final last isn't necessary since 'semi-final' contains 'final'; guard:
  if (name.includes('semi')) return 'sf'
  if (name.includes('quarter') || name.includes('cuartos') || /\bqf\b/.test(name)) return 'qf'
  if (name.includes('round of 16') || name.includes('octavos') || /\br16\b/.test(name) || name.includes('last 16'))
    return 'r16'
  if (name.includes('final')) return 'final'
  return null
}

function matchWinnerTeamId(match: Match): string | null {
  if (match.status !== 'fulltime') return null
  if (match.homeScore > match.awayScore) return match.homeTeamId
  if (match.awayScore > match.homeScore) return match.awayTeamId
  return null // draw recorded; decided elsewhere, no visual winner
}

export function SurvivorBracketPanel({
  players,
  teams,
  matches,
  assignments,
}: SurvivorBracketPanelProps) {
  const teamById = new Map(teams.map((team) => [team.id, team]))
  const playerById = new Map(players.map((player) => [player.id, player]))

  // ownerByTeamId: which player owns each team, plus that player's color.
  const sortedPlayers = [...players]
  const colorByPlayerId = new Map(
    sortedPlayers.map((player, index) => [player.id, OWNER_COLORS[index % OWNER_COLORS.length]]),
  )
  const ownerByTeamId = new Map<string, { playerId: string; color: string }>()
  assignments.forEach((assignment) => {
    const color = colorByPlayerId.get(assignment.playerId) ?? '#4b5563'
    ownerByTeamId.set(assignment.teamId, { playerId: assignment.playerId, color })
  })

  // Bucket matches into round columns, sorted by kickoff within each round.
  const columns = ROUND_DEFS.map((round) => {
    const roundMatches = matches
      .filter((match) => roundKeyForMatch(match) === round.key)
      .sort((a, b) => a.kickoffUtc.localeCompare(b.kickoffUtc))
    return { ...round, matches: roundMatches }
  })

  const hasAnyMatches = columns.some((column) => column.matches.length > 0)

  function TeamRow({ teamId, score, isWinner }: { teamId: string; score: number; isWinner: boolean }) {
    const team = teamById.get(teamId)
    const owner = ownerByTeamId.get(teamId)
    const ownerPlayer = owner ? playerById.get(owner.playerId) : undefined

    return (
      <div
        className={`flex items-center justify-between gap-2 px-3 py-2 ${
          isWinner ? 'bg-lime-400/15' : ''
        }`}
      >
        <div className="flex min-w-0 items-center gap-2">
          {owner && (
            <span
              className="h-3 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: owner.color }}
              title={ownerPlayer?.displayName}
            />
          )}
          <span className="shrink-0 text-base leading-none">{team?.flagEmoji ?? '⚪'}</span>
          <span
            className={`truncate text-sm ${
              isWinner ? 'font-bold text-ink-900' : 'font-medium text-ink-900'
            }`}
          >
            {team?.countryName ?? teamId}
          </span>
        </div>
        <span className="shrink-0 font-display text-sm font-bold text-ink-900">
          {score}
        </span>
      </div>
    )
  }

  return (
    <article className="rounded-3xl border border-pitch-900/10 bg-white/85 p-6 shadow-sm sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-pitch-700">
        Knockout Bracket
      </p>
      <div className="chalk-rule mt-3" />
      <h2 className="font-display mt-4 text-2xl font-bold uppercase tracking-tight text-ink-900 sm:text-3xl">
        Road to the final
      </h2>
      <p className="mt-3 max-w-2xl leading-7 text-ink-600">
        Each team carries a colored bar showing which player owns it. Winners are highlighted; the
        bracket fills in as knockout results are recorded.
      </p>

      {/* Owner legend */}
      {assignments.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
          {sortedPlayers.map((player) => (
            <span key={player.id} className="inline-flex items-center gap-2 text-xs text-ink-600">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: colorByPlayerId.get(player.id) }}
              />
              {player.displayName}
            </span>
          ))}
        </div>
      )}

      {!hasAnyMatches ? (
        <div className="mt-6 rounded-2xl border border-dashed border-pitch-900/20 bg-bone-50 p-8 text-center">
          <p className="font-display text-lg font-bold uppercase text-ink-900">
            Bracket not set yet
          </p>
          <p className="mt-2 text-sm text-ink-600">
            The Round of 16 teams appear here once the Round of 32 finishes and results are recorded.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto [-webkit-overflow-scrolling:touch]">
          <div className="flex min-w-max gap-4">
            {columns.map((column) => (
              <div key={column.key} className="flex w-60 shrink-0 flex-col">
                <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-pitch-700">
                  {column.label}
                </p>
                {column.matches.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-pitch-900/15 p-6 text-center text-xs text-ink-600">
                    To be decided
                  </div>
                ) : (
                  <div className="flex flex-1 flex-col justify-around gap-4">
                    {column.matches.map((match) => {
                      const winnerId = matchWinnerTeamId(match)
                      const played = match.status === 'fulltime'
                      return (
                        <div
                          key={match.id}
                          className="overflow-hidden rounded-2xl border border-pitch-900/12 bg-white shadow-sm"
                        >
                          <TeamRow
                            teamId={match.homeTeamId}
                            score={match.homeScore}
                            isWinner={winnerId === match.homeTeamId}
                          />
                          <div className="h-px bg-pitch-900/10" />
                          <TeamRow
                            teamId={match.awayTeamId}
                            score={match.awayScore}
                            isWinner={winnerId === match.awayTeamId}
                          />
                          {!played && (
                            <p className="bg-bone-50 px-3 py-1 text-center text-[0.65rem] uppercase tracking-wide text-ink-600">
                              {match.status}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  )
}
