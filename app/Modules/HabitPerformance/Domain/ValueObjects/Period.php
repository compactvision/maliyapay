<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Domain\ValueObjects;

enum Period: string
{
    case DAY = 'day';
    case WEEK = 'week';
    case MONTH = 'month';
}
