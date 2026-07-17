import type { Database } from "@/lib/supabase/database.types";
import type { BlockType } from "@/lib/validations/blocks";
import { cn } from "@/lib/utils";

type PageBlock = Database["public"]["Tables"]["page_blocks"]["Row"];

interface BlockRendererProps {
  blocks: PageBlock[];
}

export function BlockRenderer({ blocks }: BlockRendererProps) {
  if (blocks.length === 0) return null;

  return (
    <div className="space-y-4">
      {blocks.map((block, i) => (
        <div
          key={block.id}
          className="animate-fade-up opacity-0"
          style={{ animationDelay: `${(i + 1) * 80}ms`, animationFillMode: "forwards" }}
        >
          <RenderBlock block={block} />
        </div>
      ))}
    </div>
  );
}

function RenderBlock({ block }: { block: PageBlock }) {
  const config = block.config as Record<string, unknown>;
  const type = block.block_type as BlockType;

  switch (type) {
    case "link_button":
      return <LinkButtonBlock config={config} />;
    case "social_link":
      return <SocialLinkBlock config={config} />;
    case "project_highlight":
      return <ProjectHighlightBlock config={config} />;
    case "text_section":
      return <TextSectionBlock config={config} />;
    case "divider":
      return <DividerBlock config={config} />;
    case "cta_card":
      return <CtaCardBlock config={config} />;
    case "availability_card":
      return <AvailabilityBlock config={config} />;
    case "external_resource":
      return <ExternalResourceBlock config={config} />;
    case "image_card":
      return <ImageCardBlock config={config} />;
    default:
      return null;
  }
}

function LinkButtonBlock({ config }: { config: Record<string, unknown> }) {
  return (
    <a
      href={config.url as string}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center justify-between w-full rounded-2xl glass-panel p-4 md:p-5 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02] active:scale-[0.98]"
    >
      <span className="flex items-center gap-3">
        {config.icon && <span className="text-lg">{config.icon as string}</span>}
        <span className="font-medium text-sm">{config.label as string}</span>
      </span>
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground/5 dark:bg-white/5 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="stroke-current stroke-[1.5] text-muted-foreground">
          <path d="M2 10L10 2M10 2H4M10 2V8" />
        </svg>
      </span>
    </a>
  );
}

function SocialLinkBlock({ config }: { config: Record<string, unknown> }) {
  return (
    <a
      href={config.url as string}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center justify-between w-full rounded-2xl glass-panel p-4 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.01] active:scale-[0.98]"
    >
      <span className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">@</span>
        <span className="text-sm font-medium">{config.platform as string}</span>
        {config.username && (
          <span className="text-xs text-muted-foreground">{config.username as string}</span>
        )}
      </span>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="stroke-current stroke-[1.5] text-muted-foreground">
        <path d="M2 10L10 2M10 2H4M10 2V8" />
      </svg>
    </a>
  );
}

function ProjectHighlightBlock({ config }: { config: Record<string, unknown> }) {
  const techs = (config.technologies as string[]) ?? [];
  const status = config.status as string;

  return (
    <div className="bezel-outer">
      <div className="bezel-inner p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold">{config.name as string}</h3>
            {config.description && (
              <p className="text-xs text-muted-foreground leading-relaxed">{config.description as string}</p>
            )}
          </div>
          {status && (
            <span className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
              status === "active" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
              status === "wip" && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
              status === "archived" && "bg-foreground/5 text-muted-foreground"
            )}>
              {status}
            </span>
          )}
        </div>
        {techs.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {techs.map((tech) => (
              <span key={tech} className="rounded-full px-2 py-0.5 text-[10px] font-medium bg-foreground/5 dark:bg-white/5 text-muted-foreground">
                {tech}
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-3 pt-1">
          {config.url && (
            <a href={config.url as string} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline transition-colors duration-300">
              View project ↗
            </a>
          )}
          {config.repo_url && (
            <a href={config.repo_url as string} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-300">
              Source ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function TextSectionBlock({ config }: { config: Record<string, unknown> }) {
  return (
    <div className="py-2">
      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
        {config.body as string}
      </p>
    </div>
  );
}

function ImageCardBlock({ config }: { config: Record<string, unknown> }) {
  const aspect = config.aspect_ratio as string;
  const aspectClass = aspect === "16:9" ? "aspect-video" : aspect === "4:3" ? "aspect-[4/3]" : aspect === "1:1" ? "aspect-square" : "";

  return (
    <div className="bezel-outer">
      <div className="bezel-inner overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={config.src as string}
          alt={config.alt as string || ""}
          className={cn("w-full object-cover", aspectClass)}
          loading="lazy"
        />
        {config.caption && (
          <p className="px-4 py-3 text-xs text-muted-foreground">{config.caption as string}</p>
        )}
      </div>
    </div>
  );
}

function DividerBlock({ config }: { config: Record<string, unknown> }) {
  const style = config.style as string;
  if (style === "space") return <div className="py-6" />;
  if (style === "dots") {
    return (
      <div className="flex justify-center gap-1.5 py-6">
        <span className="h-1 w-1 rounded-full bg-foreground/15" />
        <span className="h-1 w-1 rounded-full bg-foreground/15" />
        <span className="h-1 w-1 rounded-full bg-foreground/15" />
      </div>
    );
  }
  return <div className="border-t border-foreground/5 dark:border-white/5 my-6" />;
}

function CtaCardBlock({ config }: { config: Record<string, unknown> }) {
  return (
    <div className="bezel-outer">
      <div className="bezel-inner p-6 text-center space-y-4">
        <h3 className="text-lg font-bold tracking-tight">{config.heading as string}</h3>
        {config.body && (
          <p className="text-sm text-muted-foreground">{config.body as string}</p>
        )}
        <a
          href={config.button_url as string}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-3 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_8px_30px_-4px_rgba(124,58,237,0.3)] active:scale-[0.98]"
        >
          <span>{config.button_label as string}</span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:scale-105">
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="stroke-current stroke-[1.5]">
              <path d="M2 10L10 2M10 2H4M10 2V8" />
            </svg>
          </span>
        </a>
      </div>
    </div>
  );
}

function AvailabilityBlock({ config }: { config: Record<string, unknown> }) {
  const status = config.status as string;
  return (
    <div className="glass-panel rounded-2xl p-5 flex items-center gap-4">
      <span className={cn(
        "h-3 w-3 rounded-full shrink-0",
        status === "available" && "bg-emerald-500 animate-pulse",
        status === "limited" && "bg-amber-500",
        status === "unavailable" && "bg-foreground/20"
      )} />
      <div className="min-w-0">
        <p className="text-sm font-medium capitalize">{status}</p>
        {config.message && (
          <p className="text-xs text-muted-foreground truncate">{config.message as string}</p>
        )}
      </div>
      {config.calendar_url && (
        <a
          href={config.calendar_url as string}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-xs text-primary hover:underline shrink-0"
        >
          Book time ↗
        </a>
      )}
    </div>
  );
}

function ExternalResourceBlock({ config }: { config: Record<string, unknown> }) {
  return (
    <a
      href={config.url as string}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-2xl glass-panel p-5 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.01] active:scale-[0.99]"
    >
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-sm font-medium truncate">{config.title as string}</p>
          {config.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{config.description as string}</p>
          )}
          {config.source && (
            <p className="text-[11px] text-muted-foreground/60">{config.source as string}</p>
          )}
        </div>
        <svg width="14" height="14" viewBox="0 0 12 12" fill="none" className="stroke-current stroke-[1.5] text-muted-foreground shrink-0 mt-0.5 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
          <path d="M2 10L10 2M10 2H4M10 2V8" />
        </svg>
      </div>
    </a>
  );
}
