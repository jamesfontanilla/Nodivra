export default function ProfileLoading() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 py-12 animate-pulse">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-24 w-24 rounded-full bg-muted" />
          <div className="h-6 bg-muted rounded w-40" />
          <div className="h-4 bg-muted rounded w-60" />
        </div>
        <div className="h-4 bg-muted rounded w-full" />
        <div className="space-y-3">
          <div className="h-14 bg-muted rounded-xl" />
          <div className="h-14 bg-muted rounded-xl" />
          <div className="h-14 bg-muted rounded-xl" />
        </div>
      </div>
    </main>
  );
}
