<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Application\Commands;

use App\Modules\HabitPerformance\Domain\Events\ForecastGenerated;
use App\Modules\HabitPerformance\Domain\Repositories\FinancialForecastRepositoryInterface;
use App\Modules\HabitPerformance\Domain\Services\ForecastService;
use App\Modules\HabitPerformance\Domain\Services\IntelligentNotificationService;
use App\Models\User;
use Illuminate\Support\Facades\Event;

/**
 * Handler pour la génération de prévision financière
 */
class GenerateForecastCommandHandler
{
    public function __construct(
        private ForecastService $forecastService,
        private FinancialForecastRepositoryInterface $forecastRepository,
        private IntelligentNotificationService $notificationService
    ) {
    }

    public function handle(GenerateForecastCommand $command): void
    {
        $user = User::find($command->userId);
        if (!$user) {
            return;
        }

        // Vérifier si une nouvelle prévision est nécessaire
        $lastForecast = $this->forecastRepository->findLatestByUserId($user->id);
        
        if (!$this->forecastService->needsNewForecast($lastForecast)) {
            return; // Prévision récente existe déjà
        }

        // Générer les nouvelles prévisions (retourne un tableau)
        $forecasts = $this->forecastService->generateMonthlyForecast($user);

        foreach ($forecasts as $forecast) {
            // Sauvegarder
            $this->forecastRepository->save($forecast);

            // Dispatcher event
            Event::dispatch(ForecastGenerated::fromForecast($forecast));

            // Envoyer notifications selon le statut
            if ($forecast->isCritical() || $forecast->isWarning()) {
                $this->notificationService->notifyNegativeForecast($user, $forecast);
            } elseif ($forecast->isPositive()) {
                $this->notificationService->notifyPositiveForecast($user, $forecast);
            }
        }
    }
}
