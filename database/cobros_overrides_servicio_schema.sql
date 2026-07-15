START TRANSACTION;

CREATE TABLE IF NOT EXISTS cobros_overrides_servicio (
    id_override BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_periodo INT(10) UNSIGNED NOT NULL,
    id_unidad INT(10) UNSIGNED NOT NULL,
    id_persona INT(10) UNSIGNED NOT NULL,
    servicio ENUM('AGUA','GAS','MANTENIMIENTO') NOT NULL,
    monto DECIMAL(12,2) NOT NULL,
    observacion VARCHAR(255) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id_override),
    UNIQUE KEY uq_override_periodo_unidad_persona_servicio (id_periodo, id_unidad, id_persona, servicio),
    KEY idx_override_periodo (id_periodo),
    CONSTRAINT fk_override_periodo FOREIGN KEY (id_periodo) REFERENCES periodos (id_periodo),
    CONSTRAINT fk_override_unidad FOREIGN KEY (id_unidad) REFERENCES unidades (id_unidad),
    CONSTRAINT fk_override_persona FOREIGN KEY (id_persona) REFERENCES personas (id_persona)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

COMMIT;
