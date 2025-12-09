<?php

declare(strict_types=1);

namespace App\Modules\Routine\Presentation\Resources;

use App\Modules\Routine\Domain\Entities\Routine;
use Illuminate\Http\Resources\Json\JsonResource;

class RoutineResource extends JsonResource
{
    public function __construct(private Routine $routine)
    {
        parent::__construct($routine);
    }

    public function toArray($request): array
    {
        return [
            'id' => $this->routine->id()->toString(),
            'name' => $this->routine->name(),
            'color' => $this->routine->color(),
            'isActive' => $this->routine->isActive(),
            'createdAt' => $this->routine->createdAt()->format('Y-m-d H:i:s'),
            'updatedAt' => $this->routine->updatedAt()->format('Y-m-d H:i:s'),
        ];
    }
}
