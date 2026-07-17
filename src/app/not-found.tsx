import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative min-h-[100dvh] flex flex-col items-center justify-center px-4 py-24 overflow-hidden">
      <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] rounded-full bg-violet-500/6 dark:bg-violet-500/10 blur-[120px]" />

      <div className="relative z-10 animate-fade-up">
        <div className="bezel-outer">
          <div className="bezel-inner p-10 md:p-14 text-center space-y-6">
            <span className="inline-block rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-primary/10 text-primary">
              Not Found
            </span>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter bg-gradient-to-br from-foreground via-foreground/60 to-foreground/30 bg-clip-text text-transparent">
              404
            </h1>
            <p className="text-muted-foreground max-w-xs mx-auto">
              This page could not be found.
            </p>
            <Link
              href="/"
              className="group inline-flex items-center gap-3 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_8px_30px_-4px_rgba(124,58,237,0.3)] active:scale-[0.98]"
            >
              <span>Go home</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:scale-105">
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="stroke-current stroke-[1.5]">
                  <path d="M2 10L10 2M10 2H4M10 2V8" />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
