export default function ProjectsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-5 w-24 rounded-full bg-foreground/5 dark:bg-white/5" />
        <div className="h-8 w-40 rounded-lg bg-foreground/5 dark:bg-white/5" />
        <div className="h-4 w-96 max-w-full rounded-lg bg-foreground/5 dark:bg-white/5" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bezel-outer">
              <div className="bezel-inner space-y-3 p-5">
                <div className="h-5 w-1/2 rounded-lg bg-foreground/5 dark:bg-white/5" />
                <div className="h-4 w-3/4 rounded-lg bg-foreground/5 dark:bg-white/5" />
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="h-10 rounded-2xl bg-foreground/5 dark:bg-white/5" />
                  <div className="h-10 rounded-2xl bg-foreground/5 dark:bg-white/5" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="bezel-outer">
          <div className="bezel-inner min-h-[420px] p-6" />
        </div>
      </div>
    </div>
  );
}
