<?php

declare(strict_types=1);

namespace App\Modules\Routine\Infrastructure\Persistence;

use App\Modules\Routine\Domain\Entities\RoutineTask;
use App\Modules\Routine\Domain\Repositories\RoutineTaskRepositoryInterface;
use App\Modules\Routine\Domain\ValueObjects\DayOfWeek;
use App\Modules\Routine\Domain\ValueObjects\TimeRange;
use App\Modules\Task\Domain\ValueObjects\TaskPriority;
use DateTimeImmutable;
use Illuminate\Support\Facades\DB;
use Ramsey\Uuid\Uuid;
use Ramsey\Uuid\UuidInterface;

class EloquentRoutineTaskRepository implements RoutineTaskRepositoryInterface
{
    public function save(RoutineTask $routineTask): void
    {
        DB::table('routine_tasks')->updateOrInsert(
            ['id' => $routineTask->id()->toString()],
            [
                'routine_id' => $routineTask->routineId()->toString(),
                'title' => $routineTask->title(),
                'description' => $routineTask->description(),
                'day_of_week' => $routineTask->dayOfWeek()->value,
                'time_start' => $routineTask->timeRange()->formatStart(),
                'time_end' => $routineTask->timeRange()->formatEnd(),
                'priority' => $routineTask->priority()->value,
                'order_index' => $routineTask->orderIndex(),
                'xp' => $routineTask->xp(),
                'created_at' => $routineTask->createdAt()->format('Y-m-d H:i:s'),
                'updated_at' => $routineTask->updatedAt()->format('Y-m-d H:i:s'),
            ]
        );
    }

    public function findById(UuidInterface $id): ?RoutineTask
    {
        $row = DB::table('routine_tasks')
            ->where('id', $id->toString())
            ->first();

        if (!$row) {
            return null;
        }

        return $this->hydrate($row);
    }

    public function findByRoutineId(UuidInterface $routineId): array
    {
        $rows = DB::table('routine_tasks')
            ->where('routine_id', $routineId->toString())
            ->orderBy('day_of_week', 'ASC')
            ->orderBy('order_index', 'ASC')
            ->get();

        return $rows->map(fn($row) => $this->hydrate($row))->all();
    }

    public function findByDayOfWeek(int $userId, DayOfWeek $dayOfWeek): array
    {
        return $this->findByUserIdAndDayOfWeek($userId, $dayOfWeek);
    }

    public function findByUserIdAndDayOfWeek(int $userId, DayOfWeek $dayOfWeek): array
    {
        $rows = DB::table('routine_tasks')
            ->join('routines', 'routine_tasks.routine_id', '=', 'routines.id')
            ->where('routines.user_id', $userId)
            ->where('routines.is_active', true)
            ->where('routine_tasks.day_of_week', $dayOfWeek->value)
            ->select('routine_tasks.*')
            ->orderBy('routine_tasks.order_index', 'ASC')
            ->get();

        return $rows->map(fn($row) => $this->hydrate($row))->all();
    }

    public function delete(UuidInterface $id): void
    {
        DB::table('routine_tasks')
            ->where('id', $id->toString())
            ->delete();
    }

    public function deleteByRoutineId(UuidInterface $routineId): void
    {
        DB::table('routine_tasks')
            ->where('routine_id', $routineId->toString())
            ->delete();
    }

    private function hydrate(object $row): RoutineTask
    {
        return RoutineTask::reconstitute(
            id: Uuid::fromString($row->id),
            routineId: Uuid::fromString($row->routine_id),
            title: $row->title,
            description: $row->description,
            dayOfWeek: DayOfWeek::fromInt((int) $row->day_of_week),
            timeRange: TimeRange::create($row->time_start, $row->time_end),
            priority: TaskPriority::fromString($row->priority),
            orderIndex: (int) $row->order_index,
            createdAt: new DateTimeImmutable($row->created_at),
            updatedAt: new DateTimeImmutable($row->updated_at),
            xp: (int) ($row->xp ?? 0)
        );
    }
}
