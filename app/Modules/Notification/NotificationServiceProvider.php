<?php

namespace App\Modules\Notification;

use App\Modules\Notification\Application\Commands\CreateNotificationCommandHandler;
use App\Modules\Notification\Application\Commands\DeleteNotificationCommandHandler;
use App\Modules\Notification\Application\Commands\MarkAsReadCommandHandler;
use App\Modules\Notification\Application\Queries\GetUnreadCountQueryHandler;
use App\Modules\Notification\Application\Queries\GetUserNotificationsQueryHandler;
use App\Modules\Notification\Domain\Repositories\NotificationRepositoryInterface;
use App\Modules\Notification\Infrastructure\Persistence\EloquentNotificationRepository;
use Illuminate\Support\ServiceProvider;

class NotificationServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Repository
        $this->app->bind(
            NotificationRepositoryInterface::class,
            EloquentNotificationRepository::class
        );

        // Command Handlers
        $this->app->bind(CreateNotificationCommandHandler::class, function ($app) {
            return new CreateNotificationCommandHandler(
                $app->make(NotificationRepositoryInterface::class)
            );
        });

        $this->app->bind(MarkAsReadCommandHandler::class, function ($app) {
            return new MarkAsReadCommandHandler(
                $app->make(NotificationRepositoryInterface::class)
            );
        });

        $this->app->bind(DeleteNotificationCommandHandler::class, function ($app) {
            return new DeleteNotificationCommandHandler(
                $app->make(NotificationRepositoryInterface::class)
            );
        });

        // Query Handlers
        $this->app->bind(GetUserNotificationsQueryHandler::class, function ($app) {
            return new GetUserNotificationsQueryHandler(
                $app->make(NotificationRepositoryInterface::class)
            );
        });

        $this->app->bind(GetUnreadCountQueryHandler::class, function ($app) {
            return new GetUnreadCountQueryHandler(
                $app->make(NotificationRepositoryInterface::class)
            );
        });
    }

    public function boot(): void
    {
        //
    }
}
