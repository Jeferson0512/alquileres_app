<?php

namespace App\Http\Middleware;

use App\Models\Module;
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

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
                'permissions' => $user ? $user->getAllPermissions()->pluck('name') : [],
            ],
            'navigation' => $user ? $this->navigationFor($user) : [],
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
