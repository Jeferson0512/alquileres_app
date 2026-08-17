-- 1. Saldo por concepto de un cobro concreto.
SELECT
    c.id_cobro,
    pe.anio,
    pe.mes,
    cc.codigo AS concepto,
    cc.nombre,
    cd.monto_programado,
    IFNULL(SUM(CASE WHEN p.estado = 'REGISTRADO' THEN pd.monto_aplicado ELSE 0 END), 0) AS monto_pagado,
    GREATEST(cd.monto_programado - IFNULL(SUM(CASE WHEN p.estado = 'REGISTRADO' THEN pd.monto_aplicado ELSE 0 END), 0), 0) AS saldo_pendiente
FROM cobros_mensuales c
INNER JOIN periodos pe ON pe.id_periodo = c.id_periodo
INNER JOIN cobros_mensuales_detalle cd ON cd.id_cobro = c.id_cobro
INNER JOIN conceptos_cobro cc ON cc.id_concepto = cd.id_concepto
LEFT JOIN pagos_detalle pd ON pd.id_cobro_detalle = cd.id_cobro_detalle
LEFT JOIN pagos p ON p.id_pago = pd.id_pago
WHERE c.id_cobro = :id_cobro
GROUP BY c.id_cobro, pe.anio, pe.mes, cc.codigo, cc.nombre, cd.monto_programado
ORDER BY cc.prioridad_aplicacion, cd.orden_visual, cd.id_cobro_detalle;

-- 2. Deuda anterior por unidad y persona, sin duplicar en el periodo actual.
SELECT
    c.id_persona,
    c.id_unidad,
    actual.id_periodo AS id_periodo_actual,
    SUM(GREATEST(cd.monto_programado - IFNULL(x.pagado, 0), 0)) AS deuda_anterior
FROM cobros_mensuales actual
INNER JOIN cobros_mensuales c ON c.id_persona = actual.id_persona
    AND c.id_unidad = actual.id_unidad
INNER JOIN periodos p_prev ON p_prev.id_periodo = c.id_periodo
INNER JOIN periodos p_act ON p_act.id_periodo = actual.id_periodo
INNER JOIN cobros_mensuales_detalle cd ON cd.id_cobro = c.id_cobro
LEFT JOIN (
    SELECT
        pd.id_cobro_detalle,
        SUM(CASE WHEN p.estado = 'REGISTRADO' THEN pd.monto_aplicado ELSE 0 END) AS pagado
    FROM pagos_detalle pd
    INNER JOIN pagos p ON p.id_pago = pd.id_pago
    GROUP BY pd.id_cobro_detalle
) x ON x.id_cobro_detalle = cd.id_cobro_detalle
WHERE actual.id_cobro = :id_cobro_actual
  AND p_prev.fecha_inicio < p_act.fecha_inicio
  AND c.estado_pago <> 'ANULADO'
GROUP BY c.id_persona, c.id_unidad, actual.id_periodo;

-- 3. Historial de pagos con el detalle exacto por concepto.
SELECT
    p.id_pago,
    p.fecha_pago,
    p.monto_pagado,
    p.metodo_pago,
    p.numero_operacion,
    p.estado,
    p.registrado_por,
    p.reversado_por,
    p.fecha_reversa,
    p.motivo_reversa,
    c.id_cobro,
    pe.anio,
    pe.mes,
    cc.codigo AS concepto,
    cc.nombre AS concepto_nombre,
    pd.monto_aplicado,
    pd.origen_aplicacion
FROM pagos p
INNER JOIN cobros_mensuales c ON c.id_cobro = p.id_cobro
INNER JOIN periodos pe ON pe.id_periodo = c.id_periodo
LEFT JOIN pagos_detalle pd ON pd.id_pago = p.id_pago
LEFT JOIN cobros_mensuales_detalle cd ON cd.id_cobro_detalle = pd.id_cobro_detalle
LEFT JOIN conceptos_cobro cc ON cc.id_concepto = cd.id_concepto
WHERE c.id_persona = :id_persona
  AND c.id_unidad = :id_unidad
ORDER BY p.fecha_pago DESC, p.id_pago DESC, cc.prioridad_aplicacion;

-- 4. Resumen por periodo y concepto.
SELECT
    pe.id_periodo,
    pe.anio,
    pe.mes,
    cc.codigo AS concepto,
    SUM(cd.monto_programado) AS total_facturado,
    IFNULL(SUM(IFNULL(x.pagado_linea, 0)), 0) AS total_cobrado,
    SUM(GREATEST(cd.monto_programado - IFNULL(x.pagado_linea, 0), 0)) AS total_pendiente
FROM cobros_mensuales c
INNER JOIN periodos pe ON pe.id_periodo = c.id_periodo
INNER JOIN cobros_mensuales_detalle cd ON cd.id_cobro = c.id_cobro
INNER JOIN conceptos_cobro cc ON cc.id_concepto = cd.id_concepto
LEFT JOIN (
    SELECT
        pd2.id_cobro_detalle,
        SUM(CASE WHEN p2.estado = 'REGISTRADO' THEN pd2.monto_aplicado ELSE 0 END) AS pagado_linea
    FROM pagos_detalle pd2
    INNER JOIN pagos p2 ON p2.id_pago = pd2.id_pago
    GROUP BY pd2.id_cobro_detalle
) x ON x.id_cobro_detalle = cd.id_cobro_detalle
WHERE pe.id_periodo = :id_periodo
GROUP BY pe.id_periodo, pe.anio, pe.mes, cc.codigo
ORDER BY cc.prioridad_aplicacion;

-- 5. Auditoria completa de un pago y su reversa.
SELECT
    pa.id_pago_auditoria,
    pa.id_pago,
    pa.accion,
    pa.actor,
    pa.payload_before,
    pa.payload_after,
    pa.created_at
FROM pagos_auditoria pa
WHERE pa.id_pago = :id_pago
ORDER BY pa.created_at ASC, pa.id_pago_auditoria ASC;

-- 6. Validacion: la suma de detalle del cobro debe coincidir con la cabecera.
SELECT
    c.id_cobro,
    c.total_cobrar AS total_cabecera,
    SUM(cd.monto_programado) AS total_detalle,
    SUM(cd.monto_programado) - c.total_cobrar AS diferencia
FROM cobros_mensuales c
INNER JOIN cobros_mensuales_detalle cd ON cd.id_cobro = c.id_cobro
GROUP BY c.id_cobro, c.total_cobrar
HAVING ROUND(diferencia, 2) <> 0;

-- 7. Validacion: la suma aplicada debe coincidir con el monto del pago activo.
SELECT
    p.id_pago,
    p.monto_pagado,
    IFNULL(SUM(pd.monto_aplicado), 0) AS total_aplicado,
    IFNULL(SUM(pd.monto_aplicado), 0) - p.monto_pagado AS diferencia
FROM pagos p
LEFT JOIN pagos_detalle pd ON pd.id_pago = p.id_pago
WHERE p.estado = 'REGISTRADO'
GROUP BY p.id_pago, p.monto_pagado
HAVING ROUND(diferencia, 2) <> 0;