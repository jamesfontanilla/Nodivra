import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { DashboardNav } from "@/components/dashboard/nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardNav userEmail={user.email ?? ""} />
      <main className="flex-1 container py-8">{children}</main>
    </div>
  );
}
