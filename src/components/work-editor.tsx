"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon, LinkIcon, PlusIcon, SparkIcon, TrashIcon } from "@/components/icons";
import { draftToPublicWorkService, WorkDetailPreview, workAvailabilityLabel } from "@/components/work-detail";
import { cn } from "@/lib/classnames";
import {
  WORK_AVAILABILITY_STATUSES,
  WORK_SERVICE_LINK_KINDS,
  type AvailabilitySettingsDraft,
  type ProfileProjectDraft,
  type ProfileWorkServiceDraft,
  type WorkAvailabilityStatus,
  type WorkServiceLinkDraft,
  type WorkServiceLinkKind,
} from "@/types/nodivra";
import { Badge, Button, EmptyState, FieldShell, Input, Panel, Select, Textarea } from "@/components/ui";

const MAX_FEATURED_SERVICES = 3;

function createId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `00000000-0000-4000-8000-${Math.random().toString(16).slice(2).padEnd(12, "0").slice(0, 12)}`;
}

function timestamp() {
  return new Date().toISOString();
}

function slugify(value: string, fallback: string) {
  const slug = value.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
  return slug || fallback;
}

function createService(profileId: string, position: number): ProfileWorkServiceDraft {
  const now = timestamp();
  return {
    id: createId(),
    profileId,
    title: "A service in progress",
    slug: `service-${position + 1}`,
    description: "Describe the useful outcome, the shape of the engagement, and who it is for.",
    startingPriceText: "Contact for estimate",
    deliveryTimeText: "Scoped together",
    skills: ["Product direction"],
    availabilityStatus: "open_to_conversations",
    contactCtaLabel: "Start a conversation",
    contactCtaUrl: "",
    isPublished: false,
    isFeatured: false,
    position,
    links: [],
    createdAt: now,
    updatedAt: now,
  };
}

function statusLabel(status: WorkAvailabilityStatus) {
  return workAvailabilityLabel(status);
}

export function WorkEditor({ profileId, availabilitySettings, services, projects, onChange, fieldErrors }: { profileId: string; availabilitySettings: AvailabilitySettingsDraft; services: ProfileWorkServiceDraft[]; projects: ProfileProjectDraft[]; onChange: (availabilitySettings: AvailabilitySettingsDraft, services: ProfileWorkServiceDraft[]) => void; fieldErrors: Record<string, string> }) {
  const [selectedId, setSelectedId] = useState<string | null>(services[0]?.id ?? null);
  const [showPreview, setShowPreview] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const selected = services.find((service) => service.id === selectedId) ?? null;
  const selectedIndex = selected ? services.findIndex((service) => service.id === selected.id) : -1;

  function update(nextAvailability: AvailabilitySettingsDraft, nextServices: ProfileWorkServiceDraft[]) {
    onChange({ ...nextAvailability, updatedAt: timestamp() }, nextServices.map((service, position) => ({ ...service, position })));
  }

  function patchAvailability<K extends keyof AvailabilitySettingsDraft>(key: K, value: AvailabilitySettingsDraft[K]) {
    update({ ...availabilitySettings, [key]: value }, services);
  }

  function patchService<K extends keyof ProfileWorkServiceDraft>(id: string, key: K, value: ProfileWorkServiceDraft[K]) {
    update(availabilitySettings, services.map((service) => service.id === id ? { ...service, [key]: value, updatedAt: timestamp() } : service));
  }

  function patchServiceText(id: string, key: keyof Pick<ProfileWorkServiceDraft, "title" | "slug" | "description" | "startingPriceText" | "deliveryTimeText" | "contactCtaLabel" | "contactCtaUrl">, value: string) {
    patchService(id, key, key === "slug" ? slugify(value, "service") : value);
  }

  function patchSkills(id: string, value: string) {
    patchService(id, "skills", value.split(",").map((skill) => skill.trim()).filter(Boolean).slice(0, 8));
  }

  function addService() {
    const service = createService(profileId, services.length);
    setSelectedId(service.id);
    setMessage(null);
    update(availabilitySettings, [...services, service]);
  }

  function setPublished(service: ProfileWorkServiceDraft, value: boolean) {
    update(availabilitySettings, services.map((candidate) => candidate.id === service.id ? { ...candidate, isPublished: value, isFeatured: value ? candidate.isFeatured : false, updatedAt: timestamp() } : candidate));
  }

  function toggleFeatured(service: ProfileWorkServiceDraft) {
    if (!service.isPublished) { setMessage("Publish a service before featuring it."); return; }
    if (!service.isFeatured && services.filter((candidate) => candidate.isFeatured).length >= MAX_FEATURED_SERVICES) { setMessage(`Choose ${MAX_FEATURED_SERVICES} featured services or fewer.`); return; }
    setMessage(null);
    patchService(service.id, "isFeatured", !service.isFeatured);
  }

  function moveService(id: string, direction: "up" | "down") {
    const index = services.findIndex((service) => service.id === id);
    const target = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || target < 0 || target >= services.length) return;
    const next = [...services];
    const [item] = next.splice(index, 1);
    if (item) next.splice(target, 0, item);
    update(availabilitySettings, next);
  }

  function removeService(id: string) {
    setSelectedId((current) => current === id ? null : current);
    update(availabilitySettings, services.filter((service) => service.id !== id));
  }

  function addLink(service: ProfileWorkServiceDraft, kind: WorkServiceLinkKind) {
    if (service.links.length >= 4) { setMessage("A service can have four links or fewer."); return; }
    const project = kind === "project" ? projects.find((candidate) => !service.links.some((link) => link.projectId === candidate.id)) : null;
    if (kind === "project" && !project) { setMessage(projects.length === 0 ? "Add a Project before linking it here." : "This service already links to every Project."); return; }
    const now = timestamp();
    const link: WorkServiceLinkDraft = { id: createId(), profileId, serviceId: service.id, kind, projectId: project?.id ?? "", label: kind === "project" ? "Related project" : "Resource", url: kind === "resource" ? "https://example.com" : "", position: service.links.length, isEnabled: true, createdAt: now, updatedAt: now };
    patchService(service.id, "links", [...service.links, link]);
  }

  function patchLink(service: ProfileWorkServiceDraft, linkId: string, key: keyof Pick<WorkServiceLinkDraft, "projectId" | "label" | "url" | "isEnabled">, value: string | boolean) {
    patchService(service.id, "links", service.links.map((link) => link.id === linkId ? { ...link, [key]: value, updatedAt: timestamp() } : link));
  }

  function removeLink(service: ProfileWorkServiceDraft, linkId: string) {
    patchService(service.id, "links", service.links.filter((link) => link.id !== linkId).map((link, position) => ({ ...link, position })));
  }

  return (
    <div className="space-y-6">
      <Panel tone="dark">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div className="space-y-3"><Badge tone="accent">Nodivra Work</Badge><h2 className="font-display text-3xl tracking-tight text-sand-50 sm:text-4xl">Make the right work easier to find.</h2><p className="max-w-2xl text-sm leading-7 text-sand-200/80">Name what you do, show how available you are, and make the next conversation feel appropriately small.</p></div><div className="flex flex-wrap gap-2"><Button type="button" variant={showPreview ? "primary" : "secondary"} onClick={() => setShowPreview((value) => !value)}>{showPreview ? "Hide preview" : "Preview service"}</Button><Button type="button" variant="secondary" onClick={addService} trailingIcon={<PlusIcon className="h-3.5 w-3.5" />}>New service</Button></div></div>
        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-[1.5rem] bg-white/5 px-4 py-3 ring-1 ring-white/10"><SparkIcon className="h-4 w-4 text-sand-200/75" /><span className="text-xs uppercase tracking-[0.18em] text-sand-300/70">Human-scale inquiries</span><span className="text-sm text-sand-200/75">No payments, contracts, or automatic email. Use the CTA to start a conversation.</span><Badge tone={message ? "danger" : "muted"}>{message ?? "Ready to save"}</Badge></div>
        {fieldErrors.services ? <p className="mt-4 rounded-2xl bg-rose-400/10 px-4 py-3 text-sm text-rose-200 ring-1 ring-rose-300/30">{fieldErrors.services}</p> : null}
      </Panel>

      <Panel tone="dark">
        <div className="space-y-5"><div><Badge tone="muted">Availability settings</Badge><h3 className="mt-3 font-display text-2xl tracking-tight text-sand-50">Set the expectation before the pitch.</h3><p className="mt-2 max-w-2xl text-sm leading-7 text-sand-200/75">This compact banner is public only when enabled. It describes your current posture, not a promise of instant delivery.</p></div><div className="grid gap-4 sm:grid-cols-2"><FieldShell label="Status" error={fieldErrors["availabilitySettings.status"]}><Select value={availabilitySettings.status} onChange={(event) => patchAvailability("status", event.target.value as WorkAvailabilityStatus)}>{WORK_AVAILABILITY_STATUSES.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}</Select></FieldShell><FieldShell label="Headline" error={fieldErrors["availabilitySettings.headline"]}><Input value={availabilitySettings.headline} onChange={(event) => patchAvailability("headline", event.target.value)} /></FieldShell></div><FieldShell label="Detail" error={fieldErrors["availabilitySettings.detail"]}><Textarea value={availabilitySettings.detail} onChange={(event) => patchAvailability("detail", event.target.value)} /></FieldShell><div className="grid gap-4 sm:grid-cols-2"><FieldShell label="CTA label" error={fieldErrors["availabilitySettings.contactCtaLabel"]}><Input value={availabilitySettings.contactCtaLabel} onChange={(event) => patchAvailability("contactCtaLabel", event.target.value)} /></FieldShell><FieldShell label="CTA URL" hint="http or https only." error={fieldErrors["availabilitySettings.contactCtaUrl"]}><Input value={availabilitySettings.contactCtaUrl} onChange={(event) => patchAvailability("contactCtaUrl", event.target.value)} placeholder="https://..." /></FieldShell></div><label className="flex items-center gap-2 text-sm text-sand-200/80"><input type="checkbox" checked={availabilitySettings.isEnabled} onChange={(event) => patchAvailability("isEnabled", event.target.checked)} className="h-4 w-4 rounded border-white/20 bg-transparent text-sand-100 focus:ring-sand-200/20" />Show availability banner publicly</label></div>
      </Panel>

      {showPreview && selected ? <WorkDetailPreview service={draftToPublicWorkService(selected)} /> : null}
      {services.length === 0 ? <EmptyState title="Start your service shelf" description="Add one clear service when you know the useful outcome and the kind of conversation it deserves." action={<Button type="button" variant="secondary" onClick={addService} trailingIcon={<PlusIcon className="h-3.5 w-3.5" />}>Add your first service</Button>} /> : <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start"><div className="space-y-4">{services.map((service, index) => <article key={service.id} className={cn("rounded-[2rem] bg-white/5 p-1.5 ring-1 ring-white/10", selectedId === service.id && "bg-sand-100/10")}><div className="rounded-[1.625rem] bg-ink-950/88 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-6"><div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sand-100 text-ink-950"><SparkIcon className="h-4 w-4" /></div><div className="min-w-0 flex-1 space-y-3"><div className="flex flex-wrap items-center gap-2"><Badge tone={service.isPublished ? "success" : "muted"}>{service.isPublished ? "Published" : "Draft"}</Badge>{service.isFeatured ? <Badge tone="accent">Featured</Badge> : null}<Badge tone="muted">{statusLabel(service.availabilityStatus)}</Badge></div><h3 className="font-display text-2xl tracking-tight text-sand-50">{service.title}</h3><p className="text-sm leading-7 text-sand-200/75">{service.description}</p></div></div><div className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4"><Button type="button" variant={selectedId === service.id ? "primary" : "secondary"} onClick={() => setSelectedId(service.id)}>{selectedId === service.id ? "Editing" : "Edit service"}</Button><Button type="button" variant="ghost" onClick={() => moveService(service.id, "up")} disabled={index === 0} trailingIcon={<ChevronUpIcon className="h-3.5 w-3.5" />}>Up</Button><Button type="button" variant="ghost" onClick={() => moveService(service.id, "down")} disabled={index === services.length - 1} trailingIcon={<ChevronDownIcon className="h-3.5 w-3.5" />}>Down</Button><Button type="button" variant="ghost" onClick={() => toggleFeatured(service)}>{service.isFeatured ? "Unfeature" : "Feature"}</Button><Button type="button" variant="ghost" onClick={() => setPublished(service, !service.isPublished)}>{service.isPublished ? "Unpublish" : "Publish"}</Button><Button type="button" variant="danger" onClick={() => removeService(service.id)} trailingIcon={<TrashIcon className="h-3.5 w-3.5" />}>Delete</Button></div></div></article>)}</div><aside className="lg:sticky lg:top-6"><div className="rounded-[2rem] bg-white/5 p-1.5 ring-1 ring-white/10"><div className="rounded-[1.625rem] bg-ink-950/88 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-6">{selected ? <div className="space-y-5"><div><p className="text-[10px] font-medium uppercase tracking-[0.22em] text-sand-300/70">Service settings</p><h3 className="mt-2 font-display text-2xl tracking-tight text-sand-50">{selected.title}</h3><p className="mt-2 text-xs leading-6 text-sand-300/70">Keep the promise legible. Rates and private notes do not travel to the public page.</p></div><div className="space-y-5 border-t border-white/10 pt-5"><FieldShell label="Title" error={fieldErrors[`services.${selectedIndex}.title`]}><Input value={selected.title} onChange={(event) => patchServiceText(selected.id, "title", event.target.value)} /></FieldShell><FieldShell label="Slug" hint="Used in the public Work URL." error={fieldErrors[`services.${selectedIndex}.slug`]}><Input value={selected.slug} onChange={(event) => patchServiceText(selected.id, "slug", event.target.value)} /></FieldShell><FieldShell label="Description" hint="600 characters or fewer." error={fieldErrors[`services.${selectedIndex}.description`]}><Textarea value={selected.description} onChange={(event) => patchServiceText(selected.id, "description", event.target.value)} /></FieldShell><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1"><FieldShell label="Starting price text" hint="Use Contact for estimate when you do not publish rates." error={fieldErrors[`services.${selectedIndex}.startingPriceText`]}><Input value={selected.startingPriceText} onChange={(event) => patchServiceText(selected.id, "startingPriceText", event.target.value)} /></FieldShell><FieldShell label="Typical delivery" error={fieldErrors[`services.${selectedIndex}.deliveryTimeText`]}><Input value={selected.deliveryTimeText} onChange={(event) => patchServiceText(selected.id, "deliveryTimeText", event.target.value)} /></FieldShell><FieldShell label="Availability" error={fieldErrors[`services.${selectedIndex}.availabilityStatus`]}><Select value={selected.availabilityStatus} onChange={(event) => patchService(selected.id, "availabilityStatus", event.target.value as WorkAvailabilityStatus)}>{WORK_AVAILABILITY_STATUSES.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}</Select></FieldShell></div><FieldShell label="Skills" hint="Comma-separated, up to eight." error={fieldErrors[`services.${selectedIndex}.skills`]}><Input value={selected.skills.join(", ")} onChange={(event) => patchSkills(selected.id, event.target.value)} /></FieldShell><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1"><FieldShell label="Contact CTA" error={fieldErrors[`services.${selectedIndex}.contactCtaLabel`]}><Input value={selected.contactCtaLabel} onChange={(event) => patchServiceText(selected.id, "contactCtaLabel", event.target.value)} /></FieldShell><FieldShell label="Contact URL" hint="http or https only." error={fieldErrors[`services.${selectedIndex}.contactCtaUrl`]}><Input value={selected.contactCtaUrl} onChange={(event) => patchServiceText(selected.id, "contactCtaUrl", event.target.value)} placeholder="https://..." /></FieldShell></div><div className="space-y-3 rounded-[1.35rem] bg-white/5 p-4 ring-1 ring-white/10"><div className="flex items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.18em] text-sand-300/70">Related context</p><p className="mt-1 text-xs text-sand-300/60">Connect a published Project or a safe external resource.</p></div><div className="flex flex-wrap justify-end gap-2">{WORK_SERVICE_LINK_KINDS.map((kind) => <Button key={kind} type="button" variant="ghost" onClick={() => addLink(selected, kind)}><LinkIcon className="mr-1 h-3.5 w-3.5" />{kind}</Button>)}</div></div>{selected.links.map((link, linkIndex) => <div key={link.id} className="space-y-3 rounded-2xl border border-white/10 bg-black/10 p-3"><div className="flex items-center justify-between gap-3"><Badge tone="muted">{link.kind}</Badge><Button type="button" variant="ghost" onClick={() => removeLink(selected, link.id)} trailingIcon={<TrashIcon className="h-3.5 w-3.5" />}>Remove</Button></div>{link.kind === "project" ? <FieldShell label="Project" error={fieldErrors[`services.${selectedIndex}.links.${linkIndex}.projectId`]}><Select value={link.projectId} onChange={(event) => patchLink(selected, link.id, "projectId", event.target.value)}><option value="">Choose a Project</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.projectName}</option>)}</Select></FieldShell> : <><FieldShell label="Label" error={fieldErrors[`services.${selectedIndex}.links.${linkIndex}.label`]}><Input value={link.label} onChange={(event) => patchLink(selected, link.id, "label", event.target.value)} /></FieldShell><FieldShell label="URL" hint="http or https only." error={fieldErrors[`services.${selectedIndex}.links.${linkIndex}.url`]}><Input value={link.url} onChange={(event) => patchLink(selected, link.id, "url", event.target.value)} /></FieldShell></>}<label className="flex items-center gap-2 text-xs text-sand-200/75"><input type="checkbox" checked={link.isEnabled} onChange={(event) => patchLink(selected, link.id, "isEnabled", event.target.checked)} className="h-4 w-4 rounded border-white/20 bg-transparent text-sand-100 focus:ring-sand-200/20" />Show this link publicly</label></div>)}</div><div className="flex flex-wrap gap-2"><Button type="button" variant={selected.isFeatured ? "primary" : "secondary"} onClick={() => toggleFeatured(selected)}>{selected.isFeatured ? "Featured service" : "Mark featured"}</Button><Button type="button" variant={selected.isPublished ? "primary" : "secondary"} onClick={() => setPublished(selected, !selected.isPublished)}>{selected.isPublished ? "Published service" : "Keep private"}</Button></div></div></div> : <div className="space-y-4"><Badge tone="muted">Service settings</Badge><h3 className="font-display text-2xl tracking-tight text-sand-50">Select a service to edit it.</h3><p className="text-sm leading-7 text-sand-200/80">Keep each offer specific enough that the right person can recognize themselves in it.</p></div>}</div></div></aside></div>}
    </div>
  );
}
