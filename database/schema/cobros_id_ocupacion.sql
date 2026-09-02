-- cobros_mensuales.id_ocupacion + consumo_kwh
--
-- Cierra un gap que el propio codigo ya denunciaba (OcupacionUnidad::cobros(),
-- CobroMensual::ocupacion()): el vinculo cobro->ocupacion era indirecto por
-- (id_unidad, id_persona), lo que causo el bug de monto_alquiler
-- desincronizado que origino esta migracion a Laravel. Tambien es
-- prerequisito de la Fase 2 del plan de atribucion por tramos
-- (docs/diseno-ocupaciones-parciales.md) -- CobroService::key() pasa a
-- usar id_ocupacion en vez de id_persona.
--
-- consumo_kwh es un snapshot: hoy el recibo del inquilino re-consulta
-- liquidacion_luz_detalle en tiempo de generacion del PDF, asi que si se
-- regenera la liquidacion de un periodo viejo los kWh impresos cambian
-- aunque el dinero cobrado no -- inconsistencia de la familia RF-16 que ya
-- existia. Este snapshot lo arregla de paso.
--
-- Ambos NULL/0 por default -- 0.5 hace el backfill de id_ocupacion sobre
-- las filas existentes.

START TRANSACTION;

ALTER TABLE cobros_mensuales
    ADD COLUMN IF NOT EXISTS id_ocupacion INT UNSIGNED NULL AFTER id_unidad,
    ADD COLUMN IF NOT EXISTS consumo_kwh DECIMAL(12,2) NOT NULL DEFAULT 0 AFTER monto_luz;

ALTER TABLE cobros_mensuales
    ADD KEY IF NOT EXISTS idx_cobro_ocupacion (id_ocupacion);

-- MariaDB no soporta "ADD CONSTRAINT IF NOT EXISTS ... FOREIGN KEY" (si
-- soporta IF NOT EXISTS en ADD COLUMN/ADD KEY, arriba). Re-correr este
-- script una segunda vez fallaria aca con "Duplicate key name" -- error
-- claro y seguro, no hace falta un guard mas elaborado para un cambio de
-- una sola vez.
ALTER TABLE cobros_mensuales
    ADD CONSTRAINT fk_cobro_ocupacion
        FOREIGN KEY (id_ocupacion) REFERENCES ocupacion_unidad (id_ocupacion);

COMMIT;

-- Backfill de las filas existentes. Prefiere la ocupacion que cubre el
-- CIERRE del periodo (fecha_fin >= periodo.fecha_fin, o sigue abierta) --
-- mismo criterio de "ocupacion de cierre" que se va a usar en
-- lecturas_unidad (ver docs/diseno-ocupaciones-parciales.md). El WHERE
-- c.id_ocupacion IS NULL lo hace seguro de re-correr.
--
-- Verificado en produccion (2026-09-02): quedan 3/62 filas en NULL a
-- proposito (cobros de periodo 2/feb-2026, ya PAGADO) -- no existe
-- ninguna ocupacion en los datos reales cuyo rango cubra ese periodo para
-- esa unidad+persona (gap real preexistente, no una falla de esta
-- query). El fallback de CobroMensual::ocupacion() y de
-- CobroService::key()/forceRefresh() (Fase 2) cubre estas filas.
UPDATE cobros_mensuales c
JOIN periodos p ON p.id_periodo = c.id_periodo
SET c.id_ocupacion = (
    SELECT o.id_ocupacion FROM ocupacion_unidad o
    WHERE o.id_unidad = c.id_unidad AND o.id_persona = c.id_persona
      AND o.estado <> 'ANULADO'
      AND o.fecha_inicio <= p.fecha_fin
      AND (o.fecha_fin IS NULL OR o.fecha_fin >= p.fecha_inicio)
    ORDER BY (o.fecha_fin IS NULL OR o.fecha_fin >= p.fecha_fin) DESC, o.fecha_inicio DESC, o.id_ocupacion DESC
    LIMIT 1
)
WHERE c.id_ocupacion IS NULL;
