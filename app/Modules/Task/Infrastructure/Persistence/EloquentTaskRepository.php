<?php

declare(strict_types=1);

namespace App\Modules\Task\Infrastructure\Persistence;

use App\Modules\Task\Domain\Entities\Task;
use App\Modules\Task\Domain\Repositories\TaskRepositoryInterface;
use App\Modules\Task\Domain\ValueObjects\TaskPriority;
use DateTimeImmutable;
use Illuminate\Support\Facades\DB;
use Ramsey\Uuid\Uuid;
use Ramsey\Uuid\UuidInterface;

class EloquentTaskRepository implements TaskRepositoryInterface
{
    public function save(Task $task): void
    {
        DB::table('tasks')->updateOrInsert(
            ['id' => $task->id()->toString()],
            [
                'user_id' => $task->userId(),
                'title' => $task->title(),
                'description' => $task->description(),
                'priority' => $task->priority()->value,
                'due_date' => $task->dueDate()?->format('Y-m-d'),
                'completed' => $task->completed(),
                'xp' => $task->xp(),
                'created_at' => $task->createdAt()->format('Y-m-d H:i:s'),
                'updated_at' => $task->updatedAt()->format('Y-m-d H:i:s'),
            ]
        );
    }

    public function findById(UuidInterface $id): ?Task
    {
        $row = DB::table('tasks')
            ->where('id', $id->toString())
            ->first();

        if (!$row) {
            return null;
        }

        return $this->hydrate($row);
    }

    public function findByUserId(int $userId): array
    {
        $rows = DB::table('tasks')
            ->where('user_id', $userId)
            ->orderByRaw('completed ASC')
            ->orderByRaw('CASE WHEN due_date IS NULL THEN 1 ELSE 0 END')
            ->orderBy('due_date', 'ASC')
            ->orderBy('created_at', 'DESC')
            ->get();

        return $rows->map(fn($row) => $this->hydrate($row))->all();
    }

    public function delete(UuidInterface $id): void
    {
        DB::table('tasks')
            ->where('id', $id->toString())
            ->delete();
    }

    public function exists(UuidInterface $id): bool
    {
        return DB::table('tasks')
            ->where('id', $id->toString())
            ->exists();
    }

    private function hydrate(object $row): Task
    {
        return Task::reconstitute(
            id: Uuid::fromString($row->id),
            userId: $row->user_id,
            title: $row->title,
            description: $row->description,
            priority: TaskPriority::fromString($row->priority),
            dueDate: $row->due_date ? new DateTimeImmutable($row->due_date) : null,
            completed: (bool) $row->completed,
            createdAt: new DateTimeImmutable($row->created_at),
            updatedAt: new DateTimeImmutable($row->updated_at),
            xp: (int) ($row->xp ?? 0)
        );
    }

    public function findAllActive(): array
    {
        $rows = DB::table('tasks')
            ->where('completed', false)
            ->whereNotNull('due_date')
            ->orderBy('due_date', 'ASC')
            ->get();

        return $rows->map(fn($row) => $this->hydrate($row))->all();
    }

    public function findByUserIdAndDateRange(int $userId, \DateTimeInterface $startDate, \DateTimeInterface $endDate): array
    {
        $rows = DB::table('tasks')
            ->where('user_id', $userId)
            ->whereBetween('due_date', [
                $startDate->format('Y-m-d'),
                $endDate->format('Y-m-d')
            ])
            ->orderBy('due_date', 'ASC')
            ->get();

        return $rows->map(fn($row) => $this->hydrate($row))->all();
    }

    public function findByRoutineTaskAndDate(UuidInterface $routineTaskId, \DateTimeInterface $date): array
    {
        $rows = DB::table('tasks')
            ->where('routine_task_id', $routineTaskId->toString())
            ->where('due_date', $date->format('Y-m-d'))
            ->get();

        return $rows->map(fn($row) => $this->hydrate($row))->all();
    }

    public function linkToRoutineTask(UuidInterface $taskId, UuidInterface $routineTaskId, \DateTimeInterface $date): void
    {
        DB::table('tasks')
            ->where('id', $taskId->toString())
            ->update([
                'routine_task_id' => $routineTaskId->toString(),
                // due_date is likely already set by creation, but we can ensure it matches or just ignore if consistent
                // 'due_date' => $date->format('Y-m-d'), 
            ]);
    }
}
