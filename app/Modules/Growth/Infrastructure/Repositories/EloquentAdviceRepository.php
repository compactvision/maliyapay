<?php

declare(strict_types=1);

namespace App\Modules\Growth\Infrastructure\Repositories;

use App\Modules\Growth\Domain\Entities\Advice;
use App\Modules\Growth\Domain\Repositories\AdviceRepositoryInterface;
use App\Modules\Growth\Infrastructure\Models\AdviceModel;

class EloquentAdviceRepository implements AdviceRepositoryInterface
{
    public function findAll(): array
    {
        return AdviceModel::orderBy('published_at', 'desc')
            ->get()
            ->map(fn($model) => $this->toDomain($model))
            ->all();
    }

    public function findById(string $id): ?Advice
    {
        $model = AdviceModel::find($id);
        return $model ? $this->toDomain($model) : null;
    }

    public function save(Advice $advice): void
    {
        AdviceModel::updateOrCreate(
            ['id' => $advice->id],
            [
                'title' => $advice->title,
                'summary' => $advice->summary,
                'content' => $advice->content,
                'category' => $advice->category,
                'status' => $advice->status,
                'featured' => $advice->featured,
                'video_url' => $advice->videoUrl,
                'author_name' => $advice->authorName,
                'reading_time_minutes' => $advice->readingTimeMinutes,
                'images' => $advice->images,
                'published_at' => $advice->publishedAt,
            ]
        );
    }

    public function delete(string $id): void
    {
        AdviceModel::destroy($id);
    }

    private function toDomain(AdviceModel $model): Advice
    {
        return new Advice(
            $model->id,
            $model->title,
            $model->summary,
            $model->content,
            $model->category,
            $model->status,
            (bool) $model->featured,
            $model->video_url,
            $model->author_name,
            (int) $model->reading_time_minutes,
            $model->images ?? [],
            $model->published_at,
            $model->created_at,
            $model->updated_at,
        );
    }
}
