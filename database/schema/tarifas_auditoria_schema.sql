START TRANSACTION;

CREATE TABLE IF NOT EXISTS tarifas_auditoria (
    id_tarifa_auditoria BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_tarifa INT(11) NOT NULL,
    accion VARCHAR(40) NOT NULL,
    actor VARCHAR(100) NULL,
    payload_before JSON NULL,
    payload_after JSON NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_tarifa_auditoria),
    KEY idx_tarifa_auditoria_tarifa (id_tarifa),
    CONSTRAINT fk_tarifa_auditoria_tarifa FOREIGN KEY (id_tarifa) REFERENCES tarifas_servicios (id_tarifa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

COMMIT;
