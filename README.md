# Registro TEA · Ley 163-2024

Aplicación de Registro de Coordinación Interinstitucional de Servicios TEA para el Departamento de la Familia de Puerto Rico (Ley Núm. 163 del 13 de agosto de 2024).

## Funcionalidades

- **Registro de casos** con el formulario oficial completo (secciones I–IX: información general, perfil de la persona con TEA, etapa de vida, composición familiar, razones del referido, necesidades identificadas, gestión realizada, seguimiento y barreras identificadas).
- **Base de datos persistente** en el navegador (localStorage), con historial de cambios por expediente, detección de duplicados y sanitización de datos.
- **Módulo bilingüe** Español / English con selector en la barra superior.
- **Módulo de tema** Claro / Oscuro.
- **Agente Especialista en Base de Datos**: motor de reglas que audita la integridad clínica de los expedientes (edad vs. etapa de vida, diagnósticos incompletos para referidos de empleo, datos de contacto faltantes, etc.), permite corrección automática de un clic, y responde consultas simples en lenguaje natural sobre los datos registrados — todo de forma local, sin depender de un servicio externo de IA.
- **Panel de análisis** con indicadores clave, distribución por estado/región y carga de trabajo por coordinador.
- **Importar / Exportar** en JSON y CSV (con BOM UTF-8 para compatibilidad con Excel).
- **Roles** (Administrador, Director, Supervisor, Coordinador) con permisos diferenciados para crear, editar, eliminar, usar el agente, aplicar correcciones, importar/exportar y reiniciar la base de datos.
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

## Estructura del proyecto

```
public/
  sw.js           Service worker: maneja eventos 'push' y 'notificationclick'
src/
  components/     Componentes de la interfaz (Navbar, CaseList, formularios, panel del agente, etc.)
  context/        Contextos de React (idioma, tema, base de datos, roles)
  data/           Datos iniciales de ejemplo
  i18n/           Diccionario de traducciones ES/EN
  types.ts        Modelos de datos del Registro TEA (Ley 163-2024)
  utils/          Lógica auxiliar: etapa de vida, agente de integridad, plazos Ley 163, notificaciones
```

## Notas

Esta versión utiliza una base de datos local (localStorage) para que la aplicación funcione de inmediato sin configuración adicional. La arquitectura de `DbContext` está aislada para poder sustituirla en el futuro por un backend real (por ejemplo, Firebase o una API propia) sin afectar el resto de la aplicación.
