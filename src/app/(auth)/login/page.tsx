export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-4">
      <h1 className="text-2xl font-semibold">Masuk</h1>
      <p className="text-sm text-muted-foreground">
        Placeholder autentikasi (Supabase Auth). Rute: /login
      </p>
      <form className="space-y-4 rounded-lg border p-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="nama@instansi.go.id"
            disabled
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="••••••••"
            disabled
          />
        </div>
        <button
          type="button"
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground opacity-60"
          disabled
        >
          Masuk (belum aktif)
        </button>
      </form>
    </main>
  );
}
