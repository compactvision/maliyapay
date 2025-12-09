<?php

declare(strict_types=1);

namespace App\Modules\Task\Application\Queries;

use App\Modules\Task\Domain\Repositories\TaskRepositoryInterface;

class GetUserTasksQueryHandler
{
    public function __construct(
        private TaskRepositoryInterface $taskRepository
    ) {
    }

    public function handle(GetUserTasksQuery $query): array
    {
        return $this->taskRepository->findByUserId($query->userId);
    }
}
