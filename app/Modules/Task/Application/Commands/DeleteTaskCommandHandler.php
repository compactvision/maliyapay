<?php

declare(strict_types=1);

namespace App\Modules\Task\Application\Commands;

use App\Modules\Task\Domain\Repositories\TaskRepositoryInterface;
use Ramsey\Uuid\Uuid;

class DeleteTaskCommandHandler
{
    public function __construct(
        private TaskRepositoryInterface $taskRepository
    ) {
    }

    public function handle(DeleteTaskCommand $command): void
    {
        $task = $this->taskRepository->findById(Uuid::fromString($command->taskId));

        if (!$task) {
            throw new \DomainException('Task not found');
        }

        if ($task->userId() !== $command->userId) {
            throw new \DomainException('Unauthorized to delete this task');
        }

        $this->taskRepository->delete($task->id());
    }
}
