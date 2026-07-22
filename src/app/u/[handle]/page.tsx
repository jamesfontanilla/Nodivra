import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicProfileCard } from "@/components/public-profile-card";
import { PublicBlocks } from "@/components/public-blocks";
import { PublicProjects } from "@/components/project-detail";
import { PublicRepositories } from "@/components/repository-detail";
import { PublicStack } from "@/components/stack-detail";
import { PublicPath } from "@/components/path-detail";
import { PublicNotes } from "@/components/note-detail";
import { PublicTalks } from "@/components/talk-detail";
import { PublicSnippets } from "@/components/snip-detail";
import { PublicWork } from "@/components/work-detail";
import { Reveal } from "@/components/reveal";
import { Badge, Panel } from "@/components/ui";
import { buildPublicProfileMetadata } from "@/lib/metadata";
import { getPublicProfile } from "@/lib/workspace";
import { siteName } from "@/lib/site";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const profile = await getPublicProfile(handle);
  return buildPublicProfileMetadata(profile, handle);
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const profile = await getPublicProfile(handle);

  if (!profile) {
    notFound();
  }

  const activeProfile = profile ?? notFound();

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Reveal className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge tone="accent">{siteName}</Badge>
          <Badge tone="muted">Public profile</Badge>
        </div>
        <PublicProfileCard profile={activeProfile} mode="public" />
        <PublicWork
          availability={activeProfile.publishedAvailability}
          services={activeProfile.publishedServices}
          projects={activeProfile.publishedProjects}
          profileHandle={activeProfile.handle}
        />
        <PublicPath
          entries={activeProfile.publishedPathEntries}
          projects={activeProfile.publishedProjects}
          profileHandle={activeProfile.handle}
        />
        <PublicNotes notes={activeProfile.publishedNotes} profileHandle={activeProfile.handle} />
        <PublicTalks
          talks={activeProfile.publishedTalks}
          projects={activeProfile.publishedProjects}
          stackItems={activeProfile.publishedStackItems}
          notes={activeProfile.publishedNotes}
          profileHandle={activeProfile.handle}
        />
        <PublicSnippets
          snippets={activeProfile.publishedSnippets}
          projects={activeProfile.publishedProjects}
          profileHandle={activeProfile.handle}
        />
        <PublicBlocks
          sections={activeProfile.publishedSections}
          blocks={activeProfile.publishedBlocks}
          projects={activeProfile.publishedProjects}
          notes={activeProfile.publishedNotes}
          profileHandle={activeProfile.handle}
        />
        <PublicProjects projects={activeProfile.publishedProjects} profileHandle={activeProfile.handle} />
        <PublicRepositories
          repositories={activeProfile.publishedRepositories}
          projects={activeProfile.publishedProjects}
          profileHandle={activeProfile.handle}
        />
        <PublicStack
          items={activeProfile.publishedStackItems}
          projects={activeProfile.publishedProjects}
          profileHandle={activeProfile.handle}
        />
      </Reveal>

      <Reveal delay={120} className="mt-6">
        <Panel tone="dark">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-sand-200/80">
            <span>This public page is rendered from the published snapshot only.</span>
            <span>Draft updates remain private until republished.</span>
          </div>
        </Panel>
      </Reveal>
    </main>
  );
}
