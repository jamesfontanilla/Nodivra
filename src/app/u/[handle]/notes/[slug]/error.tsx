"use client";

import { Button, Panel } from "@/components/ui";

export default function NoteError({ reset }: { reset: () => void }) {
  return <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8 sm:px-6"><Panel tone="dark"><div className="space-y-4"><p className="text-xs uppercase tracking-[0.2em] text-sand-300/70">Published note</p><h1 className="font-display text-4xl tracking-tight text-sand-50">This note could not load.</h1><p className="text-sm leading-7 text-sand-200/80">Try again in a moment. Published writing remains unchanged while this page recovers.</p><Button type="button" variant="secondary" onClick={reset}>Try again</Button></div></Panel></main>;
}
