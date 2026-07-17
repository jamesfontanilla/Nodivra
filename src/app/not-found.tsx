import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 text-center relative overflow-hidden">
      <div className="absolute top-[-20%] left-[20%] w-[400px] h-[400px] rounded-full bg-purple-400/15 dark:bg-purple-600/5 blur-3xl" />
      <div className="relative z-10 glass-strong rounded-2xl p-10 space-y-4">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-400 dark:to-blue-300 bg-clip-text text-transparent">
          404
        </h1>
        <p className="text-muted-foreground">
          This page could not be found.
        </p>
        <Button asChild className="rounded-full">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </main>
  );
}
