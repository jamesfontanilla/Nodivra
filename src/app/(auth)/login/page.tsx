import { LoginForm } from "./login-form";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata = {
  title: "Sign In - Nodivra",
};

export default function LoginPage() {
  return (
    <main className="relative min-h-[100dvh] flex items-center justify-center px-4 py-24 md:py-40 overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute top-[-25%] right-[-15%] w-[500px] h-[500px] rounded-full bg-violet-500/8 dark:bg-violet-500/12 blur-[120px]" />
      <div className="absolute bottom-[-25%] left-[-10%] w-[400px] h-[400px] rounded-full bg-cyan-400/6 dark:bg-cyan-400/8 blur-[100px]" />

      <div className="fixed top-6 right-6 z-40">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-sm animate-fade-up">
        <div className="bezel-outer">
          <div className="bezel-inner p-8 md:p-10 space-y-8">
            <div className="text-center space-y-3">
              <span className="inline-block rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-primary/10 text-primary dark:bg-primary/20">
                Welcome back
              </span>
              <h1 className="text-2xl font-bold tracking-tight">
                Sign in to Nodivra
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your credentials to access your dashboard
              </p>
            </div>
            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}
