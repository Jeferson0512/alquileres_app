<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    /**
     * Permisos por modulo/submodulo, tal como se documento en
     * docs/requerimientos-proyecto.md (seccion 6).
     */
    private const PERMISSIONS = [
        'dashboard.ver',

        'periodos.ver', 'periodos.crear', 'periodos.cerrar',

        'inquilinos.ver', 'inquilinos.crear', 'inquilinos.editar', 'inquilinos.eliminar',

        'unidades.ver', 'unidades.crear', 'unidades.editar',

        'ocupaciones.ver', 'ocupaciones.crear', 'ocupaciones.finalizar',

        'lecturas.ver', 'lecturas.registrar', 'lecturas.sincronizar',

        'recibo.ver', 'recibo.crear', 'recibo.editar',

        'liquidacion.ver', 'liquidacion.generar', 'liquidacion.recalcular',

        'cobros.ver', 'cobros.generar', 'cobros.forzar_actualizacion',
        'cobros.pagos.ver', 'cobros.pagos.registrar', 'cobros.pagos.reversar', 'cobros.pagos.anular',
        'cobros.comprobantes.ver', 'cobros.comprobantes.revisar',

        'avisos.ver', 'avisos.enviar',

        'configuracion.ver',

        'tarifas.ver', 'tarifas.editar',

        'config_cobranza.ver', 'config_cobranza.editar',

        'usuarios.ver', 'usuarios.crear', 'usuarios.asignar_rol',
        'usuarios.roles.ver', 'usuarios.perfil_campos.ver',

        'consultas.ver', 'consultas.gestionar',
    ];

    /**
     * Permisos del rol Supervisor: todos los .ver, mas lecturas y registrar
     * pagos. Ojo: Supervisor SI ve tarifas/config_cobranza/usuarios (los
     * ".ver" son de solo lectura), pero NO puede editarlos ni asignar
     * roles -- por eso "Roles y permisos" y "Campos del perfil" quedan
     * excluidos del sidebar (su unica razon de ser es mutar algo que
     * Supervisor no tiene permiso de tocar).
     */
    private const SUPERVISOR_EXTRA = [
        'lecturas.registrar',
        'lecturas.sincronizar',
        'cobros.pagos.registrar',
        'cobros.comprobantes.revisar',
    ];

    /**
     * ".ver" que igual se excluyen del auto-otorgado a Supervisor -- ver
     * docstring de SUPERVISOR_EXTRA.
     */
    private const SUPERVISOR_VER_EXCLUIDOS = [
        'usuarios.roles.ver',
        'usuarios.perfil_campos.ver',
    ];

    public function run(): void
    {
        foreach (self::PERMISSIONS as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        $admin = Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'web']);
        $admin->syncPermissions(self::PERMISSIONS);

        $verPermissions = array_values(array_filter(
            self::PERMISSIONS,
            fn (string $permission) => str_ends_with($permission, '.ver') && !in_array($permission, self::SUPERVISOR_VER_EXCLUIDOS, true)
        ));

        $supervisor = Role::firstOrCreate(['name' => 'Supervisor', 'guard_name' => 'web']);
        $supervisor->syncPermissions([...$verPermissions, ...self::SUPERVISOR_EXTRA]);
    }
}
