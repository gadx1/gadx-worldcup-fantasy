export function DataSourcePanel() {
  return (
    <article className="rounded-3xl border border-emerald-900/10 bg-emerald-50/70 p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-800">
            Data Source
          </p>

          <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
            Cloudflare D1 is the source of truth.
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Tournament, players, matches, scoring rules, teams, and locked draw data are loaded from
            the production Worker API backed by Cloudflare D1. Local storage is only used as a
            fallback during development and for temporary draft draws before they are saved.
          </p>
        </div>

        <span className="w-fit rounded-full bg-white px-4 py-2 text-sm font-semibold text-emerald-800 shadow-sm">
          D1 Enabled
        </span>
      </div>
    </article>
  )
}