"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, MapPin, Clock } from "lucide-react";
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
    <Card className="max-w-sm mx-auto overflow-hidden">
      <CardContent className="p-6 space-y-6">
        {/* Identity */}
        <div className="flex flex-col items-center text-center space-y-3">
          <Avatar className="h-20 w-20">
            {profile.avatar_url && (
              <AvatarImage src={profile.avatar_url} alt={profile.display_name} />
            )}
            <AvatarFallback className="text-lg">
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
            <h2 className="text-xl font-bold">{profile.display_name}</h2>
            {profile.headline && (
              <p className="text-sm text-muted-foreground mt-1">
                {profile.headline}
              </p>
            )}
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-sm text-center text-muted-foreground">
            {profile.bio}
          </p>
        )}

        {/* Meta */}
        <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
          {profile.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {profile.location}
            </span>
          )}
          {profile.timezone && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {profile.timezone}
            </span>
          )}
          {profile.is_available && (
            <span className="flex items-center gap-1 text-green-600">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Available
            </span>
          )}
        </div>

        {/* CTA */}
        {profile.primary_cta_label && profile.primary_cta_url && (
          <Button asChild className="w-full">
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
        {visibleLinks.length > 0 && (
          <div className="space-y-2">
            {visibleLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between w-full rounded-lg border p-3 text-sm hover:bg-accent transition-colors"
              >
                <span className="flex items-center gap-2">
                  {link.icon_label && (
                    <span className="text-muted-foreground">
                      {link.icon_label}
                    </span>
                  )}
                  <span className="font-medium">{link.title}</span>
                </span>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </a>
            ))}
          </div>
        )}

        {visibleLinks.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            No links added yet
          </p>
        )}
      </CardContent>
    </Card>
  );
}
