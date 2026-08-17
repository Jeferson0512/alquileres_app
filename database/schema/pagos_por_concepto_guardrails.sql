DROP PROCEDURE IF EXISTS sp_recalcular_estado_cobro;

DELIMITER $$

CREATE PROCEDURE sp_recalcular_estado_cobro(IN p_id_cobro INT UNSIGNED)
BEGIN
    DECLARE v_total_cobrar DECIMAL(12,2) DEFAULT 0;
    DECLARE v_total_pagado DECIMAL(12,2) DEFAULT 0;
    DECLARE v_estado_actual VARCHAR(20);

    SELECT c.total_cobrar, c.estado_pago
    INTO v_total_cobrar, v_estado_actual
    FROM cobros_mensuales c
    WHERE c.id_cobro = p_id_cobro
    LIMIT 1;

    IF v_estado_actual IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Cobro no encontrado para recalculo de estado.';
    END IF;

    IF v_estado_actual <> 'ANULADO' THEN
        SELECT IFNULL(SUM(CASE WHEN p.estado = 'REGISTRADO' THEN p.monto_pagado ELSE 0 END), 0)
        INTO v_total_pagado
        FROM pagos p
        WHERE p.id_cobro = p_id_cobro;

        UPDATE cobros_mensuales c
        SET c.estado_pago = CASE
                WHEN v_total_pagado <= 0 THEN 'PENDIENTE'
                WHEN v_total_pagado < v_total_cobrar THEN 'PARCIAL'
                ELSE 'PAGADO'
            END,
            c.updated_at = CURRENT_TIMESTAMP
        WHERE c.id_cobro = p_id_cobro;
    END IF;
END$$

DELIMITER ;

DROP TRIGGER IF EXISTS trg_pagos_detalle_bi;
DROP TRIGGER IF EXISTS trg_pagos_detalle_bu;
DROP TRIGGER IF EXISTS trg_pagos_detalle_ai;
DROP TRIGGER IF EXISTS trg_pagos_detalle_au;
DROP TRIGGER IF EXISTS trg_pagos_detalle_ad;
DROP TRIGGER IF EXISTS trg_pagos_bu;
DROP TRIGGER IF EXISTS trg_pagos_au;

DELIMITER $$

CREATE TRIGGER trg_pagos_detalle_bi
BEFORE INSERT ON pagos_detalle
FOR EACH ROW
BEGIN
    DECLARE v_id_cobro_pago INT UNSIGNED;
    DECLARE v_estado_pago VARCHAR(20);
    DECLARE v_monto_pago DECIMAL(12,2);
    DECLARE v_id_cobro_detalle BIGINT UNSIGNED;
    DECLARE v_monto_programado DECIMAL(12,2);
    DECLARE v_permite_pago_directo TINYINT(1);
    DECLARE v_total_aplicado_pago DECIMAL(12,2);
    DECLARE v_total_aplicado_linea DECIMAL(12,2);
    DECLARE v_saldo_linea DECIMAL(12,2);

    SELECT p.id_cobro, p.estado, p.monto_pagado
    INTO v_id_cobro_pago, v_estado_pago, v_monto_pago
    FROM pagos p
    WHERE p.id_pago = NEW.id_pago
    LIMIT 1;

    IF v_id_cobro_pago IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El pago asociado no existe.';
    END IF;

    IF v_estado_pago <> 'REGISTRADO' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Solo se puede aplicar detalle sobre pagos en estado REGISTRADO.';
    END IF;

    SELECT cd.id_cobro, cd.monto_programado, cc.permite_pago_directo
    INTO v_id_cobro_detalle, v_monto_programado, v_permite_pago_directo
    FROM cobros_mensuales_detalle cd
    INNER JOIN conceptos_cobro cc ON cc.id_concepto = cd.id_concepto
    WHERE cd.id_cobro_detalle = NEW.id_cobro_detalle
    LIMIT 1;

    IF v_id_cobro_detalle IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La linea de cobro asociada no existe.';
    END IF;

    IF v_id_cobro_pago <> v_id_cobro_detalle THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La linea de detalle no pertenece al mismo cobro del pago.';
    END IF;

    IF v_permite_pago_directo = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El concepto seleccionado no permite pago directo.';
    END IF;

    IF NEW.monto_aplicado <= 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El monto aplicado debe ser mayor a cero.';
    END IF;

    SELECT IFNULL(SUM(pd.monto_aplicado), 0)
    INTO v_total_aplicado_pago
    FROM pagos_detalle pd
    WHERE pd.id_pago = NEW.id_pago;

    IF v_total_aplicado_pago + NEW.monto_aplicado > v_monto_pago THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La suma del detalle excede el monto total del pago.';
    END IF;

    SELECT IFNULL(SUM(pd.monto_aplicado), 0)
    INTO v_total_aplicado_linea
    FROM pagos_detalle pd
    INNER JOIN pagos p ON p.id_pago = pd.id_pago
    WHERE pd.id_cobro_detalle = NEW.id_cobro_detalle
      AND p.estado = 'REGISTRADO';

    SET v_saldo_linea = GREATEST(v_monto_programado - v_total_aplicado_linea, 0);

    IF NEW.monto_aplicado > v_saldo_linea THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El monto aplicado excede el saldo disponible del concepto.';
    END IF;
END$$

CREATE TRIGGER trg_pagos_detalle_bu
BEFORE UPDATE ON pagos_detalle
FOR EACH ROW
BEGIN
    DECLARE v_id_cobro_pago INT UNSIGNED;
    DECLARE v_estado_pago VARCHAR(20);
    DECLARE v_monto_pago DECIMAL(12,2);
    DECLARE v_id_cobro_detalle BIGINT UNSIGNED;
    DECLARE v_monto_programado DECIMAL(12,2);
    DECLARE v_permite_pago_directo TINYINT(1);
    DECLARE v_total_aplicado_pago DECIMAL(12,2);
    DECLARE v_total_aplicado_linea DECIMAL(12,2);
    DECLARE v_saldo_linea DECIMAL(12,2);

    SELECT p.id_cobro, p.estado, p.monto_pagado
    INTO v_id_cobro_pago, v_estado_pago, v_monto_pago
    FROM pagos p
    WHERE p.id_pago = NEW.id_pago
    LIMIT 1;

    IF v_id_cobro_pago IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El pago asociado no existe.';
    END IF;

    IF v_estado_pago <> 'REGISTRADO' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Solo se puede modificar detalle sobre pagos en estado REGISTRADO.';
    END IF;

    SELECT cd.id_cobro, cd.monto_programado, cc.permite_pago_directo
    INTO v_id_cobro_detalle, v_monto_programado, v_permite_pago_directo
    FROM cobros_mensuales_detalle cd
    INNER JOIN conceptos_cobro cc ON cc.id_concepto = cd.id_concepto
    WHERE cd.id_cobro_detalle = NEW.id_cobro_detalle
    LIMIT 1;

    IF v_id_cobro_pago <> v_id_cobro_detalle THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La linea de detalle no pertenece al mismo cobro del pago.';
    END IF;

    IF v_permite_pago_directo = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El concepto seleccionado no permite pago directo.';
    END IF;

    IF NEW.monto_aplicado <= 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El monto aplicado debe ser mayor a cero.';
    END IF;

    SELECT IFNULL(SUM(pd.monto_aplicado), 0)
    INTO v_total_aplicado_pago
    FROM pagos_detalle pd
    WHERE pd.id_pago = NEW.id_pago
      AND pd.id_pago_detalle <> OLD.id_pago_detalle;

    IF v_total_aplicado_pago + NEW.monto_aplicado > v_monto_pago THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La suma del detalle excede el monto total del pago.';
    END IF;

    SELECT IFNULL(SUM(pd.monto_aplicado), 0)
    INTO v_total_aplicado_linea
    FROM pagos_detalle pd
    INNER JOIN pagos p ON p.id_pago = pd.id_pago
    WHERE pd.id_cobro_detalle = NEW.id_cobro_detalle
      AND p.estado = 'REGISTRADO'
      AND pd.id_pago_detalle <> OLD.id_pago_detalle;

    SET v_saldo_linea = GREATEST(v_monto_programado - v_total_aplicado_linea, 0);

    IF NEW.monto_aplicado > v_saldo_linea THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El monto aplicado excede el saldo disponible del concepto.';
    END IF;
END$$

CREATE TRIGGER trg_pagos_detalle_ai
AFTER INSERT ON pagos_detalle
FOR EACH ROW
BEGIN
    DECLARE v_id_cobro INT UNSIGNED;

    SELECT p.id_cobro INTO v_id_cobro
    FROM pagos p
    WHERE p.id_pago = NEW.id_pago
    LIMIT 1;

    CALL sp_recalcular_estado_cobro(v_id_cobro);
END$$

CREATE TRIGGER trg_pagos_detalle_au
AFTER UPDATE ON pagos_detalle
FOR EACH ROW
BEGIN
    DECLARE v_id_cobro INT UNSIGNED;

    SELECT p.id_cobro INTO v_id_cobro
    FROM pagos p
    WHERE p.id_pago = NEW.id_pago
    LIMIT 1;

    CALL sp_recalcular_estado_cobro(v_id_cobro);
END$$

CREATE TRIGGER trg_pagos_detalle_ad
AFTER DELETE ON pagos_detalle
FOR EACH ROW
BEGIN
    DECLARE v_id_cobro INT UNSIGNED;

    SELECT p.id_cobro INTO v_id_cobro
    FROM pagos p
    WHERE p.id_pago = OLD.id_pago
    LIMIT 1;

    CALL sp_recalcular_estado_cobro(v_id_cobro);
END$$

CREATE TRIGGER trg_pagos_bu
BEFORE UPDATE ON pagos
FOR EACH ROW
BEGIN
    IF NEW.estado IN ('REVERSADO', 'ANULADO') THEN
        IF NEW.motivo_reversa IS NULL OR TRIM(NEW.motivo_reversa) = '' THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'La reversa o anulacion requiere motivo_reversa.';
        END IF;

        IF NEW.reversado_por IS NULL OR TRIM(NEW.reversado_por) = '' THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'La reversa o anulacion requiere reversado_por.';
        END IF;

        IF NEW.fecha_reversa IS NULL THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'La reversa o anulacion requiere fecha_reversa.';
        END IF;
    END IF;

    IF OLD.estado IN ('REVERSADO', 'ANULADO') AND NEW.estado = 'REGISTRADO' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Un pago reversado o anulado no debe volver a REGISTRADO.';
    END IF;

    IF OLD.id_cobro <> NEW.id_cobro AND OLD.estado IN ('REVERSADO', 'ANULADO') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'No se permite mover un pago reversado o anulado a otro cobro.';
    END IF;
END$$

CREATE TRIGGER trg_pagos_au
AFTER UPDATE ON pagos
FOR EACH ROW
BEGIN

    IF OLD.id_cobro <> NEW.id_cobro THEN
        CALL sp_recalcular_estado_cobro(OLD.id_cobro);
    END IF;

    CALL sp_recalcular_estado_cobro(NEW.id_cobro);
END$$

DELIMITER ;

-- Validacion recomendada para ejecutar al cerrar una transaccion de registro o actualizacion de pago.
-- Debe devolver cero filas cuando todo esta consistente.
SELECT
    p.id_pago,
    p.monto_pagado,
    IFNULL(SUM(pd.monto_aplicado), 0) AS total_aplicado,
    ROUND(IFNULL(SUM(pd.monto_aplicado), 0) - p.monto_pagado, 2) AS diferencia
FROM pagos p
LEFT JOIN pagos_detalle pd ON pd.id_pago = p.id_pago
WHERE p.estado = 'REGISTRADO'
GROUP BY p.id_pago, p.monto_pagado
HAVING diferencia <> 0;
