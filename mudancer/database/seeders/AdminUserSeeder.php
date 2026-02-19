<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Seed the admin user: admin@mudancer.com / password
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@mudancer.com'],
            [
                'name' => 'Admin',
                'phone' => '5550000000',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ]
        );
    }
}
