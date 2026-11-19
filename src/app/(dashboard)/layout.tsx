import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { getCurrentUserProfile } from "@/lib/auth";

const navItems = [
  { href: "/dashboard", label: "Beranda" },
  { href: "/dashboard/aktivitas", label: "Aktivitas" },
  { href: "/dashboard/bukti", label: "Bukti" },
  { href: "/dashboard/laporan", label: "Laporan" },
  { href: "/dashboard/settings", label: "Pengaturan" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentUserProfile();
  
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="w-full border-b bg-muted/30 p-4 md:w-64 md:border-b-0 md:border-r">
        <div className="mb-6">
          <Link href="/" className="text-lg font-semibold">
            JEJAK KINERJA AI
          </Link>
          <p className="text-xs text-muted-foreground">Sistem pencatatan kinerja ASN</p>
        </div>
        <nav className="flex flex-row flex-wrap gap-2 md:flex-col">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 space-y-3 rounded-md border bg-background p-3 text-xs text-muted-foreground">
          <div>
            <p className="font-medium text-foreground">Role</p>
            <p>{profile?.roles?.join(", ") || "Tidak ada role"}</p>
          </div>
          {profile?.full_name && (
            <div>
              <p className="font-medium text-foreground">Pengguna</p>
              <p className="truncate">{profile.full_name}</p>
            </div>
          )}
          <form action={signOut}>
            <button
              type="submit"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
            >
              Keluar
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  );
}
