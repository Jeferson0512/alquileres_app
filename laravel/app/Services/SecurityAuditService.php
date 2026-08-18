<?php

namespace App\Services;

use App\Models\SecurityAuditLog;
use Illuminate\Support\Facades\Request;

/**
 * Auditoria de eventos de seguridad de cuentas -- login exitoso/fallido,
 * logout, reset de contraseña, eliminacion de cuenta. Antes no quedaba
 * ningun registro de esto (confirmado: no habia tabla, paquete ni listener
 * para eventos de auth). Se registra tanto vía los eventos nativos de
 * Laravel (Login/Failed/Logout/PasswordReset, ver AppServiceProvider::boot())
 * como en llamadas manuales para acciones sin evento propio (solicitud de
 * reset, eliminacion de cuenta).
 */
class SecurityAuditService
{
    public function log(string $evento, ?int $userId, ?string $email): void
    {
        SecurityAuditLog::create([
            'user_id' => $userId,
            'email' => $email,
            'evento' => $evento,
            'ip' => Request::ip(),
            'user_agent' => substr((string) Request::userAgent(), 0, 255),
            'creado_en' => now(),
        ]);
    }
}
