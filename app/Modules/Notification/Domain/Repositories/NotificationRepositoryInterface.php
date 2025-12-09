<?php

namespace App\Modules\Notification\Domain\Repositories;

use App\Modules\Notification\Domain\Entities\Notification;

interface NotificationRepositoryInterface
{
    public function save(Notification $notification): void;
    
    public function findById(string $id): ?Notification;
    
    public function findByUserId(int $userId, bool $unreadOnly = false): array;
    
    public function getUnreadCount(int $userId): int;
    
    public function delete(string $id): void;
    
    public function markAsRead(string $id): void;
    
    public function markAllAsRead(int $userId): void;
    
    public function deleteOldNotifications(int $daysOld = 30): int;
}
