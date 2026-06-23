import type { AppSection } from '../types/domain'

interface FeatureSectionsProps {
  adminSections: AppSection[]
  viewerSections: AppSection[]
}

export function FeatureSections({ adminSections, viewerSections }: FeatureSectionsProps) {
  return (
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
  )
}