<?php

declare(strict_types=1);

namespace App\Modules\Routine\Infrastructure\Persistence;

use App\Modules\Routine\Domain\Entities\Routine;
use App\Modules\Routine\Domain\Repositories\RoutineRepositoryInterface;
use DateTimeImmutable;
use Illuminate\Support\Facades\DB;
use Ramsey\Uuid\Uuid;
use Ramsey\Uuid\UuidInterface;

class EloquentRoutineRepository implements RoutineRepositoryInterface
{
    public function save(Routine $routine): void
    {
        DB::table('routines')->updateOrInsert(
            ['id' => $routine->id()->toString()],
            [
                'user_id' => $routine->userId(),
                'name' => $routine->name(),
                'color' => $routine->color(),
                'is_active' => $routine->isActive(),
                'created_at' => $routine->createdAt()->format('Y-m-d H:i:s'),
                'updated_at' => $routine->updatedAt()->format('Y-m-d H:i:s'),
            ]
        );
    }

    public function findById(UuidInterface $id): ?Routine
    {
        $row = DB::table('routines')
            ->where('id', $id->toString())
            ->first();

        if (!$row) {
            return null;
        }

        return $this->hydrate($row);
    }

    public function findByUserId(int $userId): array
    {
        $rows = DB::table('routines')
            ->where('user_id', $userId)
            ->orderBy('name', 'ASC')
            ->get();

        return $rows->map(fn($row) => $this->hydrate($row))->all();
    }

    public function findActiveByUserId(int $userId): array
    {
        $rows = DB::table('routines')
            ->where('user_id', $userId)
            ->where('is_active', true)
            ->orderBy('name', 'ASC')
            ->get();

        return $rows->map(fn($row) => $this->hydrate($row))->all();
    }

    public function delete(UuidInterface $id): void
    {
        DB::table('routines')
            ->where('id', $id->toString())
            ->delete();
    }

    public function exists(UuidInterface $id): bool
    {
        return DB::table('routines')
            ->where('id', $id->toString())
            ->exists();
    }

    private function hydrate(object $row): Routine
    {
        return Routine::reconstitute(
            id: Uuid::fromString($row->id),
            userId: (int) $row->user_id,
            name: $row->name,
            color: $row->color,
            isActive: (bool) $row->is_active,
            createdAt: new DateTimeImmutable($row->created_at),
            updatedAt: new DateTimeImmutable($row->updated_at)
        );
    }
}
