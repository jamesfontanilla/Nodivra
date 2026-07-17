"use client";

import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  function cycleTheme() {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  }

  return (
    <button
      onClick={cycleTheme}
      aria-label="Toggle theme"
      className="relative h-8 w-8 rounded-full flex items-center justify-center ring-1 ring-black/5 dark:ring-white/8 bg-white/50 dark:bg-white/5 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:ring-black/10 dark:hover:ring-white/15 active:scale-[0.92]"
    >
      {/* Sun */}
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        className="absolute stroke-current stroke-[1.5] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] rotate-0 scale-100 dark:-rotate-90 dark:scale-0"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
      {/* Moon */}
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        className="absolute stroke-current stroke-[1.5] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] rotate-90 scale-0 dark:rotate-0 dark:scale-100"
      >
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
      </svg>
    </button>
  );
}
