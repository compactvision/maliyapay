<?php

declare(strict_types=1);

namespace App\Modules\Transaction\Domain\Entities;

use App\Modules\Transaction\Domain\ValueObjects\TransactionType;
use DateTimeImmutable;
use Ramsey\Uuid\UuidInterface;

class Transaction
{
    public function __construct(
        private UuidInterface $id,
        private string $userId,
        private string $accountId,
        private ?string $categoryId,
        private float $amount,
        private string $currency,
        private TransactionType $type,
        private string $description,
        private DateTimeImmutable $date,
        private DateTimeImmutable $createdAt,
        private DateTimeImmutable $updatedAt,
        private ?float $convertedAmount = null,
        private ?string $toCurrency = null,
        private ?float $exchangeRate = null,
    ) {
    }

    public static function create(
        UuidInterface $id,
        string $userId,
        string $accountId,
        string $categoryId,
        float $amount,
        string $currency,
        TransactionType $type,
        string $description,
        DateTimeImmutable $date
    ): self {
        $now = new DateTimeImmutable();
        return new self(
            id: $id,
            userId: $userId,
            accountId: $accountId,
            categoryId: $categoryId,
            amount: $amount,
            currency: $currency,
            type: $type,
            description: $description,
            date: $date,
            createdAt: $now,
            updatedAt: $now
        );
    }

    public static function recordExchange(
        UuidInterface $id,
        string $userId,
        string $accountId,
        float $amount,
        string $currency,
        float $convertedAmount,
        string $toCurrency,
        float $exchangeRate,
        DateTimeImmutable $date,
    ): self {
        return new self(
            id: $id,
            userId: $userId,
            accountId: $accountId,
            categoryId: null,
            amount: $amount,
            currency: $currency,
            type: TransactionType::EXCHANGE,
            description: 'Change de devises',
            date: $date,
            createdAt: $date,
            updatedAt: $date,
            convertedAmount: $convertedAmount,
            toCurrency: $toCurrency,
            exchangeRate: $exchangeRate,
        );
    }

    public static function reconstitute(
        UuidInterface $id,
        string $userId,
        string $accountId,
        ?string $categoryId,
        float $amount,
        string $currency,
        TransactionType $type,
        string $description,
        DateTimeImmutable $date,
        DateTimeImmutable $createdAt,
        DateTimeImmutable $updatedAt,
        ?float $convertedAmount = null,
        ?string $toCurrency = null,
        ?float $exchangeRate = null,
    ): self {
        return new self(
            id: $id,
            userId: $userId,
            accountId: $accountId,
            categoryId: $categoryId,
            amount: $amount,
            currency: $currency,
            type: $type,
            description: $description,
            date: $date,
            createdAt: $createdAt,
            updatedAt: $updatedAt,
            convertedAmount: $convertedAmount,
            toCurrency: $toCurrency,
            exchangeRate: $exchangeRate,
        );
    }

    public function id(): UuidInterface
    {
        return $this->id;
    }

    public function userId(): string
    {
        return $this->userId;
    }

    public function accountId(): string
    {
        return $this->accountId;
    }

    public function categoryId(): ?string
    {
        return $this->categoryId;
    }

    public function amount(): float
    {
        return $this->amount;
    }

    public function currency(): string
    {
        return $this->currency;
    }

    public function type(): TransactionType
    {
        return $this->type;
    }

    public function description(): string
    {
        return $this->description;
    }

    public function date(): DateTimeImmutable
    {
        return $this->date;
    }

    public function convertedAmount(): ?float
    {
        return $this->convertedAmount;
    }

    public function toCurrency(): ?string
    {
        return $this->toCurrency;
    }

    public function exchangeRate(): ?float
    {
        return $this->exchangeRate;
    }

    public function createdAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function updatedAt(): DateTimeImmutable
    {
        return $this->updatedAt;
    }
}
