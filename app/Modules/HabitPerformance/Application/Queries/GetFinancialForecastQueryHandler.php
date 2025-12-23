<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Application\Queries;

use App\Modules\HabitPerformance\Domain\Repositories\FinancialForecastRepositoryInterface;
use App\Modules\HabitPerformance\Domain\Services\ForecastService;
use App\Models\User;

/**
 * Handler pour obtenir la prévision financière
 */
class GetFinancialForecastQueryHandler
{
    public function __construct(
        private FinancialForecastRepositoryInterface $forecastRepository,
        private ForecastService $forecastService
    ) {
    }

    /**
     * @return array[]
     */
    public function handle(GetFinancialForecastQuery $query): array
    {
        $user = User::find($query->userId);
        if (!$user) {
            return [];
        }

        // Récupérer les dernières prévisions pour chaque devise
        $forecasts = $this->forecastRepository->findLatestForEachCurrency($user->id);

        return array_map(fn($forecast) => [
            'id' => $forecast->id()->toString(),
            'currency' => $forecast->currency(),
            'generated_at' => $forecast->generatedAt()->format('Y-m-d H:i:s'),
            'current_balance' => $forecast->currentBalance(),
            'avg_daily_spending' => $forecast->avgDailySpending(),
            'projected_end_balance' => $forecast->projectedEndBalance(),
            'projected_change' => $forecast->projectedChange(),
            'projected_change_percentage' => $forecast->projectedChangePercentage(),
            'zero_balance_date' => $forecast->zeroBalanceDate()?->format('Y-m-d'),
            'days_until_zero' => $forecast->daysUntilZeroBalance(),
            'status' => $forecast->status(),
            'is_critical' => $forecast->isCritical(),
            'is_warning' => $forecast->isWarning(),
            'is_positive' => $forecast->isPositive(),
            'recommendations' => $forecast->recommendations(),
        ], $forecasts);
    }
}
