export default function ProfileLoading() {
  return (
    <main className="relative min-h-[100dvh] flex items-center justify-center px-4 py-24 md:py-40">
      <div className="w-full max-w-md space-y-8 animate-pulse">
        <div className="bezel-outer">
          <div className="bezel-inner p-8 md:p-10 space-y-8">
            <div className="flex flex-col items-center space-y-5">
              <div className="h-24 w-24 rounded-full bg-foreground/5 dark:bg-white/5" />
              <div className="h-7 bg-foreground/5 dark:bg-white/5 rounded-lg w-40" />
              <div className="h-4 bg-foreground/5 dark:bg-white/5 rounded-lg w-56" />
            </div>
            <div className="h-4 bg-foreground/5 dark:bg-white/5 rounded-lg w-full" />
            <div className="h-12 bg-foreground/5 dark:bg-white/5 rounded-full" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-16 bg-foreground/3 dark:bg-white/3 rounded-2xl" />
          <div className="h-16 bg-foreground/3 dark:bg-white/3 rounded-2xl" />
          <div className="h-16 bg-foreground/3 dark:bg-white/3 rounded-2xl" />
        </div>
      </div>
    </main>
  );
}
