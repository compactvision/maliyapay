<?php

declare(strict_types=1);

namespace App\Modules\Category\Presentation\Resources;

use App\Modules\Category\Application\DTOs\CategoryDTO;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * CategoryResource
 * 
 * API Resource for formatting category responses
 * 
 * @property CategoryDTO $resource
 */
class CategoryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var CategoryDTO $category */
        $category = $this->resource;

        return [
            'id' => $category->id,
            'name' => $category->name,
            'type' => $category->type,
            'color' => $category->color,
            'created_at' => $category->createdAt->format('Y-m-d\TH:i:s.u\Z'),
            'updated_at' => $category->updatedAt->format('Y-m-d\TH:i:s.u\Z'),
        ];
    }
}
