export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md space-y-6 animate-pulse">
        <div className="bezel-outer">
          <div className="bezel-inner p-8 space-y-5">
            <div className="h-6 bg-foreground/5 dark:bg-white/5 rounded-lg w-1/3" />
            <div className="h-4 bg-foreground/5 dark:bg-white/5 rounded-lg w-2/3" />
            <div className="space-y-3 pt-4">
              <div className="h-11 bg-foreground/5 dark:bg-white/5 rounded-xl" />
              <div className="h-11 bg-foreground/5 dark:bg-white/5 rounded-xl" />
              <div className="h-24 bg-foreground/5 dark:bg-white/5 rounded-xl" />
              <div className="h-11 bg-foreground/5 dark:bg-white/5 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
