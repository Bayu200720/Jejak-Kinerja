import Link from "next/link";

const navItems = [
  { href: "/dashboard", label: "Beranda" },
  { href: "/dashboard/aktivitas", label: "Aktivitas" },
  { href: "/dashboard/bukti", label: "Bukti" },
  { href: "/dashboard/laporan", label: "Laporan" },
  { href: "/dashboard/settings", label: "Pengaturan" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="w-full border-b bg-muted/30 p-4 md:w-64 md:border-b-0 md:border-r">
        <div className="mb-6">
          <Link href="/" className="text-lg font-semibold">
            JEJAK KINERJA AI
          </Link>
          <p className="text-xs text-muted-foreground">Role-aware (placeholder)</p>
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
        <div className="mt-6 rounded-md border bg-background p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Role (placeholder)</p>
          <p>asn | supervisor | admin</p>
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  );
}
