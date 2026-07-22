START TRANSACTION;

CREATE TABLE IF NOT EXISTS modules (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    code VARCHAR(60) NOT NULL,
    name VARCHAR(100) NOT NULL,
    parent_module_id BIGINT UNSIGNED NULL,
    sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_module_code (code),
    KEY idx_module_parent (parent_module_id),
    CONSTRAINT fk_module_parent FOREIGN KEY (parent_module_id) REFERENCES modules (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO modules (code, name, parent_module_id, sort_order) VALUES
    ('dashboard', 'Dashboard', NULL, 10),
    ('periodos', 'Periodos', NULL, 20),
    ('inquilinos', 'Inquilinos', NULL, 30),
    ('unidades', 'Unidades', NULL, 40),
    ('ocupaciones', 'Ocupaciones', NULL, 50),
    ('recibo', 'Recibo de luz', NULL, 60),
    ('lecturas', 'Lecturas', NULL, 70),
    ('liquidacion', 'Liquidación', NULL, 80),
    ('cobros', 'Cobros', NULL, 90),
    ('avisos', 'Avisos', NULL, 110),
    ('tarifas', 'Tarifas', NULL, 120),
    ('config_cobranza', 'Config. cobranza', NULL, 130),
    ('usuarios', 'Usuarios', NULL, 140)
ON DUPLICATE KEY UPDATE name = VALUES(name), sort_order = VALUES(sort_order);

INSERT INTO modules (code, name, parent_module_id, sort_order)
SELECT 'cobros.pagos', 'Pagos', m.id, 100
FROM modules m
WHERE m.code = 'cobros'
ON DUPLICATE KEY UPDATE name = VALUES(name), parent_module_id = VALUES(parent_module_id);

COMMIT;
