import { Panel } from "@/components/ui";

export default function PublicProjectLoading() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Panel tone="dark">
        <div className="space-y-5">
          <div className="h-6 w-32 rounded-full bg-white/10" />
          <div className="h-20 w-4/5 rounded-2xl bg-white/10" />
          <div className="h-48 rounded-[1.5rem] bg-white/10" />
          <div className="space-y-3">
            <div className="h-5 w-full rounded-full bg-white/10" />
            <div className="h-5 w-5/6 rounded-full bg-white/10" />
            <div className="h-5 w-2/3 rounded-full bg-white/10" />
          </div>
        </div>
      </Panel>
    </main>
  );
}
