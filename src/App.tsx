import { adminSections, viewerSections } from './data/appSections'
import { mockMatches } from './data/mockMatches'
import { mockPlayers } from './data/mockPlayers'
import { mockTeams } from './data/mockTeams'
import { mockTournaments } from './data/mockTournaments'

function App() {
  const activeTournament = mockTournaments[0]
  const playerCount = mockPlayers.filter(
    (player) => player.tournamentId === activeTournament.id,
  ).length
  const activeTeamCount = mockTeams.filter((team) => team.tournamentStatus === 'active').length
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
            <p className="mt-1 text-sm text-slate-300">Milestone 2 Prep</p>
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
            <p className="mt-2 text-xl font-semibold text-slate-950">{playerCount} / 6</p>
          </div>

          <div className="rounded-2xl border border-slate-900/10 bg-white/75 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Active Teams
            </p>
            <p className="mt-2 text-xl font-semibold text-slate-950">{activeTeamCount}</p>
          </div>

          <div className="rounded-2xl border border-slate-900/10 bg-white/75 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Scheduled Matches
            </p>
            <p className="mt-2 text-xl font-semibold text-slate-950">{scheduledMatchCount}</p>
          </div>
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