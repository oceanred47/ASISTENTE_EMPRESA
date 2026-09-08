import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import "./globals.css";
import { authConfigured, sessionCookieName, verifySessionToken } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Asistente Empresa",
  description: "Panel de control para ViVoConnect, vivienda modular y vigilancia tecnológica",
};

const NAV_ITEMS = [
  { href: "/", label: "Inicio" },
  { href: "/vivoconnect", label: "ViVoConnect" },
  { href: "/vivienda-modular", label: "Vivienda Modular" },
  { href: "/vigilancia", label: "Vigilancia Tecnológica" },
];

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let showLogout = false;
  if (authConfigured()) {
    const cookieStore = await cookies();
    showLogout = await verifySessionToken(cookieStore.get(sessionCookieName)?.value);
  }

  return (
    <html lang="es">
      <body>
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-lg font-semibold text-brand">
              Asistente Empresa
            </Link>
            <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
              {NAV_ITEMS.map((item) => (
                <Link key={item.href} href={item.href} className="hover:text-brand">
                  {item.label}
                </Link>
              ))}
              {showLogout && (
                <form action="/logout" method="post">
                  <button type="submit" className="hover:text-brand">
                    Cerrar sesión
                  </button>
                </form>
              )}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
