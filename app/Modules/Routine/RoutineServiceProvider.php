<?php

declare(strict_types=1);

namespace App\Modules\Routine;

use App\Modules\Routine\Application\Commands\CreateRoutineCommandHandler;
use App\Modules\Routine\Application\Commands\CreateRoutineTaskCommandHandler;
use App\Modules\Routine\Application\Commands\DeleteRoutineCommandHandler;
use App\Modules\Routine\Application\Commands\DeleteRoutineTaskCommandHandler;
use App\Modules\Routine\Application\Commands\ToggleRoutineActiveCommandHandler;
use App\Modules\Routine\Application\Commands\UpdateRoutineCommandHandler;
use App\Modules\Routine\Application\Commands\UpdateRoutineTaskCommandHandler;
use App\Modules\Routine\Application\Queries\GetRoutineTasksForDayQueryHandler;
use App\Modules\Routine\Application\Queries\GetRoutineTasksQueryHandler;
use App\Modules\Routine\Application\Queries\GetUserRoutinesQueryHandler;
use App\Modules\Routine\Domain\Repositories\RoutineRepositoryInterface;
use App\Modules\Routine\Domain\Repositories\RoutineTaskRepositoryInterface;
use App\Modules\Routine\Domain\Services\TaskGeneratorService;
use App\Modules\Routine\Infrastructure\Persistence\EloquentRoutineRepository;
use App\Modules\Routine\Infrastructure\Persistence\EloquentRoutineTaskRepository;
use Illuminate\Support\ServiceProvider;

class RoutineServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Bind Repositories
        $this->app->bind(
            RoutineRepositoryInterface::class,
            EloquentRoutineRepository::class
        );

        $this->app->bind(
            RoutineTaskRepositoryInterface::class,
            EloquentRoutineTaskRepository::class
        );

        // Bind Command Handlers
        $this->app->bind(CreateRoutineCommandHandler::class);
        $this->app->bind(UpdateRoutineCommandHandler::class);
        $this->app->bind(DeleteRoutineCommandHandler::class);
        $this->app->bind(ToggleRoutineActiveCommandHandler::class);
        $this->app->bind(CreateRoutineTaskCommandHandler::class);
        $this->app->bind(UpdateRoutineTaskCommandHandler::class);
        $this->app->bind(DeleteRoutineTaskCommandHandler::class);

        // Bind Query Handlers
        $this->app->bind(GetUserRoutinesQueryHandler::class);
        $this->app->bind(GetRoutineTasksForDayQueryHandler::class);
        $this->app->bind(GetRoutineTasksQueryHandler::class);

        // Bind Services
        $this->app->bind(TaskGeneratorService::class);
    }

    public function boot(): void
    {
        //
    }
}
