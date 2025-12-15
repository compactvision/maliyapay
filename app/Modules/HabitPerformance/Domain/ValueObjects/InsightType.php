<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Domain\ValueObjects;

enum InsightType: string
{
    case TASK = 'task';
    case FINANCE = 'finance';
}
