START TRANSACTION;

INSERT INTO cobros_mensuales_detalle (
    id_cobro,
    id_concepto,
    monto_programado,
    descripcion,
    orden_visual,
    created_at,
    updated_at
)
SELECT x.id_cobro,
       cc.id_concepto,
       x.monto_programado,
       x.descripcion,
       x.orden_visual,
       x.created_at,
       x.updated_at
FROM (
    SELECT c.id_cobro, 'ALQUILER' AS codigo, c.monto_alquiler AS monto_programado, 'Alquiler' AS descripcion, 10 AS orden_visual, c.created_at, c.updated_at
    FROM cobros_mensuales c
    WHERE c.monto_alquiler <> 0

    UNION ALL

    SELECT c.id_cobro, 'LUZ', c.monto_luz, 'Luz', 20, c.created_at, c.updated_at
    FROM cobros_mensuales c
    WHERE c.monto_luz <> 0

    UNION ALL

    SELECT c.id_cobro, 'AJUSTE_MINIMO_LUZ', c.ajuste_minimo_luz, 'Ajuste minimo luz', 30, c.created_at, c.updated_at
    FROM cobros_mensuales c
    WHERE c.ajuste_minimo_luz <> 0

    UNION ALL

    SELECT c.id_cobro, 'AGUA', c.monto_agua, 'Agua', 40, c.created_at, c.updated_at
    FROM cobros_mensuales c
    WHERE c.monto_agua <> 0

    UNION ALL

    SELECT c.id_cobro, 'GAS', c.monto_gas, 'Gas', 50, c.created_at, c.updated_at
    FROM cobros_mensuales c
    WHERE c.monto_gas <> 0

    UNION ALL

    SELECT c.id_cobro, 'OTROS', c.otros_conceptos, 'Otros conceptos', 60, c.created_at, c.updated_at
    FROM cobros_mensuales c
    WHERE c.otros_conceptos <> 0

    UNION ALL

    SELECT c.id_cobro, 'MORA', c.mora, 'Mora', 70, c.created_at, c.updated_at
    FROM cobros_mensuales c
    WHERE c.mora <> 0

    UNION ALL

    SELECT c.id_cobro, 'DESCUENTO', (c.descuento * -1), 'Descuento aplicado', 999, c.created_at, c.updated_at
    FROM cobros_mensuales c
    WHERE c.descuento <> 0
) x
INNER JOIN conceptos_cobro cc ON cc.codigo = x.codigo;

UPDATE pagos
SET estado = 'REGISTRADO',
    origen_registro = 'MIGRACION',
    registrado_por = COALESCE(registrado_por, 'MIGRACION_INICIAL')
WHERE origen_registro = 'MANUAL';

DROP PROCEDURE IF EXISTS sp_migrar_pagos_detalle;

DELIMITER $$

CREATE PROCEDURE sp_migrar_pagos_detalle()
BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE v_id_pago INT UNSIGNED;
    DECLARE v_id_cobro INT UNSIGNED;
    DECLARE v_restante DECIMAL(12,2);
    DECLARE v_id_cobro_detalle BIGINT UNSIGNED;
    DECLARE v_saldo_linea DECIMAL(12,2);
    DECLARE v_aplicar DECIMAL(12,2);

    DECLARE cur_pagos CURSOR FOR
        SELECT p.id_pago, p.id_cobro, p.monto_pagado
        FROM pagos p
        ORDER BY p.id_pago;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    OPEN cur_pagos;

    pagos_loop: LOOP
        FETCH cur_pagos INTO v_id_pago, v_id_cobro, v_restante;

        IF done = 1 THEN
            LEAVE pagos_loop;
        END IF;

        WHILE v_restante > 0 DO
            SET v_id_cobro_detalle = NULL;
            SET v_saldo_linea = NULL;

            SELECT MAX(q.id_cobro_detalle),
                   MAX(q.saldo_linea)
            INTO v_id_cobro_detalle, v_saldo_linea
            FROM (
                SELECT cd.id_cobro_detalle,
                       GREATEST(cd.monto_programado - IFNULL(SUM(CASE WHEN p2.estado = 'REGISTRADO' THEN pd2.monto_aplicado ELSE 0 END), 0), 0) AS saldo_linea
                FROM cobros_mensuales_detalle cd
                INNER JOIN conceptos_cobro cc ON cc.id_concepto = cd.id_concepto
                LEFT JOIN pagos_detalle pd2 ON pd2.id_cobro_detalle = cd.id_cobro_detalle
                LEFT JOIN pagos p2 ON p2.id_pago = pd2.id_pago
                WHERE cd.id_cobro = v_id_cobro
                  AND cd.monto_programado > 0
                GROUP BY cd.id_cobro_detalle, cd.monto_programado, cc.prioridad_aplicacion, cd.orden_visual
                HAVING saldo_linea > 0
                ORDER BY cc.prioridad_aplicacion, cd.orden_visual, cd.id_cobro_detalle
                LIMIT 1
            ) q;

            IF v_id_cobro_detalle IS NULL OR v_saldo_linea IS NULL THEN
                SIGNAL SQLSTATE '45000'
                    SET MESSAGE_TEXT = 'Existe al menos un pago historico cuyo monto excede el saldo total migrable del cobro.';
            END IF;

            SET v_aplicar = LEAST(v_restante, v_saldo_linea);

            INSERT INTO pagos_detalle (
                id_pago,
                id_cobro_detalle,
                monto_aplicado,
                origen_aplicacion,
                observacion
            ) VALUES (
                v_id_pago,
                v_id_cobro_detalle,
                v_aplicar,
                'MIGRACION',
                'Asignacion automatica por prioridad durante migracion'
            );

            SET v_restante = v_restante - v_aplicar;
        END WHILE;
    END LOOP;

    CLOSE cur_pagos;
END$$

DELIMITER ;

CALL sp_migrar_pagos_detalle();

DROP PROCEDURE IF EXISTS sp_migrar_pagos_detalle;

INSERT INTO pagos_auditoria (
    id_pago,
    accion,
    actor,
    payload_before,
    payload_after,
    created_at
)
SELECT p.id_pago,
       'CREADO',
       'MIGRACION_INICIAL',
       NULL,
       JSON_OBJECT(
           'id_pago', p.id_pago,
           'id_cobro', p.id_cobro,
           'fecha_pago', DATE_FORMAT(p.fecha_pago, '%Y-%m-%d'),
           'monto_pagado', p.monto_pagado,
           'metodo_pago', p.metodo_pago,
           'numero_operacion', p.numero_operacion,
           'estado', p.estado,
           'origen_registro', p.origen_registro
       ),
       COALESCE(p.created_at, CURRENT_TIMESTAMP)
FROM pagos p;

UPDATE cobros_mensuales c
LEFT JOIN (
    SELECT p.id_cobro,
           SUM(CASE WHEN p.estado = 'REGISTRADO' THEN p.monto_pagado ELSE 0 END) AS total_pagado_activo
    FROM pagos p
    GROUP BY p.id_cobro
) x ON x.id_cobro = c.id_cobro
SET c.estado_pago = CASE
        WHEN c.estado_pago = 'ANULADO' THEN 'ANULADO'
        WHEN IFNULL(x.total_pagado_activo, 0) <= 0 THEN 'PENDIENTE'
        WHEN IFNULL(x.total_pagado_activo, 0) < c.total_cobrar THEN 'PARCIAL'
        ELSE 'PAGADO'
    END,
    c.updated_at = CURRENT_TIMESTAMP;

COMMIT;
