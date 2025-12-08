<?php

declare(strict_types=1);

namespace App\Modules\Category\Domain\ValueObjects;

use InvalidArgumentException;

/**
 * CategoryColor Value Object
 * 
 * Represents a hexadecimal color code
 * Immutable and self-validating
 */
final class CategoryColor
{
    private const HEX_COLOR_PATTERN = '/^#[0-9A-F]{6}$/i';

    private string $value;

    private function __construct(string $value)
    {
        $this->validate($value);
        $this->value = strtoupper($value);
    }

    public static function fromString(string $value): self
    {
        return new self($value);
    }

    private function validate(string $value): void
    {
        if (!preg_match(self::HEX_COLOR_PATTERN, $value)) {
            throw new InvalidArgumentException(
                sprintf(
                    'Invalid color format "%s". Expected format: #RRGGBB (e.g., #FF5733)',
                    $value
                )
            );
        }
    }

    public function value(): string
    {
        return $this->value;
    }

    public function equals(CategoryColor $other): bool
    {
        return $this->value === $other->value;
    }

    public function __toString(): string
    {
        return $this->value;
    }
}
