"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Database } from "@/lib/supabase/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileLink = Database["public"]["Tables"]["profile_links"]["Row"];

interface ProfilePreviewProps {
  profile: Profile;
  links: ProfileLink[];
}

export function ProfilePreview({ profile, links }: ProfilePreviewProps) {
  const visibleLinks = links.filter((l) => l.is_visible && l.is_enabled);

  return (
    <div className="bezel-outer max-w-sm mx-auto">
      <div className="bezel-inner p-6 md:p-8 space-y-6">
        {/* Identity */}
        <div className="flex flex-col items-center text-center space-y-4">
          <Avatar className="h-20 w-20 ring-1 ring-black/5 dark:ring-white/8 shadow-[0_6px_20px_-4px_rgba(0,0,0,0.08)]">
            {profile.avatar_url && (
              <AvatarImage
                src={profile.avatar_url}
                alt={profile.display_name}
              />
            )}
            <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-violet-500 to-cyan-400 text-white">
              {profile.avatar_initials ||
                profile.display_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight">{profile.display_name}</h2>
            {profile.headline && (
              <p className="text-xs text-muted-foreground">
                {profile.headline}
              </p>
            )}
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-xs text-center text-muted-foreground leading-relaxed">
            {profile.bio}
          </p>
        )}

        {/* Meta */}
        <div className="flex flex-wrap justify-center gap-3 text-[11px] text-muted-foreground">
          {profile.location && (
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="stroke-current stroke-[1.5]">
                <path d="M12 13a3 3 0 100-6 3 3 0 000 6z" />
                <path d="M12 22s8-4.5 8-11a8 8 0 10-16 0c0 6.5 8 11 8 11z" />
              </svg>
              {profile.location}
            </span>
          )}
          {profile.timezone && (
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="stroke-current stroke-[1.5]">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              {profile.timezone}
            </span>
          )}
          {profile.is_available && (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Available
            </span>
          )}
        </div>

        {/* CTA */}
        {profile.primary_cta_label && profile.primary_cta_url && (
          <a
            href={profile.primary_cta_url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center gap-2 w-full rounded-full bg-primary px-5 py-2.5 text-xs font-medium text-primary-foreground transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_6px_20px_-4px_rgba(124,58,237,0.3)] active:scale-[0.98]"
          >
            <span>{profile.primary_cta_label}</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:scale-105">
              <svg width="8" height="8" viewBox="0 0 12 12" fill="none" className="stroke-current stroke-[1.5]">
                <path d="M2 10L10 2M10 2H4M10 2V8" />
              </svg>
            </span>
          </a>
        )}

        {/* Links */}
        {visibleLinks.length > 0 && (
          <div className="space-y-2">
            {visibleLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between w-full rounded-xl ring-1 ring-black/5 dark:ring-white/6 bg-foreground/[0.02] dark:bg-white/[0.02] p-3 text-xs transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-foreground/5 dark:hover:bg-white/5"
              >
                <span className="flex items-center gap-2">
                  {link.icon_label && (
                    <span className="text-sm">{link.icon_label}</span>
                  )}
                  <span className="font-medium">{link.title}</span>
                </span>
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="stroke-current stroke-[1.5] text-muted-foreground transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5">
                  <path d="M2 10L10 2M10 2H4M10 2V8" />
                </svg>
              </a>
            ))}
          </div>
        )}

        {visibleLinks.length === 0 && (
          <p className="text-center text-xs text-muted-foreground/60">
            No links added yet
          </p>
        )}
      </div>
    </div>
  );
}
