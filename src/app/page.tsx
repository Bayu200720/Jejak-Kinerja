import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">JEJAK KINERJA AI</h1>
      <p className="text-muted-foreground">Catat Hari Ini, Buktikan Kinerja.</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/login"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Masuk
        </Link>
        <Link
          href="/dashboard"
          className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
        >
          Dashboard (placeholder)
        </Link>
      </div>
    </main>
  );
}
