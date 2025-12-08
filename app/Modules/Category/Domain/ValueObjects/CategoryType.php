<?php

declare(strict_types=1);

namespace App\Modules\Category\Domain\ValueObjects;

use InvalidArgumentException;

/**
 * CategoryType Value Object
 * 
 * Represents the type of a category (income or expense)
 * Immutable and self-validating
 */
final class CategoryType
{
    public const INCOME = 'income';
    public const EXPENSE = 'expense';

    private const VALID_TYPES = [
        self::INCOME,
        self::EXPENSE,
    ];

    private string $value;

    private function __construct(string $value)
    {
        $this->validate($value);
        $this->value = $value;
    }

    public static function fromString(string $value): self
    {
        return new self($value);
    }

    public static function income(): self
    {
        return new self(self::INCOME);
    }

    public static function expense(): self
    {
        return new self(self::EXPENSE);
    }

    private function validate(string $value): void
    {
        if (!in_array($value, self::VALID_TYPES, true)) {
            throw new InvalidArgumentException(
                sprintf(
                    'Invalid category type "%s". Allowed types: %s',
                    $value,
                    implode(', ', self::VALID_TYPES)
                )
            );
        }
    }

    public function value(): string
    {
        return $this->value;
    }

    public function isIncome(): bool
    {
        return $this->value === self::INCOME;
    }

    public function isExpense(): bool
    {
        return $this->value === self::EXPENSE;
    }

    public function equals(CategoryType $other): bool
    {
        return $this->value === $other->value;
    }

    public function __toString(): string
    {
        return $this->value;
    }
}
