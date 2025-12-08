<?php

declare(strict_types=1);

namespace App\Modules\Category\Domain\ValueObjects;

use InvalidArgumentException;

/**
 * CategoryName Value Object
 * 
 * Represents a category name with validation rules
 * Immutable and self-validating
 */
final class CategoryName
{
    private const MIN_LENGTH = 2;
    private const MAX_LENGTH = 100;

    private string $value;

    private function __construct(string $value)
    {
        $this->validate($value);
        $this->value = trim($value);
    }

    public static function fromString(string $value): self
    {
        return new self($value);
    }

    private function validate(string $value): void
    {
        $trimmed = trim($value);
        $length = mb_strlen($trimmed);

        if ($length < self::MIN_LENGTH) {
            throw new InvalidArgumentException(
                sprintf(
                    'Category name must be at least %d characters long',
                    self::MIN_LENGTH
                )
            );
        }

        if ($length > self::MAX_LENGTH) {
            throw new InvalidArgumentException(
                sprintf(
                    'Category name must not exceed %d characters',
                    self::MAX_LENGTH
                )
            );
        }

        if (empty($trimmed)) {
            throw new InvalidArgumentException('Category name cannot be empty');
        }
    }

    public function value(): string
    {
        return $this->value;
    }

    public function equals(CategoryName $other): bool
    {
        return $this->value === $other->value;
    }

    public function __toString(): string
    {
        return $this->value;
    }
}
