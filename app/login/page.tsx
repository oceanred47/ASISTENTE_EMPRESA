import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authConfigured, createSessionToken, sessionCookieName } from "@/lib/auth";

async function login(formData: FormData) {
  "use server";
  const password = String(formData.get("password") || "");
  const from = String(formData.get("from") || "/");

  if (password !== process.env.APP_PASSWORD) {
    redirect(`/login?error=1&from=${encodeURIComponent(from)}`);
  }

  const token = await createSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect(from || "/");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; from?: string }>;
}) {
  const params = await searchParams;

  if (!authConfigured()) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-amber-300 bg-amber-50 p-6 text-sm text-amber-900">
        Autenticación no configurada. Define <code>APP_PASSWORD</code> y <code>AUTH_SECRET</code> como
        variables de entorno para proteger este panel.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm space-y-6">
      <h1 className="text-2xl font-bold">Iniciar sesión</h1>
      <form action={login} className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <input type="hidden" name="from" value={params.from ?? "/"} />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          required
          autoFocus
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        {params.error && <p className="text-sm text-red-600">Contraseña incorrecta.</p>}
        <button type="submit" className="w-full rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
          Entrar
        </button>
      </form>
    </div>
  );
}
