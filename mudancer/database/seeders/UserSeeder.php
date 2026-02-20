<?php

namespace Database\Seeders;

use App\Models\Provider;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Creates provider users (run AFTER ProviderSeeder). Then links providers to users by email.
     */
    public function run(): void
    {
        $users = [
            ['name' => 'Gaestra Admin', 'email' => 'gaestra@mudancer.com', 'phone' => '5551001001'],
            ['name' => 'Inter Admin', 'email' => 'inter@mudancer.com', 'phone' => '5551001002'],
            ['name' => 'Moreno Admin', 'email' => 'moreno@mudancer.com', 'phone' => '5551001003'],
            ['name' => 'Mudanzas IS Admin', 'email' => 'mudanzas-is@mudancer.com', 'phone' => '5551001004'],
            ['name' => 'Gómez Admin', 'email' => 'gomez@mudancer.com', 'phone' => '5551001005'],
        ];

        foreach ($users as $data) {
            User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'phone' => $data['phone'],
                    'password' => Hash::make('password'),
                    'role' => 'provider',
                ]
            );
        }

        // Link each provider to its user by email
        foreach (Provider::all() as $provider) {
            $user = User::where('email', $provider->email)->first();
            if ($user) {
                $provider->update(['user_id' => $user->id]);
            }
        }
    }
}
