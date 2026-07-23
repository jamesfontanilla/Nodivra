"use client";

import { useState, type FormEvent } from "react";
import { ArrowUpRightIcon, CheckIcon, SparkIcon, TrashIcon } from "@/components/icons";
import { cn } from "@/lib/classnames";
import { Badge, Button, EmptyState, FieldShell, Input, Panel, Select, Textarea } from "@/components/ui";
import type {
  InboxInquiry,
  InquiryStatus,
  PublicProjectSnapshot,
  PublicWorkServiceSnapshot,
} from "@/types/nodivra";

type PublicFormState = {
  name: string;
  contactText: string;
  subject: string;
  message: string;
  inquiryType: "project" | "service" | "speaking" | "mentoring" | "other";
  consent: boolean;
  relatedServiceSlug: string;
  relatedProjectSlug: string;
  honeypot: string;
};

const initialForm: PublicFormState = {
  name: "",
  contactText: "",
  subject: "",
  message: "",
  inquiryType: "project",
  consent: false,
  relatedServiceSlug: "",
  relatedProjectSlug: "",
  honeypot: "",
};

const statusLabels: Record<InquiryStatus, string> = {
  unread: "Unread",
  read: "Read",
  archived: "Archived",
  replied: "Replied manually",
  spam: "Spam",
};

function statusTone(status: InquiryStatus): "muted" | "success" | "accent" | "danger" {
  if (status === "unread") return "accent";
  if (status === "replied") return "success";
  if (status === "spam") return "danger";
  return "muted";
}

function inquiryTypeLabel(type: PublicFormState["inquiryType"]) {
  if (type === "speaking") return "Speaking or workshop";
  if (type === "mentoring") return "Mentoring";
  if (type === "service") return "A service";
  if (type === "project") return "A project";
  return "Something else";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function PublicInquiryForm({
  handle,
  services,
  projects,
  defaultServiceSlug = "",
  defaultProjectSlug = "",
}: {
  handle: string;
  services: PublicWorkServiceSnapshot[];
  projects: PublicProjectSnapshot[];
  defaultServiceSlug?: string;
  defaultProjectSlug?: string;
}) {
  const [form, setForm] = useState<PublicFormState>({
    ...initialForm,
    relatedServiceSlug: defaultServiceSlug,
    relatedProjectSlug: defaultProjectSlug,
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function patch<K extends keyof PublicFormState>(key: K, value: PublicFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: "" }));
    setNotice(null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setNotice(null);
    setFieldErrors({});

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, handle }),
      });
      const payload = (await response.json()) as {
        ok: boolean;
        message?: string;
        fieldErrors?: Record<string, string>;
      };

      if (!response.ok || !payload.ok) {
        setFieldErrors(payload.fieldErrors ?? {});
        setNotice(payload.message ?? "Review the form and try again.");
        return;
      }

      setForm(initialForm);
      setNotice(payload.message ?? "If this profile accepts messages, your note has been received.");
    } catch {
      setNotice("The message could not be sent. Please try again in a moment.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="inbox" className="scroll-mt-8">
      <div className="rounded-[2.5rem] bg-sand-100/10 p-1.5 ring-1 ring-sand-100/20 shadow-halo">
        <div className="rounded-[2rem] bg-ink-950/92 px-5 py-6 text-sand-50 sm:px-8 sm:py-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:items-start">
            <div className="space-y-5">
              <Badge tone="accent">Nodivra Inbox</Badge>
              <div className="space-y-3">
                <h2 className="font-display text-4xl leading-tight tracking-tight sm:text-5xl">Bring the useful context.</h2>
                <p className="max-w-xl text-sm leading-7 text-sand-200/80 sm:text-base">
                  Send a collaboration brief without creating an account. This profile stores the note privately; it does not send email or promise a reply.
                </p>
              </div>
              <div className="flex items-start gap-3 rounded-[1.35rem] bg-white/5 p-4 ring-1 ring-white/10">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sand-100 text-ink-950">
                  <SparkIcon className="h-4 w-4" />
                </span>
                <p className="text-xs leading-6 text-sand-200/75">A clear subject, a little context, and one reliable way to reach you makes the first exchange easier.</p>
              </div>
            </div>

            <form onSubmit={submit} className="space-y-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <FieldShell label="Your name" error={fieldErrors.name}>
                  <Input value={form.name} onChange={(event) => patch("name", event.target.value)} autoComplete="name" maxLength={120} required />
                </FieldShell>
                <FieldShell label="Contact text" hint="Email, handle, or another route." error={fieldErrors.contactText}>
                  <Input value={form.contactText} onChange={(event) => patch("contactText", event.target.value)} autoComplete="email" maxLength={200} required />
                </FieldShell>
              </div>
              <FieldShell label="Subject" error={fieldErrors.subject}>
                <Input value={form.subject} onChange={(event) => patch("subject", event.target.value)} maxLength={160} required />
              </FieldShell>
              <div className="grid gap-4 sm:grid-cols-2">
                <FieldShell label="Inquiry type" error={fieldErrors.inquiryType}>
                  <Select value={form.inquiryType} onChange={(event) => patch("inquiryType", event.target.value as PublicFormState["inquiryType"])}>
                    {(["project", "service", "speaking", "mentoring", "other"] as const).map((type) => <option key={type} value={type}>{inquiryTypeLabel(type)}</option>)}
                  </Select>
                </FieldShell>
                <FieldShell label="Related service" hint="Optional.">
                  <Select value={form.relatedServiceSlug} onChange={(event) => patch("relatedServiceSlug", event.target.value)}>
                    <option value="">No service selected</option>
                    {services.map((service) => <option key={service.id} value={service.slug}>{service.title}</option>)}
                  </Select>
                </FieldShell>
              </div>
              <FieldShell label="Related project" hint="Optional.">
                <Select value={form.relatedProjectSlug} onChange={(event) => patch("relatedProjectSlug", event.target.value)}>
                  <option value="">No project selected</option>
                  {projects.map((project) => <option key={project.id} value={project.slug}>{project.projectName}</option>)}
                </Select>
              </FieldShell>
              <FieldShell label="Message" error={fieldErrors.message}>
                <Textarea value={form.message} onChange={(event) => patch("message", event.target.value)} maxLength={4000} required placeholder="What are you trying to make clearer, ship, or explore?" />
              </FieldShell>
              <label className="flex items-start gap-3 text-xs leading-6 text-sand-200/75">
                <input type="checkbox" checked={form.consent} onChange={(event) => patch("consent", event.target.checked)} className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent text-sand-100 focus:ring-sand-200/20" />
                <span>I consent to this note being stored privately in the profile owner&apos;s Nodivra Inbox.</span>
              </label>
              {fieldErrors.consent ? <p className="text-xs text-rose-200">{fieldErrors.consent}</p> : null}
              <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                <label htmlFor="inquiry-website">Website</label>
                <input id="inquiry-website" value={form.honeypot} onChange={(event) => patch("honeypot", event.target.value)} tabIndex={-1} autoComplete="off" />
              </div>
              {notice ? <p aria-live="polite" className={cn("rounded-2xl px-4 py-3 text-sm", notice.startsWith("If") ? "bg-emerald-400/10 text-emerald-100 ring-1 ring-emerald-300/20" : "bg-rose-400/10 text-rose-100 ring-1 ring-rose-300/20")}>{notice}</p> : null}
              <Button type="submit" disabled={isSubmitting} trailingIcon={<ArrowUpRightIcon className="h-3.5 w-3.5" />}>
                {isSubmitting ? "Sending..." : "Send to Inbox"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export function InboxPanel({
  initialInquiries,
  services,
  projects,
  demoMode,
}: {
  initialInquiries: InboxInquiry[];
  services: PublicWorkServiceSnapshot[];
  projects: PublicProjectSnapshot[];
  demoMode: boolean;
}) {
  const [inquiries, setInquiries] = useState(initialInquiries);
  const [filter, setFilter] = useState<"all" | InquiryStatus>("all");
  const [notice, setNotice] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const visible = filter === "all" ? inquiries : inquiries.filter((inquiry) => inquiry.status === filter);
  const unreadCount = inquiries.filter((inquiry) => inquiry.status === "unread").length;

  function relationLabel(inquiry: InboxInquiry) {
    const service = services.find((candidate) => candidate.id === inquiry.relatedServiceId);
    const project = projects.find((candidate) => candidate.id === inquiry.relatedProjectId);
    return [service?.title, project?.projectName].filter(Boolean).join(" / ");
  }

  async function setStatus(id: string, status: InquiryStatus) {
    setPendingId(id);
    setNotice(null);
    try {
      const response = await fetch("/api/inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const payload = (await response.json()) as { ok: boolean; inquiry?: InboxInquiry; message?: string };
      if (!response.ok || !payload.ok || !payload.inquiry) {
        setNotice(payload.message ?? "Unable to update this inquiry.");
        return;
      }
      setInquiries((current) => current.map((inquiry) => inquiry.id === id ? payload.inquiry! : inquiry));
      setNotice(`Marked as ${statusLabels[status].toLowerCase()}.`);
    } catch {
      setNotice("The inbox could not be updated. Try again in a moment.");
    } finally {
      setPendingId(null);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this inquiry from the inbox?")) return;
    setPendingId(id);
    setNotice(null);
    try {
      const response = await fetch("/api/inquiries", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const payload = (await response.json()) as { ok: boolean; message?: string };
      if (!response.ok || !payload.ok) {
        setNotice(payload.message ?? "Unable to delete this inquiry.");
        return;
      }
      setInquiries((current) => current.filter((inquiry) => inquiry.id !== id));
      setNotice("Inquiry deleted.");
    } catch {
      setNotice("The inbox could not be updated. Try again in a moment.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <Panel tone="dark">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2"><Badge tone={demoMode ? "accent" : "muted"}>{demoMode ? "Demo inbox" : "Private inbox"}</Badge><Badge tone="muted">{unreadCount} unread</Badge></div>
            <div><h2 className="font-display text-4xl tracking-tight text-sand-50">Make room for the right conversations.</h2><p className="mt-2 max-w-2xl text-sm leading-7 text-sand-200/75">Nodivra stores incoming notes here. It does not send email, SMS, or calendar invites, so a reply is always manual.</p></div>
          </div>
          <div className="min-w-[220px]"><FieldShell label="Show">
            <Select value={filter} onChange={(event) => setFilter(event.target.value as "all" | InquiryStatus)}>
              <option value="all">All inquiries ({inquiries.length})</option>
              {Object.entries(statusLabels).map(([status, label]) => <option key={status} value={status}>{label}</option>)}
            </Select>
          </FieldShell></div>
        </div>
        {notice ? <p aria-live="polite" className="mt-5 rounded-2xl bg-white/5 px-4 py-3 text-sm text-sand-100 ring-1 ring-white/10">{notice}</p> : null}
      </Panel>

      {visible.length === 0 ? <Panel tone="dark"><EmptyState title={filter === "all" ? "Your inbox is clear" : `No ${statusLabels[filter].toLowerCase()} inquiries`} description="Public profile notes will appear here with their original context and optional related work." /></Panel> : <div className="space-y-4">{visible.map((inquiry) => <article key={inquiry.id} className="rounded-[2rem] bg-white/5 p-1.5 ring-1 ring-white/10"><div className="rounded-[1.625rem] bg-ink-950/88 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-6"><div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between"><div className="min-w-0 space-y-3"><div className="flex flex-wrap items-center gap-2"><Badge tone={statusTone(inquiry.status)}>{statusLabels[inquiry.status]}</Badge><Badge tone="muted">{inquiry.inquiryType}</Badge>{relationLabel(inquiry) ? <Badge tone="muted">{relationLabel(inquiry)}</Badge> : null}</div><div><h3 className="font-display text-2xl tracking-tight text-sand-50">{inquiry.subject}</h3><p className="mt-2 text-sm text-sand-200/75">From {inquiry.name} · {inquiry.contactText}</p></div></div><p className="whitespace-nowrap text-xs text-sand-300/60">{formatDate(inquiry.createdAt)}</p></div><p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-sand-100/90">{inquiry.message}</p><div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4"><Button type="button" variant={inquiry.status === "unread" ? "primary" : "secondary"} disabled={pendingId === inquiry.id} onClick={() => void setStatus(inquiry.id, inquiry.status === "unread" ? "read" : "unread")} leadingIcon={<CheckIcon className="h-3.5 w-3.5" />}>{inquiry.status === "unread" ? "Mark read" : "Mark unread"}</Button><Button type="button" variant="secondary" disabled={pendingId === inquiry.id} onClick={() => void setStatus(inquiry.id, "replied")}>Replied manually</Button><Button type="button" variant="ghost" disabled={pendingId === inquiry.id} onClick={() => void setStatus(inquiry.id, inquiry.status === "spam" ? "read" : "spam")}>{inquiry.status === "spam" ? "Not spam" : "Spam"}</Button><Button type="button" variant="ghost" disabled={pendingId === inquiry.id} onClick={() => void setStatus(inquiry.id, inquiry.status === "archived" ? "read" : "archived")}>{inquiry.status === "archived" ? "Restore" : "Archive"}</Button><Button type="button" variant="danger" disabled={pendingId === inquiry.id} onClick={() => void remove(inquiry.id)} trailingIcon={<TrashIcon className="h-3.5 w-3.5" />}>Delete</Button></div></div></article>)}</div>}
    </div>
  );
}
