import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProfileNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 text-center relative overflow-hidden">
      <div className="absolute top-[-20%] right-[10%] w-[400px] h-[400px] rounded-full bg-purple-400/15 dark:bg-purple-600/5 blur-3xl" />
      <div className="relative z-10 glass-strong rounded-2xl p-10 space-y-4">
        <h1 className="text-2xl font-bold">Profile not found</h1>
        <p className="text-muted-foreground">
          This page doesn&apos;t exist or hasn&apos;t been published yet.
        </p>
        <Button asChild className="rounded-full">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </main>
  );
}
