# ASISTENTE_EMPRESA

Panel de control (Next.js + Prisma) para dar seguimiento a los proyectos prioritarios de Alines Torres Salazar (ATSERVICESS LLC):

- **ViVoConnect** — ecosistema de automatización (flujos de n8n, integraciones LLM).
- **Vivienda Modular** — cotizaciones y decisiones logísticas del proyecto de vivienda contenedor expandible.
- **Vigilancia Tecnológica** — hallazgos de ciberseguridad, automatización y tecnologías emergentes.

## Requisitos

- Node.js 18+
- Una base de datos Postgres (ej. [Supabase](https://supabase.com), [Neon](https://neon.tech) o Vercel Postgres)

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # completa DATABASE_URL con tu conexión Postgres
npm run db:push              # crea las tablas a partir de prisma/schema.prisma
npm run dev
```

Abre http://localhost:3000.

## Despliegue en Vercel

1. Conecta este repositorio a un proyecto de Vercel.
2. En la configuración del proyecto, agrega la variable de entorno `DATABASE_URL` con tu conexión Postgres.
3. Corre `npm run db:migrate` (o `db:push` en desarrollo) para aplicar el esquema a la base de datos de producción.

Mientras `DATABASE_URL` no esté configurada, cada sección del panel muestra un aviso indicando cómo activarla; el resto del sitio funciona con normalidad.

## Estructura

- `app/` — páginas de Next.js (App Router): inicio y las 3 secciones.
- `prisma/schema.prisma` — modelo de datos.
- `lib/prisma.ts` — cliente de Prisma compartido.
- `docs/` — notas y contexto de cada proyecto (complementan, no reemplazan, el panel).
