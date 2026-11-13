import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import DbSetupNotice from "@/components/DbSetupNotice";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  PLANNED: "Planeado",
  IN_PROGRESS: "En progreso",
  LIVE: "En vivo",
  PAUSED: "Pausado",
};

async function addFlow(formData: FormData) {
  "use server";
  if (!prisma) return;
  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  await prisma.automationFlow.create({
    data: {
      name,
      description: String(formData.get("description") || "") || null,
      tool: String(formData.get("tool") || "") || null,
      status: (String(formData.get("status") || "PLANNED") as any),
    },
  });
  revalidatePath("/vivoconnect");
}

export default async function ViVoConnectPage() {
  if (!prisma) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">ViVoConnect</h1>
        <DbSetupNotice />
      </div>
    );
  }

  const flows = await prisma.automationFlow.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">ViVoConnect</h1>
        <p className="mt-1 text-slate-600">Ecosistema de automatización: flujos de n8n e integraciones con LLMs.</p>
      </div>

      <form action={addFlow} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2">
        <input name="name" placeholder="Nombre del flujo" required className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
        <input name="tool" placeholder="Herramienta (ej. n8n)" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
        <input name="description" placeholder="Descripción" className="sm:col-span-2 rounded-md border border-slate-300 px-3 py-2 text-sm" />
        <select name="status" className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          {Object.entries(STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <button type="submit" className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
          Agregar flujo
        </button>
      </form>

      <div className="space-y-3">
        {flows.length === 0 && <p className="text-sm text-slate-500">Todavía no hay flujos registrados.</p>}
        {flows.map((flow) => (
          <div key={flow.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{flow.name}</h3>
              <span className="rounded-full bg-brand/10 px-2 py-1 text-xs font-medium text-brand">
                {STATUS_LABEL[flow.status] ?? flow.status}
              </span>
            </div>
            {flow.tool && <p className="mt-1 text-xs text-slate-500">Herramienta: {flow.tool}</p>}
            {flow.description && <p className="mt-2 text-sm text-slate-600">{flow.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
