"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { profileSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface OnboardingFormProps {
  userId: string;
}

export function OnboardingForm({ userId }: OnboardingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const data = {
      handle: (formData.get("handle") as string).toLowerCase().trim(),
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
    };

    const result = profileSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    const supabase = createClient();

    // Check handle uniqueness
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("handle", data.handle)
      .is("deleted_at", null)
      .single();

    if (existing) {
      setErrors({ handle: "This handle is already taken" });
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("profiles").insert({
      user_id: userId,
      handle: data.handle,
      display_name: data.display_name,
      headline: data.headline,
      bio: data.bio,
      location: data.location,
      timezone: data.timezone,
      avatar_initials: data.avatar_initials,
      primary_cta_label: data.primary_cta_label,
      primary_cta_url: data.primary_cta_url,
      is_available: false,
      is_published: false,
    });

    if (error) {
      setErrors({ handle: error.message });
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="handle">Handle *</Label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">/u/</span>
          <Input
            id="handle"
            name="handle"
            placeholder="yourhandle"
            pattern="[a-z][a-z0-9_-]*[a-z0-9]"
            minLength={3}
            maxLength={30}
            required
          />
        </div>
        {errors.handle && (
          <p className="text-sm text-destructive">{errors.handle}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="display_name">Display Name *</Label>
        <Input
          id="display_name"
          name="display_name"
          placeholder="Jane Developer"
          maxLength={100}
          required
        />
        {errors.display_name && (
          <p className="text-sm text-destructive">{errors.display_name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="headline">Headline</Label>
        <Input
          id="headline"
          name="headline"
          placeholder="Full-stack engineer building cool things"
          maxLength={160}
        />
        {errors.headline && (
          <p className="text-sm text-destructive">{errors.headline}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          placeholder="A short bio about yourself..."
          maxLength={500}
          rows={3}
        />
        {errors.bio && (
          <p className="text-sm text-destructive">{errors.bio}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            placeholder="San Francisco, CA"
            maxLength={100}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Input
            id="timezone"
            name="timezone"
            placeholder="America/Los_Angeles"
            maxLength={50}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="avatar_initials">Avatar Initials</Label>
        <Input
          id="avatar_initials"
          name="avatar_initials"
          placeholder="JD"
          maxLength={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="primary_cta_label">CTA Label</Label>
          <Input
            id="primary_cta_label"
            name="primary_cta_label"
            placeholder="Hire Me"
            maxLength={50}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="primary_cta_url">CTA URL</Label>
          <Input
            id="primary_cta_url"
            name="primary_cta_url"
            placeholder="https://..."
            type="url"
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating..." : "Create Your Page"}
      </Button>
    </form>
  );
}
