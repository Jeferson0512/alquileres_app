<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(RolePermissionSeeder::class);

        $admin = User::firstOrCreate(
            ['email' => 'jefersonbujaico@gmail.com'],
            ['name' => 'Jeferson Bujaico', 'password' => 'CambiarEstaClave123!']
        );
        $admin->assignRole('Admin');
    }
}
