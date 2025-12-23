<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Domain\ValueObjects;

use InvalidArgumentException;

/**
 * HabitScore - Value Object pour les scores de performance (0-100)
 */
final class HabitScore
{
    private const MIN_SCORE = 0;
    private const MAX_SCORE = 100;

    private function __construct(
        private int $value
    ) {
        $this->validate();
    }

    public static function fromInt(int $value): self
    {
        return new self($value);
    }

    public static function zero(): self
    {
        return new self(self::MIN_SCORE);
    }

    public static function perfect(): self
    {
        return new self(self::MAX_SCORE);
    }

    private function validate(): void
    {
        if ($this->value < self::MIN_SCORE || $this->value > self::MAX_SCORE) {
            throw new InvalidArgumentException(
                sprintf(
                    'Score must be between %d and %d, got %d',
                    self::MIN_SCORE,
                    self::MAX_SCORE,
                    $this->value
                )
            );
        }
    }

    public function toInt(): int
    {
        return $this->value;
    }

    public function toFloat(): float
    {
        return (float) $this->value;
    }

    public function percentage(): float
    {
        return $this->value;
    }

    public function isExcellent(): bool
    {
        return $this->value >= 90;
    }

    public function isGood(): bool
    {
        return $this->value >= 70 && $this->value < 90;
    }

    public function isAverage(): bool
    {
        return $this->value >= 50 && $this->value < 70;
    }

    public function isPoor(): bool
    {
        return $this->value < 50;
    }

    public function getGrade(): string
    {
        return match (true) {
            $this->value >= 90 => 'A',
            $this->value >= 80 => 'B',
            $this->value >= 70 => 'C',
            $this->value >= 60 => 'D',
            default => 'F'
        };
    }

    public function getLabel(): string
    {
        return match (true) {
            $this->value >= 90 => 'Excellent',
            $this->value >= 80 => 'Très bien',
            $this->value >= 70 => 'Bien',
            $this->value >= 60 => 'Moyen',
            $this->value >= 50 => 'Passable',
            default => 'Insuffisant'
        };
    }

    public function equals(HabitScore $other): bool
    {
        return $this->value === $other->value;
    }

    public function greaterThan(HabitScore $other): bool
    {
        return $this->value > $other->value;
    }

    public function lessThan(HabitScore $other): bool
    {
        return $this->value < $other->value;
    }

    public function __toString(): string
    {
        return (string) $this->value;
    }
}
