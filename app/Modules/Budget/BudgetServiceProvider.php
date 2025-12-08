<?php

declare(strict_types=1);

namespace App\Modules\Budget;

use App\Modules\Budget\Domain\Repositories\BudgetRepositoryInterface;
use App\Modules\Budget\Infrastructure\Repositories\EloquentBudgetRepository;
use Illuminate\Support\ServiceProvider;

class BudgetServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(
            BudgetRepositoryInterface::class,
            EloquentBudgetRepository::class
        );
    }

    public function boot(): void
    {
    }
}
