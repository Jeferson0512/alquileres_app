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

## Los 10 candidatos de v3

Ninguno arrancado todavía. Se listan con su origen y una nota de alcance/riesgo para poder priorizar con criterio, no solo por orden de aparición.

| # | Candidato | Qué implica | Riesgo/dependencia |
|---|---|---|---|
| 1 | "Control" descargable con los datos del inquilino | Documento (¿PDF tipo ficha?) con los datos que el inquilino proporcionó — DNI/CE/pasaporte, celular, dirección, quizás datos del contrato vigente. Ya se verificó que el sistema soporta los 4 tipos de documento (DNI/RUC/CE/PASAPORTE), sirve para inquilinos extranjeros | Bajo — es sobre todo diseño/alcance, los datos ya existen |
| 10 | Avisos descargables propios por categoría (deuda anterior / contrato por vencer) | Ver detalle abajo — hoy "Contratos por vencer" y "Deuda anterior" en el módulo Avisos comparten el mismo botón "Descargar" que la categoría "Periodo actual", pero ese descargable (`AvisoPreview`/`handleDescargar` en `Avisos/Index.jsx`) está armado en base a los datos del cobro (monto, kwh, deuda), no del motivo real del aviso — para "Contratos por vencer" en particular termina bajando un documento de cobro, no uno de vencimiento de contrato | Bajo — es diseño de documento, los datos (fecha de fin de contrato, días restantes, nivel de urgencia) ya se calculan en `grupoVencimiento`/`detalleVencimiento`, solo falta un layout propio |
| 2 | PWA instalable + notificaciones push | Manifest + service worker para instalar la app como PWA | Bajo — 100% código propio, sin cuentas ni credenciales externas |
| 3 | Alertas de consumo anómalo | Comparar la lectura nueva contra el histórico de esa unidad y avisar si el consumo se dispara | Medio — conecta directo con el Reporte de Consumo ya construido en v2 (el resaltado visual simple ya deja el terreno listo) |
| 4 | WhatsApp Business API | Automatizar el envío de avisos de cobro/vencimiento por WhatsApp | Externo — depende de cuenta verificada de Meta y costo por plantilla de mensaje |
| 5 | Yape Business webhook | QR dinámico por cobro + confirmación automática de pago, sin conciliación manual | Externo — depende de la afiliación a Yape Business (ver respuesta del RUC arriba: sin bloqueo conocido), 3-10 días hábiles de aprobación |
| 6 | Egresos reales en Financiero | Cargar gastos reales (mantenimiento, reparaciones) para un reporte financiero de ingresos vs. egresos de verdad | Medio — no hay tabla de gastos hoy, hay que diseñarla desde cero |
| 7 | Otros servicios de cobro | Internet, cable, estacionamiento, limpieza como nuevos conceptos de cobro | Bajo — reutiliza `tarifas_servicios`/`conceptos_cobro` tal cual, sin cambio de esquema |
| 8 | Mora automática | Calcular la mora por días de atraso en vez de cargarla a mano, configurable desde Config. cobranza | **Alto** — toca `CobroService`, cambia montos reales de cobranza ya facturados |
| 9 | Facturación electrónica real ante SUNAT | Boletas/facturas electrónicas de verdad (hoy `comprobante_correlativos` es numeración interna, no ante SUNAT). Con RUC + RNP activos del usuario, esto le serviría para declarar bien el ingreso por alquiler | **Alto** — integración con un proveedor de facturación electrónica homologado por SUNAT, la pieza más grande de todo este roadmap |
| — | Soporte multi-inmueble (no priorizado) | El modelo `Inmueble` ya existe en el esquema pero nada de la app lo usa de verdad todavía | No es un pedido — solo queda anotado por si algún día aplica |

Reordenado 2026-09-04 a pedido del usuario (PWA sube al puesto 2, Mora automática baja al puesto 8) — es solo el orden de la tabla, no cambia alcance ni dependencias de ningún candidato; ver "¿hay algún problema en reordenar?" más abajo.

## Por dónde empezar — recomendación

No hay un orden obligatorio, pero si se quiere maximizar impacto por esfuerzo:

1. **Empezar por lo de bajo riesgo y sin dependencias externas** (#2 PWA, #7 otros servicios, #1 control descargable, #10 avisos descargables por categoría) — se pueden construir de punta a punta sin esperar la aprobación de nadie externo (Meta, Yape, un proveedor de facturación).
2. **Después lo que depende de un tercero pero ya está despejado** (#5 Yape Business — el RUC ya no es un obstáculo, solo falta que el usuario complete el trámite de afiliación) y #4 WhatsApp Business API (mismo tipo de dependencia, cuenta de Meta).
3. **Dejar para el final lo de alto riesgo/alcance grande** (#8 mora automática — toca dinero ya facturado, #9 facturación electrónica — la integración más grande del roadmap, #6 egresos — requiere diseñar una tabla nueva desde cero).

### ¿Hay algún problema en reordenar la tabla?

No. Los números son solo un índice de la tabla — no hay dependencias de código ni de negocio entre los 9 candidatos (cada uno toca partes distintas del sistema, y ninguno es prerequisito de otro salvo lo ya señalado: #3 Alertas de consumo reutiliza el mismo cálculo que el Reporte de Consumo de v2, y #9 Facturación electrónica se apoya en el trabajo de `comprobante_correlativos` que ya existe). Cambiar el orden de la tabla o de la lista de prioridad es 100% seguro en cualquier momento.

### Detalle del #10 — avisos descargables por categoría (confirmado leyendo el código, 2026-09-04)

El usuario señaló que en el módulo Avisos hay 3 categorías (periodo actual, las que deben — deuda anterior, y las que finalizan contrato) y que solo la de periodo actual tiene un descargable que de verdad le corresponde. Se verificó en `laravel/resources/js/Pages/Avisos/Index.jsx`:

- Las 3 secciones (`AvisoSection titulo="Todos los cobros del periodo"`, `"Deuda anterior"`, `"Contratos por vencer"`) usan el mismo componente `AvisoCard` con el mismo handler `onDescargar={() => handleDescargar(row)}` (líneas 545, 560, 575).
- `handleDescargar` y el componente `AvisoPreview` (línea 670) arman el documento a partir de `row` — el cobro del período (monto, kWh, deuda anterior) — no a partir del motivo específico del aviso.
- Para **"Contratos por vencer"**, esto es un desajuste real: `grupoVencimiento` ya calcula datos propios de vencimiento (`aviso.dias_restantes`, `aviso.fecha_vencimiento`, `aviso.nivel` — ver `detalleVencimiento`, línea 485), pero el botón "Descargar" de esa tarjeta genera el mismo documento de cobro que la categoría de periodo actual, no un aviso de vencimiento de contrato. Confirma exactamente lo que describió el usuario.
- Para **"Deuda anterior"**, el descargable sí incluye el monto de la deuda (`deudaAnteriorReal`/`deudaAnterior` ya son props de `AvisoPreview`), así que el contenido no está tan desalineado como en vencimiento — pero es la misma plantilla de "aviso de cobro" en los tres casos, sin una identidad visual propia por categoría.

**Alcance a definir cuando se priorice este candidato:** diseñar un layout de documento propio para "Contratos por vencer" (con fecha de fin, días restantes y nivel de urgencia en vez de datos de cobro) y decidir si "Deuda anterior" necesita su propia plantilla o si la actual ya es suficiente al ser también, en esencia, un aviso de cobro.

### Detalle del #7 — qué otros servicios podrían cobrarse

Pedido explícito: identificar qué conceptos nuevos tendría sentido sumar a `tarifas_servicios`/`conceptos_cobro` (todos son fijos mensuales por unidad, igual que hoy el alquiler — no requieren medidor ni prorrateo por consumo, salvo que se indique lo contrario):

- **Internet/WiFi** — fijo mensual, o "a cargo del inquilino" si cada uno contrata el suyo (no aplicaría como cobro).
- **TV cable / streaming compartido**.
- **Estacionamiento/cochera** — si hay unidades con cochera opcional aparte del alquiler base.
- **Limpieza de áreas comunes**.
- **Mantenimiento de ascensor** (si el inmueble lo tiene).
- **Seguridad/vigilancia** (cámaras, portero).
- **Agua** — hoy ya se prorratea la luz; si el agua no está incluida en el alquiler y hay un solo medidor general, es candidato al mismo patrón de prorrateo que la luz (esto sí tocaría lógica de prorrateo, no es un simple concepto fijo).
- **Gas** (balón o red pública), si no está incluido.
- **Depósito/storage adicional** — si alguna unidad incluye un cuarto de depósito por separado.
- **Fondo de garantía / depósito en garantía** — distinto de un cobro recurrente, sería un concepto de cobro único al inicio del contrato.
- **Amoblado** — recargo fijo si la unidad se alquila amoblada.

De estos, los que son **fijo mensual simple** (Internet, cable, estacionamiento, limpieza, ascensor, seguridad, gas de red, amoblado) son bajo riesgo — mismo patrón que hoy. **Agua con medidor único** y **fondo de garantía** son los dos que requieren decidir una regla de negocio antes de programar (el primero por el prorrateo, el segundo por ser un cobro único no recurrente). El usuario debe indicar cuáles de estos aplican realmente al inmueble antes de definir el alcance final del #7.

---

## Investigación SUNAT — Ronda 3: ¿existe un tope de 1 UIT anual? (investigado 2026-09-04)

Pedido del usuario: confirmar si existe una regla real que limite los ingresos anuales a 1 UIT y que penalice o retenga dinero al superarla — la preocupación de fondo es mezclar el ingreso del RNP (Estado) con el del alquiler bajo el mismo RUC.

**Conclusión directa: no existe ninguna regla de SUNAT que limite el ingreso anual total (ni el de alquiler, ni el combinado) a 1 UIT.** Verificado directamente en la página oficial de SUNAT para rentas de primera categoría (`personas.sunat.gob.pe/alquilo-mi-casa-o-auto/preguntas-frecuentes`): no menciona ningún tope de UIT sobre el monto de alquiler anual, y las únicas sanciones descritas son por **no declarar a tiempo** (multa de 50% de la UIT, ≈ S/2,750 en 2026 con la UIT de S/5,500), no por el monto de ingreso en sí.

Lo que sí se encontró, y probablemente es el origen de la confusión del "1 UIT":

| Regla real | De qué se trata | Por qué NO aplica como el usuario teme |
|---|---|---|
| **RNP — exoneración de inscripción ≤ 1 UIT** | El reglamento de contrataciones del Estado (RLCE) exceptúa de la obligación de registrarse en el RNP a los proveedores cuyas **contrataciones** sean por montos **iguales o menores a 1 UIT**. | Es un umbral para que el **Estado no exija** registro en compras pequeñas — no es un tope de ingreso personal, no genera multa ni retención al superarlo, y el usuario ya está inscrito en el RNP de todos modos. |
| **Deducción de 3 UIT para inquilinos** | Un trabajador (perceptor de renta de 4ta/5ta) puede deducir hasta 3 UIT adicionales de gastos, incluido el 30% de lo que paga de alquiler **como inquilino**, para reducir su propio impuesto y generar saldo a favor/devolución. | Es al revés de la situación del usuario — aplica a quien **paga** alquiler y quiere deducirlo, no a quien lo **cobra**. No tiene relación con los ingresos del arrendador. |
| **Suspensión de retenciones de 4ta categoría** | Un independiente (recibos por honorarios) puede pedir que no le retengan el 8% si sus ingresos proyectados de 4ta/5ta no superan ~S/48,125/año (2026) — no es 1 UIT, son ≈8.75 UIT. | Aplica a honorarios (4ta categoría), no a renta de alquiler (1ra categoría) ni a lo que cobra un proveedor del Estado. Distinto tributo, distinta categoría de renta. |
| **Nuevo RUS — tope real** | El límite del NRUS es S/8,000 mensuales / S/96,000 anuales (no 1 UIT ni 1,700 UIT — ese número es el tope del Régimen MYPE Tributario, otro régimen distinto). | Solo aplicaría si el RUC estuviera en NRUS por su actividad de servicios al Estado — y aun así, ver el punto siguiente: el alquiler no cuenta para ese límite. |

**El punto que sí es información dura y resuelve la duda pendiente de la Ronda 2** (ver arriba, "único punto sin resolver" sobre NRUS): las actividades de **arrendamiento están expresamente excluidas del NRUS**. El alquiler **siempre** se declara como renta de primera categoría por el Formulario 1683 (5% mensual), sin importar en qué régimen esté el RUC por su otra actividad (NRUS, RER, MYPE o Régimen General) — no se puede "meter" el alquiler dentro del NRUS, y por lo tanto tampoco puede hacer que el NRUS se pase de su límite. Los dos ingresos van en canales de declaración separados.

**Sobre la retención que el usuario teme:** confirmado en la misma FAQ oficial de SUNAT — cuando tanto el inquilino como el propietario están domiciliados en Perú (el caso normal), **no existe retención en el alquiler**. El propietario cobra el monto íntegro y paga el 5% directamente por Formulario 1683 (se puede pagar con Yape desde SUNAT Virtual, como ya se había anotado en la Ronda 2). La retención en rentas de primera solo existe en el caso excepcional de que el propietario sea **no domiciliado** (no aplica acá).

**Lo que sí es un riesgo real y donde SUNAT sí puede actuar:** el **Incremento Patrimonial No Justificado (IPNJ)** — no es un tope de UIT, es una comparación: si tus gastos/patrimonio (compras, depósitos bancarios, propiedades) no calzan con la suma de **todos** tus ingresos declarados (RNP + alquiler + cualquier otro), SUNAT puede presumir que lo no explicado es renta no declarada y cobrar impuesto sobre eso. La defensa es la misma que ya se había anotado en la Ronda 2: **declarar ambas fuentes de ingreso por separado, cada una en su categoría, es lo que blinda contra esto** — mezclarlas bajo el mismo RUC no es el problema, dejar de declarar alguna sí lo sería.

**Recomendación (se mantiene igual que la Ronda 2, ahora con más respaldo):** no hay ninguna regla de "1 UIT anual" que temer. Sigue siendo válido confirmar con un contador en qué régimen de tercera categoría está el RUC hoy (NRUS/RER/MYPE/General) — pero ya no por miedo a un tope de ingresos combinados, sino solo para asegurarse de que la actividad del RNP esté en el régimen correcto por sí sola (el alquiler, como se vio arriba, siempre va aparte sin importar cuál sea).

Fuentes consultadas (2026-09-04): [Preguntas frecuentes — Rentas de Primera Categoría (SUNAT)](https://personas.sunat.gob.pe/alquilo-mi-casa-o-auto/preguntas-frecuentes), [Rentas de Primera Categoría — Renta 2025 (SUNAT)](https://renta.sunat.gob.pe/personas/renta-de-primera-categoria), [Incremento Patrimonial No Justificado — Renta 2025 (SUNAT)](https://renta.sunat.gob.pe/personas/incremento-patrimonial-no-justificado), [8 UIT en contrataciones del Estado 2026 — qué es y cómo afecta (Licitalab)](https://www.licitalab.pe/blog/8-uit-contrataciones-estado-peru-2026), [Registro Nacional de Proveedores (RNP): requisitos y registro (Licitalab)](https://www.licitalab.pe/blog/registro-nacional-proveedores-rnp), [Fijan nuevos montos para la suspensión de pagos y retenciones de cuarta categoría en 2026 (LP)](https://lpderecho.pe/fijan-nuevos-montos-para-la-suspension-de-pagos-y-retenciones-de-cuarta-categoria-en-2026-resolucion-de-superintendencia-000390-2025-sunat/), [Deducir 3 UIT en gastos personales 2026 (modelo.pe)](https://modelo.pe/blog/como-deducir-gastos-personales-3-uit-2026-sunat/), [Alquiler de Inmuebles: ¿Renta de Primera o de Tercera Categoría? (MISHA)](https://misha.pe/tributario/alquiler-inmuebles-renta-de-primera-o-tercera-categoria/).

---

## ¿Son estos los únicos puntos mejorables? (respuesta a la pregunta del usuario)

No exactamente — los 10 candidatos no salen todos de la misma fuente. Revisando de dónde viene cada uno:

- **De `public/plan-mejoras.html`** (la página de auditoría de 2026), sección "Ideas innovadoras": #2 PWA, #3 Alertas de consumo, #4 WhatsApp, #5 Yape Business. De la sección "Plan de mejoras": #8 Mora automática (`corto-2`) y #7 Otros servicios (`medio-4`).
- **No vienen de esa página** — se agregaron en conversaciones posteriores directas con el usuario: #1 Control descargable, #6 Egresos reales, #9 Facturación electrónica.
- **#10 (avisos por categoría) no viene de ninguno de los dos documentos** — salió recién ahora, de que el usuario señaló el problema y se confirmó leyendo el código real de `Avisos/Index.jsx`. Es la prueba de que no todo lo mejorable está anotado en `plan-mejoras.html` ni en `requerimientos-proyecto.md` — hay huecos que solo aparecen al usar el módulo o revisar su código a fondo.

Además, `plan-mejoras.html` tiene una idea que **no** se promovió a la lista de v3 todavía: **`medio-1` Recordatorios automáticos** — más genérica que el #4 (WhatsApp), habla de una tarea programada que envíe avisos por email o WhatsApp antes del vencimiento; hoy solo existe el feed de notificaciones dentro de la app, el envío sigue siendo manual. Y `docs/requerimientos-proyecto.md` (punto 8, "Fuera de alcance") anota otros 3 pendientes que tampoco están en la lista de 9: **pasarela de pago genérica** (Mercado Pago/Culqi/Niubiz, además/en vez de Yape), **prorrateo por días** cuando alguien se muda a mitad de mes (bug de diseño pendiente, no es exactamente una mejora nueva), y **app móvil nativa** (descartada a favor del portal web ya hecho). Multi-inmueble ya está anotado como "no priorizado" en la tabla.

Si alguno de estos 4 (recordatorios genéricos, pasarela de pago, prorrateo por días, o confirmar que app nativa sigue descartada) también debería sumarse como candidato #10+, decirlo y se agrega a la tabla.

---

## Próximo paso

El usuario elige uno de los 9 (o el orden sugerido arriba) para arrancar. Recién ahí se abre, en este mismo archivo, una sección de detalle real siguiendo el mismo criterio que se usó para Reportes en v2: **reglas de negocio y alcance exacto primero, diseño visual tangible después, API/backend al final** — sin arrancar código antes de tener eso cerrado.
