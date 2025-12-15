<?php

namespace App\Modules\HabitPerformance\Domain\Repositories;

use App\Modules\HabitPerformance\Domain\Entities\GamificationProfile;
use Ramsey\Uuid\UuidInterface;

interface GamificationProfileRepositoryInterface
{
    public function findByUserId(int $userId): ?GamificationProfile;
    public function save(GamificationProfile $profile): void;
}
