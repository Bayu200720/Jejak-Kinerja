export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-sm text-muted-foreground">
        Placeholder dashboard (ASN/Supervisor/Admin). Data dan akses berbasis role akan dihubungkan ke Supabase.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Aktivitas hari ini</p>
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
