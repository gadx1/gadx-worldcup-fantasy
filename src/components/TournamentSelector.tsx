import type { TournamentSummary } from '../hooks/useTournamentList'

interface TournamentSelectorProps {
  tournaments: TournamentSummary[]
  activeTournamentId: string
  isLoading: boolean
  onSelect: (tournamentId: string) => void
}

/**
 * Lets the admin switch the active tournament. Each tournament keeps its own
 * players, matches, scoring rules, and saved/locked draw on the backend, so
 * switching here changes every panel below to that tournament's data.
 */
export function TournamentSelector({
  tournaments,
  activeTournamentId,
  isLoading,
  onSelect,
}: TournamentSelectorProps) {
  return (
    <article className="rounded-3xl border border-pitch-900/10 bg-white/85 p-6 shadow-sm sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-pitch-700">
        Tournament
      </p>
      <div className="chalk-rule mt-3" />
      <h2 className="font-display mt-4 text-2xl font-bold uppercase tracking-tight text-ink-900 sm:text-3xl">
        Pick a tournament to manage
      </h2>
      <p className="mt-3 max-w-2xl leading-7 text-ink-600">
        Each tournament keeps its own players, fixtures, and locked draw. Switching here updates
        every panel below.
      </p>

      {isLoading ? (
        <p className="mt-6 text-sm font-medium text-ink-600">Loading tournaments…</p>
      ) : tournaments.length === 0 ? (
        <p className="mt-6 text-sm font-medium text-coral-500">
          No tournaments yet. Run the database migration to add them.
        </p>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {tournaments.map((tournament) => {
            const isActive = tournament.id === activeTournamentId

            return (
              <button
                key={tournament.id}
                type="button"
                onClick={() => onSelect(tournament.id)}
                aria-pressed={isActive}
                className={`group rounded-2xl border p-5 text-left transition ${
                  isActive
                    ? 'border-pitch-700 bg-pitch-900 shadow-md'
                    : 'border-pitch-900/10 bg-white hover:border-pitch-700 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p
                    className={`font-display text-lg font-bold uppercase tracking-tight ${
                      isActive ? 'text-bone-50' : 'text-ink-900'
                    }`}
                  >
                    {tournament.name}
                  </p>
                  {isActive && (
                    <span className="rounded-full bg-lime-400 px-3 py-1 text-xs font-bold uppercase tracking-wide text-pitch-900">
                      Active
                    </span>
                  )}
                </div>
                <p
                  className={`mt-2 text-sm ${
                    isActive ? 'text-emerald-50/80' : 'text-ink-600'
                  }`}
                >
                  {tournament.roundName}
                </p>
                <p
                  className={`mt-2 text-xs uppercase tracking-[0.18em] ${
                    isActive ? 'text-lime-300' : 'text-slate-400'
                  }`}
                >
                  {tournament.status}
                </p>
              </button>
            )
          })}
        </div>
      )}
    </article>
  )
}
