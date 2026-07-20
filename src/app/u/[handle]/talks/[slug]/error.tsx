"use client";

import { Panel } from "@/components/ui";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8"><Panel tone="dark"><div className="space-y-4"><p className="text-xs uppercase tracking-[0.2em] text-sand-300/70">Talk detail</p><h1 className="font-display text-4xl tracking-tight text-sand-50">This talk is temporarily out of reach.</h1><p className="text-sm leading-7 text-sand-200/80">Try again. The public snapshot remains unchanged while the page reloads.</p><button type="button" onClick={() => reset()} className="rounded-full bg-sand-100 px-5 py-2.5 text-sm font-medium text-ink-950">Try again</button></div></Panel></main>;
}
