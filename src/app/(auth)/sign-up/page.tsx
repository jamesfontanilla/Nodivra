import { AuthPanel } from "@/components/auth-panel";

export const metadata = {
  title: "Sign up",
};

export default function SignUpPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <AuthPanel mode="sign-up" />
    </main>
  );
}
