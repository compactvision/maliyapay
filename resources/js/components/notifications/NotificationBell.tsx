import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell } from 'lucide-react';
import { useState } from 'react';
import { NotificationPanel } from './NotificationPanel';

export function NotificationBell() {
    const {
        notifications,
        unreadCount,
        isLoading,
        fetchNotifications,
        markAsRead,
        deleteNotification,
    } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open) {
            fetchNotifications();
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-10 w-10"
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 h-2.5 w-2.5 animate-pulse rounded-full bg-red-600 ring-2 ring-background" />
                    )}
                    <span className="sr-only">Notifications</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[380px] p-0" align="end">
                <div className="h-[400px]">
                    <NotificationPanel
                        notifications={notifications}
                        isLoading={isLoading}
                        onMarkAsRead={markAsRead}
                        onDelete={deleteNotification}
                        onClose={() => setIsOpen(false)}
                    />
                </div>
            </PopoverContent>
        </Popover>
    );
}
