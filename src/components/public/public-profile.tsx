import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BlockRenderer } from "@/components/public/block-renderer";
import { ProjectsSection } from "@/components/public/projects-section";
import type { Database } from "@/lib/supabase/database.types";
import type { PageSection } from "@/lib/page-builder";
import type { ProjectDetail } from "@/lib/projects";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileLink = Database["public"]["Tables"]["profile_links"]["Row"];
type PageBlock = Database["public"]["Tables"]["page_blocks"]["Row"];

interface PublicProfileProps {
  profile: Profile;
  links: ProfileLink[];
  sections?: PageSection[];
  blocks?: PageBlock[];
  projects?: ProjectDetail[];
}

export function PublicProfile({
  profile,
  links,
  sections = [],
  blocks = [],
  projects = [],
}: PublicProfileProps) {
  return (
    <main className="relative min-h-[100dvh] flex items-center justify-center px-4 py-24 md:py-40 overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute top-[-30%] left-[-20%] w-[700px] h-[700px] rounded-full bg-violet-500/8 dark:bg-violet-500/15 blur-[140px]" />
      <div className="absolute bottom-[-30%] right-[-20%] w-[600px] h-[600px] rounded-full bg-cyan-400/6 dark:bg-cyan-400/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-md space-y-8">
        {/* Identity card — Double-Bezel */}
        <div className="bezel-outer animate-fade-up">
          <div className="bezel-inner p-8 md:p-10 space-y-8">
            {/* Avatar */}
            <div className="flex flex-col items-center text-center space-y-5">
              <Avatar className="h-24 w-24 ring-1 ring-black/5 dark:ring-white/10 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.4)]">
                {profile.avatar_url && (
                  <AvatarImage
                    src={profile.avatar_url}
                    alt={profile.display_name}
                  />
                )}
                <AvatarFallback className="text-xl font-semibold bg-gradient-to-br from-violet-500 to-cyan-400 text-white">
                  {profile.avatar_initials ||
                    profile.display_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  {profile.display_name}
                </h1>
                {profile.headline && (
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                    {profile.headline}
                  </p>
                )}
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-center text-sm text-muted-foreground leading-relaxed">
                {profile.bio}
              </p>
            )}

            {/* Meta info */}
            <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
              {profile.location && (
                <span className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="stroke-current stroke-[1.5]">
                    <path d="M12 13a3 3 0 100-6 3 3 0 000 6z" />
                    <path d="M12 22s8-4.5 8-11a8 8 0 10-16 0c0 6.5 8 11 8 11z" />
                  </svg>
                  {profile.location}
                </span>
              )}
              {profile.timezone && (
                <span className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="stroke-current stroke-[1.5]">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  {profile.timezone}
                </span>
              )}
              {profile.is_available && (
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Available
                </span>
              )}
            </div>

            {/* Primary CTA — Button-in-Button */}
            {profile.primary_cta_label && profile.primary_cta_url && (
              <a
                href={profile.primary_cta_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center justify-center gap-3 w-full rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_8px_30px_-4px_rgba(124,58,237,0.35)] active:scale-[0.98]"
              >
                <span>{profile.primary_cta_label}</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="stroke-current stroke-[1.5]">
                    <path d="M2 10L10 2M10 2H4M10 2V8" />
                  </svg>
                </span>
              </a>
            )}
          </div>
        </div>

        {/* Links */}
        {links.length > 0 && (
          <div className="space-y-3">
            {links.map((link, i) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between w-full rounded-2xl glass-panel p-4 md:p-5 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02] hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.4)] active:scale-[0.98] animate-fade-up opacity-0"
                style={{ animationDelay: `${(i + 1) * 100}ms`, animationFillMode: "forwards" }}
              >
                <span className="flex items-center gap-3">
                  {link.icon_label && (
                    <span className="text-lg">{link.icon_label}</span>
                  )}
                  <span className="font-medium text-sm">{link.title}</span>
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground/5 dark:bg-white/5 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="stroke-current stroke-[1.5] text-muted-foreground">
                    <path d="M2 10L10 2M10 2H4M10 2V8" />
                  </svg>
                </span>
              </a>
            ))}
          </div>
        )}

        {projects.length > 0 && (
          <ProjectsSection handle={profile.handle} projects={projects} />
        )}

        {/* Blocks */}
        {blocks.length > 0 && (
          <BlockRenderer
            profileHandle={profile.handle}
            sections={sections}
            blocks={blocks}
            projects={projects}
          />
        )}

        {/* Footer */}
        <footer className="text-center pt-8 animate-fade-up delay-5 opacity-0" style={{ animationFillMode: "forwards" }}>
          <a
            href="/"
            className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/40 hover:text-muted-foreground transition-colors duration-500"
          >
            Built with Nodivra
          </a>
        </footer>
      </div>
    </main>
  );
}
