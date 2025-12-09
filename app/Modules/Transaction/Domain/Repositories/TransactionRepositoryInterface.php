<?php

declare(strict_types=1);

namespace App\Modules\Transaction\Domain\Repositories;

use App\Modules\Transaction\Domain\Entities\Transaction;
use DateTimeImmutable;

interface TransactionRepositoryInterface
{
    public function save(Transaction $transaction): void;
    public function getSpentAmountForCategory(string $userId, string $categoryId, DateTimeImmutable $startDate, DateTimeImmutable $endDate): float;
    public function getIncomeAmountForCategory(string $userId, string $categoryId, DateTimeImmutable $startDate, DateTimeImmutable $endDate): float;
    public function findAllByUser(string $userId, ?int $limit = null): array;
    public function findByUserAndPeriod(string $userId, DateTimeImmutable $startDate, DateTimeImmutable $endDate): array;
    public function findById(string $id, string $userId): ?Transaction;
    public function delete(Transaction $transaction): void;
}
