export function AdminGuidePanel() {
  return (
    <article className="rounded-3xl border border-slate-900/10 bg-white/80 p-6 shadow-sm">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">
          Admin Guide
        </p>

        <h2 className="text-2xl font-semibold tracking-tight">
          How to operate this tournament
        </h2>

        <p className="max-w-4xl text-sm leading-6 text-slate-600">
          Use this guide before running a test with players. The public viewer page is read-only;
          all setup and result management should happen from this protected admin view.
        </p>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-900/10 bg-slate-50 p-5">
          <h3 className="text-base font-semibold">1. Before sharing the public link</h3>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-600">
            <li>Open the protected admin URL.</li>
            <li>Confirm the tournament name and round dates.</li>
            <li>Confirm the 6 player names are correct.</li>
            <li>Confirm the eligible teams match the intended test round.</li>
            <li>Do not share the protected admin URL with players.</li>
          </ol>
        </section>

        <section className="rounded-2xl border border-slate-900/10 bg-slate-50 p-5">
          <h3 className="text-base font-semibold">2. How to run the draw</h3>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-600">
            <li>Go to the Draw Control section.</li>
            <li>Click Run Draw to generate a temporary draft.</li>
            <li>Review the player-to-team assignments.</li>
            <li>Click Save &amp; Lock Draw when the draft looks correct.</li>
            <li>Refresh the page and confirm the locked draw is still visible.</li>
          </ol>
        </section>

        <section className="rounded-2xl border border-slate-900/10 bg-slate-50 p-5">
          <h3 className="text-base font-semibold">3. What players can see</h3>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-600">
            <li>Players should open only the public viewer URL.</li>
            <li>They can see the leaderboard, assigned teams, and match results.</li>
            <li>They cannot edit players, results, tournament setup, or draw controls.</li>
            <li>If the draw is not locked yet, they will see a draw pending message.</li>
          </ol>
        </section>

        <section className="rounded-2xl border border-slate-900/10 bg-slate-50 p-5">
          <h3 className="text-base font-semibold">4. How to update results</h3>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-600">
            <li>Use the Match Admin section from the protected admin view.</li>
            <li>Update match status and scores as results become available.</li>
            <li>The leaderboard will recalculate automatically.</li>
            <li>Results can still be edited after the draw is locked.</li>
          </ol>
        </section>
      </div>

      <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <h3 className="text-base font-semibold text-amber-950">Current limitations</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-amber-900">
          <li>This version supports one active tournament from the UI.</li>
          <li>Creating a second tournament is not available from the admin view yet.</li>
          <li>Player invitations are not managed inside the app yet.</li>
          <li>The public viewer is open, but admin writes should be further protected at API level in a later version.</li>
          <li>The protected admin route is temporarily using the known-working Cloudflare Access pattern for the current test version.</li>
        </ul>
      </div>

      <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <h3 className="text-base font-semibold text-emerald-950">Links to use</h3>
        <div className="mt-3 grid gap-3 text-sm leading-6 text-emerald-900">
          <div>
            <span className="font-semibold">Public viewer:</span>{' '}
            https://gadx-worldcup-fantasy.pages.dev/
          </div>
          <div>
            <span className="font-semibold">Protected admin view:</span>{' '}
            https://gadx-worldcup-fantasy.pages.dev/admin
          </div>
        </div>
      </div>
    </article>
  )
}