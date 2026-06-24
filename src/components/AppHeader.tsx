interface AppHeaderProps {
  milestone: string
}

export function AppHeader({ milestone }: AppHeaderProps) {
  return (
    <header className="overflow-hidden rounded-[2rem] bg-slate-200 shadow-sm">
      <div className="relative isolate min-h-[20rem] overflow-hidden rounded-[2rem] px-8 py-8 sm:px-10 lg:px-12">
        <div className="absolute inset-y-0 left-0 -z-10 w-2/3 rounded-r-full bg-emerald-700/90" />
        <div className="absolute inset-0 -z-20 bg-slate-200" />

        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.45em] text-emerald-800">
              By GADX
            </p>

            <h1 className="mt-6 text-6xl font-semibold tracking-tight text-slate-950 sm:text-7xl lg:text-8xl">
              World Cup
              <br />
              Draw
            </h1>

            <p className="mt-8 max-w-3xl text-lg leading-8 text-slate-600 sm:text-xl">
              A private fantasy tournament app for assigning national teams, tracking match
              results, and ranking players through a clean football-inspired dashboard.
            </p>
          </div>

          <div className="w-fit rounded-3xl bg-slate-950 px-8 py-7 text-white shadow-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300">
              V1 Status
            </p>
            <p className="mt-4 text-2xl font-semibold leading-tight">Production Preview</p>
            <p className="mt-2 text-sm text-slate-300">{milestone}</p>
          </div>
        </div>
      </div>
    </header>
  )
}