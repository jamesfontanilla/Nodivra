export default function ProfileLoading() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 py-12 animate-pulse">
        <div className="glass-strong rounded-2xl p-8 space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-24 w-24 rounded-full bg-white/20 dark:bg-white/5" />
            <div className="h-6 bg-white/20 dark:bg-white/5 rounded-lg w-40" />
            <div className="h-4 bg-white/20 dark:bg-white/5 rounded-lg w-60" />
          </div>
          <div className="h-4 bg-white/20 dark:bg-white/5 rounded-lg w-full" />
        </div>
        <div className="space-y-3">
          <div className="h-14 glass rounded-xl" />
          <div className="h-14 glass rounded-xl" />
          <div className="h-14 glass rounded-xl" />
        </div>
      </div>
    </main>
  );
}
