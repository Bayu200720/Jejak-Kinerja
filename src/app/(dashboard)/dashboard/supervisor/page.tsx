import { getCurrentUserProfile } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SupervisorDashboardPage() {
  const profile = await getCurrentUserProfile();
  
  if (!profile || !profile.roles.includes("supervisor")) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard Supervisor</h1>
      <p className="text-sm text-muted-foreground">
        Selamat datang, {profile.full_name} (Supervisor).
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">ASN dalam Tim</p>
          <p className="text-2xl font-semibold">—</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Laporan Menunggu</p>
          <p className="text-2xl font-semibold">—</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Perlu Perbaikan</p>
          <p className="text-2xl font-semibold">—</p>
        </div>
      </div>
    </div>
  );
}
