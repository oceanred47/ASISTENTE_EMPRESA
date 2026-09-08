export default function DbSetupNotice() {
  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
      <p className="font-medium">Base de datos no configurada</p>
      <p className="mt-1">
        Define la variable de entorno <code className="rounded bg-amber-100 px-1">DATABASE_URL</code>{" "}
        (Postgres, ej. Supabase o Vercel Postgres) y corre{" "}
        <code className="rounded bg-amber-100 px-1">npm run db:push</code> para activar esta sección.
      </p>
    </div>
  );
}
