import { getCurrentUserProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  const profile = await getCurrentUserProfile();
  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold">Profil</h1>
        <p className="text-sm text-muted-foreground">
          Kelola informasi profil Anda (data non-kinerja).
        </p>
      </div>

      <SettingsForm
        initialFullName={profile.full_name || ""}
        initialNip={profile.nip || ""}
      />

      <div className="rounded-lg border p-6 space-y-3 bg-muted/30">
        <h2 className="font-medium">Informasi Lain</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">ID Profil</span>
            <span className="font-mono text-xs">{profile.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Role</span>
            <span>{profile.roles.join(", ")}</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Untuk mengubah role atau organisasi, hubungi administrator sistem.
        </p>
      </div>
    </div>
  );
}
