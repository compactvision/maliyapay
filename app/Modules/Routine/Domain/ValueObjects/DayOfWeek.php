<?php

declare(strict_types=1);

namespace App\Modules\Routine\Domain\ValueObjects;

enum DayOfWeek: int
{
    case MONDAY = 1;
    case TUESDAY = 2;
    case WEDNESDAY = 3;
    case THURSDAY = 4;
    case FRIDAY = 5;
    case SATURDAY = 6;
    case SUNDAY = 7;

    public function label(): string
    {
        return match ($this) {
            self::MONDAY => 'Lundi',
            self::TUESDAY => 'Mardi',
            self::WEDNESDAY => 'Mercredi',
            self::THURSDAY => 'Jeudi',
            self::FRIDAY => 'Vendredi',
            self::SATURDAY => 'Samedi',
            self::SUNDAY => 'Dimanche',
        };
    }

    public function shortLabel(): string
    {
        return match ($this) {
            self::MONDAY => 'Lu',
            self::TUESDAY => 'Ma',
            self::WEDNESDAY => 'Me',
            self::THURSDAY => 'Je',
            self::FRIDAY => 'Ve',
            self::SATURDAY => 'Sa',
            self::SUNDAY => 'Di',
        };
    }

    public static function fromInt(int $value): self
    {
        return self::from($value);
    }

    public static function today(): self
    {
        $dayNumber = (int) date('N'); // 1 (Monday) to 7 (Sunday)
        return self::from($dayNumber);
    }
}
