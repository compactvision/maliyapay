<?php

declare(strict_types=1);

namespace App\Modules\Routine\Domain\Services;

use App\Modules\Routine\Domain\Repositories\RoutineTaskRepositoryInterface;
use App\Modules\Routine\Domain\ValueObjects\DayOfWeek;
use App\Modules\Task\Application\Commands\CreateTaskCommand;
use App\Modules\Task\Application\Commands\CreateTaskCommandHandler;
use App\Modules\Task\Domain\Repositories\TaskRepositoryInterface;
use DateTimeImmutable;

class TaskGeneratorService
{
    public function __construct(
        private RoutineTaskRepositoryInterface $routineTaskRepository,
        private TaskRepositoryInterface $taskRepository,
        private CreateTaskCommandHandler $createTaskHandler
    ) {
    }

    public function generateTasksForToday(int $userId): int
    {
        $today = new DateTimeImmutable();
        $dayOfWeek = DayOfWeek::today();

        return $this->generateTasksForDate($userId, $today, $dayOfWeek);
    }

    public function generateTasksForDate(int $userId, DateTimeImmutable $date, DayOfWeek $dayOfWeek): int
    {
        // Get all routine tasks for this day
        $routineTasks = $this->routineTaskRepository->findByUserIdAndDayOfWeek($userId, $dayOfWeek);

        $generatedCount = 0;

        foreach ($routineTasks as $routineTask) {
            // Check if task already generated for this date
            $existingTasks = $this->taskRepository->findByRoutineTaskAndDate(
                $routineTask->id(),
                $date
            );

            if (!empty($existingTasks)) {
                continue; // Already generated
            }

            // Create task from routine task
            $command = new CreateTaskCommand(
                userId: $userId,
                title: $routineTask->title(),
                description: $routineTask->description(),
                priority: $routineTask->priority()->value,
                dueDate: $date->format('Y-m-d')
            );

            $task = $this->createTaskHandler->handle($command);

            // Link to routine task
            $this->taskRepository->linkToRoutineTask(
                $task->id(),
                $routineTask->id(),
                $date
            );

            $generatedCount++;
        }

        return $generatedCount;
    }
}
