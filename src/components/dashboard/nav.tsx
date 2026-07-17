"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardNavProps {
  userEmail: string;
}

const navLinks = [
  { href: "/dashboard", label: "Page" },
  { href: "/dashboard/links", label: "Links" },
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
    <header className="sticky top-0 z-50 glass-strong border-b border-white/10 dark:border-white/5">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="font-bold text-lg bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-400 dark:to-blue-300 bg-clip-text text-transparent"
          >
            Nodivra
          </Link>
          <nav className="hidden sm:flex items-center gap-1 text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-1.5 rounded-full transition-all",
                  pathname === link.href
                    ? "glass text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/10"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden sm:block">
            {userEmail}
          </span>
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="hidden sm:inline-flex rounded-full"
          >
            Sign out
          </Button>
          <button
            className="sm:hidden p-2 rounded-full hover:bg-white/10"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="sm:hidden glass-strong border-t border-white/10 px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "block py-2 px-3 rounded-lg text-sm transition-colors",
                pathname === link.href
                  ? "glass text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-white/10 mt-2">
            <p className="text-xs text-muted-foreground mb-2 px-3">
              {userEmail}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="w-full justify-start rounded-lg"
            >
              Sign out
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
