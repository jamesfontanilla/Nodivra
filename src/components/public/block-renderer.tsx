import type { Database } from "@/lib/supabase/database.types";
import type { BlockType } from "@/lib/validations/blocks";
import { cn } from "@/lib/utils";
import { groupPageBlocks, type PageSection } from "@/lib/page-builder";
import {
  PROJECT_LINK_KIND_LABELS,
  PROJECT_STATUS_LABELS,
  PROJECT_TYPE_LABELS,
  formatProjectDateRange,
  getProjectLink,
  type ProjectDetail,
} from "@/lib/projects";

type PageBlock = Database["public"]["Tables"]["page_blocks"]["Row"];

const hasText = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const toText = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : fallback;

const toList = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];

interface BlockRendererProps {
  profileHandle?: string;
  sections?: PageSection[];
  blocks: PageBlock[];
  projects?: ProjectDetail[];
}

export function BlockRenderer({
  profileHandle,
  sections = [],
  blocks,
  projects = [],
}: BlockRendererProps) {
  const visibleSections = sections.filter((section) => section.is_visible);
  const groupedBlocks = groupPageBlocks(visibleSections, blocks);
  const renderableGroups = groupedBlocks.filter((group) => group.blocks.length > 0);

  if (renderableGroups.length === 0) return null;

  return (
    <div className="space-y-8">
      {renderableGroups.map((group, groupIndex) => (
        <section key={group.key} className="space-y-4">
          {group.section && (
            <div className="space-y-3">
              <div className="flex items-end justify-between gap-3">
                <div className="space-y-2">
                  <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-primary dark:bg-primary/15">
                    {group.section.slug}
                  </span>
                  <h2 className="text-sm font-semibold tracking-tight md:text-base">
                    {group.section.title}
                  </h2>
                </div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {group.blocks.length} block{group.blocks.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="h-px w-full bg-foreground/5 dark:bg-white/5" />
            </div>
          )}

          <div className="space-y-4">
            {group.blocks.map((block, index) => (
              <div
                key={block.id}
                className="animate-fade-up opacity-0"
                style={{
                  animationDelay: `${(groupIndex * 80) + ((index + 1) * 60)}ms`,
                  animationFillMode: "forwards",
                }}
              >
                <RenderBlock
                  block={block}
                  projects={projects}
                  profileHandle={profileHandle}
                />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function RenderBlock({
  block,
  projects,
  profileHandle,
}: {
  block: PageBlock;
  projects: ProjectDetail[];
  profileHandle?: string;
}) {
  const config = (block.config ?? {}) as Record<string, unknown>;
  const type = block.block_type as BlockType;

  switch (type) {
    case "link_button":
      return <LinkButtonBlock config={config} />;
    case "social_link":
      return <SocialLinkBlock config={config} />;
    case "project_highlight":
      return (
        <ProjectHighlightBlock
          config={config}
          projects={projects}
          profileHandle={profileHandle}
        />
      );
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
  const url = toText(config.url);
  const label = toText(config.label);
  const icon = toText(config.icon);

  if (!hasText(url) || !hasText(label)) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex w-full items-center justify-between rounded-2xl glass-panel p-4 md:p-5 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02] active:scale-[0.98]"
    >
      <span className="flex items-center gap-3">
        {hasText(icon) && <span className="text-lg">{icon}</span>}
        <span className="text-sm font-medium">{label}</span>
      </span>
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground/5 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105 dark:bg-white/5">
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className="stroke-current stroke-[1.5] text-muted-foreground"
        >
          <path d="M2 10L10 2M10 2H4M10 2V8" />
        </svg>
      </span>
    </a>
  );
}

function SocialLinkBlock({ config }: { config: Record<string, unknown> }) {
  const url = toText(config.url);
  const platform = toText(config.platform);
  const username = toText(config.username);

  if (!hasText(url) || !hasText(platform)) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex w-full items-center justify-between rounded-2xl glass-panel p-4 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.01] active:scale-[0.98]"
    >
      <span className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">@</span>
        <span className="text-sm font-medium">{platform}</span>
        {hasText(username) && (
          <span className="text-xs text-muted-foreground">{username}</span>
        )}
      </span>
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        className="stroke-current stroke-[1.5] text-muted-foreground"
      >
        <path d="M2 10L10 2M10 2H4M10 2V8" />
      </svg>
    </a>
  );
}

function ProjectHighlightBlock({
  config,
  projects,
  profileHandle,
}: {
  config: Record<string, unknown>;
  projects: ProjectDetail[];
  profileHandle?: string;
}) {
  const projectId = toText(config.project_id);
  const name = toText(config.name);
  const description = toText(config.description);
  const url = toText(config.url);
  const repoUrl = toText(config.repo_url);
  const techs = toList(config.technologies);
  const status = toText(config.status);

  if (hasText(projectId)) {
    const projectDetail = projects.find((item) => item.project.id === projectId);
    if (projectDetail) {
      const liveLink = getProjectLink(projectDetail.links, "live");
      const repositoryLink = getProjectLink(projectDetail.links, "repository");
      const demoLink = getProjectLink(projectDetail.links, "demo");

      return (
        <div className="bezel-outer">
          <div className="bezel-inner space-y-4 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold">
                  {projectDetail.project.title}
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {projectDetail.project.summary}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                {projectDetail.project.is_featured && (
                  <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber-700 dark:text-amber-300">
                    Featured
                  </span>
                )}
                <span className="rounded-full bg-foreground/5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground dark:bg-white/5">
                  {PROJECT_STATUS_LABELS[projectDetail.project.status]}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                {PROJECT_TYPE_LABELS[projectDetail.project.project_type]}
              </span>
              <span className="rounded-full bg-foreground/5 px-2 py-0.5 text-[10px] font-medium text-muted-foreground dark:bg-white/5">
                {formatProjectDateRange(projectDetail.project)}
              </span>
            </div>

            {projectDetail.technologies.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {projectDetail.technologies.map((technology) => (
                  <span
                    key={technology.id}
                    className="rounded-full bg-foreground/5 px-2 py-0.5 text-[10px] font-medium text-muted-foreground dark:bg-white/5"
                  >
                    {technology.name}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-1">
              {hasText(profileHandle) && (
                <a
                  href={`/u/${profileHandle}/projects/${projectDetail.project.slug}`}
                  target="_self"
                  rel="noreferrer"
                  className="text-xs text-primary transition-colors duration-300 hover:underline"
                >
                  {"Read case study ->"}
                </a>
              )}
              {liveLink && (
                <a
                  href={liveLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground transition-colors duration-300 hover:text-foreground hover:underline"
                >
                  {`${PROJECT_LINK_KIND_LABELS.live} ->`}
                </a>
              )}
              {repositoryLink && (
                <a
                  href={repositoryLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground transition-colors duration-300 hover:text-foreground hover:underline"
                >
                  {`${PROJECT_LINK_KIND_LABELS.repository} ->`}
                </a>
              )}
              {demoLink && (
                <a
                  href={demoLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground transition-colors duration-300 hover:text-foreground hover:underline"
                >
                  {`${PROJECT_LINK_KIND_LABELS.demo} ->`}
                </a>
              )}
            </div>
          </div>
        </div>
      );
    }
  }

  if (!hasText(name)) return null;

  return (
    <div className="bezel-outer">
      <div className="bezel-inner space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold">{name}</h3>
            {hasText(description) && (
              <p className="text-xs leading-relaxed text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {hasText(status) && (
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
                status === "active" &&
                  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                status === "wip" &&
                  "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                status === "archived" && "bg-foreground/5 text-muted-foreground"
              )}
            >
              {status}
            </span>
          )}
        </div>

        {techs.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {techs.map((tech) => (
              <span
                key={tech}
                className="rounded-full bg-foreground/5 px-2 py-0.5 text-[10px] font-medium text-muted-foreground dark:bg-white/5"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-3 pt-1">
          {hasText(url) && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary transition-colors duration-300 hover:underline"
            >
              {"View project ->"}
            </a>
          )}
          {hasText(repoUrl) && (
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground transition-colors duration-300 hover:text-foreground"
            >
              {"Source ->"}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function TextSectionBlock({ config }: { config: Record<string, unknown> }) {
  const body = toText(config.body);

  if (!hasText(body)) return null;

  return (
    <div className="py-2">
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
        {body}
      </p>
    </div>
  );
}

function ImageCardBlock({ config }: { config: Record<string, unknown> }) {
  const src = toText(config.src);
  const alt = toText(config.alt);
  const caption = toText(config.caption);
  const aspect = toText(config.aspect_ratio);

  if (!hasText(src)) return null;

  const aspectClass =
    aspect === "16:9"
      ? "aspect-video"
      : aspect === "4:3"
        ? "aspect-[4/3]"
        : aspect === "1:1"
          ? "aspect-square"
          : "";

  return (
    <div className="bezel-outer">
      <div className="bezel-inner overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className={cn("w-full object-cover", aspectClass)}
          loading="lazy"
        />
        {hasText(caption) && (
          <p className="px-4 py-3 text-xs text-muted-foreground">{caption}</p>
        )}
      </div>
    </div>
  );
}

function DividerBlock({ config }: { config: Record<string, unknown> }) {
  const style = toText(config.style);

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

  return <div className="my-6 border-t border-foreground/5 dark:border-white/5" />;
}

function CtaCardBlock({ config }: { config: Record<string, unknown> }) {
  const heading = toText(config.heading);
  const body = toText(config.body);
  const buttonLabel = toText(config.button_label);
  const buttonUrl = toText(config.button_url);

  if (!hasText(heading) || !hasText(buttonLabel) || !hasText(buttonUrl)) {
    return null;
  }

  return (
    <div className="bezel-outer">
      <div className="bezel-inner space-y-4 p-6 text-center">
        <h3 className="text-lg font-bold tracking-tight">{heading}</h3>
        {hasText(body) && <p className="text-sm text-muted-foreground">{body}</p>}
        <a
          href={buttonUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-3 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_8px_30px_-4px_rgba(124,58,237,0.3)] active:scale-[0.98]"
        >
          <span>{buttonLabel}</span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:scale-105">
            <svg
              width="10"
              height="10"
              viewBox="0 0 12 12"
              fill="none"
              className="stroke-current stroke-[1.5]"
            >
              <path d="M2 10L10 2M10 2H4M10 2V8" />
            </svg>
          </span>
        </a>
      </div>
    </div>
  );
}

function AvailabilityBlock({ config }: { config: Record<string, unknown> }) {
  const status = toText(config.status);
  const message = toText(config.message);
  const calendarUrl = toText(config.calendar_url);

  if (!hasText(status)) return null;

  return (
    <div className="glass-panel flex items-center gap-4 rounded-2xl p-5">
      <span
        className={cn(
          "h-3 w-3 shrink-0 rounded-full",
          status === "available" && "bg-emerald-500 animate-pulse",
          status === "limited" && "bg-amber-500",
          status === "unavailable" && "bg-foreground/20"
        )}
      />
      <div className="min-w-0">
        <p className="text-sm font-medium capitalize">{status}</p>
        {hasText(message) && (
          <p className="truncate text-xs text-muted-foreground">{message}</p>
        )}
      </div>
      {hasText(calendarUrl) && (
        <a
          href={calendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto shrink-0 text-xs text-primary hover:underline"
        >
          {"Book time ->"}
        </a>
      )}
    </div>
  );
}

function ExternalResourceBlock({ config }: { config: Record<string, unknown> }) {
  const url = toText(config.url);
  const title = toText(config.title);
  const description = toText(config.description);
  const source = toText(config.source);

  if (!hasText(url) || !hasText(title)) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-2xl glass-panel p-5 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.01] active:scale-[0.99]"
    >
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="truncate text-sm font-medium">{title}</p>
          {hasText(description) && (
            <p className="line-clamp-2 text-xs text-muted-foreground">
              {description}
            </p>
          )}
          {hasText(source) && (
            <p className="text-[11px] text-muted-foreground/60">{source}</p>
          )}
        </div>
        <svg
          width="14"
          height="14"
          viewBox="0 0 12 12"
          fill="none"
          className="shrink-0 stroke-current stroke-[1.5] text-muted-foreground transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        >
          <path d="M2 10L10 2M10 2H4M10 2V8" />
        </svg>
      </div>
    </a>
  );
}
