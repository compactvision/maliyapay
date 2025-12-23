<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance;

use App\Modules\HabitPerformance\Domain\Repositories\GamificationProfileRepositoryInterface;
use App\Modules\HabitPerformance\Domain\Repositories\HabitInsightRepositoryInterface;
use App\Modules\HabitPerformance\Domain\Repositories\PerformanceMetricRepositoryInterface;
use App\Modules\HabitPerformance\Domain\Repositories\PerformanceSnapshotRepositoryInterface;
use App\Modules\HabitPerformance\Domain\Repositories\FinancialForecastRepositoryInterface;
use App\Modules\HabitPerformance\Infrastructure\Repositories\EloquentGamificationProfileRepository;
use App\Modules\HabitPerformance\Infrastructure\Repositories\EloquentHabitInsightRepository;
use App\Modules\HabitPerformance\Infrastructure\Repositories\EloquentPerformanceMetricRepository;
use App\Modules\HabitPerformance\Infrastructure\Repositories\EloquentPerformanceSnapshotRepository;
use App\Modules\HabitPerformance\Infrastructure\Repositories\EloquentFinancialForecastRepository;
use Illuminate\Support\ServiceProvider;

class HabitPerformanceServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(
            GamificationProfileRepositoryInterface::class,
            EloquentGamificationProfileRepository::class
        );

        $this->app->bind(
            HabitInsightRepositoryInterface::class,
            EloquentHabitInsightRepository::class
        );

        $this->app->bind(
            PerformanceMetricRepositoryInterface::class,
            EloquentPerformanceMetricRepository::class
        );

        $this->app->bind(
            PerformanceSnapshotRepositoryInterface::class,
            EloquentPerformanceSnapshotRepository::class
        );

        $this->app->bind(
            FinancialForecastRepositoryInterface::class,
            EloquentFinancialForecastRepository::class
        );

        $this->app->singleton(\App\Modules\HabitPerformance\Domain\Services\FinancialPerformanceService::class);
        $this->app->singleton(\App\Modules\HabitPerformance\Domain\Services\TaskPerformanceService::class);
    }

    public function boot(): void
    {
        // Event listeners will be registered here or in EventServiceProvider
        \Illuminate\Support\Facades\Event::listen(
            \App\Modules\Task\Domain\Events\TaskCompleted::class,
            \App\Modules\HabitPerformance\Application\Listeners\OnTaskCompleted::class
        );

        \Illuminate\Support\Facades\Event::listen(
            \App\Modules\Transaction\Domain\Events\TransactionCreated::class,
            \App\Modules\HabitPerformance\Application\Listeners\OnTransactionCreated::class
        );
    }
}
