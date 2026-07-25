<?php

namespace App\Http\Middleware;

use App\Models\Module;
use App\Services\NotificacionFeedService;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        // getAllPermissions() carga (y cachea) las relaciones roles/roles.permissions
        // sobre $user -- si mandaramos el modelo $user tal cual al frontend, Eloquent
        // serializaria esas relaciones cargadas junto con el resto (ids, timestamps,
        // pivot de la tabla intermedia, etc.), exponiendo mas de lo necesario en el
        // HTML. Por eso solo se comparten los campos puntuales que la UI usa.
        $permissions = $user ? $user->getAllPermissions()->pluck('name') : collect();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'email_verified_at' => $user->email_verified_at,
                    'estado' => $user->estado,
                    'id_persona' => $user->id_persona,
                ] : null,
                'permissions' => $permissions,
            ],
            'navigation' => $user ? $this->navigationFor($user) : [],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
                'info' => fn () => $request->session()->get('info'),
                'qr_path' => fn () => $request->session()->get('qr_path'),
            ],
            // Compartido para cualquier usuario autenticado (no solo quien puede
            // finalizar ocupaciones o revisar comprobantes): la campanita de
            // notificaciones es un mecanismo general para todo el staff.
            'notificaciones' => $user ? app(NotificacionFeedService::class)->paraCampana() : [],
        ];
    }

    /**
     * Árbol de módulos (solo los de nivel superior con sus submódulos), filtrado
     * a los que el usuario puede al menos "ver" — ver docs/requerimientos-proyecto.md
     * sección 6 para la convención de nombres de permiso.
     */
    private function navigationFor($user): array
    {
        $permissions = $user->getAllPermissions()->pluck('name')->flip();

        return Module::whereNull('parent_module_id')
            ->orderBy('sort_order')
            ->with('children')
            ->get()
            ->filter(fn (Module $module) => $permissions->has("{$module->code}.ver"))
            ->map(fn (Module $module) => [
                'code' => $module->code,
                'name' => $module->name,
                'children' => $module->children
                    ->filter(fn (Module $child) => $permissions->has("{$child->code}.ver"))
                    ->map(fn (Module $child) => [
                        'code' => $child->code,
                        'name' => $child->name,
                    ])
                    ->values(),
            ])
            ->values()
            ->toArray();
    }
}
