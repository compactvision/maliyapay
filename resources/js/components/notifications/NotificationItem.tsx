import { Notification } from '@/api/notificationApi';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
    AlertCircle,
    AlertOctagon,
    AlertTriangle,
    Bell,
    Calendar,
    Check,
    Clock,
    Trash2,
} from 'lucide-react';

interface NotificationItemProps {
    notification: Notification;
    
    onMarkAsRead: (id: string) => void;
    onDelete: (id: string) => void;
}

export function NotificationItem({
    notification,
    onMarkAsRead,
    onDelete,
}: NotificationItemProps) {
    const getIcon = () => {
        switch (notification.typeIcon) {
            case 'alert-circle':
                return <AlertCircle className="h-5 w-5 text-red-500" />;
            case 'alert-octagon':
                return <AlertOctagon className="h-5 w-5 text-red-600" />;
            case 'alert-triangle':
                return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            case 'calendar':
                return <Calendar className="h-5 w-5 text-yellow-500" />;
            case 'clock':
                return <Clock className="h-5 w-5 text-blue-500" />;
            default:
                return <Bell className="h-5 w-5 text-gray-400" />;
        }
    };

    const getPriorityBorder = () => {
        switch (notification.priority) {
            case 'high':
                return 'border-l-4 border-l-red-500';
            case 'medium':
                return 'border-l-4 border-l-yellow-500';
            case 'low':
                return 'border-l-4 border-l-blue-500';
            default:
                return '';
        }
    };

    return (
        <div
            className={cn(
                'relative flex gap-4 p-4 transition-colors hover:bg-muted/50',
                !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : '',
                getPriorityBorder(),
            )}
        >
            <div className="mt-1 shrink-0">{getIcon()}</div>

            <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between gap-2">
                    <p
                        className={cn(
                            'text-sm leading-none font-medium',
                            !notification.isRead && 'font-bold',
                        )}
                    >
                        {notification.title}
                    </p>
                    <span className="text-xs whitespace-nowrap text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: fr,
                        })}
                    </span>
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                    {notification.message}
                </p>

                <div className="mt-2 flex items-center gap-2 pt-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {!notification.isRead && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => onMarkAsRead(notification.id)}
                        >
                            <Check className="mr-1 h-3 w-3" />
                            Marquer comme lu
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                        onClick={() => onDelete(notification.id)}
                    >
                        <Trash2 className="mr-1 h-3 w-3" />
                        Supprimer
                    </Button>
                </div>
            </div>

            {!notification.isRead && (
                <div className="absolute top-1/2 right-4 h-2 w-2 -translate-y-1/2 rounded-full bg-blue-500" />
            )}
        </div>
    );
}
