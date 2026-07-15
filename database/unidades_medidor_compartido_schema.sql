START TRANSACTION;

CREATE TABLE IF NOT EXISTS unidades_medidor_compartido (
    id_relacion BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_unidad_titular INT(10) UNSIGNED NOT NULL,
    id_unidad_dependiente INT(10) UNSIGNED NOT NULL,
    porcentaje_dependiente DECIMAL(5,2) NOT NULL DEFAULT 0,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    observacion VARCHAR(255) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id_relacion),
    UNIQUE KEY uq_medidor_dependiente (id_unidad_dependiente),
    KEY idx_medidor_titular (id_unidad_titular),
    CONSTRAINT fk_medidor_titular FOREIGN KEY (id_unidad_titular) REFERENCES unidades (id_unidad),
    CONSTRAINT fk_medidor_dependiente FOREIGN KEY (id_unidad_dependiente) REFERENCES unidades (id_unidad)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

COMMIT;
