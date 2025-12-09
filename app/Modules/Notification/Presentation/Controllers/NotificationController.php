<?php

namespace App\Modules\Notification\Presentation\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Notification\Application\Commands\CreateNotificationCommand;
use App\Modules\Notification\Application\Commands\CreateNotificationCommandHandler;
use App\Modules\Notification\Application\Commands\MarkAsReadCommand;
use App\Modules\Notification\Application\Commands\MarkAsReadCommandHandler;
use App\Modules\Notification\Application\Commands\DeleteNotificationCommand;
use App\Modules\Notification\Application\Commands\DeleteNotificationCommandHandler;
use App\Modules\Notification\Application\Queries\GetUserNotificationsQuery;
use App\Modules\Notification\Application\Queries\GetUserNotificationsQueryHandler;
use App\Modules\Notification\Application\Queries\GetUnreadCountQuery;
use App\Modules\Notification\Application\Queries\GetUnreadCountQueryHandler;
use App\Modules\Notification\Presentation\Resources\NotificationResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function __construct(
        private readonly GetUserNotificationsQueryHandler $getUserNotificationsHandler,
        private readonly GetUnreadCountQueryHandler $getUnreadCountHandler,
        private readonly MarkAsReadCommandHandler $markAsReadHandler,
        private readonly DeleteNotificationCommandHandler $deleteHandler,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $unreadOnly = $request->boolean('unread_only', false);

        $query = new GetUserNotificationsQuery($userId, $unreadOnly);
        $notifications = $this->getUserNotificationsHandler->handle($query);

        return response()->json([
            'notifications' => array_map(
                fn($notification) => (new NotificationResource($notification))->toArray($request),
                $notifications
            ),
        ]);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $query = new GetUnreadCountQuery($userId);
        $count = $this->getUnreadCountHandler->handle($query);

        return response()->json([
            'count' => $count,
        ]);
    }

    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $userId = $request->user()->id;

        try {
            $command = new MarkAsReadCommand($id, $userId);
            $this->markAsReadHandler->handle($command);

            return response()->json([
                'message' => 'Notification marquée comme lue',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], $e->getMessage() === 'Unauthorized' ? 403 : 404);
        }
    }

    public function delete(Request $request, string $id): JsonResponse
    {
        $userId = $request->user()->id;

        try {
            $command = new DeleteNotificationCommand($id, $userId);
            $this->deleteHandler->handle($command);

            return response()->json([
                'message' => 'Notification supprimée',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], $e->getMessage() === 'Unauthorized' ? 403 : 404);
        }
    }
}
