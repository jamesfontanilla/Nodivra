export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-pulse space-y-4 w-full max-w-md">
        <div className="h-8 bg-white/20 dark:bg-white/5 rounded-lg w-1/3" />
        <div className="h-4 bg-white/20 dark:bg-white/5 rounded-lg w-2/3" />
        <div className="space-y-3 pt-4">
          <div className="h-10 bg-white/20 dark:bg-white/5 rounded-lg" />
          <div className="h-10 bg-white/20 dark:bg-white/5 rounded-lg" />
          <div className="h-24 bg-white/20 dark:bg-white/5 rounded-lg" />
          <div className="h-10 bg-white/20 dark:bg-white/5 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
