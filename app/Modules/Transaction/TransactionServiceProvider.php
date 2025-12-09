<?php

declare(strict_types=1);

namespace App\Modules\Transaction;

use App\Modules\Transaction\Domain\Repositories\TransactionRepositoryInterface;
use App\Modules\Transaction\Infrastructure\Repositories\EloquentTransactionRepository;
use Illuminate\Support\ServiceProvider;

class TransactionServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(TransactionRepositoryInterface::class, EloquentTransactionRepository::class);
    }

    public function boot(): void
    {
    }
}
