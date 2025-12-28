<?php

declare(strict_types=1);

namespace App\Modules\Task\Application\Commands;

use App\Modules\Task\Domain\Entities\Task;
use App\Modules\Task\Domain\Repositories\TaskRepositoryInterface;
use App\Modules\Task\Domain\ValueObjects\TaskPriority;
use DateTimeImmutable;
use Ramsey\Uuid\Uuid;

class CreateTaskCommandHandler
{
    public function __construct(
        private TaskRepositoryInterface $taskRepository
    ) {
    }

    public function handle(CreateTaskCommand $command): Task
    {
        $task = Task::create(
            id: Uuid::uuid4(),
            userId: $command->userId,
            title: $command->title,
            description: $command->description,
            priority: TaskPriority::fromString($command->priority),
            dueDate: $command->dueDate ? new DateTimeImmutable($command->dueDate) : null,
            xp: $command->xp
        );

        $this->taskRepository->save($task);

        return $task;
    }
}
