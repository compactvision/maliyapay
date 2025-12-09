<?php

declare(strict_types=1);

namespace App\Modules\Task;

use App\Modules\Task\Application\Commands\CreateTaskCommandHandler;
use App\Modules\Task\Application\Commands\DeleteTaskCommandHandler;
use App\Modules\Task\Application\Commands\ToggleTaskCompletionCommandHandler;
use App\Modules\Task\Application\Commands\UpdateTaskCommandHandler;
use App\Modules\Task\Application\Queries\GetUserTasksQueryHandler;
use App\Modules\Task\Domain\Repositories\TaskRepositoryInterface;
use App\Modules\Task\Infrastructure\Persistence\EloquentTaskRepository;
use Illuminate\Support\ServiceProvider;

class TaskServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Bind Repository
        $this->app->bind(
            TaskRepositoryInterface::class,
            EloquentTaskRepository::class
        );

        // Bind Command Handlers
        $this->app->bind(CreateTaskCommandHandler::class);
        $this->app->bind(UpdateTaskCommandHandler::class);
        $this->app->bind(ToggleTaskCompletionCommandHandler::class);
        $this->app->bind(DeleteTaskCommandHandler::class);

        // Bind Query Handlers
        $this->app->bind(GetUserTasksQueryHandler::class);
    }

    public function boot(): void
    {
        //
    }
}
