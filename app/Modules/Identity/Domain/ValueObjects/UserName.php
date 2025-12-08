<?php

declare(strict_types=1);

namespace App\Modules\Identity\Domain\ValueObjects;

use InvalidArgumentException;

/**
 * UserName Value Object
 * 
 * Represents a user's name with validation
 * Immutable and self-validating
 */
final class UserName
{
    private const MIN_LENGTH = 2;
    private const MAX_LENGTH = 255;

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
                sprintf('Name must be at least %d characters long', self::MIN_LENGTH)
            );
        }

        if ($length > self::MAX_LENGTH) {
            throw new InvalidArgumentException(
                sprintf('Name must not exceed %d characters', self::MAX_LENGTH)
            );
        }

        if (empty($trimmed)) {
            throw new InvalidArgumentException('Name cannot be empty');
        }

        // Check for invalid characters (only letters, spaces, hyphens, apostrophes)
        if (!preg_match("/^[\p{L}\s'-]+$/u", $trimmed)) {
            throw new InvalidArgumentException('Name contains invalid characters');
        }
    }

    public function value(): string
    {
        return $this->value;
    }

    public function firstName(): string
    {
        $parts = explode(' ', $this->value);
        return $parts[0];
    }

    public function equals(UserName $other): bool
    {
        return $this->value === $other->value;
    }

    public function __toString(): string
    {
        return $this->value;
    }
}
