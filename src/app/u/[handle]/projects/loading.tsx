export default function PublicProjectsLoading() {
  return (
    <main className="min-h-[100dvh] px-4 py-20 md:px-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 animate-pulse">
        <div className="space-y-3">
          <div className="h-4 w-40 rounded-full bg-foreground/5 dark:bg-white/5" />
          <div className="h-10 w-80 max-w-full rounded-lg bg-foreground/5 dark:bg-white/5" />
          <div className="h-4 w-96 max-w-full rounded-lg bg-foreground/5 dark:bg-white/5" />
        </div>
        <div className="bezel-outer">
          <div className="bezel-inner h-24 p-5" />
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bezel-outer">
              <div className="bezel-inner h-80 p-5" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
