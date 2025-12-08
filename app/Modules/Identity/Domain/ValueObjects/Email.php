<?php

declare(strict_types=1);

namespace App\Modules\Identity\Domain\ValueObjects;

use InvalidArgumentException;

/**
 * Email Value Object
 * 
 * Represents a valid email address
 * Immutable and self-validating
 */
final class Email
{
    private string $value;

    private function __construct(string $value)
    {
        $this->validate($value);
        $this->value = strtolower(trim($value));
    }

    public static function fromString(string $value): self
    {
        return new self($value);
    }

    private function validate(string $value): void
    {
        $trimmed = trim($value);

        if (empty($trimmed)) {
            throw new InvalidArgumentException('Email cannot be empty');
        }

        if (!filter_var($trimmed, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException(
                sprintf('Invalid email format: %s', $trimmed)
            );
        }

        // Additional validation: check for common disposable email domains
        $domain = substr(strrchr($trimmed, '@'), 1);
        $disposableDomains = ['tempmail.com', 'throwaway.email', '10minutemail.com'];
        
        if (in_array($domain, $disposableDomains, true)) {
            throw new InvalidArgumentException('Disposable email addresses are not allowed');
        }
    }

    public function value(): string
    {
        return $this->value;
    }

    public function domain(): string
    {
        return substr(strrchr($this->value, '@'), 1);
    }

    public function localPart(): string
    {
        return strstr($this->value, '@', true);
    }

    public function equals(Email $other): bool
    {
        return $this->value === $other->value;
    }

    public function __toString(): string
    {
        return $this->value;
    }
}
