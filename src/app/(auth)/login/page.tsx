import { LoginForm } from "./login-form";

export const metadata = {
  title: "Sign In - Nodivra",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Sign in to Nodivra</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email and password to access your dashboard
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
