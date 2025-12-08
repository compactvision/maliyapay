<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Modules\Category\Infrastructure\Models\Category;
use App\Models\User;
use Illuminate\Database\Seeder;
use Ramsey\Uuid\Uuid;

/**
 * CategorySeeder
 * 
 * Seeds default categories for testing
 */
class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get first user or create one
        $user = User::first();

        if (!$user) {
            $this->command->warn('No users found. Please create a user first.');
            return;
        }

        $expenseCategories = [
            ['name' => 'Alimentation', 'color' => '#EF4444'],
            ['name' => 'Transport', 'color' => '#F97316'],
            ['name' => 'Logement', 'color' => '#EAB308'],
            ['name' => 'Loisirs', 'color' => '#84CC16'],
            ['name' => 'Santé', 'color' => '#22C55E'],
            ['name' => 'Éducation', 'color' => '#14B8A6'],
            ['name' => 'Vêtements', 'color' => '#06B6D4'],
            ['name' => 'Autres dépenses', 'color' => '#6B7280'],
        ];

        $incomeCategories = [
            ['name' => 'Salaire', 'color' => '#3B82F6'],
            ['name' => 'Freelance', 'color' => '#6366F1'],
            ['name' => 'Investissements', 'color' => '#8B5CF6'],
            ['name' => 'Autres revenus', 'color' => '#A855F7'],
        ];

        foreach ($expenseCategories as $category) {
            Category::create([
                'id' => Uuid::uuid4()->toString(),
                'name' => $category['name'],
                'type' => 'expense',
                'color' => $category['color'],
                'user_id' => $user->id,
            ]);
        }

        foreach ($incomeCategories as $category) {
            Category::create([
                'id' => Uuid::uuid4()->toString(),
                'name' => $category['name'],
                'type' => 'income',
                'color' => $category['color'],
                'user_id' => $user->id,
            ]);
        }

        $this->command->info('Categories seeded successfully!');
    }
}
