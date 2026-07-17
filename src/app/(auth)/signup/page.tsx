import { SignupForm } from "./signup-form";

export const metadata = {
  title: "Sign Up - Nodivra",
};

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Create your Nodivra account</h1>
          <p className="text-sm text-muted-foreground">
            Start building your developer identity page
          </p>
        </div>
        <SignupForm />
      </div>
    </main>
  );
}
