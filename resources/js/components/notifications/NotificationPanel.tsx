import { Notification } from '@/api/notificationApi';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, CheckCheck } from 'lucide-react';
import { NotificationItem } from './NotificationItem';
import { router } from '@inertiajs/react';

interface NotificationPanelProps {
    notifications: Notification[];
    isLoading: boolean;
    onMarkAsRead: (id: string) => void;
    onDelete: (id: string) => void;
    onClose: () => void;
}

export function NotificationPanel({
    notifications,
    isLoading,
    onMarkAsRead,
    onDelete,
    onClose,
}: NotificationPanelProps) {
    const hasUnread = notifications.some((n) => !n.isRead);

    return (
        <div className="flex h-full w-full flex-col">
            <div className="flex items-center justify-between border-b p-4">
                <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    <h2 className="font-semibold">Notifications</h2>
                </div>
                {hasUnread && (
                    <Button variant="ghost" size="sm" className="h-8 text-xs">
                        <CheckCheck className="mr-1 h-3 w-3" />
                        Tout marquer comme lu
                    </Button>
                )}
            </div>

            <ScrollArea className="flex-1">
                {isLoading ? (
                    <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                        Chargement...
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex h-[300px] flex-col items-center justify-center gap-2 text-muted-foreground">
                        <Bell className="h-8 w-8 opacity-20" />
                        <p className="text-sm">Aucune notification</p>
                    </div>
                ) : (
                    <div className="group divide-y">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className="group-hover:opacity-100"
                            >
                                <NotificationItem
                                    notification={notification}
                                    onMarkAsRead={onMarkAsRead}
                                    onDelete={onDelete}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>

            <div className="border-t p-2">
                <Button
                    variant="ghost"
                    className="w-full justify-center text-sm"
                    onClick={() => {
                        router.visit(route('notification'));
                    }}
                >
                    Voir toutes les notifications
                </Button>
            </div>
        </div>
    );
}
