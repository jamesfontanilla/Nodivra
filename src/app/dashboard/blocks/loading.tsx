export default function BlocksLoading() {
  return (
    <div className="max-w-3xl space-y-10 animate-pulse">
      <div className="space-y-2">
        <div className="h-5 w-24 bg-foreground/5 dark:bg-white/5 rounded-full" />
        <div className="h-8 w-32 bg-foreground/5 dark:bg-white/5 rounded-lg" />
        <div className="h-4 w-64 bg-foreground/5 dark:bg-white/5 rounded-lg" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bezel-outer">
            <div className="bezel-inner p-6 h-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
