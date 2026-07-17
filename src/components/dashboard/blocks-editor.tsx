"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BLOCK_TYPES, validateBlockConfig, type BlockType } from "@/lib/validations/blocks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/supabase/database.types";

type PageSection = Database["public"]["Tables"]["page_sections"]["Row"];
type PageBlock = Database["public"]["Tables"]["page_blocks"]["Row"];

const BLOCK_LABELS: Record<BlockType, string> = {
  link_button: "Link Button",
  social_link: "Social Link",
  project_highlight: "Project",
  text_section: "Text",
  image_card: "Image",
  divider: "Divider",
  cta_card: "CTA Card",
  availability_card: "Availability",
  external_resource: "Resource",
};

const BLOCK_ICONS: Record<BlockType, string> = {
  link_button: "↗",
  social_link: "@",
  project_highlight: "◆",
  text_section: "¶",
  image_card: "◻",
  divider: "—",
  cta_card: "★",
  availability_card: "●",
  external_resource: "⊞",
};

interface BlocksEditorProps {
  profileId: string;
  sections: PageSection[];
  blocks: PageBlock[];
}

export function BlocksEditor({ profileId, sections, blocks }: BlocksEditorProps) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  async function handleAddBlock(blockType: BlockType) {
    setAdding(true);
    const defaultConfigs: Record<BlockType, object> = {
      link_button: { url: "https://example.com", label: "My Link", style: "default" },
      social_link: { url: "https://github.com/user", platform: "GitHub" },
      project_highlight: { name: "My Project", description: "", technologies: [], status: "active" },
      text_section: { body: "Write something here...", format: "plain" },
      image_card: { src: "https://via.placeholder.com/600x400", alt: "Image", aspect_ratio: "16:9" },
      divider: { style: "line" },
      cta_card: { heading: "Let's work together", button_label: "Get in touch", button_url: "https://example.com" },
      availability_card: { status: "available", message: "Open for freelance work" },
      external_resource: { url: "https://example.com", title: "Read my article", source: "Blog" },
    };

    const config = defaultConfigs[blockType];
    const validation = validateBlockConfig(blockType, config);
    if (!validation.success) {
      toast({ title: "Error", description: validation.error, variant: "destructive" });
      setAdding(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.from("page_blocks").insert({
      profile_id: profileId,
      block_type: blockType,
      title: BLOCK_LABELS[blockType],
      position: blocks.length,
      is_visible: true,
      config: validation.data as Record<string, unknown>,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `${BLOCK_LABELS[blockType]} added` });
      setShowTypeSelector(false);
      router.refresh();
    }
    setAdding(false);
  }

  async function handleDelete(blockId: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("page_blocks")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", blockId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Block deleted" });
      setEditingId(null);
      router.refresh();
    }
  }

  async function handleDuplicate(block: PageBlock) {
    const supabase = createClient();
    const { error } = await supabase.from("page_blocks").insert({
      profile_id: profileId,
      section_id: block.section_id,
      block_type: block.block_type,
      title: `${block.title} (copy)`,
      position: blocks.length,
      is_visible: block.is_visible,
      config: block.config as Record<string, unknown>,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Block duplicated" });
      router.refresh();
    }
  }

  async function handleToggleVisibility(blockId: string, current: boolean) {
    const supabase = createClient();
    await supabase.from("page_blocks").update({ is_visible: !current }).eq("id", blockId);
    router.refresh();
  }

  async function handleMoveUp(index: number) {
    if (index === 0) return;
    await swapPositions(index, index - 1);
  }

  async function handleMoveDown(index: number) {
    if (index === blocks.length - 1) return;
    await swapPositions(index, index + 1);
  }

  async function swapPositions(a: number, b: number) {
    const supabase = createClient();
    await Promise.all([
      supabase.from("page_blocks").update({ position: b }).eq("id", blocks[a].id),
      supabase.from("page_blocks").update({ position: a }).eq("id", blocks[b].id),
    ]);
    router.refresh();
  }

  async function handleSaveEdit(e: React.FormEvent<HTMLFormElement>, block: PageBlock) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = (formData.get("block_title") as string).trim();
    const configRaw = (formData.get("block_config") as string).trim();

    let config: unknown;
    try {
      config = JSON.parse(configRaw);
    } catch {
      toast({ title: "Invalid JSON", description: "Config must be valid JSON", variant: "destructive" });
      return;
    }

    const validation = validateBlockConfig(block.block_type as BlockType, config);
    if (!validation.success) {
      toast({ title: "Validation error", description: validation.error, variant: "destructive" });
      return;
    }

    const supabase = createClient();
    const { error } = await supabase
      .from("page_blocks")
      .update({ title, config: validation.data as Record<string, unknown> })
      .eq("id", block.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Block saved" });
      setEditingId(null);
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      {/* Block list */}
      {blocks.length === 0 && !showTypeSelector && (
        <div className="bezel-outer">
          <div className="bezel-inner p-10 text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              No blocks yet. Start building your page.
            </p>
            <Button onClick={() => setShowTypeSelector(true)} className="rounded-full">
              Add your first block
            </Button>
          </div>
        </div>
      )}

      {blocks.map((block, index) => (
        <div key={block.id} className="bezel-outer animate-fade-up" style={{ animationDelay: `${index * 50}ms`, animationFillMode: "forwards" }}>
          <div className="bezel-inner p-5">
            {editingId === block.id ? (
              <form onSubmit={(e) => handleSaveEdit(e, block)} className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-muted-foreground">
                    {BLOCK_LABELS[block.block_type as BlockType] ?? block.block_type}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-500"
                  >
                    Cancel
                  </button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`title-${block.id}`} className="text-xs">Title</Label>
                  <Input id={`title-${block.id}`} name="block_title" defaultValue={block.title} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`config-${block.id}`} className="text-xs">Configuration (JSON)</Label>
                  <textarea
                    id={`config-${block.id}`}
                    name="block_config"
                    defaultValue={JSON.stringify(block.config, null, 2)}
                    rows={6}
                    className="flex w-full rounded-xl ring-1 ring-black/8 dark:ring-white/8 bg-white/60 dark:bg-white/4 px-4 py-3 text-xs font-mono placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] resize-none"
                  />
                </div>
                <Button type="submit" size="sm">Save</Button>
              </form>
            ) : (
              <div className="flex items-center gap-3">
                {/* Reorder */}
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                    aria-label="Move up"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="stroke-current stroke-[1.5]">
                      <path d="M18 15l-6-6-6 6" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === blocks.length - 1}
                    className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                    aria-label="Move down"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="stroke-current stroke-[1.5]">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                </div>

                {/* Icon + Info */}
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => setEditingId(block.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter") setEditingId(block.id); }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg opacity-60">{BLOCK_ICONS[block.block_type as BlockType] ?? "□"}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{block.title || BLOCK_LABELS[block.block_type as BlockType]}</p>
                      <p className="text-[11px] text-muted-foreground">{BLOCK_LABELS[block.block_type as BlockType]}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Switch
                    checked={block.is_visible}
                    onCheckedChange={() => handleToggleVisibility(block.id, block.is_visible)}
                    aria-label="Toggle visibility"
                  />
                  <button
                    onClick={() => handleDuplicate(block)}
                    className="p-1.5 text-muted-foreground hover:text-foreground transition-all duration-500"
                    aria-label="Duplicate"
                    title="Duplicate"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="stroke-current stroke-[1.5]">
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setEditingId(block.id)}
                    className="p-1.5 text-muted-foreground hover:text-foreground transition-all duration-500"
                    aria-label="Edit"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="stroke-current stroke-[1.5]">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(block.id)}
                    className="p-1.5 text-muted-foreground hover:text-destructive transition-all duration-500"
                    aria-label="Delete"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="stroke-current stroke-[1.5]">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Add block type selector */}
      {showTypeSelector && (
        <div className="bezel-outer animate-fade-up">
          <div className="bezel-inner p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-muted-foreground">
                Choose block type
              </span>
              <button
                onClick={() => setShowTypeSelector(false)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-500"
              >
                Cancel
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {BLOCK_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => handleAddBlock(type)}
                  disabled={adding}
                  className={cn(
                    "group flex flex-col items-center gap-2 rounded-xl p-4 ring-1 ring-black/5 dark:ring-white/6",
                    "transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]",
                    "hover:ring-primary/30 hover:bg-primary/5 active:scale-[0.97]",
                    "disabled:opacity-50"
                  )}
                >
                  <span className="text-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500">
                    {BLOCK_ICONS[type]}
                  </span>
                  <span className="text-[11px] font-medium">{BLOCK_LABELS[type]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add button */}
      {blocks.length > 0 && !showTypeSelector && (
        <button
          onClick={() => setShowTypeSelector(true)}
          className="group w-full rounded-2xl ring-1 ring-black/5 dark:ring-white/6 ring-dashed p-5 flex items-center justify-center gap-2 text-sm text-muted-foreground transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:ring-primary/30 hover:text-foreground hover:bg-primary/3 active:scale-[0.99]"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground/5 dark:bg-white/5 group-hover:bg-primary/10 transition-colors duration-500">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="stroke-current stroke-[1.5]">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
          Add block
        </button>
      )}
    </div>
  );
}
