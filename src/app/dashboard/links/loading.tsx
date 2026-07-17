export default function LinksLoading() {
  return (
    <div className="max-w-2xl space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 bg-foreground/5 dark:bg-white/5 rounded-lg w-24" />
        <div className="h-4 bg-foreground/5 dark:bg-white/5 rounded-lg w-52" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bezel-outer">
            <div className="bezel-inner p-5 h-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
