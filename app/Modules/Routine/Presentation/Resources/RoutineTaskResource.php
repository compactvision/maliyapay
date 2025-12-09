<?php

declare(strict_types=1);

namespace App\Modules\Routine\Presentation\Resources;

use App\Modules\Routine\Domain\Entities\RoutineTask;
use Illuminate\Http\Resources\Json\JsonResource;

class RoutineTaskResource extends JsonResource
{
    public function __construct(private RoutineTask $routineTask)
    {
        parent::__construct($routineTask);
    }

    public function toArray($request): array
    {
        return [
            'id' => $this->routineTask->id()->toString(),
            'routineId' => $this->routineTask->routineId()->toString(),
            'title' => $this->routineTask->title(),
            'description' => $this->routineTask->description(),
            'dayOfWeek' => $this->routineTask->dayOfWeek()->value,
            'dayLabel' => $this->routineTask->dayOfWeek()->label(),
            'dayShortLabel' => $this->routineTask->dayOfWeek()->shortLabel(),
            'timeStart' => $this->routineTask->timeRange()->formatStart(),
            'timeEnd' => $this->routineTask->timeRange()->formatEnd(),
            'timeRange' => $this->routineTask->timeRange()->toString(),
            'priority' => $this->routineTask->priority()->value,
            'orderIndex' => $this->routineTask->orderIndex(),
            'createdAt' => $this->routineTask->createdAt()->format('Y-m-d H:i:s'),
            'updatedAt' => $this->routineTask->updatedAt()->format('Y-m-d H:i:s'),
        ];
    }
}
