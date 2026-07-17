import Link from "next/link";

export default function ProfileNotFound() {
  return (
    <main className="relative min-h-[100dvh] flex flex-col items-center justify-center px-4 py-24 overflow-hidden">
      <div className="absolute top-[-20%] right-[10%] w-[400px] h-[400px] rounded-full bg-violet-500/6 dark:bg-violet-500/8 blur-[100px]" />

      <div className="relative z-10 animate-fade-up">
        <div className="bezel-outer">
          <div className="bezel-inner p-10 md:p-14 text-center space-y-6">
            <span className="inline-block rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-primary/10 text-primary">
              Not Found
            </span>
            <h1 className="text-2xl font-bold tracking-tight">
              Profile not found
            </h1>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              This page doesn&apos;t exist or hasn&apos;t been published yet.
            </p>
            <Link
              href="/"
              className="group inline-flex items-center gap-3 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_8px_30px_-4px_rgba(124,58,237,0.3)] active:scale-[0.98]"
            >
              <span>Back to home</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
