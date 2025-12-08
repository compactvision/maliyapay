<?php

declare(strict_types=1);

namespace App\Modules\Account\Domain\ValueObjects;

final class Balance
{
    public function __construct(
        private string $currencyCode,
        private float $amount
    ) {
    }

    public function currencyCode(): string
    {
        return $this->currencyCode;
    }

    public function amount(): float
    {
        return $this->amount;
    }

    public function add(float $amount): self
    {
        return new self($this->currencyCode, $this->amount + $amount);
    }

    public function subtract(float $amount): self
    {
        return new self($this->currencyCode, $this->amount - $amount);
    }
}
