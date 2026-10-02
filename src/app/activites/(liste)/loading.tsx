/** Squelette affiché pendant le chargement de la liste des activités. */
export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6" aria-busy="true" aria-label="Chargement des activités">
      <div className="mb-10 space-y-4">
        <div className="h-6 w-32 animate-pulse rounded-full bg-paper-deep" />
        <div className="h-14 w-80 animate-pulse rounded-2xl bg-paper-deep" />
      </div>
      <div className="mb-10 h-[4.5rem] animate-pulse rounded-[2rem] border-2 border-ink/10 bg-paper-deep" />
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="overflow-hidden rounded-[2rem] border-2 border-ink/15 bg-card">
            <div className="h-40 animate-pulse bg-paper-deep" />
            <div className="space-y-3 p-5">
              <div className="h-4 w-20 animate-pulse rounded-full bg-paper-deep" />
              <div className="h-6 w-3/4 animate-pulse rounded-lg bg-paper-deep" />
              <div className="h-4 w-1/2 animate-pulse rounded-full bg-paper-deep" />
              <div className="mt-6 h-3 animate-pulse rounded-full bg-paper-deep" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
