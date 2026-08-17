---
name: reglas-negocio-facturacion
description: Reglas de negocio no obvias de facturación (Liquidación/Cobros/Avisos/Recibos) que hay que respetar en cualquier feature nueva que muestre montos o consumo de luz. Usar al tocar CobroService, LiquidacionService, Avisos, Config. cobranza, o al construir cualquier documento nuevo tipo recibo/comprobante.
---

# Reglas de negocio de facturación

Estas reglas ya existen en el código y **no son evidentes leyendo un solo
archivo** — se pisan fácil si se rediseña o se agrega un documento nuevo
(recibo, PDF, notificación) sin revisar primero cómo lo hace `Avisos/Index.jsx`
o `CobroService`.

## 1. Mínimo de luz — dos configuraciones independientes, no una

`config_cobranza` tiene **dos campos de "mínimo" separados**, con propósitos
distintos. Confundirlos es el error más fácil de cometer:

| Campo | Unidad | Qué hace | Dónde vive |
|---|---|---|---|
| `monto_minimo_luz` | Soles (S/) | Si la luz calculada de una unidad da **menos** que este monto, se cobra el mínimo igual. Es dinero real, va a `ajuste_minimo_luz` en `cobros_mensuales`. | `CobroService::calcular*()` (busca `ajusteMinimoLuz`) |
| `minimo_kwh_aviso` | kWh (default 13.5) | Si el consumo real es **menor** a este umbral, el aviso/recibo muestra **0.00 kWh** en vez del número real. Es puramente de presentación — no cambia ni un centavo de lo cobrado. | `Avisos/Index.jsx` (`getAvisoMinimoKwh`, `isLowConsumo`, `displayConsumo`) |

**Por qué existe la regla del kWh (no es capricho):** si a alguien se le cobra
el mínimo fijo (`ajuste_minimo_luz` > 0) porque consumió muy poco, mostrarle
"1.20 kWh" al lado del monto es confuso — parece que se le está cobrando por
ese consumo diminuto, cuando en realidad paga el mínimo fijo. Por eso se
oculta el número real y se muestra 0.00.

**Regla práctica:** cualquier documento nuevo que muestre el detalle de Luz
(recibo descargable, PDF, notificación, dashboard de consumo) tiene que
replicar la lógica de `isLowConsumo` de `Avisos/Index.jsx` — el monto de Luz
mostrado siempre es `monto_luz + ajuste_minimo_luz` (ya combinado, correcto
tal cual viene de `CobroService`), pero el **número de kWh** que se muestra
al lado depende de si el consumo real superó `minimo_kwh_aviso`.

## 2. "Recibo" vs "Comprobante" — son documentos distintos, no confundir

- **Recibo** (el documento oficial itemizado: alquiler + luz + agua + gas +
  deuda anterior + saldo) — lo genera el sistema, con folio
  (`numero_comprobante`), sello de estado. Existe tanto para el periodo
  pendiente como para cualquier periodo ya pagado del historial — el mismo
  documento, solo que con el sello "Pagado" en vez de "Pendiente" y los
  montos ya saldados.
- **Comprobante** (`comprobantes_pago`) — la **foto/captura** que el
  inquilino sube como prueba de haber pagado (Yape, transferencia, etc.),
  con su propio estado `PENDIENTE`/`APROBADO`/`RECHAZADO`. Es evidencia que
  sube el inquilino, no un documento que genera el sistema.

Un cobro puede tener recibo descargable sin tener comprobante subido (pago
en efectivo, por ejemplo), y viceversa durante la revisión. No son
intercambiables en la UI ni en los nombres de botón.

## 3. Prorrateo por días — sigue sin existir (recordatorio)

Ni la Liquidación ni los Cobros prorratean por días de ocupación dentro de un
periodo — ver `docs/requerimientos-proyecto.md` punto 8. Cualquier feature
nueva que calcule o muestre montos de un periodo parcial (alguien que se
mudó a mitad de mes) hereda ese vacío, no lo inventa. No "arreglarlo" de
paso en otra feature sin que sea una tarea explícita de diseño aparte.
