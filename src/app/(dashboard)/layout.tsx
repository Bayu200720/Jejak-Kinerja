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
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      <aside className="w-full md:w-64 border-r bg-card px-4 py-6 flex flex-col min-h-screen">
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <svg className="h-5 w-5 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <span className="font-semibold text-foreground">Jejak Kinerja</span>
          </Link>
          <p className="mt-2 text-xs text-muted-foreground">Sistem pencatatan kinerja ASN</p>
        </div>
        <nav className="space-y-1 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-6 border-t border-border space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</p>
            <p className="text-sm text-foreground">{profile?.roles?.join(", ") || "Tidak ada role"}</p>
          </div>
          {profile?.full_name && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pengguna</p>
              <p className="text-sm text-foreground truncate">{profile.full_name}</p>
            </div>
          )}
          <form action={signOut}>
            <button
              type="submit"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Keluar
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-muted/30">
        {children}
      </main>
    </div>
  );
}
