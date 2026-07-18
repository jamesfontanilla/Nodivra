import { Panel, Button, Badge } from "@/components/ui";
import { ArrowUpRightIcon } from "@/components/icons";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <Panel tone="dark">
        <div className="space-y-5">
          <Badge tone="muted">Not found</Badge>
          <div className="space-y-3">
            <h1 className="font-display text-4xl tracking-tight text-sand-50">
              We could not find that public profile.
            </h1>
            <p className="max-w-xl text-sm leading-7 text-sand-200/80">
              The handle may be unpublished, reserved, or spelled differently. You can open the demo profile or jump to the dashboard.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button href="/" variant="secondary">
              Back home
            </Button>
            <Button href="/u/nodivra" trailingIcon={<ArrowUpRightIcon className="h-3.5 w-3.5" />}>
              Open demo page
            </Button>
          </div>
        </div>
      </Panel>
    </main>
  );
}
