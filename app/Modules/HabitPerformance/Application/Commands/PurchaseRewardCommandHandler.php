<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Application\Commands;

use App\Modules\HabitPerformance\Domain\Repositories\GamificationProfileRepositoryInterface;
use App\Modules\HabitPerformance\Domain\Entities\GamificationProfile;
use Ramsey\Uuid\Uuid;

class PurchaseRewardCommandHandler
{
    public function __construct(
        private GamificationProfileRepositoryInterface $gamificationRepository
    ) {
    }

    public function handle(PurchaseRewardCommand $command): void
    {
        $profile = $this->gamificationRepository->findByUserId($command->userId);
        
        if (!$profile) {
            $profile = GamificationProfile::create(
                Uuid::uuid4(),
                $command->userId
            );
        }

        if ($profile->spendCoins($command->cost)) {
            $this->gamificationRepository->save($profile);
            // Here we would dispatch an event: RewardPurchased(rewardId)
            // But for now, just deducing coins is enough for the MVP request.
        } else {
            throw new \DomainException("Solde insuffisant.");
        }
    }
}
