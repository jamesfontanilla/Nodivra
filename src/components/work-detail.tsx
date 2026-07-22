import Link from "next/link";
import { ArrowUpRightIcon, LinkIcon, SparkIcon } from "@/components/icons";
import { Badge } from "@/components/ui";
import type {
  AvailabilitySettingsDraft,
  ProfileWorkServiceDraft,
  PublicAvailabilitySnapshot,
  PublicProjectSnapshot,
  PublicWorkServiceSnapshot,
  WorkAvailabilityStatus,
} from "@/types/nodivra";

export function workAvailabilityLabel(status: WorkAvailabilityStatus) {
  if (status === "limited_availability") return "Limited availability";
  if (status === "not_available") return "Not available";
  if (status === "open_to_conversations") return "Open to conversations";
  return "Available";
}

function statusTone(status: WorkAvailabilityStatus): "success" | "accent" | "danger" | "muted" {
  if (status === "available") return "success";
  if (status === "limited_availability" || status === "open_to_conversations") return "accent";
  return "danger";
}

export function draftToPublicWorkService(service: ProfileWorkServiceDraft): PublicWorkServiceSnapshot {
  return {
    id: service.id,
    title: service.title,
    slug: service.slug,
    description: service.description,
    startingPriceText: service.startingPriceText,
    deliveryTimeText: service.deliveryTimeText,
    skills: service.skills,
    availabilityStatus: service.availabilityStatus,
    contactCtaLabel: service.contactCtaLabel,
    contactCtaUrl: service.contactCtaUrl,
    isFeatured: service.isFeatured,
    position: service.position,
    links: service.links.filter((link) => link.isEnabled).map((link) => ({
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

export function draftToPublicAvailability(settings: AvailabilitySettingsDraft | null): PublicAvailabilitySnapshot | null {
  if (!settings || !settings.isEnabled) return null;
  return {
    status: settings.status,
    headline: settings.headline,
    detail: settings.detail,
    contactCtaLabel: settings.contactCtaLabel,
    contactCtaUrl: settings.contactCtaUrl,
  };
}

function ServiceLinks({ service, projects, profileHandle }: { service: PublicWorkServiceSnapshot; projects: PublicProjectSnapshot[]; profileHandle: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {service.links.map((link) => {
        if (link.kind === "project") {
          const project = projects.find((candidate) => candidate.id === link.projectId);
          if (!project) return null;
          return <Link key={link.id} href={`/u/${profileHandle}/projects/${project.slug}`} className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-xs text-sand-100 ring-1 ring-white/10 hover:bg-white/10"><LinkIcon className="h-3.5 w-3.5" />{link.label || project.projectName}</Link>;
        }
        return <a key={link.id} href={link.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-xs text-sand-100 ring-1 ring-white/10 hover:bg-white/10"><ArrowUpRightIcon className="h-3.5 w-3.5" />{link.label}</a>;
      })}
    </div>
  );
}

export function ServiceCard({ service, projects, profileHandle }: { service: PublicWorkServiceSnapshot; projects: PublicProjectSnapshot[]; profileHandle: string }) {
  return (
    <article className="rounded-[2rem] bg-white/5 p-1.5 ring-1 ring-white/10">
      <div className="flex h-full flex-col rounded-[1.625rem] bg-ink-950/88 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <Badge tone={statusTone(service.availabilityStatus)}>{workAvailabilityLabel(service.availabilityStatus)}</Badge>
          {service.isFeatured ? <Badge tone="accent">Featured</Badge> : null}
        </div>
        <h3 className="mt-5 font-display text-2xl tracking-tight text-sand-50">{service.title}</h3>
        <p className="mt-3 text-sm leading-7 text-sand-200/80">{service.description}</p>
        <div className="mt-5 grid gap-3 border-y border-white/10 py-4 text-xs text-sand-200/75 sm:grid-cols-2">
          <div><span className="block uppercase tracking-[0.16em] text-sand-300/60">Starting point</span><span className="mt-1 block text-sm text-sand-50">{service.startingPriceText || "Contact for estimate"}</span></div>
          <div><span className="block uppercase tracking-[0.16em] text-sand-300/60">Typical pace</span><span className="mt-1 block text-sm text-sand-50">{service.deliveryTimeText || "Scoped together"}</span></div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">{service.skills.map((skill) => <Badge key={skill} tone="muted">{skill}</Badge>)}</div>
        <div className="mt-auto space-y-4 pt-6">
          <ServiceLinks service={service} projects={projects} profileHandle={profileHandle} />
          <div className="flex flex-wrap gap-2">
            <Link href={`/u/${profileHandle}/work/${service.slug}`} className="inline-flex items-center gap-2 rounded-full bg-sand-100 px-4 py-2.5 text-sm font-medium text-ink-950 hover:bg-sand-50">Explore service <ArrowUpRightIcon className="h-3.5 w-3.5" /></Link>
            {service.contactCtaUrl ? <a href={service.contactCtaUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2.5 text-sm text-sand-50 ring-1 ring-white/10 hover:bg-white/10">{service.contactCtaLabel || "Start a conversation"}</a> : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function AvailabilityBanner({ availability }: { availability: PublicAvailabilitySnapshot }) {
  return (
    <div className="rounded-[2rem] bg-sand-100/10 p-1.5 ring-1 ring-sand-100/20">
      <div className="flex flex-col gap-5 rounded-[1.625rem] bg-ink-950/88 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-3">
          <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sand-100 text-ink-950"><SparkIcon className="h-4 w-4" /></div>
          <div><div className="flex flex-wrap items-center gap-2"><Badge tone={statusTone(availability.status)}>{workAvailabilityLabel(availability.status)}</Badge><span className="text-xs uppercase tracking-[0.16em] text-sand-300/60">Availability</span></div><h2 className="mt-3 font-display text-2xl tracking-tight text-sand-50">{availability.headline}</h2><p className="mt-2 max-w-2xl text-sm leading-7 text-sand-200/75">{availability.detail}</p></div>
        </div>
        {availability.contactCtaUrl ? <a href={availability.contactCtaUrl} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-sand-100 px-4 py-2.5 text-sm font-medium text-ink-950 hover:bg-sand-50">{availability.contactCtaLabel || "Start a conversation"}<ArrowUpRightIcon className="h-3.5 w-3.5" /></a> : null}
      </div>
    </div>
  );
}

export function PublicWork({ availability, services, projects, profileHandle }: { availability: PublicAvailabilitySnapshot | null; services: PublicWorkServiceSnapshot[]; projects: PublicProjectSnapshot[]; profileHandle: string }) {
  if (!availability && services.length === 0) return null;
  const featured = services.filter((service) => service.isFeatured);
  const visible = (featured.length > 0 ? featured : services).slice(0, 3);
  return (
    <section className="space-y-5">
      {availability ? <AvailabilityBanner availability={availability} /> : null}
      {visible.length > 0 ? <div className="space-y-5"><div className="flex flex-wrap items-end justify-between gap-4"><div><Badge tone="muted">Nodivra Work</Badge><h2 className="mt-3 font-display text-4xl tracking-tight text-sand-50">Useful work, clearly scoped.</h2><p className="mt-2 max-w-2xl text-sm leading-7 text-sand-200/75">A small set of ways to work together, with enough context to decide if the shape fits.</p></div>{services.length > 3 ? <Link href={`/u/${profileHandle}/work`} className="text-xs uppercase tracking-[0.18em] text-sand-300/70 underline decoration-white/20 underline-offset-4 hover:text-sand-50">Explore all Work <ArrowUpRightIcon className="inline h-3.5 w-3.5" /></Link> : null}</div><div className="grid gap-5 lg:grid-cols-2">{visible.map((service) => <ServiceCard key={service.id} service={service} projects={projects} profileHandle={profileHandle} />)}</div></div> : null}
    </section>
  );
}

export function WorkDetailPreview({ service }: { service: PublicWorkServiceSnapshot }) {
  return <div className="rounded-[2rem] bg-white/5 p-1.5 ring-1 ring-white/10"><div className="rounded-[1.625rem] bg-ink-950/88 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"><Badge tone="accent">Work preview</Badge><h2 className="mt-4 font-display text-4xl tracking-tight text-sand-50">{service.title}</h2><p className="mt-3 text-sm leading-7 text-sand-200/80">{service.description}</p><div className="mt-5 flex flex-wrap gap-2">{service.skills.map((skill) => <Badge key={skill} tone="muted">{skill}</Badge>)}</div></div></div>;
}

export function ServiceArticle({ service, projects, profileHandle, relatedServices = [] }: { service: PublicWorkServiceSnapshot; projects: PublicProjectSnapshot[]; profileHandle: string; relatedServices?: PublicWorkServiceSnapshot[] }) {
  return <article className="space-y-8"><header className="rounded-[2rem] bg-white/5 p-1.5 ring-1 ring-white/10"><div className="rounded-[1.625rem] bg-ink-950/88 p-6 sm:p-10"><div className="flex flex-wrap gap-2"><Badge tone={statusTone(service.availabilityStatus)}>{workAvailabilityLabel(service.availabilityStatus)}</Badge>{service.isFeatured ? <Badge tone="accent">Featured service</Badge> : null}</div><h1 className="mt-5 max-w-4xl font-display text-5xl leading-[0.98] tracking-tight text-sand-50 sm:text-7xl">{service.title}</h1><p className="mt-6 max-w-3xl text-lg leading-8 text-sand-200/85">{service.description}</p><div className="mt-8 flex flex-wrap gap-2">{service.contactCtaUrl ? <a href={service.contactCtaUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-sand-100 px-4 py-2.5 text-sm font-medium text-ink-950 hover:bg-sand-50">{service.contactCtaLabel || "Start a conversation"}<ArrowUpRightIcon className="h-3.5 w-3.5" /></a> : null}</div></div></header><div className="grid gap-5 md:grid-cols-2"><div className="rounded-[2rem] bg-white/5 p-1.5 ring-1 ring-white/10"><div className="rounded-[1.625rem] bg-ink-950/88 p-6"><p className="text-xs uppercase tracking-[0.18em] text-sand-300/60">Starting point</p><p className="mt-3 font-display text-3xl text-sand-50">{service.startingPriceText || "Contact for estimate"}</p></div></div><div className="rounded-[2rem] bg-white/5 p-1.5 ring-1 ring-white/10"><div className="rounded-[1.625rem] bg-ink-950/88 p-6"><p className="text-xs uppercase tracking-[0.18em] text-sand-300/60">Typical pace</p><p className="mt-3 font-display text-3xl text-sand-50">{service.deliveryTimeText || "Scoped together"}</p></div></div></div><div className="mx-auto max-w-3xl space-y-5"><div><Badge tone="muted">What this draws on</Badge><div className="mt-4 flex flex-wrap gap-2">{service.skills.map((skill) => <Badge key={skill} tone="muted">{skill}</Badge>)}</div></div><ServiceLinks service={service} projects={projects} profileHandle={profileHandle} /></div>{relatedServices.length > 0 ? <aside className="space-y-5"><div className="flex items-end justify-between gap-4"><div><Badge tone="muted">Keep exploring</Badge><h2 className="mt-3 font-display text-3xl tracking-tight text-sand-50">Other ways to work together</h2></div><Link href={`/u/${profileHandle}/work`} className="text-xs uppercase tracking-[0.18em] text-sand-300/70 underline decoration-white/20 underline-offset-4">All Work</Link></div><div className="grid gap-5 md:grid-cols-2">{relatedServices.slice(0, 2).map((related) => <ServiceCard key={related.id} service={related} projects={projects} profileHandle={profileHandle} />)}</div></aside> : null}</article>;
}
