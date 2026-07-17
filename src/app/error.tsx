"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 text-center relative overflow-hidden">
      <div className="absolute bottom-[-20%] right-[20%] w-[400px] h-[400px] rounded-full bg-red-400/10 dark:bg-red-600/5 blur-3xl" />
      <div className="relative z-10 glass-strong rounded-2xl p-10 space-y-4">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="text-muted-foreground">
          {error.message || "An unexpected error occurred."}
        </p>
        <Button onClick={reset} className="rounded-full">
          Try again
        </Button>
      </div>
    </main>
  );
}
