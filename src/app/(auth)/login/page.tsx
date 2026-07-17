import { LoginForm } from "./login-form";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata = {
  title: "Sign In - Nodivra",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-purple-400/20 dark:bg-purple-600/10 blur-3xl" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-blue-400/20 dark:bg-blue-600/10 blur-3xl" />

      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="glass-strong rounded-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Sign in to Nodivra</h1>
            <p className="text-sm text-muted-foreground">
              Enter your email and password to access your dashboard
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
