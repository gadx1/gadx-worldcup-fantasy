import { calculateTeamMatchScore } from '../lib/scoring'
import type { Match, ScoringRules, Team } from '../types/domain'

interface MatchResultsPanelProps {
  matches: Match[]
  teams: Team[]
  scoringRules: ScoringRules
}

function getTeamName(teams: Team[], teamId: string) {
  return teams.find((team) => team.id === teamId)?.countryName ?? 'Unknown Team'
}

function getTeamFlag(teams: Team[], teamId: string) {
  return teams.find((team) => team.id === teamId)?.flagEmoji ?? '🏳️'
}

function getStatusLabel(status: Match['status']) {
  const statusLabels: Record<Match['status'], string> = {
    scheduled: 'Scheduled',
    live: 'Live',
    halftime: 'Half-time',
    fulltime: 'Full-time',
    postponed: 'Postponed',
    cancelled: 'Cancelled',
  }

  return statusLabels[status]
}

function formatKickoffDate(dateIso: string) {
  return new Intl.DateTimeFormat('en-IE', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Dublin',
  }).format(new Date(dateIso))
}

export function MatchResultsPanel({ matches, teams, scoringRules }: MatchResultsPanelProps) {
  return (
    <article className="rounded-3xl border border-slate-900/10 bg-white/80 p-8 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">
            Match Results
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">
            Results driving the leaderboard.
          </h2>
          <p className="mt-4 max-w-2xl leading-7 text-slate-600">
            Completed matches generate points from result, goals scored, and clean sheets.
            Scheduled matches remain visible but do not generate points yet.
          </p>
        </div>

        <span className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
          Dublin Time
        </span>
      </div>

      <div className="mt-6 grid gap-4">
        {matches.map((match) => {
          const homeTeamScore = calculateTeamMatchScore(match.homeTeamId, match, scoringRules)
          const awayTeamScore = calculateTeamMatchScore(match.awayTeamId, match, scoringRules)

          return (
            <section
              key={match.id}
              className="rounded-2xl border border-slate-900/10 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    {match.roundName}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatKickoffDate(match.kickoffUtc)}
                  </p>
                </div>

                <span
                  className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                    match.status === 'fulltime'
                      ? 'bg-emerald-100 text-emerald-800'
                      : match.status === 'live' || match.status === 'halftime'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {getStatusLabel(match.status)}
                </span>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-950">
                    {getTeamFlag(teams, match.homeTeamId)} {getTeamName(teams, match.homeTeamId)}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Points: <span className="font-semibold">{homeTeamScore.points}</span>
                  </p>
                  {match.status === 'fulltime' && (
                    <p className="mt-1 text-xs text-slate-500">
                      Result {homeTeamScore.resultPoints} · Goals {homeTeamScore.goalPoints} ·
                      Clean sheet {homeTeamScore.cleanSheetPoints}
                    </p>
                  )}
                </div>

                <div className="rounded-2xl bg-slate-950 px-5 py-4 text-center text-white">
                  <p className="text-2xl font-semibold">
                    {match.homeScore} — {match.awayScore}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-950">
                    {getTeamFlag(teams, match.awayTeamId)} {getTeamName(teams, match.awayTeamId)}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Points: <span className="font-semibold">{awayTeamScore.points}</span>
                  </p>
                  {match.status === 'fulltime' && (
                    <p className="mt-1 text-xs text-slate-500">
                      Result {awayTeamScore.resultPoints} · Goals {awayTeamScore.goalPoints} ·
                      Clean sheet {awayTeamScore.cleanSheetPoints}
                    </p>
                  )}
                </div>
              </div>
            </section>
          )
        })}
      </div>
    </article>
  )
}