# Registro TEA · Ley 163-2024

Aplicación de Registro de Coordinación Interinstitucional de Servicios TEA para el Departamento de la Familia de Puerto Rico (Ley Núm. 163 del 13 de agosto de 2024).

## Funcionalidades

- **Registro de casos** con el formulario oficial completo (secciones I–IX: información general, perfil de la persona con TEA, etapa de vida, composición familiar, razones del referido, necesidades identificadas, gestión realizada, seguimiento y barreras identificadas).
- **Base de datos**: en localStorage por defecto (modo local, un solo navegador), o sincronizada en tiempo real vía Firebase/Firestore entre todos los usuarios cuando se configura (ver "Configurar Firebase" abajo). Incluye historial de cambios por expediente, detección de duplicados y sanitización de datos en ambos modos.
- **Autenticación** (solo en modo Firebase): inicio de sesión con correo/contraseña o Google. En modo local no hay pantalla de inicio de sesión.
- **Módulo bilingüe** Español / English con selector en la barra superior.
- **Módulo de tema** Claro / Oscuro.
- **Agente Especialista en Base de Datos**: motor de reglas que audita la integridad clínica de los expedientes (edad vs. etapa de vida, diagnósticos incompletos para referidos de empleo, datos de contacto faltantes, etc.), permite corrección automática de un clic, y responde consultas simples en lenguaje natural sobre los datos registrados — todo de forma local, sin depender de un servicio externo de IA.
- **Panel de análisis** con indicadores clave, distribución por estado/región y carga de trabajo por coordinador.
- **Importar / Exportar** en JSON y CSV (con BOM UTF-8 para compatibilidad con Excel).
- **Roles** (Administrador, Director, Supervisor, Coordinador) con permisos diferenciados para crear, editar, eliminar, usar el agente, aplicar correcciones, importar/exportar y reiniciar la base de datos. En modo local el rol se elige libremente (demo); en modo Firebase el rol lo asigna un Administrador desde el panel "Usuarios" y se aplica también del lado del servidor (`firestore.rules`).
- **Alertas de inactividad** (30+/60+ días sin actividad) con banner, filtro y centro de notificaciones en la barra superior.
- **Comités Ley 163-2024**: separa el Comité de Servicios de Salud (Art. 20) del Comité de Servicios para Adultos/ADFAN (Art. 10, con sus 9 subcomités) y monitorea los plazos reglamentarios (cubierta especial provisional de 180 días, primer seguimiento de 15–30 días, estancamiento de casos "En proceso").
- **Reporte oficial imprimible/PDF** con membrete institucional y bloque de firmas (usa la función de impresión del navegador, "Guardar como PDF").
- **Notificaciones web** (`Notification` API + service worker en `public/sw.js`): botón "Activar Alertas" que solicita permiso al navegador y, mientras la app está abierta, muestra notificaciones locales para alertas críticas (60+ días de inactividad o plazos legales vencidos), con clic para abrir el expediente correspondiente. El manejador de eventos `push` del service worker queda listo para recibir notificaciones reales de un servidor (Web Push con VAPID), pero esa parte de backend no está incluida — requeriría infraestructura y credenciales adicionales.

## Requisitos

- Node.js 18+

## Instalación y ejecución

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Compilar para producción

```bash
npm run build
```

Los archivos estáticos se generan en `dist/`.

## Configurar Firebase (recomendado para producción)

Sin configurar, la app funciona en modo local (localStorage, sin login, sin sincronización entre usuarios). Para activar sincronización real y autenticación:

1. Crea un proyecto en [console.firebase.google.com](https://console.firebase.google.com).
2. Activa **Firestore Database** (modo producción) y **Authentication** (métodos Email/contraseña y Google).
3. ⚙️ Configuración del proyecto → General → "Tus apps" → agrega una app Web → copia el objeto `firebaseConfig`.
4. Copia `.env.example` a `.env` y completa los valores `VITE_FIREBASE_*` (para producción en Vercel, agrégalos en Project Settings → Environment Variables).
5. Publica las reglas de seguridad: Firestore Database → Reglas → pega el contenido de `firestore.rules` → Publicar.
6. El primer usuario que inicie sesión queda con rol "Coordinador" por defecto. Para hacerlo Administrador la primera vez, edítalo manualmente en Firestore Console → colección `users` → documento de ese usuario → cambia el campo `role` a `"Administrador"`. Desde ahí ya puede usar el panel "Usuarios" en la app para asignar roles a los demás.

## Checklist de producción

- [x] Autenticación (Firebase Auth)
- [x] Base de datos compartida en tiempo real (Firestore)
- [x] Reglas de seguridad server-side (`firestore.rules`) que replican los permisos por rol
- [x] Manejo de errores global (Error Boundary) y favicon
- [ ] Aviso de privacidad/consentimiento para el manejo de datos clínicos
- [ ] Backups periódicos automatizados (más allá de la persistencia de Firestore)
- [ ] Alertas por correo (SMTP) — requiere credenciales de un servidor de correo
- [ ] Dominio propio
- [ ] Pruebas automatizadas

## Estructura del proyecto

```
firestore.rules  Reglas de seguridad de Firestore (permisos por rol)
public/
  sw.js           Service worker: maneja eventos 'push' y 'notificationclick'
src/
  components/     Componentes de la interfaz (Navbar, CaseList, formularios, panel del agente, login, etc.)
  context/        Contextos de React (idioma, tema, base de datos, roles, autenticación)
  data/           Datos iniciales de ejemplo (modo local)
  i18n/           Diccionario de traducciones ES/EN
  lib/firebase.ts Inicialización de Firebase (con fallback si no está configurado)
  types.ts        Modelos de datos del Registro TEA (Ley 163-2024)
  utils/          Lógica auxiliar: etapa de vida, agente de integridad, plazos Ley 163, notificaciones
```

## Notas

`DbContext` y `RoleContext` cambian automáticamente entre modo local (localStorage, sin login) y modo Firebase (Firestore + Authentication) según si las variables `VITE_FIREBASE_*` están configuradas — no hace falta tocar el resto de la aplicación al activar Firebase.
