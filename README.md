# ASISTENTE_EMPRESA

Monorepo con las apps que usa Alines Torres Salazar (ATSERVICESS LLC). Cada proyecto vive en su propia carpeta dentro de `apps/` con su propio `package.json`, deploy y ciclo de vida.

## Apps

### `apps/asistente-empresa/` — Panel de control

Next.js + Prisma. Da seguimiento a las prioridades de negocio:

- **ViVoConnect** — ecosistema de automatización (flujos de n8n, integraciones LLM).
- **Vivienda Modular** — cotizaciones y decisiones logísticas del proyecto de vivienda contenedor expandible.
- **Vigilancia Tecnológica** — hallazgos de ciberseguridad, automatización y tecnologías emergentes.

Ver [`apps/asistente-empresa/README.md`](apps/asistente-empresa/README.md) para desarrollo local y despliegue.

`docs/` (en la raíz) tiene notas y contexto de cada proyecto que complementan, no reemplazan, el panel.

### `apps/registro-tea/` — Registro TEA (Ley 163-2024)

Vite + React + Firebase. Registro de Coordinación Interinstitucional de Servicios TEA para el Departamento de la Familia de Puerto Rico.

## Despliegue

Cada app se despliega como un proyecto de Vercel independiente, con su **Root Directory** apuntando a su carpeta (`apps/asistente-empresa` o `apps/registro-tea`). Si el proyecto de Vercel ya existía apuntando a la raíz del repo, hay que actualizar esa configuración en Vercel → Project Settings → General → Root Directory tras este cambio de estructura.
