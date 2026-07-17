import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toRoute } from "@/lib/routes";
import {
  PROJECT_LINK_KIND_LABELS,
  PROJECT_STATUS_LABELS,
  PROJECT_TYPE_LABELS,
  formatProjectDateRange,
  type Project,
  type ProjectDetail,
  type ProjectLink,
} from "@/lib/projects";

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function safeHttpUrl(value: string | null | undefined): string | null {
  if (!hasText(value)) return null;
  return /^https?:\/\//i.test(value) ? value : null;
}

function buildDetailHref(handle: string, projectSlug: string): string {
  return `/u/${handle}/projects/${projectSlug}`;
}

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern =
    /(!\[[^\]]*]\([^)]+\)|\[[^\]]+]\([^)]+\)|`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_)/g;
  let cursor = 0;

  pattern.lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    const index = match.index ?? 0;
    if (index > cursor) {
      nodes.push(text.slice(cursor, index));
    }

    const token = match[0];
    const imageMatch = token.match(/^!\[([^\]]*)]\(([^)]+)\)$/);
    const linkMatch = token.match(/^\[([^\]]+)]\(([^)]+)\)$/);
    const codeMatch = token.match(/^`([^`]+)`$/);
    const boldMatch = token.match(/^(?:\*\*|__)(.+)(?:\*\*|__)$/);
    const italicMatch = token.match(/^(?:\*|_)(.+)(?:\*|_)$/);

    if (imageMatch) {
      const alt = imageMatch[1];
      const url = safeHttpUrl(imageMatch[2]);
      if (url) {
        nodes.push(
          <span key={`${index}-image`} className="my-4 block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={alt}
              loading="lazy"
              className="max-h-80 w-full rounded-2xl object-cover ring-1 ring-black/5 dark:ring-white/10"
            />
          </span>
        );
      } else {
        nodes.push(alt || token);
      }
    } else if (linkMatch) {
      const label = linkMatch[1];
      const url = safeHttpUrl(linkMatch[2]);
      if (url) {
        nodes.push(
          <a
            key={`${index}-link`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline-offset-4 hover:underline"
          >
            {label}
          </a>
        );
      } else {
        nodes.push(label);
      }
    } else if (codeMatch) {
      nodes.push(
        <code
          key={`${index}-code`}
          className="rounded-md bg-foreground/5 px-1.5 py-0.5 font-mono text-[0.9em] text-foreground dark:bg-white/10"
        >
          {codeMatch[1]}
        </code>
      );
    } else if (boldMatch) {
      nodes.push(
        <strong key={`${index}-strong`} className="font-semibold text-foreground">
          {boldMatch[1]}
        </strong>
      );
    } else if (italicMatch) {
      nodes.push(
        <em key={`${index}-em`} className="italic">
          {italicMatch[1]}
        </em>
      );
    } else {
      nodes.push(token);
    }

    cursor = index + token.length;
  }

  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }

  return nodes;
}

type MarkdownBlock =
  | { type: "heading"; level: 1 | 2 | 3 | 4; text: string }
  | { type: "paragraph"; text: string }
  | { type: "blockquote"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "code"; code: string }
  | { type: "divider" };

function parseMarkdown(markdown: string): MarkdownBlock[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: MarkdownBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (trimmed.startsWith("```")) {
      const codeLines: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        codeLines.push(lines[index]);
        index += 1;
      }
      if (index < lines.length) {
        index += 1;
      }
      blocks.push({ type: "code", code: codeLines.join("\n") });
      continue;
    }

    if (/^#{1,4}\s+/.test(trimmed)) {
      const match = trimmed.match(/^(#{1,4})\s+(.*)$/);
      if (match) {
        blocks.push({
          type: "heading",
          level: match[1].length as 1 | 2 | 3 | 4,
          text: match[2],
        });
        index += 1;
        continue;
      }
    }

    if (/^---+$/.test(trimmed)) {
      blocks.push({ type: "divider" });
      index += 1;
      continue;
    }

    if (/^>\s?/.test(trimmed)) {
      const quoteLines: string[] = [];
      while (index < lines.length && /^>\s?/.test(lines[index].trim())) {
        quoteLines.push(lines[index].trim().replace(/^>\s?/, ""));
        index += 1;
      }
      blocks.push({ type: "blockquote", text: quoteLines.join(" ") });
      continue;
    }

    if (/^\s*[-*+]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (index < lines.length && /^\s*[-*+]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\s*[-*+]\s+/, ""));
        index += 1;
      }
      blocks.push({ type: "list", ordered: false, items });
      continue;
    }

    if (/^\s*\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (index < lines.length && /^\s*\d+\.\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\s*\d+\.\s+/, ""));
        index += 1;
      }
      blocks.push({ type: "list", ordered: true, items });
      continue;
    }

    const paragraphLines: string[] = [trimmed];
    index += 1;
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^#{1,4}\s+/.test(lines[index].trim()) &&
      !/^---+$/.test(lines[index].trim()) &&
      !/^>\s?/.test(lines[index].trim()) &&
      !/^\s*[-*+]\s+/.test(lines[index].trim()) &&
      !/^\s*\d+\.\s+/.test(lines[index].trim()) &&
      !lines[index].trim().startsWith("```")
    ) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }

    blocks.push({
      type: "paragraph",
      text: paragraphLines.join(" "),
    });
  }

  return blocks;
}

export function ProjectMarkdown({ markdown }: { markdown: string }) {
  const blocks = parseMarkdown(markdown);

  if (blocks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-5">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const HeadingTag = `h${block.level}` as keyof JSX.IntrinsicElements;
          return (
            <HeadingTag
              key={`${block.type}-${index}`}
              className={cn(
                "font-semibold tracking-tight text-foreground",
                block.level === 1 && "text-2xl",
                block.level === 2 && "text-xl",
                block.level === 3 && "text-lg",
                block.level === 4 && "text-base"
              )}
            >
              {renderInline(block.text)}
            </HeadingTag>
          );
        }

        if (block.type === "paragraph") {
          return (
            <p
              key={`${block.type}-${index}`}
              className="text-sm leading-7 text-muted-foreground"
            >
              {renderInline(block.text)}
            </p>
          );
        }

        if (block.type === "blockquote") {
          return (
            <blockquote
              key={`${block.type}-${index}`}
              className="border-l-2 border-primary/20 pl-4 text-sm leading-7 text-muted-foreground"
            >
              {renderInline(block.text)}
            </blockquote>
          );
        }

        if (block.type === "list") {
          const ListTag = block.ordered ? "ol" : "ul";
          return (
            <ListTag
              key={`${block.type}-${index}`}
              className={cn(
                "space-y-2 text-sm leading-7 text-muted-foreground",
                block.ordered ? "list-decimal pl-5" : "list-disc pl-5"
              )}
            >
              {block.items.map((item, itemIndex) => (
                <li key={`${block.type}-${index}-${itemIndex}`}>
                  {renderInline(item)}
                </li>
              ))}
            </ListTag>
          );
        }

        if (block.type === "code") {
          return (
            <pre
              key={`${block.type}-${index}`}
              className="overflow-x-auto rounded-2xl bg-foreground/5 p-4 text-xs leading-6 text-foreground dark:bg-white/8"
            >
              <code>{block.code}</code>
            </pre>
          );
        }

        return (
          <div
            key={`${block.type}-${index}`}
            className="h-px w-full bg-foreground/5 dark:bg-white/5"
          />
        );
      })}
    </div>
  );
}

export function ProjectLinkButtons({ links }: { links: ProjectLink[] }) {
  const visibleLinks = links.filter((link) => !link.deleted_at && link.is_visible);

  if (visibleLinks.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-3">
      {visibleLinks.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 rounded-full bg-foreground/5 px-4 py-2 text-xs font-medium text-foreground transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-foreground/8 hover:shadow-[0_10px_24px_-10px_rgba(0,0,0,0.12)] dark:bg-white/8 dark:hover:bg-white/12"
        >
          <span>{PROJECT_LINK_KIND_LABELS[link.kind]}</span>
            <span className="text-[10px] text-muted-foreground transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5">
              {"->"}
            </span>
        </a>
      ))}
    </div>
  );
}

function ProjectBadges({ project }: { project: Project }) {
  return (
    <div className="flex flex-wrap gap-2">
      {project.is_featured && (
        <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
          Featured
        </span>
      )}
      <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-primary">
        {PROJECT_STATUS_LABELS[project.status]}
      </span>
      <span className="inline-flex items-center rounded-full bg-foreground/5 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {PROJECT_TYPE_LABELS[project.project_type]}
      </span>
    </div>
  );
}

function ProjectChipRow({
  items,
  label,
}: {
  items: Array<{ id: string; name: string }>;
  label: string;
}) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span
            key={item.id}
            className="rounded-full bg-foreground/5 px-2.5 py-1 text-[11px] font-medium text-muted-foreground dark:bg-white/8"
          >
            {item.name}
          </span>
        ))}
      </div>
    </div>
  );
}

export function ProjectCard({
  detail,
  handle,
}: {
  detail: ProjectDetail;
  handle: string;
}) {
  const { project, technologies, tags, links } = detail;
  const href = buildDetailHref(handle, project.slug);
  const cover = safeHttpUrl(project.cover_image_url);

  return (
    <div className="bezel-outer group h-full overflow-hidden">
      <div className="bezel-inner flex h-full flex-col overflow-hidden">
        {cover && (
          <Link href={toRoute(href)} className="block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cover}
              alt={project.cover_image_alt ?? project.title}
              className="h-48 w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.03]"
              loading="lazy"
            />
          </Link>
        )}
        <div className="flex flex-1 flex-col gap-4 p-5">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <ProjectBadges project={project} />
                <Link
                  href={toRoute(href)}
                  className="block text-left text-lg font-semibold tracking-tight transition-colors duration-300 hover:text-primary"
                >
                  {project.title}
                </Link>
              </div>
              <span className="rounded-full bg-foreground/5 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {formatProjectDateRange(project)}
              </span>
            </div>

            <p className="text-sm leading-6 text-muted-foreground">
              {project.summary}
            </p>

            {project.role && (
              <p className="text-xs text-muted-foreground/80">
                Role: {project.role}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <ProjectChipRow items={technologies} label="Technologies" />
            <ProjectChipRow items={tags} label="Tags" />
            <ProjectLinkButtons links={links} />
          </div>

          <div className="pt-2">
            <Link
              href={toRoute(href)}
              className="group inline-flex items-center gap-2 text-sm font-medium text-primary transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:gap-3"
            >
              <span>Read case study</span>
              <span className="transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5">
                {"->"}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProjectDetailView({
  detail,
  backHref,
  previewLabel,
  publicHref,
}: {
  detail: ProjectDetail;
  backHref?: string;
  previewLabel?: string;
  publicHref?: string;
}) {
  const { project, technologies, tags, links } = detail;
  const cover = safeHttpUrl(project.cover_image_url);
  const publishedLabel = project.is_published ? "Published" : "Draft";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {backHref ? (
          <Link
            href={toRoute(backHref)}
            className="text-sm text-muted-foreground transition-colors duration-300 hover:text-foreground"
          >
            &lt;- Back
          </Link>
        ) : (
          <span className="text-sm text-muted-foreground/60">Project</span>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {previewLabel && (
            <span className="rounded-full bg-foreground/5 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {previewLabel}
            </span>
          )}
          <span
            className={cn(
              "rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.18em]",
              project.is_published
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "bg-amber-500/10 text-amber-700 dark:text-amber-300"
            )}
          >
            {publishedLabel}
          </span>
        </div>
      </div>

      {publicHref && (
        <div className="flex justify-end">
          <Link
            href={toRoute(publicHref)}
            className="text-xs font-medium text-muted-foreground transition-colors duration-300 hover:text-foreground"
          >
            Open public case study -&gt;
          </Link>
        </div>
      )}

      <div className="bezel-outer overflow-hidden">
        <div className="bezel-inner space-y-0 overflow-hidden">
          {cover && (
            <div className="border-b border-black/5 dark:border-white/8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cover}
                alt={project.cover_image_alt ?? project.title}
                className="h-64 w-full object-cover md:h-80"
                loading="lazy"
              />
            </div>
          )}

          <div className="space-y-6 p-5 md:p-8">
            <div className="space-y-4">
              <ProjectBadges project={project} />
              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight md:text-4xl">
                  {project.title}
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                  {project.summary}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl bg-foreground/[0.02] p-4 dark:bg-white/[0.02]">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Role
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {project.role || "Not specified"}
                </p>
              </div>
              <div className="rounded-2xl bg-foreground/[0.02] p-4 dark:bg-white/[0.02]">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Timeline
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {formatProjectDateRange(project)}
                </p>
              </div>
              <div className="rounded-2xl bg-foreground/[0.02] p-4 dark:bg-white/[0.02]">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Type
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {PROJECT_TYPE_LABELS[project.project_type]}
                </p>
              </div>
              <div className="rounded-2xl bg-foreground/[0.02] p-4 dark:bg-white/[0.02]">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Status
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {PROJECT_STATUS_LABELS[project.status]}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <ProjectChipRow items={technologies} label="Technologies" />
              <ProjectChipRow items={tags} label="Tags" />
              <ProjectLinkButtons links={links} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="bezel-outer">
          <div className="bezel-inner space-y-6 p-5 md:p-8">
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Case Study
              </p>
              <h2 className="text-lg font-semibold tracking-tight">
                Project narrative
              </h2>
            </div>
            <ProjectMarkdown markdown={project.case_study_md} />
          </div>
        </div>

        <div className="space-y-6">
          {project.lessons_learned && (
            <div className="bezel-outer">
              <div className="bezel-inner space-y-3 p-5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Lessons learned
                </p>
                <p className="text-sm leading-7 text-muted-foreground">
                  {project.lessons_learned}
                </p>
              </div>
            </div>
          )}

          {publicHref && (
            <div className="bezel-outer">
              <div className="bezel-inner space-y-3 p-5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Public link
                </p>
          <Link
            href={toRoute(publicHref)}
            className="text-sm font-medium text-primary transition-colors duration-300 hover:underline"
          >
            View this project page -&gt;
          </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProjectsSection({
  handle,
  projects,
}: {
  handle: string;
  projects: ProjectDetail[];
}) {
  const visibleProjects = projects.filter(
    (detail) => detail.project.is_visible && detail.project.is_published
  );
  const featuredProjects = visibleProjects.filter(
    (detail) => detail.project.is_featured
  );
  const projectsToShow =
    featuredProjects.length > 0 ? featuredProjects : visibleProjects;

  if (projectsToShow.length === 0) {
    return (
      <div className="bezel-outer">
        <div className="bezel-inner p-6 text-center space-y-3">
          <p className="text-sm font-medium">Projects</p>
          <p className="text-sm text-muted-foreground">
            No published projects have been added yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div className="space-y-2">
          <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-primary">
            Projects
          </span>
          <div className="space-y-1">
            <h2 className="text-sm font-semibold tracking-tight md:text-base">
              Selected case studies
            </h2>
            <p className="text-xs text-muted-foreground">
              Curated work, shipped by hand.
            </p>
          </div>
        </div>
        <Link
          href={toRoute(`/u/${handle}/projects`)}
          className="text-xs font-medium text-muted-foreground transition-colors duration-300 hover:text-foreground"
        >
          View all -&gt;
        </Link>
      </div>

      <div className="grid gap-4">
        {projectsToShow.slice(0, 3).map((detail) => (
          <ProjectCard
            key={detail.project.id}
            detail={detail}
            handle={handle}
          />
        ))}
      </div>
    </section>
  );
}
