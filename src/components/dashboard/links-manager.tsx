"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { linkSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import {
  GripVertical,
  Trash2,
  Plus,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import type { Database } from "@/lib/supabase/database.types";

type ProfileLink = Database["public"]["Tables"]["profile_links"]["Row"];

interface LinksManagerProps {
  profileId: string;
  links: ProfileLink[];
}

export function LinksManager({ profileId, links }: LinksManagerProps) {
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [adding, setAdding] = useState(false);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAdding(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: (formData.get("title") as string).trim(),
      url: (formData.get("url") as string).trim(),
      icon_label: (formData.get("icon_label") as string).trim() || null,
      is_visible: true,
      is_enabled: true,
    };

    const result = linkSchema.safeParse(data);
    if (!result.success) {
      toast({
        title: "Validation error",
        description: result.error.errors[0]?.message,
        variant: "destructive",
      });
      setAdding(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.from("profile_links").insert({
      profile_id: profileId,
      title: data.title,
      url: data.url,
      icon_label: data.icon_label,
      position: links.length,
      is_visible: true,
      is_enabled: true,
    });

    if (error) {
      toast({
        title: "Error adding link",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Link added" });
      setShowAddForm(false);
      router.refresh();
    }
    setAdding(false);
  }

  async function handleDelete(linkId: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("profile_links")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", linkId);

    if (error) {
      toast({
        title: "Error deleting link",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Link deleted" });
      router.refresh();
    }
  }

  async function handleToggleEnabled(linkId: string, currentValue: boolean) {
    const supabase = createClient();
    const { error } = await supabase
      .from("profile_links")
      .update({
        is_enabled: !currentValue,
        updated_at: new Date().toISOString(),
      })
      .eq("id", linkId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      router.refresh();
    }
  }

  async function handleToggleVisibility(linkId: string, currentValue: boolean) {
    const supabase = createClient();
    const { error } = await supabase
      .from("profile_links")
      .update({
        is_visible: !currentValue,
        updated_at: new Date().toISOString(),
      })
      .eq("id", linkId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      router.refresh();
    }
  }

  async function handleMoveUp(index: number) {
    if (index === 0) return;
    await swapPositions(index, index - 1);
  }

  async function handleMoveDown(index: number) {
    if (index === links.length - 1) return;
    await swapPositions(index, index + 1);
  }

  async function swapPositions(indexA: number, indexB: number) {
    const supabase = createClient();
    const linkA = links[indexA];
    const linkB = links[indexB];

    await Promise.all([
      supabase
        .from("profile_links")
        .update({ position: indexB, updated_at: new Date().toISOString() })
        .eq("id", linkA.id),
      supabase
        .from("profile_links")
        .update({ position: indexA, updated_at: new Date().toISOString() })
        .eq("id", linkB.id),
    ]);

    router.refresh();
  }

  return (
    <div className="space-y-4">
      {links.length === 0 && !showAddForm && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">
              No links yet. Add your first link to get started.
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Link
            </Button>
          </CardContent>
        </Card>
      )}

      {links.map((link, index) => (
        <Card key={link.id}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                  aria-label="Move up"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <button
                  onClick={() => handleMoveDown(index)}
                  disabled={index === links.length - 1}
                  className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                  aria-label="Move down"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{link.title}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {link.url}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs text-muted-foreground">Visible</span>
                  <Switch
                    checked={link.is_visible}
                    onCheckedChange={() =>
                      handleToggleVisibility(link.id, link.is_visible)
                    }
                    aria-label="Toggle visibility"
                  />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs text-muted-foreground">Enabled</span>
                  <Switch
                    checked={link.is_enabled}
                    onCheckedChange={() =>
                      handleToggleEnabled(link.id, link.is_enabled)
                    }
                    aria-label="Toggle enabled"
                  />
                </div>
                <button
                  onClick={() => handleDelete(link.id)}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Delete link"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {showAddForm && (
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="My Website"
                  maxLength={100}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">URL *</Label>
                <Input
                  id="url"
                  name="url"
                  placeholder="https://example.com"
                  type="url"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="icon_label">Icon Label</Label>
                <Input
                  id="icon_label"
                  name="icon_label"
                  placeholder="🌐"
                  maxLength={30}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={adding}>
                  {adding ? "Adding..." : "Add Link"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {links.length > 0 && !showAddForm && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Link
        </Button>
      )}
    </div>
  );
}
