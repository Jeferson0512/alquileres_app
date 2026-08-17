START TRANSACTION;

CREATE TABLE IF NOT EXISTS conceptos_cobro (
    id_concepto SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    codigo VARCHAR(40) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    prioridad_aplicacion SMALLINT UNSIGNED NOT NULL,
    permite_pago_directo TINYINT(1) NOT NULL DEFAULT 1,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id_concepto),
    UNIQUE KEY uq_concepto_cobro_codigo (codigo),
    KEY idx_concepto_cobro_prioridad (prioridad_aplicacion),
    CONSTRAINT chk_concepto_prioridad CHECK (prioridad_aplicacion > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO conceptos_cobro (codigo, nombre, prioridad_aplicacion, permite_pago_directo, activo)
VALUES
    ('ALQUILER', 'Alquiler', 10, 1, 1),
    ('LUZ', 'Luz', 20, 1, 1),
    ('AJUSTE_MINIMO_LUZ', 'Ajuste minimo luz', 30, 1, 1),
    ('AGUA', 'Agua', 40, 1, 1),
    ('GAS', 'Gas', 50, 1, 1),
    ('OTROS', 'Otros conceptos', 60, 1, 1),
    ('MORA', 'Mora', 70, 1, 1),
    ('DESCUENTO', 'Descuento', 999, 0, 1)
ON DUPLICATE KEY UPDATE
    nombre = VALUES(nombre),
    prioridad_aplicacion = VALUES(prioridad_aplicacion),
    permite_pago_directo = VALUES(permite_pago_directo),
    activo = VALUES(activo);

CREATE TABLE IF NOT EXISTS cobros_mensuales_detalle (
    id_cobro_detalle BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_cobro INT(10) UNSIGNED NOT NULL,
    id_concepto SMALLINT UNSIGNED NOT NULL,
    monto_programado DECIMAL(12,2) NOT NULL,
    descripcion VARCHAR(255) NULL,
    orden_visual SMALLINT UNSIGNED NOT NULL DEFAULT 100,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id_cobro_detalle),
    KEY idx_cobro_detalle_cobro (id_cobro),
    KEY idx_cobro_detalle_concepto (id_concepto),
    KEY idx_cobro_detalle_cobro_concepto (id_cobro, id_concepto, orden_visual),
    CONSTRAINT fk_cobro_detalle_cobro FOREIGN KEY (id_cobro) REFERENCES cobros_mensuales (id_cobro),
    CONSTRAINT fk_cobro_detalle_concepto FOREIGN KEY (id_concepto) REFERENCES conceptos_cobro (id_concepto),
    CONSTRAINT chk_cobro_detalle_monto_no_cero CHECK (monto_programado <> 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE pagos
    ADD COLUMN estado ENUM('REGISTRADO', 'REVERSADO', 'ANULADO') NOT NULL DEFAULT 'REGISTRADO' AFTER observacion,
    ADD COLUMN origen_registro ENUM('MANUAL', 'MIGRACION', 'AJUSTE') NOT NULL DEFAULT 'MANUAL' AFTER estado,
    ADD COLUMN registrado_por VARCHAR(100) NULL AFTER origen_registro,
    ADD COLUMN reversado_por VARCHAR(100) NULL AFTER registrado_por,
    ADD COLUMN fecha_reversa DATETIME NULL AFTER reversado_por,
    ADD COLUMN motivo_reversa VARCHAR(255) NULL AFTER fecha_reversa,
    ADD KEY idx_pagos_estado (estado),
    ADD KEY idx_pagos_origen (origen_registro);

CREATE TABLE IF NOT EXISTS pagos_detalle (
    id_pago_detalle BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_pago INT(10) UNSIGNED NOT NULL,
    id_cobro_detalle BIGINT UNSIGNED NOT NULL,
    monto_aplicado DECIMAL(12,2) NOT NULL,
    origen_aplicacion ENUM('MANUAL', 'AUTOMATICA', 'MIGRACION', 'REVERSA') NOT NULL DEFAULT 'MANUAL',
    observacion VARCHAR(255) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id_pago_detalle),
    UNIQUE KEY uq_pago_detalle_pago_linea (id_pago, id_cobro_detalle),
    KEY idx_pago_detalle_linea (id_cobro_detalle),
    KEY idx_pago_detalle_origen (origen_aplicacion),
    CONSTRAINT fk_pago_detalle_pago FOREIGN KEY (id_pago) REFERENCES pagos (id_pago),
    CONSTRAINT fk_pago_detalle_cobro_detalle FOREIGN KEY (id_cobro_detalle) REFERENCES cobros_mensuales_detalle (id_cobro_detalle),
    CONSTRAINT chk_pago_detalle_monto_positivo CHECK (monto_aplicado > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pagos_auditoria (
    id_pago_auditoria BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_pago INT(10) UNSIGNED NOT NULL,
    accion ENUM('CREADO', 'ACTUALIZADO', 'APLICADO', 'REVERSADO', 'ANULADO') NOT NULL,
    actor VARCHAR(100) NULL,
    payload_before JSON NULL,
    payload_after JSON NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_pago_auditoria),
    KEY idx_pago_auditoria_pago (id_pago),
    KEY idx_pago_auditoria_accion_fecha (accion, created_at),
    CONSTRAINT fk_pago_auditoria_pago FOREIGN KEY (id_pago) REFERENCES pagos (id_pago)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

COMMIT;
