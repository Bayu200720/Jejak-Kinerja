import { getCurrentUserProfile } from "@/lib/auth";
import { getDashboardPathForRole } from "@/lib/role-redirect";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const profile = await getCurrentUserProfile();
  
  if (!profile) {
    redirect("/login");
  }

  // Redirect ke dashboard sesuai role utama
  redirect(getDashboardPathForRole(profile.primaryRole));
}
