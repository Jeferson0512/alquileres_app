-- cobros_mensuales: unicidad por (periodo, unidad, ocupacion) en vez de
-- (periodo, persona, unidad)
--
-- Desbloquea el caso que el diseño original (decision 5.9,
-- docs/diseno-ocupaciones-parciales.md) pide facturar como DOS cobros: una
-- renovacion de contrato con cambio de precio a mitad de periodo, MISMA
-- persona, MISMA unidad, dos ocupaciones distintas -- la unicidad vieja
-- (periodo, persona, unidad) lo rechazaria como duplicado. Ya paso una vez
-- en datos reales (persona 4, unidad 5, periodo 9).
--
-- No hace falta para los otros 3 escenarios del plan (retiro a mitad de
-- periodo, dos inquilinos en la misma unidad, traslado entre unidades) --
-- todos con personas distintas, la unicidad vieja ya los permitia.
--
-- DESVIACION respecto al plan original: el plan decia "id_ocupacion pasa a
-- NOT NULL (ya backfilleado en 0.5)" -- verificado en produccion
-- (2026-09-02): NO esta 100% backfilleado, quedan 3/62 filas en NULL a
-- proposito (cobros de periodo 2/feb-2026, ya PAGADO, sin ninguna
-- ocupacion real que cubra esas fechas -- ver
-- database/schema/cobros_id_ocupacion.sql). Forzar NOT NULL rompería el
-- ALTER. Se deja id_ocupacion NULLABLE -- MySQL/MariaDB trata cada NULL
-- como distinto en un indice UNIQUE, y las 3 filas ya estan en
-- (periodo,unidad) distintos entre si, asi que no hay riesgo de colision
-- real. El codigo de aplicacion (CobroService::buildProgramados()) siempre
-- puebla id_ocupacion en cobros nuevos, asi que este hueco no crece.

START TRANSACTION;

ALTER TABLE cobros_mensuales
    DROP INDEX uq_cobro_periodo_persona_unidad,
    ADD UNIQUE KEY uq_cobro_periodo_unidad_ocupacion (id_periodo, id_unidad, id_ocupacion);

COMMIT;
