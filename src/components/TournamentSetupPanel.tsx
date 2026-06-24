import type { ResultsMode, Tournament } from '../types/domain'

interface TournamentSetupPanelProps {
  isLocked: boolean
  isReadOnly?: boolean
  onResetTournament: () => void
  onUpdateTournament: (updates: Partial<Tournament>) => void
  readOnlyReason?: string
  statusLabel?: string
  tournament: Tournament
}

function toDateTimeLocalValue(dateIso: string) {
  const date = new Date(dateIso)
  const offsetMs = date.getTimezoneOffset() * 60 * 1000
  const localDate = new Date(date.getTime() - offsetMs)

  return localDate.toISOString().slice(0, 16)
}

function fromDateTimeLocalValue(value: string) {
  return new Date(value).toISOString()
}

export function TournamentSetupPanel({
  tournament,
  isLocked,
  isReadOnly = false,
  onUpdateTournament,
  onResetTournament,
  readOnlyReason,
  statusLabel,
}: TournamentSetupPanelProps) {
  const isDisabled = isLocked || isReadOnly
  const visibleStatusLabel = statusLabel ?? (isLocked ? 'Locked' : 'Editable')

  return (
    <article className="rounded-3xl border border-slate-900/10 bg-white/80 p-8 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">
            Tournament Setup
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">
            Configure the active tournament.
          </h2>
          <p className="mt-4 max-w-2xl leading-7 text-slate-600">
            Tournament dates define which national teams are eligible for the draw. Once the draw is
            saved and locked, tournament setup becomes read-only.
          </p>
        </div>

        <span
          className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${
            isDisabled ? 'bg-slate-950 text-white' : 'bg-emerald-100 text-emerald-800'
          }`}
        >
          {visibleStatusLabel}
        </span>
      </div>

      {isLocked && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
          Tournament editing is disabled because the draw has already been saved and locked. Use
          Reset Local Draw during development if you need to change the tournament setup.
        </div>
      )}

      {isReadOnly && readOnlyReason && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-700">
          {readOnlyReason}
        </div>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Tournament name
          <input
            className="rounded-xl border border-slate-900/10 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
            disabled={isDisabled}
            onChange={(event) =>
              onUpdateTournament({
                name: event.target.value,
              })
            }
            type="text"
            value={tournament.name}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Round name
          <input
            className="rounded-xl border border-slate-900/10 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
            disabled={isDisabled}
            onChange={(event) =>
              onUpdateTournament({
                roundName: event.target.value,
              })
            }
            type="text"
            value={tournament.roundName}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Round start date
          <input
            className="rounded-xl border border-slate-900/10 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
            disabled={isDisabled}
            onChange={(event) =>
              onUpdateTournament({
                roundStartDate: fromDateTimeLocalValue(event.target.value),
              })
            }
            type="datetime-local"
            value={toDateTimeLocalValue(tournament.roundStartDate)}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Round end date
          <input
            className="rounded-xl border border-slate-900/10 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
            disabled={isDisabled}
            onChange={(event) =>
              onUpdateTournament({
                roundEndDate: fromDateTimeLocalValue(event.target.value),
              })
            }
            type="datetime-local"
            value={toDateTimeLocalValue(tournament.roundEndDate)}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Results mode
          <select
            className="rounded-xl border border-slate-900/10 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
            disabled={isDisabled}
            onChange={(event) =>
              onUpdateTournament({
                resultsMode: event.target.value as ResultsMode,
              })
            }
            value={tournament.resultsMode}
          >
            <option value="manual">Manual</option>
            <option value="api">API-ready</option>
          </select>
        </label>

        <div className="flex items-end justify-start">
          <button
            className="rounded-full border border-slate-900/10 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-700 hover:text-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
            disabled={isDisabled}
            onClick={onResetTournament}
            type="button"
          >
            Reset Tournament
          </button>
        </div>
      </div>
    </article>
  )
}