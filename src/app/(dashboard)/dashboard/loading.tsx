import { Panel } from "@/components/ui";

export default function DashboardLoading() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <Panel tone="dark">
          <div className="space-y-4">
            <div className="h-4 w-32 rounded-full bg-white/10" />
            <div className="h-10 w-3/4 rounded-2xl bg-white/10" />
            <div className="h-20 w-full rounded-[1.5rem] bg-white/10" />
          </div>
        </Panel>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
          <div className="space-y-6">
            <Panel tone="dark">
              <div className="space-y-4">
                <div className="h-5 w-40 rounded-full bg-white/10" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="h-28 rounded-[1.35rem] bg-white/10" />
                  <div className="h-28 rounded-[1.35rem] bg-white/10" />
                  <div className="h-28 rounded-[1.35rem] bg-white/10" />
                  <div className="h-28 rounded-[1.35rem] bg-white/10" />
                </div>
              </div>
            </Panel>
          </div>
          <Panel tone="dark">
            <div className="h-[520px] rounded-[2rem] bg-white/10" />
          </Panel>
        </div>
      </div>
    </main>
  );
}
