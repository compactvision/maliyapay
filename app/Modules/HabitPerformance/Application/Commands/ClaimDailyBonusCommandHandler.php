<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Application\Commands;

use App\Modules\HabitPerformance\Domain\Repositories\GamificationProfileRepositoryInterface;
use App\Modules\HabitPerformance\Domain\Entities\GamificationProfile;
use Ramsey\Uuid\Uuid;
use DateTimeImmutable;

class ClaimDailyBonusCommandHandler
{
    public function __construct(
        private GamificationProfileRepositoryInterface $gamificationRepository
    ) {
    }

    public function handle(ClaimDailyBonusCommand $command): void
    {
        $profile = $this->gamificationRepository->findByUserId($command->userId);
        
        if (!$profile) {
            $profile = GamificationProfile::create(
                Uuid::uuid4(),
                $command->userId
            );
        }

        $now = new DateTimeImmutable();
        if ($profile->claimDailyBonus($now)) {
            $this->gamificationRepository->save($profile);
        } else {
            // Already claimed
            // Could throw domain exception or just ignore
            // throw new \DomainException("Bonus already claimed today.");
        }
    }
}
