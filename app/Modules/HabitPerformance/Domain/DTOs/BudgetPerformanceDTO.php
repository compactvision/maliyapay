<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Domain\DTOs;

class BudgetPerformanceDTO
{
    public function __construct(
        public readonly float $totalBudget,
        public readonly float $totalSpent,
        public readonly float $spendingRatio, // 0.0 to 1.0+
        public readonly int $adherenceScore, // 0-100
        public readonly array $categoriesOverBudget, // ['category_id' => ['name', 'budget', 'spent']]
        public readonly bool $isOverBudget,
        public readonly string $advice
    ) {
    }

    public static function create(
        float $totalBudget,
        float $totalSpent,
        array $categoriesOverBudget
    ): self {
        $spendingRatio = $totalBudget > 0 ? $totalSpent / $totalBudget : 0;
        $isOverBudget = $spendingRatio > 1.0;
        
        // Calculate adherence score (0-100)
        // 100 = perfect (0% spent), 0 = terrible (200%+ spent)
        $adherenceScore = match (true) {
            $spendingRatio <= 0.5 => 100, // Under 50% = perfect
            $spendingRatio <= 0.8 => 90,  // 50-80% = excellent
            $spendingRatio <= 1.0 => 75,  // 80-100% = good
            $spendingRatio <= 1.1 => 50,  // 100-110% = warning
            $spendingRatio <= 1.25 => 25, // 110-125% = bad
            default => 0                   // 125%+ = critical
        };

        // Generate advice
        $advice = self::generateAdvice($spendingRatio, $categoriesOverBudget);

        return new self(
            totalBudget: $totalBudget,
            totalSpent: $totalSpent,
            spendingRatio: $spendingRatio,
            adherenceScore: $adherenceScore,
            categoriesOverBudget: $categoriesOverBudget,
            isOverBudget: $isOverBudget,
            advice: $advice
        );
    }

    private static function generateAdvice(float $ratio, array $categoriesOver): string
    {
        if ($ratio <= 0.5) {
            return "Excellent! Vous gérez très bien votre budget. Continuez ainsi!";
        }
        
        if ($ratio <= 0.8) {
            return "Très bien! Vous êtes sur la bonne voie. Maintenez cette discipline.";
        }
        
        if ($ratio <= 1.0) {
            return "Attention! Vous approchez de votre limite budgétaire. Surveillez vos dépenses.";
        }
        
        if ($ratio <= 1.1) {
            $categories = implode(', ', array_column($categoriesOver, 'name'));
            return "⚠️ Budget dépassé de " . round(($ratio - 1) * 100, 1) . "%. Catégories problématiques: {$categories}";
        }
        
        return "🚨 Budget largement dépassé! Réduisez immédiatement vos dépenses, surtout dans: " . 
               implode(', ', array_column($categoriesOver, 'name'));
    }
}
