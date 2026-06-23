interface AppHeaderProps {
  milestone: string
}

export function AppHeader({ milestone }: AppHeaderProps) {
  return (
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
        <p className="mt-1 text-sm text-slate-300">{milestone}</p>
      </div>
    </header>
  )
}