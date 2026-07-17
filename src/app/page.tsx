import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-400/20 dark:bg-purple-600/10 blur-3xl" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-400/20 dark:bg-blue-600/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-2xl text-center space-y-8">
        <div className="glass-strong rounded-2xl p-10 sm:p-14 space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight sm:text-7xl bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-400 dark:to-blue-300 bg-clip-text text-transparent">
              Nodivra
            </h1>
            <p className="text-lg text-muted-foreground sm:text-xl max-w-md mx-auto">
              Your developer identity in one link. Showcase your work, links,
              projects, and availability.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="rounded-full px-8">
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-8 glass">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
