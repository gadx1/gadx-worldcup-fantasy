import type { Player } from '../types/domain'

interface PlayerSetupPanelProps {
  players: Player[]
  isLocked: boolean
  onUpdatePlayer: (playerId: string, updates: Partial<Player>) => void
}

export function PlayerSetupPanel({ players, isLocked, onUpdatePlayer }: PlayerSetupPanelProps) {
  return (
    <article className="rounded-3xl border border-slate-900/10 bg-white/80 p-8 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">
            Player Setup
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">
            Configure tournament players.
          </h2>
          <p className="mt-4 max-w-2xl leading-7 text-slate-600">
            Edit player names and avatar identifiers before running the final locked draw.
            Once the draw is saved and locked, player setup becomes read-only for this tournament.
          </p>
        </div>

        <span
          className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${
            isLocked ? 'bg-slate-950 text-white' : 'bg-emerald-100 text-emerald-800'
          }`}
        >
          {isLocked ? 'Locked' : 'Editable'}
        </span>
      </div>

      {isLocked && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
          Player editing is disabled because the draw has already been saved and locked. Use
          Reset Local Draw during development if you need to change player setup.
        </div>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {players.map((player, index) => (
          <section
            key={player.id}
            className="rounded-2xl border border-slate-900/10 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Player {index + 1}
                </p>
                <p className="mt-1 font-semibold text-slate-950">{player.displayName}</p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-sm font-semibold text-emerald-800">
                {player.avatarId.replace('avatar-', 'A')}
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                First name
                <input
                  className="rounded-xl border border-slate-900/10 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                  disabled={isLocked}
                  onChange={(event) =>
                    onUpdatePlayer(player.id, {
                      firstName: event.target.value,
                    })
                  }
                  type="text"
                  value={player.firstName}
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Last name
                <input
                  className="rounded-xl border border-slate-900/10 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                  disabled={isLocked}
                  onChange={(event) =>
                    onUpdatePlayer(player.id, {
                      lastName: event.target.value,
                    })
                  }
                  type="text"
                  value={player.lastName}
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Display name
                <input
                  className="rounded-xl border border-slate-900/10 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                  disabled={isLocked}
                  onChange={(event) =>
                    onUpdatePlayer(player.id, {
                      displayName: event.target.value,
                    })
                  }
                  type="text"
                  value={player.displayName}
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Avatar ID
                <select
                  className="rounded-xl border border-slate-900/10 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                  disabled={isLocked}
                  onChange={(event) =>
                    onUpdatePlayer(player.id, {
                      avatarId: event.target.value,
                    })
                  }
                  value={player.avatarId}
                >
                  <option value="avatar-01">avatar-01</option>
                  <option value="avatar-02">avatar-02</option>
                  <option value="avatar-03">avatar-03</option>
                  <option value="avatar-04">avatar-04</option>
                  <option value="avatar-05">avatar-05</option>
                  <option value="avatar-06">avatar-06</option>
                </select>
              </label>
            </div>
          </section>
        ))}
      </div>
    </article>
  )
}