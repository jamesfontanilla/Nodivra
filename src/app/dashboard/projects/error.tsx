"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ProjectsError({
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
    <div className="bezel-outer">
      <div className="bezel-inner space-y-4 p-8 text-center">
        <h2 className="text-lg font-semibold">We hit a snag loading projects</h2>
        <p className="text-sm text-muted-foreground">
          The project builder could not be loaded. Please try again.
        </p>
        <Button onClick={() => reset()}>Retry</Button>
      </div>
    </div>
  );
}
