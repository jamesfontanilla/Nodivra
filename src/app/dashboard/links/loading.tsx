export default function LinksLoading() {
  return (
    <div className="max-w-2xl space-y-6 animate-pulse">
      <div>
        <div className="h-8 bg-muted rounded w-24" />
        <div className="h-4 bg-muted rounded w-48 mt-2" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 bg-muted rounded-lg" />
        ))}
      </div>
    </div>
  );
}
