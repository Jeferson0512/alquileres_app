START TRANSACTION;

-- Numero de WhatsApp de contacto para el boton flotante del portal del
-- inquilino -- distinto de yape_numero (ese es para pagar, este es para
-- escribir una consulta). Formato libre con codigo de pais incluido
-- (ej. "51987654321"), tal cual lo pide un link wa.me.
ALTER TABLE config_cobranza
    ADD COLUMN whatsapp_contacto VARCHAR(20) NULL AFTER yape_qr;

COMMIT;
