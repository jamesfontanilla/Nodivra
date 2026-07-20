"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRightIcon, CheckIcon, CopyIcon, LinkIcon, SparkIcon } from "@/components/icons";
import { Badge } from "@/components/ui";
import type { ProfileSnipDraft, PublicProjectSnapshot, PublicSnipSnapshot, SnipLanguage } from "@/types/nodivra";

export function snipLanguageLabel(language: SnipLanguage) {
  if (language === "plaintext") return "Plain text";
  if (language === "tsx") return "TSX";
  if (language === "jsx") return "JSX";
  if (language === "sql") return "SQL";
  if (language === "json") return "JSON";
  if (language === "yaml") return "YAML";
  return language.charAt(0).toUpperCase() + language.slice(1);
}

export function draftToPublicSnip(snip: ProfileSnipDraft): PublicSnipSnapshot {
  return {
    id: snip.id,
    title: snip.title,
    slug: snip.slug,
    description: snip.description,
    code: snip.code,
    language: snip.language,
    tags: snip.tags,
    sourceUrl: snip.sourceUrl,
    isFeatured: snip.isFeatured,
    position: snip.position,
    links: snip.links.filter((link) => link.isEnabled).map((link) => ({
      id: link.id,
      kind: link.kind,
      projectId: link.projectId,
      label: link.label,
      url: link.url,
      position: link.position,
      isEnabled: link.isEnabled,
    })),
  };
}

export function CopySnippetButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  async function copyCode() {
    setFailed(false);
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setFailed(true);
    }
  }

  return <div className="flex items-center gap-3"><button type="button" onClick={() => void copyCode()} className="group inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-xs font-medium text-sand-50 ring-1 ring-white/10 transition-[transform,background-color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:bg-white/15 active:scale-[0.98]" aria-label={copied ? "Snippet copied" : "Copy snippet code"}><span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105">{copied ? <CheckIcon className="h-3.5 w-3.5" /> : <CopyIcon className="h-3.5 w-3.5" />}</span>{copied ? "Copied" : "Copy code"}</button><span className="sr-only" aria-live="polite">{copied ? "Snippet copied to clipboard." : failed ? "Clipboard access was blocked." : ""}</span>{failed ? <span className="text-xs text-rose-200">Clipboard unavailable</span> : null}</div>;
}

function SnipLinks({ snip, projects, profileHandle }: { snip: PublicSnipSnapshot; projects: PublicProjectSnapshot[]; profileHandle: string }) {
  return <div className="flex flex-wrap gap-2">{snip.links.map((link) => { const project = projects.find((candidate) => candidate.id === link.projectId); if (link.kind === "project" && project) return <Link key={link.id} href={`/u/${profileHandle}/projects/${project.slug}`} className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2.5 text-sm text-sand-100 ring-1 ring-white/10 transition-[transform,background-color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:bg-white/10"><LinkIcon className="h-3.5 w-3.5" />{link.label || project.projectName}</Link>; if (!link.url) return null; return <a key={link.id} href={link.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2.5 text-sm text-sand-100 ring-1 ring-white/10 transition-[transform,background-color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:bg-white/10"><ArrowUpRightIcon className="h-3.5 w-3.5" />{link.label || "Resource"}</a>; })}</div>;
}

function CodeBlock({ snip, compact = false }: { snip: PublicSnipSnapshot; compact?: boolean }) {
  return <div className="overflow-hidden rounded-[1.5rem] bg-[#080a0d] ring-1 ring-white/10"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3"><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-300/80" /><Badge tone="muted">{snipLanguageLabel(snip.language)}</Badge><span className="text-[10px] uppercase tracking-[0.16em] text-sand-300/55">Reference only</span></div>{compact ? null : <CopySnippetButton code={snip.code} />}</div><pre className={`overflow-x-auto p-5 font-mono text-[12px] leading-7 text-sand-100/90 sm:p-6 sm:text-[13px] ${compact ? "max-h-64" : "max-h-[620px]"}`} tabIndex={0} aria-label={`${snipLanguageLabel(snip.language)} code snippet`}><code>{snip.code}</code></pre></div>;
}

export function SnipCard({ snip, profileHandle, projects = [] }: { snip: PublicSnipSnapshot; profileHandle: string; projects?: PublicProjectSnapshot[] }) {
  return <article className="group rounded-[2rem] bg-white/5 p-1.5 ring-1 ring-white/10 transition-[transform,background-color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:bg-white/10"><div className="h-full rounded-[1.625rem] bg-ink-950/88 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-6"><div className="flex flex-wrap items-center gap-2">{snip.isFeatured ? <Badge tone="accent">Featured</Badge> : null}<Badge tone="muted">{snipLanguageLabel(snip.language)}</Badge>{snip.tags.slice(0, 2).map((tag) => <Badge key={tag} tone="muted">{tag}</Badge>)}</div><div className="mt-5 space-y-3"><h3 className="font-display text-3xl leading-tight tracking-tight text-sand-50"><Link href={`/u/${profileHandle}/snips/${snip.slug}`} className="transition-[color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-sand-200">{snip.title}</Link></h3><p className="text-sm leading-7 text-sand-200/80">{snip.description}</p></div><div className="mt-5"><CodeBlock snip={snip} compact /></div><div className="mt-5 flex flex-wrap items-center justify-between gap-3"><SnipLinks snip={snip} projects={projects} profileHandle={profileHandle} /><Link href={`/u/${profileHandle}/snips/${snip.slug}`} className="inline-flex items-center gap-2 text-sm text-sand-50 underline decoration-white/20 underline-offset-4 transition-[transform,color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:text-sand-200">Open snip <ArrowUpRightIcon className="h-4 w-4" /></Link></div></div></article>;
}

export function PublicSnippets({ snippets, profileHandle, projects = [] }: { snippets: PublicSnipSnapshot[]; profileHandle: string; projects?: PublicProjectSnapshot[] }) {
  const visibleSnips = [...snippets].sort((left, right) => Number(right.isFeatured) - Number(left.isFeatured) || left.position - right.position).slice(0, 4);
  if (visibleSnips.length === 0) return null;
  return <section className="space-y-8 py-16 sm:py-24" aria-labelledby="snips-heading"><div className="flex flex-wrap items-end justify-between gap-4"><div className="space-y-3"><Badge tone="muted">Technical references</Badge><h2 id="snips-heading" className="font-display text-4xl tracking-tight text-sand-50 sm:text-5xl">Small pieces, kept useful.</h2><p className="max-w-2xl text-sm leading-7 text-sand-200/80">A few compact patterns and implementation notes, preserved as readable reference rather than magic.</p></div><Link href={`/u/${profileHandle}/snips`} className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-sand-300/70 underline decoration-white/20 underline-offset-4 transition-[color,transform] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:text-sand-50">Explore all Snips <ArrowUpRightIcon className="h-3.5 w-3.5" /></Link></div><div className="grid gap-5 lg:grid-cols-2">{visibleSnips.map((snip) => <SnipCard key={snip.id} snip={snip} profileHandle={profileHandle} projects={projects} />)}</div></section>;
}

export function SnippetArticle({ snip, projects, profileHandle, relatedSnips = [] }: { snip: PublicSnipSnapshot; projects: PublicProjectSnapshot[]; profileHandle: string; relatedSnips?: PublicSnipSnapshot[] }) {
  return <article className="space-y-10"><header className="rounded-[2rem] bg-white/5 p-1.5 ring-1 ring-white/10"><div className="rounded-[1.625rem] bg-ink-950/88 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-10"><div className="flex flex-wrap gap-2">{snip.isFeatured ? <Badge tone="accent">Featured Snip</Badge> : null}<Badge tone="muted">{snipLanguageLabel(snip.language)}</Badge>{snip.tags.map((tag) => <Badge key={tag} tone="muted">{tag}</Badge>)}</div><h1 className="mt-5 max-w-4xl font-display text-5xl leading-[0.98] tracking-tight text-sand-50 sm:text-7xl">{snip.title}</h1><p className="mt-6 max-w-3xl text-lg leading-8 text-sand-200/85">{snip.description}</p><div className="mt-8 flex flex-wrap gap-2"><CopySnippetButton code={snip.code} />{snip.sourceUrl ? <a href={snip.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2.5 text-sm text-sand-50 ring-1 ring-white/10 transition-[transform,background-color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:bg-white/10"><ArrowUpRightIcon className="h-3.5 w-3.5" />Source reference</a> : null}</div></div></header><CodeBlock snip={snip} /><div className="mx-auto max-w-3xl space-y-6"><div><Badge tone="muted">Related context</Badge><h2 className="mt-3 font-display text-3xl tracking-tight text-sand-50">Where this fits.</h2></div><SnipLinks snip={snip} projects={projects} profileHandle={profileHandle} /></div>{relatedSnips.length > 0 ? <aside className="space-y-5"><div className="flex items-end justify-between gap-4"><div><Badge tone="muted">Keep exploring</Badge><h2 className="mt-3 font-display text-3xl tracking-tight text-sand-50">Related Snips</h2></div><Link href={`/u/${profileHandle}/snips`} className="text-xs uppercase tracking-[0.18em] text-sand-300/70 underline decoration-white/20 underline-offset-4">All Snips</Link></div><div className="grid gap-5 md:grid-cols-2">{relatedSnips.slice(0, 3).map((related) => <SnipCard key={related.id} snip={related} profileHandle={profileHandle} projects={projects} />)}</div></aside> : null}</article>;
}

export function SnipDetailPreview({ snip }: { snip: PublicSnipSnapshot }) {
  return <div className="rounded-[2rem] bg-white/5 p-1.5 ring-1 ring-white/10"><div className="rounded-[1.625rem] bg-ink-950/88 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"><Badge tone="accent">Snip preview</Badge><h2 className="mt-4 font-display text-4xl leading-tight tracking-tight text-sand-50">{snip.title}</h2><p className="mt-3 text-sm leading-7 text-sand-200/80">{snip.description}</p><div className="mt-5"><CodeBlock snip={snip} compact /></div></div></div>;
}
