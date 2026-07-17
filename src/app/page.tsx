import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function HomePage() {
  return (
    <main className="relative min-h-[100dvh] flex flex-col items-center justify-center px-4 py-24 md:py-40 overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute top-[-25%] left-[-15%] w-[700px] h-[700px] rounded-full bg-violet-500/10 dark:bg-violet-500/15 blur-[120px]" />
      <div className="absolute bottom-[-25%] right-[-15%] w-[600px] h-[600px] rounded-full bg-cyan-400/8 dark:bg-cyan-400/10 blur-[100px]" />

      {/* Theme toggle */}
      <div className="fixed top-6 right-6 z-40">
        <ThemeToggle />
      </div>

      {/* Hero — Double-Bezel */}
      <div className="relative z-10 w-full max-w-xl animate-fade-up">
        <div className="bezel-outer">
          <div className="bezel-inner p-10 md:p-16 space-y-10 text-center">
            {/* Eyebrow */}
            <span className="inline-block rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary">
              Developer Identity Platform
            </span>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-br from-foreground via-foreground/80 to-foreground/50 bg-clip-text text-transparent leading-[1.05]">
              Nodivra
            </h1>

            {/* Subtitle */}
            <p className="text-base md:text-lg text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Your developer identity in one link. Showcase your work, projects,
              and availability — beautifully.
            </p>

            {/* CTAs — Button-in-Button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                href="/signup"
                className="group relative inline-flex items-center justify-center gap-3 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_8px_30px_-4px_rgba(124,58,237,0.35)] active:scale-[0.98]"
              >
                <span>Get Started</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="stroke-current stroke-[1.5]">
                    <path d="M2 10L10 2M10 2H4M10 2V8" />
                  </svg>
                </span>
              </Link>

              <Link
                href="/login"
                className="group inline-flex items-center justify-center gap-3 rounded-full px-6 py-3.5 text-sm font-medium ring-1 ring-black/8 dark:ring-white/10 bg-white/50 dark:bg-white/5 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:ring-black/15 dark:hover:ring-white/20 hover:bg-white/80 dark:hover:bg-white/10 active:scale-[0.98]"
              >
                <span>Sign In</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
