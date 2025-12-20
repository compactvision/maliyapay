<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class AssignDefaultRoles extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:assign-default-roles';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Assign default user role to users without any roles';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Checking for users without roles...');

        $usersWithoutRoles = \App\Models\User::whereDoesntHave('roles')->get();

        if ($usersWithoutRoles->isEmpty()) {
            $this->info('All users already have roles assigned.');
            return Command::SUCCESS;
        }

        $this->info("Found {$usersWithoutRoles->count()} user(s) without roles.");

        $bar = $this->output->createProgressBar($usersWithoutRoles->count());
        $bar->start();

        foreach ($usersWithoutRoles as $user) {
            $user->assignRole('user');
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("Successfully assigned 'user' role to {$usersWithoutRoles->count()} user(s).");

        return Command::SUCCESS;
    }
}
