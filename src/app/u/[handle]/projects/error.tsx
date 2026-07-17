"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toRoute } from "@/lib/routes";

export default function PublicProjectsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-[100dvh] px-4 py-20 md:px-6">
      <div className="mx-auto max-w-2xl">
        <div className="bezel-outer">
          <div className="bezel-inner space-y-4 p-8 text-center">
            <h2 className="text-lg font-semibold">Could not load projects</h2>
            <p className="text-sm text-muted-foreground">
              Try again or return to the profile page.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={() => reset()}>Retry</Button>
              <Button asChild variant="outline">
                <Link href={toRoute("/")}>Back</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
