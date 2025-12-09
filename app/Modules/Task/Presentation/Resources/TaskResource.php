<?php

declare(strict_types=1);

namespace App\Modules\Task\Presentation\Resources;

use App\Modules\Task\Domain\Entities\Task;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    public function __construct(private Task $task)
    {
        parent::__construct($task);
    }

    public function toArray($request): array
    {
        return [
            'id' => $this->task->id()->toString(),
            'title' => $this->task->title(),
            'description' => $this->task->description(),
            'priority' => $this->task->priority()->value,
            'dueDate' => $this->task->dueDate()?->format('Y-m-d'),
            'completed' => $this->task->completed(),
            'isOverdue' => $this->task->isOverdue(),
            'createdAt' => $this->task->createdAt()->format('Y-m-d H:i:s'),
            'updatedAt' => $this->task->updatedAt()->format('Y-m-d H:i:s'),
        ];
    }
}
