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
    <main className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8 py-12">
        {/* Identity */}
        <div className="flex flex-col items-center text-center space-y-4">
          <Avatar className="h-24 w-24">
            {profile.avatar_url && (
              <AvatarImage src={profile.avatar_url} alt={profile.display_name} />
            )}
            <AvatarFallback className="text-xl font-semibold">
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
              <p className="text-muted-foreground mt-1">{profile.headline}</p>
            )}
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-center text-muted-foreground">{profile.bio}</p>
        )}

        {/* Meta info */}
        <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
          {profile.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {profile.location}
            </span>
          )}
          {profile.timezone && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {profile.timezone}
            </span>
          )}
          {profile.is_available && (
            <span className="flex items-center gap-1.5 text-green-600 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
              Available
            </span>
          )}
        </div>

        {/* Primary CTA */}
        {profile.primary_cta_label && profile.primary_cta_url && (
          <Button asChild className="w-full" size="lg">
            <a
              href={profile.primary_cta_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {profile.primary_cta_label}
            </a>
          </Button>
        )}

        {/* Links */}
        {links.length > 0 && (
          <div className="space-y-3">
            {links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between w-full rounded-xl border p-4 hover:bg-accent hover:shadow-sm transition-all"
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
        <footer className="text-center pt-8">
          <a
            href="/"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Built with Nodivra
          </a>
        </footer>
      </div>
    </main>
  );
}
