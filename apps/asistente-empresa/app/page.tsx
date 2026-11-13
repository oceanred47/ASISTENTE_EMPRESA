import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getCounts() {
  if (!prisma) return null;
  const [flows, quotes, watchEntries] = await Promise.all([
    prisma.automationFlow.count(),
    prisma.quote.count(),
    prisma.watchEntry.count(),
  ]);
  return { flows, quotes, watchEntries };
}

const CARDS = [
  {
    href: "/vivoconnect",
    title: "ViVoConnect",
    description: "Ecosistema de automatización: flujos de n8n e integraciones con LLMs.",
    countKey: "flows" as const,
    countLabel: "flujos",
  },
  {
    href: "/vivienda-modular",
    title: "Vivienda Modular",
    description: "Cotizaciones y decisiones logísticas del proyecto de vivienda contenedor.",
    countKey: "quotes" as const,
    countLabel: "cotizaciones",
  },
  {
    href: "/vigilancia",
    title: "Vigilancia Tecnológica",
    description: "Novedades en ciberseguridad, automatización y tecnologías emergentes.",
    countKey: "watchEntries" as const,
    countLabel: "hallazgos",
  },
];

export default async function HomePage() {
  const counts = await getCounts();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Bienvenida, Alines</h1>
        <p className="mt-1 text-slate-600">
          Panel de seguimiento de tus proyectos prioritarios.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand hover:shadow-md"
          >
            <h2 className="text-lg font-semibold text-brand">{card.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{card.description}</p>
            <p className="mt-4 text-sm font-medium text-slate-500">
              {counts ? `${counts[card.countKey]} ${card.countLabel}` : "Configura la base de datos"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
