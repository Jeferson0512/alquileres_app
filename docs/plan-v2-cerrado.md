# Plan maestro — Alquileres App

## 📋 Estado general

| # | Bloque | Estado |
|---|---|---|
| 1 | Backend — Ocupaciones parciales (Fases 0-3) | ✅ Completo |
| 2 | Diseño visual — Fase A (fundamento: tokens, tipografía, componentes) | ✅ Completo |
| 3 | Diseño visual — Fase B (10 páginas del prototipo) | ✅ Completo |
| 4 | Ajustes a Avisos (feedback post-Fase B) | ✅ Completo |
| 5 | Diseño visual — Fase C (7 páginas fuera del alcance original) | ✅ Completo |
| 6 | Reconciliar `public/plan-mejoras.html` | ✅ Completo |
| 7bis | Bug de datos — orden de Tarifas en Roles y permisos | ✅ Completo |
| 7 | Fase D — Módulo de Reportes (nuevo, al final de la cola) | ✅ Completo |
| 8 | Alinear Perfil del Portal (inquilino) con "Mi perfil" del admin | ✅ Completo |

**Próximo paso:** sin bloques activos — bloque 8 se retomó antes de lo previsto (a pedido directo, no quedó para "después de v2" como se había anotado).

## ✅ v2 cerrada del lado de código/Git (2026-09-04)

`v2-desarrollo` fusionada a `main` (fast-forward, sin conflictos), tag `v2.0.0` creado, las 3 referencias (`main`, `v2-desarrollo`, `v2.0.0`) pusheadas a GitHub y verificadas idénticas (`git rev-list --left-right --count` → `0 0`). Backup de `alquileres_db` hecho y copiado por el usuario a su USB. 2 gotchas reales encontrados en el cierre quedaron documentados en el skill `publicar-version` (chequear que la llave SSH exista en la máquina actual antes de prometer un deploy; re-correr `RolePermissionSeeder` a mano después de `migrate --force` si el deploy agrega un permiso nuevo).

**Pendiente real, no de este plan:** el despliegue a producción (Parte B) sigue bloqueado — la llave SSH (`ssh-key-2026-07-25.key`) no está en la computadora usada en esta sesión. El usuario necesita traerla desde donde la tenga guardada antes de poder desplegar.

Este plan queda cerrado acá. **v3 arranca como plan separado** — ver `docs/plan-v3.md`.

---

# 1. Backend — Ocupaciones parciales ✅ Completo

## Contexto

Arrancó como un reporte puntual: en Lecturas, con el período ABIERTO, el campo "Actual" aparecía bloqueado para unidades recién sincronizadas. La causa raíz (bloqueo por auditoría de `lectura_anterior`) escaló a un problema de fondo ya documentado en `docs/requerimientos-proyecto.md` punto 8: el sistema asumía una sola ocupación estable por unidad por período, lo que rompía 3 escenarios reales — retiro a mitad de período, dos inquilinos en la misma unidad, traslado entre unidades. Se diseñó (`docs/diseno-ocupaciones-parciales.md`) y resolvieron 13 decisiones de negocio (5.1-5.13) antes de ejecutar.

**Resultado logrado:** el sistema atribuye correctamente consumo de luz y prorratea alquiler/agua/gas/mantenimiento entre ocupaciones parciales dentro de un mismo período, sin duplicar ni perder cobros, con el bug original de Lecturas corregido.

## Decisiones de negocio (referencia rápida)

| # | Decisión | Resuelto como | Fase |
|---|---|---|---|
| 5.1 | Alquiler de tramo parcial | Prorratear siempre, por días reales del período | 2 |
| 5.2 | Alquiler en traslado | Prorratear entre las dos unidades | 2 |
| 5.3 | Denominador del prorrateo | Días reales del período (no 30 fijos) | 2 |
| 5.4 | Consumo del tramo vacante | Se reparte entre unidades ocupadas | 2 |
| 5.5 | Mínimo de luz con 2+ tramos | Un mínimo por unidad+período, repartido | 2 |
| 5.6 | `minimo_kwh_aviso` | Contra el consumo del período completo | 2 |
| 5.7 | Mínimo de días para tramo propio | Sin mínimo | 2 |
| 5.8 | Tramo sin corte al generar | Bloquear la generación de esa unidad | 2 |
| 5.9 | Renovación con cambio de precio a mitad de período | Dos cobros, uno por tramo | 2 |
| 5.10 | Garantía en traslado | Se traslada tal cual | 3 |
| 5.11 | Deuda anterior tras traslado | Sigue a la persona (cadena) | 3 |
| 5.12 | Portal en mes de transición | Dos recibos, nota cruzada | 3 |
| 5.13 | Convención de fechas de ocupación | Cerrado-cerrado, `+1 día` | 0 |

**Descartado en el camino:** bloqueo por `estado='VALIDADO'` (no soportaba guardar "Actual" 2 veces en un período abierto); Fase 4 del diseño original como fase separada (ya la cubre Fase 2); heurístico "bloquear solo si consumo > 0" (fallaba con consumo real cero).

## ✅ Fase 0 — Corrección inmediata + saneamiento

| Paso | Qué | Archivos |
|---|---|---|
| ✅ 0.0 | Quitar bloqueo por auditoría en "Actual"; editable si `periodo.estado === 'ABIERTO'` | `Pages/Lecturas/Index.jsx:116-149` |
| ✅ 0.1 | Test golden — 2-3 períodos históricos reales, `cobros_mensuales` centavo a centavo | `tests/Feature/Services/` |
| ✅ 0.2 | Convención de fechas (5.13) — validación anti-solape en `OcupacionController` | `OcupacionController.php`, `Ocupaciones/Index.jsx:239-254` |
| ✅ 0.3 | Limpieza de ~5 solapes de 1 día en `ocupacion_unidad` | `database/schema/` |
| ✅ 0.4 | `cobros_mensuales` ADD `id_ocupacion` + `consumo_kwh` (legacy, vía skill `modificar-esquema-legacy`) | `database/schema/cobros_id_ocupacion.sql` |
| ✅ 0.5 | Backfill `id_ocupacion` — 59/62 backfilleados, 3 en `NULL` a propósito (gap real preexistente, no bug) | mismo `.sql` |
| ✅ 0.6 | `CobroMensual::ocupacion()` usa `id_ocupacion` directo (fallback para las 3 filas sin backfill) | `Models/CobroMensual.php:53-69` |
| ✅ 0.7 | Fix medidor compartido: ocupación del dependiente por "vigente en el período", no por `estado='ACTIVO'` | `Services/CobroService.php:146-149` |
| ✅ 0.8 | `$fillable` + regenerar `schema_dump_test.sql` | skill `correr-tests` |

## ✅ Fase 1 — Captura de lecturas de corte

| Paso | Qué |
|---|---|
| ✅ 1.1 | Migración `lecturas_corte`: `id_periodo`, `id_unidad`, `fecha_corte`, `id_ocupacion_sale/entra`, `lectura_corte` (nullable), `origen` (AUTO/MANUAL) |
| ✅ 1.2 | `TramoResolver::tramosParaPeriodo()` — recorta ocupaciones al período, rellena vacantes, cruza con `lecturas_corte`, calcula consumo/días por tramo |
| ✅ 1.3 | Tests de propiedad: cobertura exacta sin huecos/solapes, conservación de kWh, caso `n=1` idéntico al actual |
| ✅ 1.4 | `LecturaService::sincronizar()` detecta fronteras y crea `lecturas_corte` AUTO pendientes |
| ✅ 1.5 | UI Lecturas: sub-fila por tramo, badge "Corte pendiente", acción "Registrar corte" |
| ✅ 1.6 | Guard: no sincronizar/crear cortes si el período ya tiene pagos `REGISTRADO` |

## ✅ Fase 2 — Atribución real de consumo + prorrateo (cambia dinero)

Golden test byte-idéntico en cada paso. 2.11 se aplicó con desviación: `id_ocupacion` quedó nullable (no `NOT NULL`) por 3/63 cobros históricos sin ocupación real backfilleable — detalle en `docs/implementacion-ocupaciones-parciales.md`.

| Paso | Qué | Decisión |
|---|---|---|
| ✅ 2.1 | Migración `liquidacion_luz_tramo` | — |
| ✅ 2.2 | Reparto de `total_pagar_luz` entre tramos ocupados, proporcional a consumo, residuo al último | 5.4, 5.5 |
| ✅ 2.3 | Exclusión por consumo cero pasa a nivel UNIDAD, no tramo | 5.1, 5.4 |
| ✅ 2.4 | kWh de tramo vacante excluido de `calcularPorcentajes()` — `diferenciaComun` lo absorbe solo | 5.4 |
| ✅ 2.5 | `buildProgramados()` lee de `liquidacion_luz_tramo`, joinea por `id_ocupacion` del tramo | — |
| ✅ 2.6 | `CobroService::key()`: `"{unidad}:{persona}"` → `"{unidad}:{ocupacion}"` | 5.9 |
| ✅ 2.7 | `armarFilaCobro()`: `factor = dias_tramo/dias_periodo` en alquiler/agua/gas/otros | 5.1-5.3 |
| ✅ 2.8 | Mínimo de luz una vez por unidad+período, repartido con mismo criterio de residuo | 5.5, 5.7 |
| ✅ 2.9 | Tramo sin `lectura_corte` → `ValidationException`, no genera ni adivina | 5.8 |
| ✅ 2.10 | `minimo_kwh_aviso` contra consumo del período completo (suma de tramos) | 5.6 |
| ✅ 2.11 | Unicidad `cobros_mensuales` → `uq_cobro_periodo_unidad_ocupacion` | 5.9 |
| ✅ 2.12 | `forceRefresh()` keyea por `id_ocupacion` con fallback | 5.9 |
| ✅ 2.13 | `listarParaPeriodo()`/`PortalReciboController` leen snapshot `cobros_mensuales.consumo_kwh` | — |
| ✅ 2.14 | UI: Liquidación con sub-filas por tramo; Cobros con rango de fechas del tramo | — |
| ✅ 2.15 | Arnés de regresión — históricos `n=1` dan salida byte-idéntica | — |

**Archivos:** `LiquidacionService.php`, `CobroService.php`, `Liquidacion/Index.jsx`, `Avisos/Index.jsx`.

## ✅ Fase 3 — Traslado como acción de primera clase

`traslados_ocupacion` sin la columna `regla_alquiler` del diseño original (5.1/5.2 ya resueltas por Fase 2, hubiera quedado sin uso).

| Paso | Qué | Decisión |
|---|---|---|
| ✅ 3.1 | Migración `traslados_ocupacion` | — |
| ✅ 3.2 | `TrasladoService`: finaliza origen, crea destino, vincula, crea los 2 `lecturas_corte` con valores reales | 5.10 |
| ✅ 3.3 | Modal "Trasladar a otra unidad" — un solo paso | — |
| ✅ 3.4 | `deuda_anterior` sigue la cadena de `traslados_ocupacion` | 5.11 |
| ✅ 3.5 | Portal: dos recibos separados el mes de transición, nota cruzada | 5.12 |
| ✅ 3.6 | Badge "Traslado" con link cruzado en Cobros/recibo | — |

## Protecciones que ningún paso puede violar

| Protección | Cómo se respeta |
|---|---|
| RF-16 (cobro no cambia de monto salvo regeneración explícita) | `liquidacion_luz_tramo`/`cobros_mensuales.consumo_kwh` son snapshots |
| `forceRefresh` preserva pagos ya aplicados | Key con fallback + backfill 100% antes de romper unicidad |
| `generar()` bloqueado si el período ya tiene pagos | Sin cambios |
| Nunca `migrate:fresh` | Tablas nuevas son grupo 2, la regla sigue en pie |
| Tests de Services contra MySQL real | `schema_dump_test.sql` regenerado tras cada ALTER |

## Post-implementación: 2 bugs en vivo, resueltos sin cambio de código

- **Unidad 208** (contrato vencido sin renovar): se evaluó parchear `TramoResolver` para que ACTIVO ignore `fecha_fin` vencida, pero no hizo falta — crear la renovación con `fecha_fin=NULL` deja que el fix de fusión sin cambios (commit `67da661`) la absorba.
- **Unidad 204** (mudanza el primer día del período, corte histórico sin capturar): `lectura_anterior == lectura_actual` del período completo → el valor del corte está forzado matemáticamente (un medidor nunca retrocede), no es una decisión de negocio.

Detalle completo en `docs/implementacion-ocupaciones-parciales.md`.

---

# 2-3. Diseño visual — Fase A + Fase B ✅ Completo

## Contexto

Con el backend cerrado, se retomó un pendiente diferido semanas atrás: alinear el panel admin al prototipo visual "Torre de Control" — mismo alcance operativo, sistema visual más rico, **misma paleta de marca exacta** (`primary #2563EB`, `success #16A34A`, `warning #D97706`, `danger #DC2626`, confirmada carácter por carácter contra el HTML real del artifact). No es cambio de identidad de color, es una capa de refinamiento (tokens de superficie/borde, tipografía, tarjetas/KPIs consistentes) sobre la paleta que ya existía.

**Decisiones tomadas con el usuario:**
- Sin modo oscuro en el admin por ahora (el admin es 100% claro a propósito — comentario explícito en `AdminLayout.jsx`; solo el Portal tiene toggle real).
- Sin barra de búsqueda global (sería feature nueva de backend, no reskin).

## ✅ Fase A — Fundamento

| Paso | Qué |
|---|---|
| ✅ A.1 | `tailwind.config.js`: tokens nuevos (`ink`, `paper`, `surface.2/3`, `border`/`border-strong`, `muted`/`muted-2`, bloque `sidebar.*`) + `mono: IBM Plex Mono` + `sans: Plus Jakarta Sans` |
| ✅ A.2 | `app.blade.php`: fuentes vía Bunny Fonts (Plus Jakarta Sans + IBM Plex Mono), fuera del bloque condicional de Portal |
| ✅ A.3 | `Components/Card.jsx` y `Components/KpiCard.jsx` nuevos |
| ✅ A.4 | `AdminLayout.jsx` re-claseado (sidebar, topbar, breadcrumb, título) — sin tocar lógica de `navigation`/permisos |
| ✅ A.5 | Verificación: `npm run build` limpio + smoke visual |

**Extensión de Fase A** (a pedido del usuario, antes de terminar Fase B — los modales seguían con scaffolding de Breeze sin tocar):
`TextInput`, `InputLabel`, `InputError`, `PrimaryButton` (usaba `bg-gray-800`, ni siquiera el azul de la app), `SecondaryButton`, `DangerButton`, `Modal` (overlay/panel/radio), `IconButton`, `Pagination`, `StatusTabs` — todos migrados. Barrido completo de los 6 modales de Cobros/Ocupaciones para sacar cualquier clase suelta. `lib/confirm.js`/`promptDialog.js`/`toast.js` (SweetAlert2, fuera del árbol de React) alineados — ya usaban los hex exactos de marca, solo desalineaba el gris de Cancelar y los íconos del toast.

## ✅ Fase B — Rollout de las 10 páginas del prototipo

| # | Página | Estado | Notas |
|---|---|---|---|
| ✅ | 1. Liquidación | Completo | Pipeline de 4 pasos + tabla; fix select nativo → PeriodSwitcher; columna Unidad más ancha con nombre abreviado; columna Estado angosta |
| ✅ | 2. Dashboard | Completo | KPI row → `KpiCard` (+ tono `purple` para no perder el acento de "Cobro teórico"); 6 secciones → `Card`; números → `font-mono` |
| ✅ | 3. Cobros | Completo | Fix select nativo; tabla reskineada; "Cartera vencida" de acento amber → `alert-band` danger (semánticamente correcto: deuda vencida real). Los 3 modales quedaron fuera a propósito (se hicieron después, ver Extensión de Fase A) |
| ✅ | 4. Ocupaciones | Completo | Mapa de unidades reskineado (`border-transparent` en ocupadas sin alerta, `rounded-xl`); tabla de detalle; de paso `StatusTabs.jsx` migrado |
| ✅ | 5. Periodos | Completo | Timeline a `rounded-xl`, dot abierto con `bg-primary-light`; 2 modales barridos |
| ✅ | 6. Unidades | Completo | Grid de cards + tabla "De baja"/"Todas" + modal |
| ✅ | 7. Inquilinos | Completo | Tabla con fila avatar-iniciales + modal |
| ✅ | 8. Lecturas | Completo | KPI row → `KpiCard`; tabla + sub-filas de tramo + modal "Registrar corte". **Refinado a pedido del usuario:** columna Auditoría sin ancho fijo; sub-filas ya resueltas atenuadas a `opacity-60`; input de corte de sub-fila igualado a `w-28` |
| ✅ | 9. Avisos | Completo (ver bloque 4 — ajustes pendientes) | Ver detalle abajo |
| ✅ | 10. Recibo/Comprobantes | Completo | Hero + pipeline + 2 cards + desglose en Recibo; tabla + modal "Aprobar comprobante" + form de rechazo en Comprobantes |

### Avisos — detalle (corrección importante a mitad de camino)

La primera versión (lista + panel de vista previa) fue un error — no correspondía al prototipo real. Al releer el HTML del artifact se encontró que Avisos usa una **grilla de tarjetas** agrupada en **3 secciones por motivo con dato real**: "Deuda anterior", "Consumo bajo el mínimo", "Contratos por vencer" — las 3 con señal ya presente en la página (`deuda_anterior`, `isLowConsumo`, `vencimientosContrato`). La afirmación previa de "no hay dato de consumo sin tocar backend" fue un error, corregido.

**Cambio de backend consentido explícitamente** (única excepción a "esta pasada no toca Services"): `CobroService::listarParaPeriodo()` trae `p.celular` — 1 línea, aditiva. Verificado con `CobroServiceTest` (7/7) + suite completa (67/71, mismas 4 fallas de Auth sin relación de siempre).

Estructura: `AvisoSection` + `AvisoCard` (nuevos). Cada tarjeta: avatar-iniciales, nombre, unidad, mensaje de una línea, botón WhatsApp (`wa.me` + `buildSummaryText()`), Descargar PNG. Clic en el header abre `AvisoPreview` dentro de `Modal` — Copiar/Descargar/Compartir/Cancelar-deuda intactos, cero funcionalidad perdida.

**Ajuste posterior:** se eliminó "Consumo bajo el mínimo" (nota contable interna, no motivo de WhatsApp) y se agregó "Todos los cobros del periodo" detrás de un toggle.

**Bug encontrado y corregido:** al sacar la sección de consumo se borró por error `avisoMinimoKwh`, usado por el modal de preview → `ReferenceError` en consola. Restaurado.

## Verificación de Fase A+B

`npm run build` limpio en cada paso. Smoke visual manual (sin tests automatizados de UI). Nada tocó Services/Controllers salvo la única excepción documentada (celular en Avisos).

---

# 4. Ajustes pendientes a Avisos ✅ Completo

Feedback del usuario sobre lo ya implementado en Fase B, a aplicar antes de arrancar Fase C:

| # | Ajuste | Decisión |
|---|---|---|
| ✅ | **Orden y qué se oculta** | "Todos los cobros del periodo" pasa a **primera sección, siempre visible**. **"Contratos por vencer" pasa a ocultarse** detrás de `Ver contratos por vencer (N)` en el header (estado renombrado a `mostrarVencimientos`). Orden final: Todos los cobros (siempre) → Deuda anterior (siempre) → Contratos por vencer (toggle) |
| ✅ | **Ícono de WhatsApp** | Se mantiene `MessageCircle` (lucide no tiene íconos de marca) + fondo verde `#22C35E` + texto "WhatsApp" |
| ✅ | **Popup de vista previa no descubrible** | Botón `Eye` (lucide) explícito agregado junto a WhatsApp/Descargar en cada `AvisoCard` |

**Archivo:** `laravel/resources/js/Pages/Avisos/Index.jsx` (`AvisoCard`, `return` de `Index`, imports de lucide).

---

# 5. Diseño visual — Fase C (7 páginas fuera del alcance original) ✅ Completo

## Contexto

Fase B cubrió las 10 páginas del prototipo. Al preguntar "¿qué falta?" salió a la luz que **7 páginas nunca entraron a esa lista** porque no forman parte del flujo operativo diario mostrado en el prototipo: Usuarios (+ Roles y permisos, Campos del perfil), Configuración de cobranza, Tarifas, Notificaciones (página completa), Consultas, Mi perfil, Auth. Todas con scaffolding viejo de Breeze.

## Plan de ejecución

### ✅ Fase C.0 — Fundamento

`GuestLayout.jsx` → `bg-paper`, card `border-border bg-surface shadow-sm rounded-[13px]`; `Checkbox.jsx` → tokens de marca; `PasswordRequirements.jsx` → `text-gray-400` a `text-muted-2`.

### ✅ Fase C.1 — Rollout página por página (menor a mayor esfuerzo)

Auth (5 archivos), Mi perfil (Edit + 3 Partials), Tarifas + Consultas, Notificaciones, Campos del perfil, Configuración de cobranza, Usuarios (2 modales migrados a `Modal.jsx` real), Roles y permisos (matriz — diseño propio).

## Verificación

`npm run build` limpio después de C.0 y cada página. Suite Pest completa: 67/71, mismas 4 fallas de Auth sin relación de siempre. Nada tocó Services/Controllers.

---

# 6. Reconciliar `public/plan-mejoras.html` ✅ Completo

## Contexto

Documento estático existente (diagnóstico histórico + checklist de mejoras de la migración a Laravel). El usuario pidió: (1) marcar lo ya resuelto, (2) evaluar las 4 "ideas innovadoras" sin implementar para una posible v3, (3) alimentar el alcance del módulo Reportes nuevo (bloque 7).

## Resultado

`medio-3` (Recibos en PDF) marcado como resuelto, redirigiendo a `medio-5` (ya lo describía). Ideas innovadoras anotadas con su estado real para v3: `innovador-1` (PWA) y `innovador-4` (alertas de consumo) como candidatas reales; `innovador-2` (WhatsApp Business API) e `innovador-3` (Yape webhook) mencionadas con la salvedad de que dependen de decisión externa. Se agregó la entrada `reportes-1` documentando el alcance confirmado del módulo de Reportes nuevo (bloque 7).

---

# 7bis. Bug de datos — Tarifas aparecía agrupada bajo Avisos en Roles y permisos ✅ Completo

## Diagnóstico

`RolePermissionController::index()` arma la matriz como **lista plana con bandera de indentación** (`es_submodulo = parent_module_id !== null`), sin agrupar por padre real — depende 100% del `sort_order` de cada módulo para que un submódulo quede junto a su padre visualmente.

La migración `2026_07_22_120000_add_configuracion_module_and_reparent.php` re-padreó `tarifas`/`config_cobranza`/`usuarios` bajo un módulo nuevo "Configuración" (`sort_order 125`), pero nunca subió el `sort_order` propio de Tarifas — se quedó en `120`. Con `120 < 125`, Tarifas ordenaba *antes* que su propio padre, y el módulo raíz inmediatamente anterior era "Avisos" — de ahí la agrupación visual incorrecta.

## Fix

Migración `database/migrations/2026_09_04_000000_fix_tarifas_sort_order.php`: sube `sort_order` de `tarifas` a `126`. El sidebar real (`HandleInertiaRequests::navigationFor()`) construye un árbol real vía Eloquent, no una lista plana — nunca estuvo afectado, el bug era exclusivo de la matriz de Roles y permisos.

Migración commiteada (`e205401`).

---

# 7. Fase D — Módulo de Reportes ✅ Completo

## Alcance confirmado con el usuario

| # | Tipo de reporte | Qué cubre |
|---|---|---|
| 1 | Financiero | Ingresos/egresos, morosidad, cobrado vs. facturado, por período o rango de fechas |
| 2 | Ocupación | Historial por unidad, tasa de vacancia, contratos vencidos/renovados en un rango |
| 3 | Consumo de luz | Histórico por unidad, comparativa entre períodos |
| 4 | Exportable | Archivo descargable (Excel/PDF) para uso externo (contador, declaraciones) |

## Orden de trabajo pedido explícitamente por el usuario

No es el orden por defecto (reglas → API → UI). El usuario pidió expresamente: **primero algo visualmente tangible para poder verlo, reglas de negocio y alcance exacto ANTES de eso para no ir descubriendo cosas a mitad de camino, y la API/backend al final.**

## Decisiones de alcance cerradas

| Pregunta | Decisión |
|---|---|
| Financiero — ¿egresos reales? | **No en v1.** Solo lado de ingresos con datos que ya existen. Egresos reales quedan como candidato de v3 |
| Granularidad de fechas | **Rango de períodos**, no calendario libre |
| Formato de exportación | **Los dos** — PDF (dompdf) y Excel (`maatwebsite/excel`, librería nueva) |
| Estructura de pantalla | **3 pestañas** (Financiero, Ocupación, Consumo), cada una con su propio botón Exportar — "Exportable" no es una 4ta pestaña |

## Reglas de negocio por tipo (investigación de industria vía web + `AskUserQuestion`)

- **Financiero:** aging de morosidad por tramos de días (0-30/31-60/61-90+), desglose por concepto, totales + detalle por unidad (rent roll), gráficos de evolución cobrado/facturado y morosidad.
- **Ocupación:** timeline visual por unidad, vacancia agregada + por unidad, listado de eventos de contrato separado, gráficos de evolución de ocupación y motivo de salida.
- **Consumo:** gráfico de líneas + tabla matriz por período, resaltado visual de desviación (sin la lógica completa de detección de anomalías, eso queda para v3), señalización de unidades bajo el mínimo facturable.
- **Exportable:** botón propio en cada pestaña (no una 4ta pestaña), PDF formal con encabezado, Excel con varias hojas según el contenido.

## Backend real

`ReporteFinancieroService`, `ReporteOcupacionService`, `ReporteConsumoService` + `ReporteController` (ruta `/reportes`, permiso `reportes.ver`, módulo nuevo bajo el grupo "General" del sidebar). Verificado contra datos reales de la BD de dev vía tinker en cada paso — encontró y corrigió: unidad de prueba `INACTIVO` colándose en Ocupación/Consumo, un fix de precisión de punto flotante en `diffInDays()`, y un fallback a `liquidacion_luz_detalle` para períodos anteriores a que `cobros_mensuales.consumo_kwh` existiera como snapshot.

## Exportación PDF

`app/Support/PdfChart.php` (gráficos como PNG vía GD + DejaVu Sans, no SVG — dompdf no lo renderiza de forma confiable) + `resources/views/reportes/*.blade.php` (diseño adaptado de un documento de referencia que pasó el usuario, con la paleta y contenido propios de la app).

## Exportación Excel

`maatwebsite/excel` instalado. `app/Exports/{Financiero,Ocupacion,Consumo}Export.php` + `Sheets/ArraySheet.php` genérica reutilizable — 3-4 hojas por reporte, valores numéricos sin formatear como texto para que el contador pueda sumar/filtrar en Excel.

---

# 8. Alinear Perfil del Portal (inquilino) con "Mi perfil" del admin ✅ Completo

## Diagnóstico

El perfil editable del inquilino (`Pages/Portal/CompletarPerfil.jsx`) no estaba a la par visualmente de "Mi perfil" del admin — usaba `<input>`/`<label>` a mano con clases sueltas, no los componentes compartidos. El Portal tiene modo oscuro de verdad (a diferencia del admin, 100% claro a propósito), así que los componentes compartidos del admin no servían tal cual (sin soporte `dark:`).

## Resolución

**Componentes nuevos:** `Components/Portal/PortalTextInput.jsx` y `PortalLabel.jsx` — versión dark-safe, extraídas del patrón que ya se repetía suelto en `Portal/Index.jsx`. `InputError`/`PasswordRequirements` se reusaron tal cual (ya eran dark-safe).

**`CompletarPerfil.jsx` rediseñado:** header con avatar-iniciales igual al admin, secciones con ícono+título+descripción, `PasswordMatchHint` agregado.

**Análisis de campos obligatorios:** `email` ya está en `required=true` en `profile_fields` (contradice lo que el usuario recordaba). `numero_documento` (DNI) no hace falta agregarlo — ya es obligatorio antes, cuando el admin crea el Inquilino.

**Bug real encontrado y corregido:** `personas.email` y `users.email` (login) son columnas independientes que solo se copiaban una vez al crear el acceso al portal — nada las mantenía sincronizadas después. `PortalPerfilController::update()` ahora también actualiza `users.email` cuando cambia (nunca con valor vacío), más validación de unicidad contra `users`.

**Fix post-entrega:** "Datos de contacto" y "Contraseña" quedaron apiladas en vez de en paralelo (`grid lg:grid-cols-2`) — corregido.
