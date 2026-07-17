"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { profileUpdateSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import type { Database } from "@/lib/supabase/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileLink = Database["public"]["Tables"]["profile_links"]["Row"];

interface ProfileEditorProps {
  profile: Profile;
  links: ProfileLink[];
}

export function ProfileEditor({ profile, links: _links }: ProfileEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      display_name: (formData.get("display_name") as string).trim(),
      headline: (formData.get("headline") as string).trim() || null,
      bio: (formData.get("bio") as string).trim() || null,
      location: (formData.get("location") as string).trim() || null,
      timezone: (formData.get("timezone") as string).trim() || null,
      avatar_initials:
        (formData.get("avatar_initials") as string).trim() || null,
      primary_cta_label:
        (formData.get("primary_cta_label") as string).trim() || null,
      primary_cta_url:
        (formData.get("primary_cta_url") as string).trim() || null,
      is_available: formData.get("is_available") === "on",
    };

    const result = profileUpdateSchema.safeParse(data);
    if (!result.success) {
      toast({
        title: "Validation error",
        description: result.error.errors[0]?.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", profile.id);

    if (error) {
      toast({
        title: "Error saving",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Profile saved" });
      router.refresh();
    }

    setLoading(false);
  }

  async function handlePublishToggle() {
    setPublishing(true);
    const supabase = createClient();
    const newStatus = !profile.is_published;

    const { error } = await supabase
      .from("profiles")
      .update({
        is_published: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: newStatus ? "Page published!" : "Page unpublished",
        description: newStatus
          ? `Your page is now live at /u/${profile.handle}`
          : "Your page is now hidden from the public",
      });
      router.refresh();
    }
    setPublishing(false);
  }

  async function handleCopyLink() {
    const url = `${window.location.origin}/u/${profile.handle}`;
    await navigator.clipboard.writeText(url);
    toast({ title: "Link copied!", description: url });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex h-2.5 w-2.5 rounded-full ${
              profile.is_published ? "bg-green-500" : "bg-yellow-500"
            }`}
          />
          <span className="text-sm font-medium">
            {profile.is_published ? "Published" : "Draft"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCopyLink}>
            Copy Link
          </Button>
          <Button
            variant={profile.is_published ? "secondary" : "default"}
            size="sm"
            onClick={handlePublishToggle}
            disabled={publishing}
          >
            {profile.is_published ? "Unpublish" : "Publish"}
          </Button>
        </div>
      </div>

      <Separator />

      <form onSubmit={handleSave} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="display_name">Display Name</Label>
          <Input
            id="display_name"
            name="display_name"
            defaultValue={profile.display_name}
            maxLength={100}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="headline">Headline</Label>
          <Input
            id="headline"
            name="headline"
            defaultValue={profile.headline ?? ""}
            maxLength={160}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            name="bio"
            defaultValue={profile.bio ?? ""}
            maxLength={500}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              defaultValue={profile.location ?? ""}
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Input
              id="timezone"
              name="timezone"
              defaultValue={profile.timezone ?? ""}
              maxLength={50}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="avatar_initials">Avatar Initials</Label>
          <Input
            id="avatar_initials"
            name="avatar_initials"
            defaultValue={profile.avatar_initials ?? ""}
            maxLength={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="primary_cta_label">CTA Label</Label>
            <Input
              id="primary_cta_label"
              name="primary_cta_label"
              defaultValue={profile.primary_cta_label ?? ""}
              maxLength={50}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="primary_cta_url">CTA URL</Label>
            <Input
              id="primary_cta_url"
              name="primary_cta_url"
              defaultValue={profile.primary_cta_url ?? ""}
              type="url"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="is_available">Available for opportunities</Label>
          <Switch
            id="is_available"
            name="is_available"
            defaultChecked={profile.is_available}
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}
