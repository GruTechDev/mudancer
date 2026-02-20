<?php

namespace Database\Seeders;

use App\Models\Provider;
use Illuminate\Database\Seeder;

class ProviderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Creates provider records (user_id set by UserSeeder after users exist).
     */
    public function run(): void
    {
        $providers = [
            ['nombre' => 'Gaestra', 'email' => 'gaestra@mudancer.com'],
            ['nombre' => 'Inter', 'email' => 'inter@mudancer.com'],
            ['nombre' => 'Moreno', 'email' => 'moreno@mudancer.com'],
            ['nombre' => 'Mudanzas IS', 'email' => 'mudanzas-is@mudancer.com'],
            ['nombre' => 'Gómez', 'email' => 'gomez@mudancer.com'],
        ];

        foreach ($providers as $data) {
            Provider::updateOrCreate(
                ['email' => $data['email']],
                array_merge($data, [
                    'rfc' => 'RFC' . strtoupper(substr(md5($data['email']), 0, 10)),
                    'domicilio' => 'Domicilio ' . $data['nombre'],
                    'telefono' => '5550000000',
                    'responsable' => $data['nombre'] . ' Admin',
                    'logo' => null,
                    'reputacion' => 0,
                ])
            );
        }
    }
}
