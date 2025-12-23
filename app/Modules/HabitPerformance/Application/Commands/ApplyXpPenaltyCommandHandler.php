<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Application\Commands;

use App\Modules\HabitPerformance\Domain\Events\XpPenalized;
use App\Modules\HabitPerformance\Domain\Repositories\GamificationProfileRepositoryInterface;
use App\Modules\HabitPerformance\Domain\Services\IntelligentNotificationService;
use App\Models\User;
use DateTimeImmutable;
use Illuminate\Support\Facades\Event;

/**
 * Handler pour appliquer une pénalité XP
 */
class ApplyXpPenaltyCommandHandler
{
    public function __construct(
        private GamificationProfileRepositoryInterface $gamificationRepository,
        private IntelligentNotificationService $notificationService
    ) {
    }

    public function handle(ApplyXpPenaltyCommand $command): void
    {
        $user = User::find($command->userId);
        if (!$user) {
            return;
        }

        $profile = $this->gamificationRepository->findByUserId($user->id);
        if (!$profile) {
            return;
        }

        // Appliquer la pénalité
        $profile->removeXp($command->amount);
        $this->gamificationRepository->save($profile);

        // Dispatcher event
        Event::dispatch(new XpPenalized(
            $user->id,
            $command->amount,
            $command->reason,
            $profile->xp(),
            $profile->currentLevel(),
            new DateTimeImmutable()
        ));

        // Notifier l'utilisateur
        $this->notificationService->notifyXpLost($user, $command->amount, $command->reason);
    }
}
