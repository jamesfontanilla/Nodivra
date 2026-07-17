import { SignupForm } from "./signup-form";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata = {
  title: "Sign Up - Nodivra",
};

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-blue-400/20 dark:bg-blue-600/10 blur-3xl" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-purple-400/20 dark:bg-purple-600/10 blur-3xl" />

      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="glass-strong rounded-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Create your Nodivra account</h1>
            <p className="text-sm text-muted-foreground">
              Start building your developer identity page
            </p>
          </div>
          <SignupForm />
        </div>
      </div>
    </main>
  );
}
