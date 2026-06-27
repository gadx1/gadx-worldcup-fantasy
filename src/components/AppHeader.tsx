interface AppHeaderProps {
  milestone: string
}

export function AppHeader({ milestone }: AppHeaderProps) {
  return (
    <header className="relative isolate overflow-hidden rounded-[2rem] bg-[var(--pitch-900)] shadow-xl">
      {/* Pitch markings: a faint center circle and chalk lines drawn with CSS,
          evoking a football pitch without any heavy imagery. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.14]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 82% 30%, transparent 7.5rem, var(--lime-400) 7.5rem, var(--lime-400) calc(7.5rem + 2px), transparent calc(7.5rem + 2px)), linear-gradient(90deg, transparent calc(50% - 1px), var(--lime-400) 50%, transparent calc(50% + 1px))',
        }}
      />
      {/* Soft lime glow in the corner. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full bg-[var(--lime-400)]/20 blur-3xl"
      />

      <div className="px-7 py-10 sm:px-10 lg:px-14 lg:py-14">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.45em] text-[var(--lime-400)]">
                GADX
              </span>
              <span className="h-px w-8 bg-[var(--lime-400)]/50" />
              <span className="text-xs font-medium uppercase tracking-[0.3em] text-emerald-100/70">
                Private league
              </span>
            </div>

            <h1 className="font-display mt-6 text-6xl font-bold uppercase leading-[0.92] tracking-tight text-bone-50 text-[var(--bone-50)] sm:text-7xl lg:text-8xl">
              World Cup
              <br />
              <span className="text-[var(--lime-400)]">Draw</span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-7 text-emerald-50/80 sm:text-lg">
              Draw national teams to your friends, lock the picks, and let the leaderboard settle
              who got the bragging rights.
            </p>
          </div>

          <div className="w-fit rounded-3xl border border-[var(--lime-400)]/25 bg-black/20 px-7 py-6 backdrop-blur-sm">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-[var(--lime-400)]">
              Build
            </p>
            <p className="font-display mt-3 text-2xl font-bold uppercase leading-tight text-[var(--bone-50)]">
              Production Preview
            </p>
            <p className="mt-1 text-sm text-emerald-100/60">{milestone}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
