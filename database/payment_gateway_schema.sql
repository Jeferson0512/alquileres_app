START TRANSACTION;

CREATE TABLE IF NOT EXISTS payment_gateway_transactions (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_pago INT(10) UNSIGNED NOT NULL,
    provider VARCHAR(40) NOT NULL,
    external_transaction_id VARCHAR(120) NULL,
    status ENUM('PENDING', 'CONFIRMED', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    raw_payload JSON NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_gateway_tx_pago (id_pago),
    KEY idx_gateway_tx_status (status),
    CONSTRAINT fk_gateway_tx_pago FOREIGN KEY (id_pago) REFERENCES pagos (id_pago)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

COMMIT;
