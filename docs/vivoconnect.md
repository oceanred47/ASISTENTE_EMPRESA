# Project ViVoConnect — Ecosistema de Automatización

Documento base para estructurar el diseño del ecosistema de automatización de ViVoConnect. Sirve como punto de partida a completar con detalles concretos (herramientas ya elegidas, integraciones existentes, diagramas).

## Objetivo

Describir en un solo lugar la arquitectura de automatización de ViVoConnect: qué procesos se automatizan, con qué herramientas y cómo se conectan entre sí.

## Componentes previstos

| Componente | Descripción | Estado |
|---|---|---|
| Orquestación (n8n) | Flujos de automatización que conectan servicios y disparan acciones | Por definir |
| Integraciones con LLMs | Puntos donde un modelo de lenguaje interviene (clasificación, generación, resumen, agentes) | Por definir |
| Fuentes de datos | Sistemas o formularios que alimentan los flujos | Por definir |
| Canales de salida | A dónde llegan los resultados (Slack, email, CRM, dashboard) | Por definir |

## Flujos de automatización

_Lista los flujos de n8n conforme se vayan diseñando o implementando._

1. _Pendiente de definir_

## Decisiones de arquitectura

_Registro de decisiones clave (por qué se eligió una herramienta, un patrón de integración, etc.) a medida que se tomen._

## Próximos pasos

- [ ] Confirmar el alcance inicial del ecosistema (qué procesos automatizar primero).
- [ ] Definir las herramientas y servicios a integrar con n8n.
- [ ] Documentar el primer flujo end-to-end.
