import { DashboardEditor } from "@/components/dashboard-editor";
import { ArrowUpRightIcon, SparkIcon } from "@/components/icons";
import { Button, Panel, Badge } from "@/components/ui";
import { getViewerContext, getWorkspaceSnapshot } from "@/lib/workspace";
import { siteName } from "@/lib/site";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const viewer = await getViewerContext();

  if (viewer.mode === "anonymous") {
    return (
      <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Panel tone="dark">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Badge tone="accent">Sign in required</Badge>
              <Badge tone="muted">{siteName}</Badge>
            </div>
            <div className="space-y-3">
              <h1 className="font-display text-4xl tracking-tight text-sand-50">
                Your dashboard is private.
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-sand-200/80">
                Please sign in before editing the workspace. Once you are authenticated, you can update the draft profile, preview it live, and publish the snapshot.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button href="/sign-in" trailingIcon={<ArrowUpRightIcon className="h-3.5 w-3.5" />}>
                Sign in
              </Button>
              <Button href="/sign-up" variant="secondary" trailingIcon={<SparkIcon className="h-3.5 w-3.5" />}>
                Create account
              </Button>
            </div>
          </div>
        </Panel>
      </main>
    );
  }

  const workspace = await getWorkspaceSnapshot(viewer);

  return (
    <main className="mx-auto min-h-screen w-full max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
      <DashboardEditor initialWorkspace={workspace} demoMode={viewer.mode === "demo"} />
    </main>
  );
}
