# Plan v3 — Alquileres App

Documento separado del plan de v2 (`docs/plan-v2-cerrado.md`, cerrada por completo). Este archivo es exclusivo de v3 — se arma y actualiza acá, no se mezcla con el otro. Vive dentro del repo (a diferencia de los planes de Claude Code en `~/.claude/plans/`, que son locales a una sola computadora) para que viaje entre computadoras junto con el proyecto.

## Estado de v2 (para contexto, sin re-abrirla)

Código en `main`, tag `v2.0.0`, ambos pusheados a GitHub. Backup de `alquileres_db` hecho y ya copiado por el usuario a su USB. Único pendiente real de v2 (no de código): el despliegue al servidor de producción sigue bloqueado porque la llave SSH (`ssh-key-2026-07-25.key`) no está en la computadora usada cuando se cerró v2.

---

## Respuesta clara sobre el RUC `10714409919`

**Sí, ese RUC se puede usar para afiliarse a Yape Business — no hay ningún motivo, ni por SUNAT ni por el RNP, que lo bloquee.**

- Es un RUC válido (pasa el algoritmo de dígito verificador de SUNAT), tipo "10" = persona natural con RUC.
- El flujo oficial de Yape Empresa (Centro de Ayuda Yape) solo pide "tipo de documento: RUC", sin distinguir si empieza en 10 o 20. No se encontró ninguna fuente que excluya al RUC persona natural.
- Estar inscrito en el RNP (Registro Nacional de Proveedores del Estado) **no interfiere en nada**: el RNP es exclusivamente para contratar con el Estado, no impone obligaciones extra ante SUNAT más allá de las normales de tener RUC, y no convierte a la persona en "Persona Expuesta Políticamente" ante el banco (ese estatus es solo para funcionarios públicos, no para proveedores privados).
- La única condición real que podría bloquear tanto el RNP como Yape Business es que el RUC esté **"activo y habido"** ante SUNAT — eso se verifica gratis en el portal de SUNAT, y no tiene relación con estar en el RNP.
- Fuentes y el detalle completo de la investigación quedaron anotados en `public/plan-mejoras.html`, dentro de la idea `innovador-3` (Yape Business webhook).

Conclusión: usar este RUC para Yape Business no es un problema técnico ni regulatorio — si en algún momento la afiliación fallara, sería por un trámite bancario puntual (ej. falta la tarjeta Credimás), no por el RUC en sí ni por el RNP.

### Ronda 2 — ¿y declarar el alquiler ante SUNAT sin problemas? (investigado 2026-09-04)

El miedo real del usuario no era solo "afiliarme a Yape", sino "que SUNAT me cuestione de dónde sale esa plata en mi RUC". Investigado a fondo, con fuentes oficiales de SUNAT/MEF:

- **El alquiler se declara aparte, mes a mes, con el Formulario Virtual 1683** (Renta de Primera Categoría, 5% del ingreso bruto) — se puede pagar con el mismo Yape desde SUNAT Virtual. Genera un recibo oficial para el inquilino.
- **Mezclar ingresos del RNP (Estado) y del alquiler bajo el mismo RUC es normal** — un RUC cubre varias categorías de renta a la vez, declaradas por separado. Lo que SUNAT persigue es "incremento patrimonial no justificado" (que lo que hay en la cuenta no coincida con lo declarado EN TOTAL) — declarar ambas fuentes da más sustento, no menos.
- **El canal de pago (Yape) no es en sí un factor de riesgo.** Existen 2 mecanismos de SUNAT (reporte bancario de saldos >7 UIT / S/38,500 en 2026; fiscalización de Yape/Plin desde ~S/45,000 anuales) pero ambos apuntan a ingresos NO declarados, no al canal.
- **Único punto sin resolver, información contradictoria entre fuentes:** si el RUC está en régimen **NRUS**, no está claro si el alquiler puede sumarse sin sacarlo de esa categoría (unas fuentes dicen que sí hasta S/8,000/mes, otras que no). **Si el RUC está en RER/MYPE/Régimen General, este problema no existe.**

**Recomendación:** confirmar con un contador solo UNA cosa — en qué régimen de tercera categoría está el RUC hoy. Si no es NRUS, no hay nada más que resolver.

---

## Los 9 candidatos de v3

Ninguno arrancado todavía. Se listan con su origen y una nota de alcance/riesgo para poder priorizar con criterio, no solo por orden de aparición.

| # | Candidato | Qué implica | Riesgo/dependencia |
|---|---|---|---|
| 1 | "Control" descargable con los datos del inquilino | Documento (¿PDF tipo ficha?) con los datos que el inquilino proporcionó — DNI/CE/pasaporte, celular, dirección, quizás datos del contrato vigente. Ya se verificó que el sistema soporta los 4 tipos de documento (DNI/RUC/CE/PASAPORTE), sirve para inquilinos extranjeros | Bajo — es sobre todo diseño/alcance, los datos ya existen |
| 2 | Mora automática | Calcular la mora por días de atraso en vez de cargarla a mano, configurable desde Config. cobranza | **Alto** — toca `CobroService`, cambia montos reales de cobranza ya facturados |
| 3 | Alertas de consumo anómalo | Comparar la lectura nueva contra el histórico de esa unidad y avisar si el consumo se dispara | Medio — conecta directo con el Reporte de Consumo ya construido en v2 (el resaltado visual simple ya deja el terreno listo) |
| 4 | PWA instalable + notificaciones push | Manifest + service worker para instalar la app como PWA | Bajo — 100% código propio, sin cuentas ni credenciales externas |
| 5 | WhatsApp Business API | Automatizar el envío de avisos de cobro/vencimiento por WhatsApp | Externo — depende de cuenta verificada de Meta y costo por plantilla de mensaje |
| 6 | Yape Business webhook | QR dinámico por cobro + confirmación automática de pago, sin conciliación manual | Externo — depende de la afiliación a Yape Business (ver respuesta del RUC arriba: sin bloqueo conocido), 3-10 días hábiles de aprobación |
| 7 | Egresos reales en Financiero | Cargar gastos reales (mantenimiento, reparaciones) para un reporte financiero de ingresos vs. egresos de verdad | Medio — no hay tabla de gastos hoy, hay que diseñarla desde cero |
| 8 | Otros servicios de cobro | Internet, cable, estacionamiento, limpieza como nuevos conceptos de cobro | Bajo — reutiliza `tarifas_servicios`/`conceptos_cobro` tal cual, sin cambio de esquema |
| 9 | Facturación electrónica real ante SUNAT | Boletas/facturas electrónicas de verdad (hoy `comprobante_correlativos` es numeración interna, no ante SUNAT). Con RUC + RNP activos del usuario, esto le serviría para declarar bien el ingreso por alquiler | **Alto** — integración con un proveedor de facturación electrónica homologado por SUNAT, la pieza más grande de todo este roadmap |
| — | Soporte multi-inmueble (no priorizado) | El modelo `Inmueble` ya existe en el esquema pero nada de la app lo usa de verdad todavía | No es un pedido — solo queda anotado por si algún día aplica |

## Por dónde empezar — recomendación

No hay un orden obligatorio, pero si se quiere maximizar impacto por esfuerzo:

1. **Empezar por lo de bajo riesgo y sin dependencias externas** (#4 PWA, #8 otros servicios, #1 control descargable) — se pueden construir de punta a punta sin esperar la aprobación de nadie externo (Meta, Yape, un proveedor de facturación).
2. **Después lo que depende de un tercero pero ya está despejado** (#6 Yape Business — el RUC ya no es un obstáculo, solo falta que el usuario complete el trámite de afiliación) y #5 WhatsApp Business API (mismo tipo de dependencia, cuenta de Meta).
3. **Dejar para el final lo de alto riesgo/alcance grande** (#2 mora automática — toca dinero ya facturado, #9 facturación electrónica — la integración más grande del roadmap, #7 egresos — requiere diseñar una tabla nueva desde cero).

## Próximo paso

El usuario elige uno de los 9 (o el orden sugerido arriba) para arrancar. Recién ahí se abre, en este mismo archivo, una sección de detalle real siguiendo el mismo criterio que se usó para Reportes en v2: **reglas de negocio y alcance exacto primero, diseño visual tangible después, API/backend al final** — sin arrancar código antes de tener eso cerrado.
