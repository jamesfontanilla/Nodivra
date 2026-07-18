import { Panel } from "@/components/ui";

export default function PublicProfileLoading() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Panel tone="dark">
        <div className="space-y-4">
          <div className="h-6 w-32 rounded-full bg-white/10" />
          <div className="h-24 rounded-[2rem] bg-white/10" />
          <div className="grid gap-3 md:grid-cols-2">
            <div className="h-24 rounded-[1.5rem] bg-white/10" />
            <div className="h-24 rounded-[1.5rem] bg-white/10" />
          </div>
        </div>
      </Panel>
    </main>
  );
}
