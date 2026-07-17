import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ExternalLink, MapPin, Clock } from "lucide-react";
import type { Database } from "@/lib/supabase/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileLink = Database["public"]["Tables"]["profile_links"]["Row"];

interface PublicProfileProps {
  profile: Profile;
  links: ProfileLink[];
}

export function PublicProfile({ profile, links }: PublicProfileProps) {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 gradient-mesh" />
      <div className="absolute top-[-30%] left-[-20%] w-[600px] h-[600px] rounded-full bg-purple-400/15 dark:bg-purple-600/5 blur-3xl" />
      <div className="absolute bottom-[-30%] right-[-20%] w-[600px] h-[600px] rounded-full bg-blue-400/15 dark:bg-blue-600/5 blur-3xl" />

      <div className="relative z-10 w-full max-w-md space-y-6 py-12">
        <div className="glass-strong rounded-2xl p-8 space-y-6">
          {/* Identity */}
          <div className="flex flex-col items-center text-center space-y-4">
            <Avatar className="h-24 w-24 ring-2 ring-white/20 shadow-lg">
              {profile.avatar_url && (
                <AvatarImage
                  src={profile.avatar_url}
                  alt={profile.display_name}
                />
              )}
              <AvatarFallback className="text-xl font-semibold bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                {profile.avatar_initials ||
                  profile.display_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{profile.display_name}</h1>
              {profile.headline && (
                <p className="text-muted-foreground mt-1">
                  {profile.headline}
                </p>
              )}
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-center text-muted-foreground text-sm">
              {profile.bio}
            </p>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            {profile.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {profile.location}
              </span>
            )}
            {profile.timezone && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {profile.timezone}
              </span>
            )}
            {profile.is_available && (
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                Available
              </span>
            )}
          </div>

          {/* Primary CTA */}
          {profile.primary_cta_label && profile.primary_cta_url && (
            <Button asChild className="w-full rounded-full" size="lg">
              <a
                href={profile.primary_cta_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {profile.primary_cta_label}
              </a>
            </Button>
          )}
        </div>

        {/* Links */}
        {links.length > 0 && (
          <div className="space-y-3">
            {links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between w-full rounded-xl glass p-4 hover:scale-[1.02] hover:shadow-lg transition-all duration-200"
              >
                <span className="flex items-center gap-3">
                  {link.icon_label && (
                    <span className="text-lg">{link.icon_label}</span>
                  )}
                  <span className="font-medium">{link.title}</span>
                </span>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </a>
            ))}
          </div>
        )}

        {/* Footer */}
        <footer className="text-center pt-4">
          <a
            href="/"
            className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
          >
            Built with Nodivra
          </a>
        </footer>
      </div>
    </main>
  );
}
