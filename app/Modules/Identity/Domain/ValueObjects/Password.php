<?php

declare(strict_types=1);

namespace App\Modules\Identity\Domain\ValueObjects;

use InvalidArgumentException;

/**
 * Password Value Object
 * 
 * Represents a password with strength requirements
 * Immutable and self-validating
 */
final class Password
{
    private const MIN_LENGTH = 8;
    private const MAX_LENGTH = 255;

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

    /**
     * Create from already hashed password (for reconstitution)
     */
    public static function fromHash(string $hash): self
    {
        $instance = new self('dummy'); // Bypass validation
        $instance->value = $hash;
        return $instance;
    }

    private function validate(string $value): void
    {
        $length = mb_strlen($value);

        if ($length < self::MIN_LENGTH) {
            throw new InvalidArgumentException(
                sprintf('Password must be at least %d characters long', self::MIN_LENGTH)
            );
        }

        if ($length > self::MAX_LENGTH) {
            throw new InvalidArgumentException(
                sprintf('Password must not exceed %d characters', self::MAX_LENGTH)
            );
        }

        // Check for at least one uppercase letter
        if (!preg_match('/[A-Z]/', $value)) {
            throw new InvalidArgumentException('Password must contain at least one uppercase letter');
        }

        // Check for at least one lowercase letter
        if (!preg_match('/[a-z]/', $value)) {
            throw new InvalidArgumentException('Password must contain at least one lowercase letter');
        }

        // Check for at least one number
        if (!preg_match('/[0-9]/', $value)) {
            throw new InvalidArgumentException('Password must contain at least one number');
        }

        // Optional: Check for special character
        // if (!preg_match('/[^A-Za-z0-9]/', $value)) {
        //     throw new InvalidArgumentException('Password must contain at least one special character');
        // }
    }

    public function value(): string
    {
        return $this->value;
    }

    public function hash(): string
    {
        return password_hash($this->value, PASSWORD_BCRYPT);
    }

    public function verify(string $hash): bool
    {
        return password_verify($this->value, $hash);
    }

    public function __toString(): string
    {
        return $this->value;
    }
}
