<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Application\Commands;

/**
 * Command pour générer une prévision financière
 */
class GenerateForecastCommand
{
    public function __construct(
        public readonly int $userId
    ) {
    }
}
