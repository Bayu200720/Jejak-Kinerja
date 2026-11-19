import { getCurrentUserProfile } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ASNDashboardPage() {
  const profile = await getCurrentUserProfile();
  
  if (!profile) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard ASN</h1>
      <p className="text-sm text-muted-foreground">
        Selamat datang, {profile.full_name}.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Aktivitas bulan ini</p>
          <p className="text-2xl font-semibold">—</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">RHK tercatat</p>
          <p className="text-2xl font-semibold">—</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Bukti terunggah</p>
          <p className="text-2xl font-semibold">—</p>
        </div>
      </div>
    </div>
  );
}
