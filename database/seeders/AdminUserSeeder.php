<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure admin role exists
        if (!Role::where('name', 'admin')->exists()) {
            Role::create(['name' => 'admin']);
        }

        $user = User::firstOrCreate(
            ['email' => 'admin@maliyapay.com'],
            [
                'name' => 'MaliYapay Admin',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        $user->assignRole('admin');
        
        $this->command->info('Admin user created successfully.');
    }
}
