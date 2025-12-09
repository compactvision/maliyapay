<?php

declare(strict_types=1);

namespace App\Modules\Task\Domain\ValueObjects;

enum TaskPriority: string
{
    case LOW = 'low';
    case MEDIUM = 'medium';
    case HIGH = 'high';

    public function label(): string
    {
        return match ($this) {
            self::LOW => 'Basse',
            self::MEDIUM => 'Moyenne',
            self::HIGH => 'Haute',
        };
    }

    public static function fromString(string $value): self
    {
        return self::from($value);
    }
}
