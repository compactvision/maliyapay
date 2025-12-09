<?php

declare(strict_types=1);

namespace App\Modules\Task\Application\Commands;

use App\Modules\Task\Domain\Repositories\TaskRepositoryInterface;
use App\Modules\Task\Domain\ValueObjects\TaskPriority;
use DateTimeImmutable;
use Ramsey\Uuid\Uuid;

class UpdateTaskCommandHandler
{
    public function __construct(
        private TaskRepositoryInterface $taskRepository
    ) {
    }

    public function handle(UpdateTaskCommand $command): void
    {
        $task = $this->taskRepository->findById(Uuid::fromString($command->taskId));

        if (!$task) {
            throw new \DomainException('Task not found');
        }

        if ($task->userId() !== $command->userId) {
            throw new \DomainException('Unauthorized to update this task');
        }

        $task->update(
            title: $command->title,
            description: $command->description,
            priority: TaskPriority::fromString($command->priority),
            dueDate: $command->dueDate ? new DateTimeImmutable($command->dueDate) : null
        );

        $this->taskRepository->save($task);
    }
}
