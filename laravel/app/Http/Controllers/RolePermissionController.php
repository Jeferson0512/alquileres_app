<?php

namespace App\Http\Controllers;

use App\Models\Module;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

/**
 * Matriz de permisos por rol -- la parte de "que puede ver cada rol, tanto
 * a nivel de modulo como de submodulo" que faltaba en el modulo Usuarios.
 * El rol Admin queda fijo con todos los permisos (asi se documento en
 * docs/requerimientos-proyecto.md: "Admin: todos los permisos de la
 * lista"), solo Supervisor (y cualquier rol futuro) es editable aqui --
 * evita que el unico usuario Admin existente se bloquee su propio acceso.
 */
class RolePermissionController extends Controller
{
    public function index(): Response
    {
        $modules = Module::orderBy('sort_order')->get(['id', 'code', 'name', 'parent_module_id']);
        $moduleByCode = $modules->keyBy('code');
        $moduleById = $modules->keyBy('id');

        $grupos = [];
        foreach ($modules as $module) {
            $grupos[$module->code] = [
                'code' => $module->code,
                'name' => $module->name,
                'es_submodulo' => $module->parent_module_id !== null,
                'permisos' => [],
            ];
        }

        foreach (Permission::orderBy('name')->pluck('name') as $permName) {
            $segmentos = explode('.', $permName);
            $moduleCode = null;
            for ($len = count($segmentos) - 1; $len >= 1; $len--) {
                $candidato = implode('.', array_slice($segmentos, 0, $len));
                if ($moduleByCode->has($candidato)) {
                    $moduleCode = $candidato;
                    break;
                }
            }
            $moduleCode ??= $segmentos[0];

            if (!isset($grupos[$moduleCode])) {
                continue;
            }

            $grupos[$moduleCode]['permisos'][] = ['name' => $permName, 'accion' => end($segmentos)];
        }

        $roles = Role::orderBy('name')->with('permissions:id,name')->get();

        return Inertia::render('Usuarios/Roles', [
            'grupos' => array_values(array_filter($grupos, fn ($g) => $g['permisos'] !== [])),
            'roles' => $roles->pluck('name'),
            'rolePermissions' => $roles->mapWithKeys(fn ($role) => [$role->name => $role->permissions->pluck('name')->all()]),
        ]);
    }

    public function toggle(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'role' => ['required', 'string', 'exists:roles,name'],
            'permission' => ['required', 'string', 'exists:permissions,name'],
            'enabled' => ['required', 'boolean'],
        ]);

        if ($data['role'] === 'Admin') {
            throw ValidationException::withMessages(['role' => 'El rol Admin siempre tiene todos los permisos; no se puede editar.']);
        }

        $role = Role::findByName($data['role']);
        $data['enabled'] ? $role->givePermissionTo($data['permission']) : $role->revokePermissionTo($data['permission']);

        return back()->with('success', 'Permiso actualizado correctamente');
    }
}
