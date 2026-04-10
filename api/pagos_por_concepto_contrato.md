# Contrato API para pagos por concepto

## Enfoque recomendado

Orden de implementacion sugerido:

1. crear primero endpoints de lectura para validar saldo por concepto;
2. crear luego endpoint de registro de pago con detalle manual y automatico;
3. crear por ultimo endpoint de reversa y endpoint de auditoria.

Motivo:

- primero validas que las consultas de saldo y deuda anterior coincidan con negocio;
- luego insertas pagos sobre una estructura ya verificable;
- finalmente agregas operaciones sensibles de reversa y auditoria.

## 1. Consultar saldo de un cobro por concepto

### GET /api/?path=cobros/detalle&id_cobro={id}

Respuesta sugerida:

```json
{
  "ok": true,
  "data": {
    "id_cobro": 181,
    "id_periodo": 3,
    "periodo": {
      "anio": 2026,
      "mes": 3
    },
    "id_persona": 5,
    "id_unidad": 7,
    "total_cobrar": 1270.00,
    "total_pagado": 900.00,
    "saldo_pendiente": 370.00,
    "estado_pago": "PARCIAL",
    "conceptos": [
      {
        "id_cobro_detalle": 9001,
        "codigo": "ALQUILER",
        "nombre": "Alquiler",
        "monto_programado": 1000.00,
        "monto_pagado": 900.00,
        "saldo_pendiente": 100.00,
        "permite_pago_directo": true
      },
      {
        "id_cobro_detalle": 9002,
        "codigo": "AGUA",
        "nombre": "Agua",
        "monto_programado": 20.00,
        "monto_pagado": 0.00,
        "saldo_pendiente": 20.00,
        "permite_pago_directo": true
      }
    ]
  }
}
```

## 2. Consultar deuda anterior consolidada

### GET /api/?path=cobros/deuda-anterior&id_persona={id}&id_unidad={id}&id_periodo={id}

Respuesta sugerida:

```json
{
  "ok": true,
  "data": {
    "id_persona": 5,
    "id_unidad": 7,
    "id_periodo_actual": 3,
    "deuda_anterior_total": 540.00,
    "periodos": [
      {
        "id_periodo": 1,
        "anio": 2026,
        "mes": 1,
        "saldo_pendiente": 220.00
      },
      {
        "id_periodo": 2,
        "anio": 2026,
        "mes": 2,
        "saldo_pendiente": 320.00
      }
    ]
  }
}
```

## 3. Registrar pago con aplicacion automatica

### POST /api/?path=pagos

Request sugerido:

```json
{
  "id_cobro": 181,
  "fecha_pago": "2026-03-23",
  "monto_pagado": 500.00,
  "metodo_pago": "YAPE",
  "numero_operacion": "YAPE-00991",
  "observacion": "Pago sin seleccionar conceptos",
  "registrado_por": "admin_local",
  "modo_aplicacion": "AUTOMATICA"
}
```

Reglas:

- `modo_aplicacion = AUTOMATICA` obliga al backend a repartir por prioridad;
- el detalle insertado debe quedar en `pagos_detalle` con `origen_aplicacion = 'AUTOMATICA'`.

Respuesta sugerida:

```json
{
  "ok": true,
  "message": "Pago registrado correctamente",
  "data": {
    "id_pago": 44,
    "id_cobro": 181,
    "estado_pago_cobro": "PARCIAL",
    "aplicaciones": [
      {
        "id_cobro_detalle": 9001,
        "codigo": "ALQUILER",
        "monto_aplicado": 500.00
      }
    ]
  }
}
```

## 4. Registrar pago por concepto manual

### POST /api/?path=pagos

Request sugerido:

```json
{
  "id_cobro": 181,
  "fecha_pago": "2026-03-23",
  "monto_pagado": 170.00,
  "metodo_pago": "TRANSFERENCIA",
  "numero_operacion": "TX-82919",
  "observacion": "Pago de agua y gas",
  "registrado_por": "admin_local",
  "modo_aplicacion": "MANUAL",
  "aplicaciones": [
    {
      "id_cobro_detalle": 9002,
      "monto_aplicado": 20.00
    },
    {
      "id_cobro_detalle": 9003,
      "monto_aplicado": 150.00
    }
  ]
}
```

Reglas:

- la suma de `aplicaciones[].monto_aplicado` debe ser igual a `monto_pagado`;
- cada `id_cobro_detalle` debe pertenecer al mismo `id_cobro`;
- no se puede aplicar a conceptos sin saldo ni a `DESCUENTO`.

## 5. Obtener historial de pagos con detalle aplicado

### GET /api/?path=pagos&id_cobro={id}

Respuesta sugerida:

```json
{
  "ok": true,
  "data": [
    {
      "id_pago": 44,
      "id_cobro": 181,
      "fecha_pago": "2026-03-23",
      "monto_pagado": 170.00,
      "metodo_pago": "TRANSFERENCIA",
      "numero_operacion": "TX-82919",
      "estado": "REGISTRADO",
      "registrado_por": "admin_local",
      "aplicaciones": [
        {
          "id_cobro_detalle": 9002,
          "codigo": "AGUA",
          "monto_aplicado": 20.00
        },
        {
          "id_cobro_detalle": 9003,
          "codigo": "GAS",
          "monto_aplicado": 150.00
        }
      ]
    }
  ]
}
```

## 6. Reversar pago

### POST /api/?path=pagos/reversa&id={id_pago}

Request sugerido:

```json
{
  "motivo_reversa": "Operacion duplicada",
  "reversado_por": "admin_local",
  "fecha_reversa": "2026-03-23 18:40:00"
}
```

Respuesta sugerida:

```json
{
  "ok": true,
  "message": "Pago reversado correctamente",
  "data": {
    "id_pago": 44,
    "estado": "REVERSADO"
  }
}
```

Efecto esperado:

- no se borra `pagos_detalle`;
- el saldo vuelve a abrirse;
- se registra evento en `pagos_auditoria`.

## 7. Consultar auditoria de un pago

### GET /api/?path=pagos/auditoria&id={id_pago}

Respuesta sugerida:

```json
{
  "ok": true,
  "data": [
    {
      "accion": "CREADO",
      "actor": "admin_local",
      "created_at": "2026-03-23 18:10:00"
    },
    {
      "accion": "REVERSADO",
      "actor": "admin_local",
      "created_at": "2026-03-23 18:40:00"
    }
  ]
}
```

## Flujo transaccional recomendado en backend

### Registrar pago

1. validar `id_cobro` activo y no anulado;
2. obtener detalle con saldos pendientes;
3. construir aplicaciones manuales o automaticas;
4. validar suma exacta de aplicaciones;
5. insertar `pagos`;
6. insertar `pagos_detalle`;
7. recalcular `cobros_mensuales.estado_pago`;
8. insertar auditoria `CREADO` y `APLICADO`;
9. confirmar transaccion.

### Reversar pago

1. validar que el pago exista y no este reversado;
2. actualizar estado y metadatos de reversa;
3. recalcular estado del cobro;
4. insertar auditoria `REVERSADO`;
5. confirmar transaccion.
