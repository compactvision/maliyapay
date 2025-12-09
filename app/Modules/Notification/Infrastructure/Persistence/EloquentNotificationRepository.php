<?php

namespace App\Modules\Notification\Infrastructure\Persistence;

use App\Modules\Notification\Domain\Entities\Notification;
use App\Modules\Notification\Domain\Repositories\NotificationRepositoryInterface;
use App\Modules\Notification\Domain\ValueObjects\NotificationType;
use App\Modules\Notification\Domain\ValueObjects\NotificationPriority;
use Illuminate\Support\Facades\DB;

class EloquentNotificationRepository implements NotificationRepositoryInterface
{
    public function save(Notification $notification): void
    {
        DB::table('notifications')->updateOrInsert(
            ['id' => $notification->getId()],
            [
                'user_id' => $notification->getUserId(),
                'type' => $notification->getType()->value,
                'priority' => $notification->getPriority()->value,
                'title' => $notification->getTitle(),
                'message' => $notification->getMessage(),
                'data' => $notification->getData() ? json_encode($notification->getData()) : null,
                'read_at' => $notification->getReadAt()?->format('Y-m-d H:i:s'),
                'created_at' => $notification->getCreatedAt()?->format('Y-m-d H:i:s') ?? now(),
                'updated_at' => now(),
            ]
        );
    }

    public function findById(string $id): ?Notification
    {
        $row = DB::table('notifications')->where('id', $id)->first();

        return $row ? $this->mapToEntity($row) : null;
    }

    public function findByUserId(int $userId, bool $unreadOnly = false): array
    {
        $query = DB::table('notifications')
            ->where('user_id', $userId);

        if ($unreadOnly) {
            $query->whereNull('read_at');
        }

        $rows = $query->orderByDesc('created_at')->get();

        return array_map(fn($row) => $this->mapToEntity($row), $rows->all());
    }

    public function getUnreadCount(int $userId): int
    {
        return DB::table('notifications')
            ->where('user_id', $userId)
            ->whereNull('read_at')
            ->count();
    }

    public function delete(string $id): void
    {
        DB::table('notifications')->where('id', $id)->delete();
    }

    public function markAsRead(string $id): void
    {
        DB::table('notifications')
            ->where('id', $id)
            ->update(['read_at' => now()]);
    }

    public function markAllAsRead(int $userId): void
    {
        DB::table('notifications')
            ->where('user_id', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }

    public function deleteOldNotifications(int $daysOld = 30): int
    {
        return DB::table('notifications')
            ->where('created_at', '<', now()->subDays($daysOld))
            ->delete();
    }

    private function mapToEntity(object $row): Notification
    {
        return new Notification(
            id: $row->id,
            userId: $row->user_id,
            type: NotificationType::from($row->type),
            priority: NotificationPriority::from($row->priority),
            title: $row->title,
            message: $row->message,
            data: $row->data ? json_decode($row->data, true) : null,
            readAt: $row->read_at ? new \DateTimeImmutable($row->read_at) : null,
            createdAt: new \DateTimeImmutable($row->created_at),
            updatedAt: new \DateTimeImmutable($row->updated_at),
        );
    }
}
