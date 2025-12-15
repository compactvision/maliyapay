<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Domain\ValueObjects;

use InvalidArgumentException;

class Score
{
    private function __construct(private int $value)
    {
    }

    public static function fromInt(int $value): self
    {
        if ($value < 0 || $value > 100) {
            throw new InvalidArgumentException('Score must be between 0 and 100');
        }
        return new self($value);
    }

    public function toInt(): int
    {
        return $this->value;
    }
}
