import type {
  ButtonHTMLAttributes,
  AnchorHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/classnames";
import { ArrowUpRightIcon, CheckIcon, SparkIcon } from "@/components/icons";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const buttonStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-sand-100 text-ink-950 shadow-halo hover:bg-sand-200 focus-visible:outline-sand-300",
  secondary:
    "bg-white/5 text-sand-50 ring-1 ring-white/10 hover:bg-white/10 focus-visible:outline-white/20",
  ghost:
    "bg-transparent text-sand-50 hover:bg-white/5 focus-visible:outline-white/20",
  danger:
    "bg-rose-500/10 text-rose-200 ring-1 ring-rose-400/30 hover:bg-rose-500/20 focus-visible:outline-rose-300",
};

export function Button({
  className,
  variant = "primary",
  trailingIcon,
  leadingIcon,
  href,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  trailingIcon?: ReactNode;
  leadingIcon?: ReactNode;
  href?: string;
}) {
  const classes = cn(
    "group inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition-[transform,background-color,box-shadow,border-color,opacity] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
    buttonStyles[variant],
    className,
  );

  const content = (
    <>
      {leadingIcon ? <span className="shrink-0">{leadingIcon}</span> : null}
      <span>{children}</span>
      {trailingIcon ? (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/5 text-current transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105 dark:bg-white/10">
          {trailingIcon}
        </span>
      ) : null}
    </>
  );

  if (href) {
    return (
      <a href={href} className={classes} {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {content}
      </a>
    );
  }

  return (
    <button className={classes} {...props}>
      {content}
    </button>
  );
}

export function Panel({
  children,
  className,
  tone = "dark",
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  tone?: "dark" | "light";
}) {
  return (
    <div
      className={cn(
        "rounded-[2rem] p-1.5 ring-1 transition-[transform,box-shadow] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]",
        tone === "dark"
          ? "bg-white/5 ring-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.3)]"
          : "bg-ink-950/5 ring-ink-950/10 shadow-[0_30px_90px_rgba(13,15,19,0.12)]",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "rounded-[1.625rem] px-5 py-5 sm:px-6",
          tone === "dark"
            ? "bg-ink-950/88 text-sand-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
            : "bg-sand-50 text-ink-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]",
        )}
      >
        {children}
      </div>
    </div>
  );
}

function fieldBaseClass(tone: "dark" | "light") {
  return cn(
    "w-full rounded-2xl px-4 py-3 text-sm transition-[border-color,box-shadow,background-color,transform] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] focus-visible:outline-none",
    tone === "dark"
      ? "border border-white/10 bg-white/5 text-sand-50 placeholder:text-sand-300/50 focus-visible:border-sand-200/60 focus-visible:ring-2 focus-visible:ring-sand-200/20"
      : "border border-ink-950/10 bg-white text-ink-950 placeholder:text-ink-500 focus-visible:border-ink-950/30 focus-visible:ring-2 focus-visible:ring-ink-950/10",
  );
}

export function Input({
  className,
  tone = "dark",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { tone?: "dark" | "light" }) {
  return <input className={cn(fieldBaseClass(tone), className)} {...props} />;
}

export function Textarea({
  className,
  tone = "dark",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { tone?: "dark" | "light" }) {
  return (
    <textarea
      className={cn(fieldBaseClass(tone), "min-h-[120px] resize-y", className)}
      {...props}
    />
  );
}

export function Select({
  className,
  tone = "dark",
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  tone?: "dark" | "light";
}) {
  return (
    <select className={cn(fieldBaseClass(tone), className)} {...props} />
  );
}

export function Label({
  className,
  ...props
}: HTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-sand-200/80",
        className,
      )}
      {...props}
    />
  );
}

export function Badge({
  className,
  tone = "muted",
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  tone?: "muted" | "accent" | "success" | "danger";
}) {
  const tones: Record<"muted" | "accent" | "success" | "danger", string> = {
    muted: "bg-white/5 text-sand-100 ring-white/10",
    accent: "bg-sand-100 text-ink-950 ring-sand-200/50",
    success: "bg-emerald-400/10 text-emerald-200 ring-emerald-300/30",
    danger: "bg-rose-400/10 text-rose-200 ring-rose-300/30",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] ring-1",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      <Badge tone="muted">{eyebrow}</Badge>
      <div className="space-y-4">
        <h2 className="max-w-3xl font-display text-3xl leading-tight tracking-tight text-sand-50 sm:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="max-w-2xl text-sm leading-7 text-sand-200/80 sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function FieldShell({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-4">
        <Label>{label}</Label>
        {hint ? <p className="text-xs text-sand-300/70">{hint}</p> : null}
      </div>
      {children}
      {error ? <p className="text-xs text-rose-300">{error}</p> : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/5 px-5 py-6">
      <div className="flex items-start gap-4">
        <span className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-sand-100 ring-1 ring-white/10">
          <SparkIcon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-medium text-sand-50">{title}</h3>
          <p className="mt-1 text-sm leading-7 text-sand-200/80">{description}</p>
        </div>
      </div>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-white/10", className)} />;
}

export function StatusPill({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "accent" | "success" | "danger";
}) {
  return <Badge tone={tone}>{children}</Badge>;
}

export function InlineLink({
  className,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      className={cn(
        "inline-flex items-center gap-1 text-sm text-sand-100 underline decoration-white/20 underline-offset-4 transition hover:decoration-sand-100",
        className,
      )}
      {...props}
    />
  );
}

export function DemoArrowButton({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button {...props} trailingIcon={<ArrowUpRightIcon className="h-3.5 w-3.5" />}>
      {children}
    </Button>
  );
}

export function CheckBadge() {
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-200 ring-1 ring-emerald-300/30">
      <CheckIcon className="h-3.5 w-3.5" />
    </span>
  );
}
