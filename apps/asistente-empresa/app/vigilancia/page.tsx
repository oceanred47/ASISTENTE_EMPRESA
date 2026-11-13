import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import DbSetupNotice from "@/components/DbSetupNotice";

export const dynamic = "force-dynamic";

const CATEGORY_LABEL: Record<string, string> = {
  CIBERSEGURIDAD: "Ciberseguridad",
  AUTOMATIZACION: "Automatización",
  TECNOLOGIA_EMERGENTE: "Tecnología emergente",
};

async function addEntry(formData: FormData) {
  "use server";
  if (!prisma) return;
  const topic = String(formData.get("topic") || "").trim();
  if (!topic) return;
  await prisma.watchEntry.create({
    data: {
      topic,
      category: (String(formData.get("category") || "AUTOMATIZACION") as any),
      source: String(formData.get("source") || "") || null,
      relevance: String(formData.get("relevance") || "") || null,
    },
  });
  revalidatePath("/vigilancia");
}

export default async function VigilanciaPage() {
  if (!prisma) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Vigilancia Tecnológica</h1>
        <DbSetupNotice />
      </div>
    );
  }

  const entries = await prisma.watchEntry.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Vigilancia Tecnológica</h1>
        <p className="mt-1 text-slate-600">Novedades en ciberseguridad, automatización y tecnologías emergentes.</p>
      </div>

      <form action={addEntry} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2">
        <input name="topic" placeholder="Tema / hallazgo" required className="sm:col-span-2 rounded-md border border-slate-300 px-3 py-2 text-sm" />
        <select name="category" className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          {Object.entries(CATEGORY_LABEL).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <input name="source" placeholder="Fuente (URL o publicación)" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
        <input name="relevance" placeholder="Por qué es relevante" className="sm:col-span-2 rounded-md border border-slate-300 px-3 py-2 text-sm" />
        <button type="submit" className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
          Agregar hallazgo
        </button>
      </form>

      <div className="space-y-3">
        {entries.length === 0 && <p className="text-sm text-slate-500">Todavía no hay hallazgos registrados.</p>}
        {entries.map((e) => (
          <div key={e.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{e.topic}</h3>
              <span className="rounded-full bg-brand/10 px-2 py-1 text-xs font-medium text-brand">
                {CATEGORY_LABEL[e.category] ?? e.category}
              </span>
            </div>
            {e.source && <p className="mt-1 text-xs text-slate-500">Fuente: {e.source}</p>}
            {e.relevance && <p className="mt-2 text-sm text-slate-600">{e.relevance}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
