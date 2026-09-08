import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import DbSetupNotice from "@/components/DbSetupNotice";

export const dynamic = "force-dynamic";

const QUOTE_STATUS_LABEL: Record<string, string> = {
  REQUESTED: "Solicitada",
  RECEIVED: "Recibida",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
};

async function addQuote(formData: FormData) {
  "use server";
  if (!prisma) return;
  const vendor = String(formData.get("vendor") || "").trim();
  const concept = String(formData.get("concept") || "").trim();
  if (!vendor || !concept) return;
  const amountRaw = String(formData.get("amount") || "");
  await prisma.quote.create({
    data: {
      vendor,
      concept,
      amount: amountRaw ? Number(amountRaw) : null,
      status: (String(formData.get("status") || "REQUESTED") as any),
      notes: String(formData.get("notes") || "") || null,
    },
  });
  revalidatePath("/vivienda-modular");
}

async function addDecision(formData: FormData) {
  "use server";
  if (!prisma) return;
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  await prisma.logisticsDecision.create({
    data: {
      title,
      rationale: String(formData.get("rationale") || "") || null,
      decidedBy: String(formData.get("decidedBy") || "") || null,
    },
  });
  revalidatePath("/vivienda-modular");
}

export default async function ViviendaModularPage() {
  if (!prisma) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Vivienda Modular</h1>
        <DbSetupNotice />
      </div>
    );
  }

  const [quotes, decisions] = await Promise.all([
    prisma.quote.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.logisticsDecision.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold">Vivienda Modular</h1>
        <p className="mt-1 text-slate-600">Cotizaciones y decisiones logísticas del proyecto de vivienda contenedor expandible.</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Cotizaciones</h2>
        <form action={addQuote} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2">
          <input name="vendor" placeholder="Proveedor" required className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
          <input name="concept" placeholder="Concepto" required className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
          <input name="amount" type="number" step="0.01" placeholder="Monto (USD)" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
          <select name="status" className="rounded-md border border-slate-300 px-3 py-2 text-sm">
            {Object.entries(QUOTE_STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <input name="notes" placeholder="Notas" className="sm:col-span-2 rounded-md border border-slate-300 px-3 py-2 text-sm" />
          <button type="submit" className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
            Agregar cotización
          </button>
        </form>
        <div className="space-y-3">
          {quotes.length === 0 && <p className="text-sm text-slate-500">Todavía no hay cotizaciones registradas.</p>}
          {quotes.map((q) => (
            <div key={q.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{q.vendor} — {q.concept}</h3>
                <span className="rounded-full bg-brand/10 px-2 py-1 text-xs font-medium text-brand">
                  {QUOTE_STATUS_LABEL[q.status] ?? q.status}
                </span>
              </div>
              {q.amount != null && <p className="mt-1 text-xs text-slate-500">Monto: ${q.amount.toFixed(2)}</p>}
              {q.notes && <p className="mt-2 text-sm text-slate-600">{q.notes}</p>}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Decisiones logísticas</h2>
        <form action={addDecision} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2">
          <input name="title" placeholder="Decisión" required className="sm:col-span-2 rounded-md border border-slate-300 px-3 py-2 text-sm" />
          <input name="rationale" placeholder="Justificación" className="sm:col-span-2 rounded-md border border-slate-300 px-3 py-2 text-sm" />
          <input name="decidedBy" placeholder="Responsable" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
          <button type="submit" className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
            Agregar decisión
          </button>
        </form>
        <div className="space-y-3">
          {decisions.length === 0 && <p className="text-sm text-slate-500">Todavía no hay decisiones registradas.</p>}
          {decisions.map((d) => (
            <div key={d.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="font-semibold">{d.title}</h3>
              {d.rationale && <p className="mt-1 text-sm text-slate-600">{d.rationale}</p>}
              {d.decidedBy && <p className="mt-1 text-xs text-slate-500">Responsable: {d.decidedBy}</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
