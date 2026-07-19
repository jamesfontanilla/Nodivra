import { Panel } from "@/components/ui";

export default function PublicProjectsLoading() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <Panel tone="dark">
          <div className="space-y-5">
            <div className="h-5 w-40 rounded-full bg-white/10" />
            <div className="h-20 w-4/5 rounded-2xl bg-white/10" />
            <div className="h-12 w-full max-w-md rounded-full bg-white/10" />
          </div>
        </Panel>
        <div className="grid gap-5 md:grid-cols-2">
          {[0, 1, 2, 3].map((item) => <div key={item} className="h-96 rounded-[2rem] bg-white/5 ring-1 ring-white/10" />)}
        </div>
      </div>
    </main>
  );
}
