"use client";

import { Button, Panel } from "@/components/ui";

export default function PublicProjectsError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Panel tone="dark">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.2em] text-sand-300/70">Project archive</p>
          <h1 className="font-display text-4xl tracking-tight text-sand-50">The archive could not load.</h1>
          <p className="max-w-xl text-sm leading-7 text-sand-200/80">Try again in a moment. Published work remains unchanged while this page recovers.</p>
          <Button type="button" variant="secondary" onClick={reset}>Try again</Button>
        </div>
      </Panel>
    </main>
  );
}
