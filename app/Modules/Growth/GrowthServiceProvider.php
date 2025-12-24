<?php

declare(strict_types=1);

namespace App\Modules\Growth;

use App\Modules\Growth\Domain\Repositories\AdviceRepositoryInterface;
use App\Modules\Growth\Domain\Repositories\BusinessModelRepositoryInterface;
use App\Modules\Growth\Domain\Repositories\RoutineKitRepositoryInterface;
use App\Modules\Growth\Domain\Repositories\UserBusinessProgressRepositoryInterface;
use App\Modules\Growth\Infrastructure\Repositories\EloquentAdviceRepository;
use App\Modules\Growth\Infrastructure\Repositories\EloquentBusinessModelRepository;
use App\Modules\Growth\Infrastructure\Repositories\EloquentRoutineKitRepository;
use App\Modules\Growth\Infrastructure\Repositories\EloquentUserBusinessProgressRepository;
use App\Modules\Growth\Domain\Services\GrowthService;
use App\Modules\Growth\Domain\Services\RoutineImportService;
use Illuminate\Support\ServiceProvider;

class GrowthServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(AdviceRepositoryInterface::class, EloquentAdviceRepository::class);
        $this->app->bind(RoutineKitRepositoryInterface::class, EloquentRoutineKitRepository::class);
        $this->app->bind(BusinessModelRepositoryInterface::class, EloquentBusinessModelRepository::class);
        $this->app->bind(UserBusinessProgressRepositoryInterface::class, EloquentUserBusinessProgressRepository::class);
        
        $this->app->singleton(GrowthService::class);
        $this->app->singleton(RoutineImportService::class);
    }

    public function boot(): void
    {
        //
    }
}
