"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

interface DashboardNavProps {
  userEmail: string;
}

const navLinks: Array<{ href: Route; label: string }> = [
  { href: "/dashboard", label: "Page" },
  { href: "/dashboard/links", label: "Links" },
  { href: "/dashboard/blocks", label: "Blocks" },
  { href: "/dashboard/preview", label: "Preview" },
  { href: "/dashboard/settings", label: "Settings" },
];

export function DashboardNav({ userEmail }: DashboardNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      {/* Floating pill nav — detached from top */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-3xl">
        <nav className="glass-panel rounded-full px-3 py-2 flex items-center justify-between backdrop-blur-2xl">
          <div className="flex items-center gap-1">
            <Link
              href={"/dashboard" as Route}
              className="font-bold text-sm px-3 py-1.5 bg-gradient-to-r from-violet-600 to-cyan-500 dark:from-violet-400 dark:to-cyan-300 bg-clip-text text-transparent"
            >
              Nodivra
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]",
                    pathname === link.href
                      ? "bg-foreground/8 dark:bg-white/10 text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-foreground/5 dark:hover:bg-white/5"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden lg:block text-[11px] text-muted-foreground truncate max-w-[140px]">
              {userEmail}
            </span>
            <ThemeToggle />
            <button
              onClick={handleSignOut}
              className="hidden md:block text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-foreground/5 dark:hover:bg-white/5"
            >
              Sign out
            </button>

            {/* Hamburger — morphing lines */}
            <button
              className="md:hidden relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-foreground/5 dark:hover:bg-white/5 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation"
            >
              <span
                className={cn(
                  "absolute w-4 h-[1.5px] bg-foreground rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
                  mobileOpen ? "rotate-45 translate-y-0" : "-translate-y-1"
                )}
              />
              <span
                className={cn(
                  "absolute w-4 h-[1.5px] bg-foreground rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
                  mobileOpen ? "-rotate-45 translate-y-0" : "translate-y-1"
                )}
              />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile full-screen overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 md:hidden backdrop-blur-3xl bg-background/90 dark:bg-background/95 flex flex-col items-center justify-center">
          <nav className="space-y-2 text-center">
            {navLinks.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block text-2xl font-medium py-3 animate-fade-up opacity-0",
                  pathname === link.href
                    ? "text-foreground"
                    : "text-muted-foreground",
                  i === 0 && "delay-1",
                  i === 1 && "delay-2",
                  i === 2 && "delay-3",
                  i === 3 && "delay-4"
                )}
                style={{ animationFillMode: "forwards" }}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-8 animate-fade-up delay-5 opacity-0" style={{ animationFillMode: "forwards" }}>
              <p className="text-xs text-muted-foreground mb-3">{userEmail}</p>
              <button
                onClick={handleSignOut}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-500"
              >
                Sign out
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* Spacer for floating nav */}
      <div className="h-24" />
    </>
  );
}
