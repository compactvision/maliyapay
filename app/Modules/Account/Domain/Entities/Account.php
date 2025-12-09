<?php

declare(strict_types=1);

namespace App\Modules\Account\Domain\Entities;

use App\Modules\Account\Domain\ValueObjects\AccountType;
use App\Modules\Account\Domain\ValueObjects\Balance; // We'll create this next
use DateTimeImmutable;
use Ramsey\Uuid\UuidInterface;

/**
 * Account Domain Entity
 */
final class Account
{
    private UuidInterface $id;
    private string $userId;
    private string $name;
    private AccountType $type;
    private ?string $color;
    private bool $isArchived;
    /** @var Balance[] */
    private array $balances;
    private DateTimeImmutable $createdAt;
    private DateTimeImmutable $updatedAt;
    private ?DateTimeImmutable $deletedAt;

    private function __construct(
        UuidInterface $id,
        string $userId,
        string $name,
        AccountType $type,
        ?string $color,
        bool $isArchived,
        array $balances,
        DateTimeImmutable $createdAt,
        DateTimeImmutable $updatedAt,
        ?DateTimeImmutable $deletedAt = null
    ) {
        $this->id = $id;
        $this->userId = $userId;
        $this->name = $name;
        $this->type = $type;
        $this->color = $color;
        $this->isArchived = $isArchived;
        $this->balances = $balances;
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;
        $this->deletedAt = $deletedAt;
    }

    public static function create(
        UuidInterface $id,
        string $userId,
        string $name,
        AccountType $type,
        ?string $color
    ): self {
        $now = new DateTimeImmutable();
        return new self(
            id: $id,
            userId: $userId,
            name: $name,
            type: $type,
            color: $color,
            isArchived: false,
            balances: [], // Init empty, add currency later
            createdAt: $now,
            updatedAt: $now
        );
    }

    public static function reconstitute(
        UuidInterface $id,
        string $userId,
        string $name,
        AccountType $type,
        ?string $color,
        bool $isArchived,
        array $balances,
        DateTimeImmutable $createdAt,
        DateTimeImmutable $updatedAt,
        ?DateTimeImmutable $deletedAt = null
    ): self {
        return new self(
            id: $id,
            userId: $userId,
            name: $name,
            type: $type,
            color: $color,
            isArchived: $isArchived,
            balances: $balances,
            createdAt: $createdAt,
            updatedAt: $updatedAt,
            deletedAt: $deletedAt
        );
    }

    public function addBalance(Balance $balance): void
    {
        // Check if currency already exists?
        foreach ($this->balances as $b) {
            if ($b->currencyCode() === $balance->currencyCode()) {
                throw new \DomainException("Balance for currency {$balance->currencyCode()} already exists");
            }
        }
        $this->balances[] = $balance;
    }

    public function balances(): array
    {
        return $this->balances;
    }

    public function deposit(float $amount, string $currency): void
    {
        foreach ($this->balances as $balance) {
            if ($balance->currencyCode() === $currency) {
                // Assuming Balance is immutable, we might need a setBalance or create a new Balance
                // Since Balance is a VO, we should replace it in the array or update internal state if mutable (unlikely for VO)
                // Let's check Balance VO implementation. If it's just a DTO, we can't easily update it inside the array unless we remove and replace.
                // However, usually we should update the Aggregate.
                
                // Simplified: We assume we can replace the balance object.
                // Actually, let's look at the Balance VO next. For now, let's implement the logic assuming we can update it.
                // If Balance is immutable (as it should be), we create a new one.
                $newAmount = $balance->amount() + $amount;
                $newBalance = new Balance($currency, $newAmount);
                $this->updateBalance($newBalance);
                return;
            }
        }
        // If not found, create new? Or throw?
        // Usually accounts should have the currency initialized. If not, maybe auto-create? 
        // Let's auto-create for now as it's user friendly.
        $this->addBalance(new Balance($currency, $amount));
    }

    public function withdraw(float $amount, string $currency): void
    {
        foreach ($this->balances as $balance) {
            if ($balance->currencyCode() === $currency) {
                $newAmount = $balance->amount() - $amount;
                $newBalance = new Balance($currency, $newAmount);
                $this->updateBalance($newBalance);
                return;
            }
        }
        // If currency doesn't exist, we can create it with negative balance or throw.
        // Let's create with negative.
        $this->addBalance(new Balance($currency, -$amount));
    }

    private function updateBalance(Balance $newBalance): void
    {
        foreach ($this->balances as $key => $balance) {
            if ($balance->currencyCode() === $newBalance->currencyCode()) {
                $this->balances[$key] = $newBalance;
                return;
            }
        }
    }
    
    // Getters...
    public function id(): UuidInterface { return $this->id; }
    public function userId(): string { return $this->userId; }
    public function name(): string { return $this->name; }
    public function type(): AccountType { return $this->type; }
    public function color(): ?string { return $this->color; }
    public function isArchived(): bool { return $this->isArchived; }
    public function createdAt(): DateTimeImmutable { return $this->createdAt; }
    public function updatedAt(): DateTimeImmutable { return $this->updatedAt; }
    public function deletedAt(): ?DateTimeImmutable { return $this->deletedAt; }
}
