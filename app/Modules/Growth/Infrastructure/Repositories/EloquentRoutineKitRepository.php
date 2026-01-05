<?php

declare(strict_types=1);

namespace App\Modules\Growth\Infrastructure\Repositories;

use App\Modules\Growth\Domain\Entities\RoutineKit;
use App\Modules\Growth\Domain\Entities\RoutineKitTask;
use App\Modules\Growth\Domain\Repositories\RoutineKitRepositoryInterface;
use App\Modules\Growth\Infrastructure\Models\RoutineKitModel;
use App\Modules\Growth\Infrastructure\Models\RoutineKitTaskModel;

class EloquentRoutineKitRepository implements RoutineKitRepositoryInterface
{
    public function findAll(): array
    {
        return RoutineKitModel::with('tasks')
            ->get()
            ->map(fn($model) => $this->toDomain($model))
            ->all();
    }

    public function findById(string $id): ?RoutineKit
    {
        $model = RoutineKitModel::with('tasks')->find($id);
        return $model ? $this->toDomain($model) : null;
    }

    public function save(RoutineKit $kit): void
    {
        $model = RoutineKitModel::updateOrCreate(
            ['id' => $kit->id],
            [
                'name' => $kit->name,
                'description' => $kit->description,
                'category' => $kit->category,
                'color' => $kit->color,
                'status' => $kit->status,
                'is_paid' => $kit->isPaid,
                'price_amount' => $kit->priceAmount,
                'price_currency' => $kit->priceCurrency,
                'images' => $kit->images,
            ]
        );

        // Simple sync for tasks (delete and recreate for simplicity in this MVP)
        $model->tasks()->delete();
        foreach ($kit->tasks as $task) {
            RoutineKitTaskModel::create([
                'id' => $task->id,
                'kit_id' => $model->id,
                'title' => $task->title,
                'description' => $task->description,
                'order_index' => $task->orderIndex,
                'day_of_week' => $task->dayOfWeek,
                'time_start' => $task->timeStart,
                'time_end' => $task->timeEnd,
                'priority' => $task->priority,
                'xp' => $task->xp,
            ]);
        }
    }

    public function delete(string $id): void
    {
        RoutineKitModel::destroy($id);
    }

    private function toDomain(RoutineKitModel $model): RoutineKit
    {
        $tasks = $model->tasks->map(function ($taskModel) {
            return new RoutineKitTask(
                $taskModel->id,
                $taskModel->kit_id,
                $taskModel->title,
                $taskModel->description,
                (int) $taskModel->order_index,
                $taskModel->day_of_week,
                $taskModel->time_start,
                $taskModel->time_end,
                $taskModel->priority,
                (int) $taskModel->xp,
            );
        })->all();

        return new RoutineKit(
            $model->id,
            $model->name,
            $model->description,
            $model->category,
            $model->color,
            $model->status,
            (bool) $model->is_paid,
            $model->price_amount ? (float) $model->price_amount : null,
            $model->price_currency,
            $model->images ?? [],
            $tasks
        );
    }
}
