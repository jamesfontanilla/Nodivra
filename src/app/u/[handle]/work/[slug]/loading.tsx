import { Panel } from "@/components/ui";

export default function Loading() {
  return <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8"><Panel tone="dark"><div className="space-y-6"><div className="h-3 w-32 animate-pulse rounded-full bg-white/10" /><div className="h-20 max-w-3xl animate-pulse rounded-2xl bg-white/10" /><div className="h-36 animate-pulse rounded-[1.5rem] bg-white/5" /></div></Panel></main>;
}
