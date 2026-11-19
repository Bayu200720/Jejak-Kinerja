import { getCurrentUserProfile } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  const profile = await getCurrentUserProfile();
  
  if (!profile || !profile.roles.includes("admin")) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard Admin</h1>
      <p className="text-sm text-muted-foreground">
        Selamat datang, {profile.full_name} (Admin).
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total Pengguna</p>
          <p className="text-2xl font-semibold">—</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total ASN</p>
          <p className="text-2xl font-semibold">—</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total Aktivitas</p>
          <p className="text-2xl font-semibold">—</p>
        </div>
      </div>
    </div>
  );
}
