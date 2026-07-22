# Documento de requerimientos — Migración a Laravel + React + TailAdmin

> Fuente de verdad del proyecto de migración. Antes de agregar algo que no esté acá ("¿esto hace falta ahora?"), se revisa este documento primero. Si la respuesta no está, se discute y se agrega acá — no se decide de nuevo cada vez.

## 1. Estado actual

**Stack:** PHP plano sin framework (~5.000 líneas en `api/modules/*`) + JavaScript vanilla sin build (~5.000 líneas en `public/assets/js/`) sobre MySQL/MariaDB, corriendo en XAMPP.

**13 módulos existentes:**

| Módulo | Qué hace | Complejidad | Tests E2E |
|---|---|---|---|
| Dashboard | KPIs del periodo activo | Baja (agregador) | No |
| Periodos | Ciclos de facturación mensuales | Baja | No |
| Inquilinos | Datos de personas que alquilan | Baja | No |
| Unidades | Cuartos/departamentos del inmueble | Baja | No |
| Ocupaciones | Vincula persona↔unidad en un rango de fechas | Media | No |
| Recibo de luz | Datos del recibo real de la eléctrica | Media | No |
| Lecturas | Lectura de medidor por unidad | Media | No |
| Liquidación | Reparte el recibo de luz por consumo + IGV | **Alta** | **No** |
| Cobros | Genera el cobro mensual (alquiler+luz+agua+gas+...) | **Alta** | Sí (parcial) |
| Pagos | Registro/reversa/anulación de pagos | **Alta** (el módulo más grande, ~1.095 líneas) | Sí (parcial) |
| Avisos | Comparte el cobro y alerta vencimientos de contrato | Baja | Sí |
| Tarifas | Montos de agua/gas/mantenimiento/kWh | Baja | No |
| Config. cobranza | Datos bancarios/QR para cobrar | Baja | No |

**Dos brechas confirmadas (no son opinión, están verificadas en código):**
1. **Cero autenticación** en toda la API — cualquier endpoint es público si el servidor es alcanzable.
2. **Cero control de roles/permisos** — no existe ningún concepto de "quién puede hacer qué".

**Hallazgo relevante:** el esquema de base de datos ya anticipaba crecimiento que la app nunca terminó de aprovechar — `personas.tipo_persona` ya incluye `ADMIN`/`SUPERVISOR`/`PROPIETARIO`/`INQUILINO`, y existe una tabla `inmuebles` completa para soportar más de una propiedad. Ninguna de las dos cosas está realmente conectada al comportamiento de la app hoy.

## 2. Usuarios del sistema (roles)

| Rol | Quién es hoy | Alcance |
|---|---|---|
| **Admin** | El propietario/administrador (vos) | Acceso total a los 13 módulos |
| **Supervisor** | Alguien que ayuda a operar (lecturas, pagos) | Sin acceso a tarifas, usuarios, ni anulación de pagos |
| **Propietario** | Dueño de un inmueble, si en el futuro hay varios con dueños distintos | Ve solo lo de su(s) inmueble(s) — **no implementado en esta fase**, solo reservado el rol |
| **Inquilino** | Hoy es solo un dato (`personas`), no un usuario del sistema | **Candidato a usuario futuro**: login propio para ver su estado de cuenta desde el celular (conecta con la idea de app móvil en React Native evaluada en la auditoría). **Fuera de alcance de esta migración.** |

## 3. Casos de uso principales

**Admin:**
- Ciclo completo mensual: abrir periodo → registrar lecturas → cargar recibo de luz → generar liquidación → generar cobros → registrar/anular pagos → enviar avisos.
- Configurar tarifas, datos de cobranza, y gestionar usuarios/roles.

**Supervisor:**
- Registrar lecturas de medidor.
- Registrar pagos (no anularlos).
- Ver el resto de los módulos en modo lectura.

**Propietario / Inquilino:** sin caso de uso implementado todavía — documentados para que el diseño de roles/tablas no tenga que rehacerse cuando se implementen.

## 4. Requerimientos funcionales

Uno por módulo — se documenta lo que el sistema **ya hace hoy** (no se inventa nada nuevo en esta migración, solo se reimplementa con Laravel/Eloquent) más los dos gaps a cerrar:

- **RF-01 a RF-13:** cada uno de los 13 módulos de la tabla del punto 1 debe seguir soportando exactamente el mismo flujo que hoy (alta/baja/edición donde aplique, los cálculos de liquidación/cobros sin cambios de fórmula).
- **RF-14 (nuevo):** el sistema debe requerir login para acceder a cualquier módulo.
- **RF-15 (nuevo):** cada acción de cada módulo debe poder habilitarse/deshabilitarse por rol, a nivel de módulo y de submódulo/acción específica (ver catálogo en el punto 6).
- **RF-16 (nuevo):** un cobro ya generado no debe cambiar de monto si se corrige el precio de alquiler de la ocupación después — a menos que se regenere explícitamente (esto es lo que falló y se corrigió manualmente en la sesión que originó este proyecto).
- **RF-17 (nuevo, reservado):** el sistema debe poder registrar el resultado de una transacción de una pasarela de pago externa contra un pago existente, sin que el proveedor esté decidido todavía (ver punto 8).

## 5. Requerimientos no funcionales

- **RNF-01:** presupuesto de hosting $0 mientras el volumen sea el actual (9 unidades, 1 inmueble).
- **RNF-02:** un solo servidor/base de datos — sin necesidad de alta concurrencia ni múltiples réplicas.
- **RNF-03:** la integridad de los datos de facturación (montos, estados de pago) debe garantizarse a nivel de base de datos (constraints/triggers), no solo confiando en que el código de la aplicación la respete — el esquema actual ya cumple esto en gran parte (ver `docs/auditoria-tecnologica.html`, sección de diagnóstico de BD).
- **RNF-04:** la migración es incremental (patrón *strangler fig*) — la app en PHP plano sigue funcionando y cobrándole a los inquilinos sin interrupción durante toda la migración.

## 6. Catálogo de módulos, submódulos y permisos

Puebla la tabla `modules` y el seeder de roles de Spatie. Convención: `{módulo}.{acción}` o `{módulo}.{submódulo}.{acción}`.

```
dashboard.ver

periodos.ver | periodos.crear | periodos.cerrar

inquilinos.ver | inquilinos.crear | inquilinos.editar | inquilinos.eliminar

unidades.ver | unidades.crear | unidades.editar

ocupaciones.ver | ocupaciones.crear | ocupaciones.finalizar

lecturas.ver | lecturas.registrar | lecturas.sincronizar

recibo.ver | recibo.crear | recibo.editar

liquidacion.ver | liquidacion.generar | liquidacion.recalcular

cobros.ver | cobros.generar | cobros.forzar_actualizacion
cobros.pagos.registrar | cobros.pagos.reversar | cobros.pagos.anular

avisos.ver | avisos.enviar

tarifas.ver | tarifas.editar

config_cobranza.ver | config_cobranza.editar

usuarios.ver | usuarios.crear | usuarios.asignar_rol
```

**Asignación inicial:**
- **Admin:** todos los permisos de la lista.
- **Supervisor:** todos los `.ver`, más `lecturas.registrar`, `lecturas.sincronizar`, `cobros.pagos.registrar`. Explícitamente SIN `tarifas.editar`, `config_cobranza.editar`, `usuarios.*`, ni `cobros.pagos.anular`.

## 7. Sistema de diseño

**Paleta (azul confianza/financiero) — única fuente de verdad de color:**

| Token | Valor | Uso |
|---|---|---|
| `primary` | `#2563EB` | Acento principal (botones, links activos, sidebar activo) |
| `primary-dark` | `#1D4ED8` | Hover/estados activos |
| `primary-light` | `#DBEAFE` | Fondos suaves de elementos activos |
| `surface` | `#F8FAFC` (claro) / `#0F172A` (oscuro) | Fondo general |
| `success` | `#16A34A` | Pagos completos, estados OK |
| `warning` | `#D97706` | Vencimientos próximos, estados parciales |
| `danger` | `#DC2626` | Anulaciones, errores, deuda vencida |

**Layout:** Sidebar (izquierda, colapsable, agrupado por módulo desde la tabla `modules`, cada ítem visible solo si el usuario tiene el permiso `.ver` correspondiente) + Navbar/Topbar (breadcrumb, usuario/rol, logout — sin buscador global ni notificaciones, no hay requerimiento real para eso todavía) + contenido con cards de KPI y tablas.

**Base de componentes:** TailAdmin free (React + Tailwind, MIT) — se reutiliza la capa visual (Sidebar, Topbar, Card, Table, Badge, Modal), no su routing ni sus páginas de ejemplo.

## 8. Fuera de alcance de esta migración (backlog documentado)

- Login de inquilinos / app móvil para ellos.
- Multi-inmueble con dueños (`PROPIETARIO`) distintos operando en paralelo.
- Integración real de pasarela de pago — hoy solo se reserva la tabla `payment_gateway_transactions` con un campo `provider` genérico; elegir entre Mercado Pago, Culqi o Niubiz e integrar su SDK queda para después.
- Buscador global y centro de notificaciones en el layout.
