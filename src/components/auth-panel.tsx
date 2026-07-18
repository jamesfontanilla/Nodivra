"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/classnames";
import {
  ArrowUpRightIcon,
  CheckIcon,
  SparkIcon,
} from "@/components/icons";
import { Badge, Button, Divider, FieldShell, Input, Panel } from "@/components/ui";

type Mode = "sign-in" | "sign-up";

export function AuthPanel({ mode }: { mode: Mode }) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<{ tone: "success" | "danger" | "muted"; message: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setNotice(null);

    if (!supabase) {
      setNotice({
        tone: "muted",
        message: "Supabase is not configured yet. Use demo mode to explore the dashboard.",
      });
      setSubmitting(false);
      return;
    }

    if (mode === "sign-in") {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setNotice({ tone: "danger", message: error.message });
        setSubmitting(false);
        return;
      }

      if (data.session) {
        router.push("/dashboard");
        router.refresh();
        return;
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        setNotice({ tone: "danger", message: error.message });
        setSubmitting(false);
        return;
      }

      if (data.session) {
        router.push("/dashboard");
        router.refresh();
        return;
      }
    }

    setNotice({
      tone: "success",
      message:
        mode === "sign-up"
          ? "Account created. Sign in if your auth settings require confirmation."
          : "Signed in. Redirecting to your workspace.",
    });
    setSubmitting(false);
  }

  const title = mode === "sign-in" ? "Welcome back" : "Create your workspace";
  const description =
    mode === "sign-in"
      ? "Use email and password auth to reach the private dashboard."
      : "Create a new account and start shaping your public developer page.";

  if (!supabase) {
    return (
      <Panel tone="dark">
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <Badge tone="accent">Demo mode</Badge>
            <Badge tone="muted">No env vars detected</Badge>
          </div>
          <div className="space-y-3">
            <h1 className="font-display text-3xl tracking-tight text-sand-50">{title}</h1>
            <p className="max-w-xl text-sm leading-7 text-sand-200/80">{description}</p>
          </div>
          <div className="rounded-[1.35rem] border border-white/10 bg-white/5 px-4 py-4">
            <div className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sand-100 text-ink-950 ring-1 ring-sand-200/50">
                <SparkIcon className="h-4 w-4" />
              </span>
              <div className="space-y-2">
                <p className="text-sm font-medium text-sand-50">Explore the editor right away</p>
                <p className="text-sm leading-7 text-sand-200/80">
                  The local demo workspace lets you inspect the build without Supabase configured. No email delivery is required.
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              href="/dashboard"
              trailingIcon={<ArrowUpRightIcon className="h-3.5 w-3.5" />}
            >
              Open demo dashboard
            </Button>
            <Button
              href="/"
              variant="secondary"
              trailingIcon={<CheckIcon className="h-3.5 w-3.5" />}
            >
              Return home
            </Button>
          </div>
        </div>
      </Panel>
    );
  }

  return (
    <Panel tone="dark">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="accent">{mode === "sign-in" ? "Sign in" : "Sign up"}</Badge>
            <Badge tone="muted">Supabase Auth</Badge>
          </div>
          <h1 className="font-display text-3xl tracking-tight text-sand-50">{title}</h1>
          <p className="max-w-xl text-sm leading-7 text-sand-200/80">{description}</p>
        </div>

        <Divider />

        <FieldShell label="Email" hint="Password auth keeps email delivery optional.">
          <Input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@domain.com"
          />
        </FieldShell>

        <FieldShell label="Password" hint="Use a strong password you can remember.">
          <Input
            type="password"
            autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
          />
        </FieldShell>

        {notice ? (
          <div
            className={cn(
              "rounded-[1.35rem] border px-4 py-3 text-sm",
              notice.tone === "success"
                ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-100"
                : notice.tone === "danger"
                  ? "border-rose-300/30 bg-rose-400/10 text-rose-100"
                  : "border-white/10 bg-white/5 text-sand-100",
            )}
          >
            {notice.message}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit" disabled={submitting} trailingIcon={<ArrowUpRightIcon className="h-3.5 w-3.5" />}>
            {submitting ? "Working..." : mode === "sign-in" ? "Sign in" : "Create account"}
          </Button>
          <Button
            href={mode === "sign-in" ? "/sign-up" : "/sign-in"}
            variant="secondary"
          >
            {mode === "sign-in" ? "Need an account?" : "Already have one?"}
          </Button>
        </div>
      </form>
    </Panel>
  );
}
