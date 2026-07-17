import { redirect } from "next/navigation";
import { createServerSupabaseClient, getUser } from "@/lib/supabase/server";
import { OnboardingForm } from "@/components/dashboard/onboarding-form";

export const metadata = {
  title: "Set Up Your Profile - Nodivra",
};

export default async function OnboardingPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const supabase = createServerSupabaseClient();

  // If profile already exists, redirect to dashboard
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();

  if (profile) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-[80vh] items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Set up your page</h1>
          <p className="text-sm text-muted-foreground">
            Choose a unique handle and fill in your profile details
          </p>
        </div>
        <OnboardingForm userId={user.id} />
      </div>
    </main>
  );
}
