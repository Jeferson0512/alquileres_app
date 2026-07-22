START TRANSACTION;

ALTER TABLE ocupacion_unidad
    ADD COLUMN activa_flag TINYINT GENERATED ALWAYS AS (IF(estado = 'ACTIVO', id_unidad, NULL)) STORED;

CREATE UNIQUE INDEX uq_ocupacion_unidad_activa ON ocupacion_unidad (id_unidad, activa_flag);

COMMIT;
