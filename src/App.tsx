import { adminSections, viewerSections } from './data/appSections'
import { mockMatches } from './data/mockMatches'
import { mockPlayers } from './data/mockPlayers'
import { mockTeams } from './data/mockTeams'
import { mockTournaments } from './data/mockTournaments'
import { getDrawReadiness, runFairDraw } from './lib/draw'
import { getEligibleTeams, getIneligibleTeams } from './lib/eligibility'

function App() {
  const activeTournament = mockTournaments[0]
  const tournamentPlayers = mockPlayers.filter(
    (player) => player.tournamentId === activeTournament.id,
  )
  const eligibleTeams = getEligibleTeams(mockTeams, mockMatches, activeTournament)
  const ineligibleTeams = getIneligibleTeams(mockTeams, mockMatches, activeTournament)
  const drawReadiness = getDrawReadiness(tournamentPlayers, eligibleTeams)
  const demoAssignments = drawReadiness.canRunDraw
    ? runFairDraw(tournamentPlayers, eligibleTeams)
    : []

  const scheduledMatchCount = mockMatches.filter((match) => match.status === 'scheduled').length

  return (
    <main className="min-h-screen px-6 py-6 text-slate-950 sm:px-8 lg:px-12">
      <section className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="flex flex-col gap-5 rounded-3xl border border-emerald-900/10 bg-white/70 p-6 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">
              by GADX
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 md:text-6xl">
              World Cup Draw
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              A private fantasy tournament app for assigning national teams, tracking match results,
              and ranking players through a clean football-inspired dashboard.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-950 px-5 py-4 text-white shadow-lg">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-emerald-300">
              V1 Status
            </p>
            <p className="mt-2 text-2xl font-semibold">Local Prototype</p>
            <p className="mt-1 text-sm text-slate-300">Milestone 2.1</p>
          </div>
        </header>

        <nav className="flex flex-wrap gap-3 rounded-2xl border border-slate-900/10 bg-white/60 p-3 shadow-sm">
          {['Tournaments', 'Players', 'Teams', 'Draw', 'Leaderboard', 'Results', 'Rules'].map(
            (item) => (
              <button
                key={item}
                className="rounded-full border border-slate-900/10 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-700 hover:text-emerald-800"
                type="button"
              >
                {item}
              </button>
            ),
          )}
        </nav>

        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-900/10 bg-white/75 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Tournament
            </p>
            <p className="mt-2 text-xl font-semibold text-slate-950">{activeTournament.name}</p>
          </div>

          <div className="rounded-2xl border border-slate-900/10 bg-white/75 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Players
            </p>
            <p className="mt-2 text-xl font-semibold text-slate-950">
              {drawReadiness.playerCount} / 6
            </p>
          </div>

          <div className="rounded-2xl border border-slate-900/10 bg-white/75 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Eligible Teams
            </p>
            <p className="mt-2 text-xl font-semibold text-slate-950">
              {drawReadiness.eligibleTeamCount}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-900/10 bg-white/75 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Scheduled Matches
            </p>
            <p className="mt-2 text-xl font-semibold text-slate-950">{scheduledMatchCount}</p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
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
                {tournamentPlayers.map((player) => {
                  const playerAssignments = demoAssignments.filter(
                    (assignment) => assignment.playerId === player.id,
                  )

                  return (
                    <div key={player.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                      <p className="font-semibold">{player.displayName}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {playerAssignments.map((assignment) => {
                          const team = mockTeams.find((item) => item.id === assignment.teamId)

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
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-3xl bg-slate-950 p-8 text-white shadow-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">
              Admin Console
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">
              Create tournaments, control access, run fair draws.
            </h2>
            <p className="mt-4 max-w-2xl leading-7 text-slate-300">
              The admin experience will manage tournament setup, eligible teams, draw locking,
              invitations, match results, scoring rules, and audit controls.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {adminSections.map((section) => (
                <div
                  key={section.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200">
                    Admin
                  </span>
                  <h3 className="mt-4 text-lg font-semibold">{section.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{section.description}</p>
                </div>
              ))}
            </div>
          </article>

          <aside className="rounded-3xl border border-slate-900/10 bg-white/75 p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">
              Viewer Mode
            </p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">
              Players only see what they need.
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              Invited users will access assigned tournaments in read-only mode: teams, points,
              results, progress, and rankings.
            </p>

            <div className="mt-6 space-y-4">
              {viewerSections.map((section) => (
                <div
                  key={section.title}
                  className="rounded-2xl border border-slate-900/10 bg-white p-5"
                >
                  <h3 className="font-semibold text-slate-950">{section.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{section.description}</p>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <footer className="flex flex-col gap-2 border-t border-slate-900/10 py-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>GADX World Cup Draw — Private Fantasy Tournament App</p>
          <p>React · TypeScript · Vite · Tailwind · Cloudflare-ready</p>
        </footer>
      </section>
    </main>
  )
}

export default App