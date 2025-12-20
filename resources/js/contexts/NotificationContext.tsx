import { Notification, notificationApi } from '@/api/notificationApi';
import { AuthContext } from '@/contexts/AuthContext';
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    error: string | null;
    fetchNotifications: (unreadOnly?: boolean) => Promise<void>;
    fetchUnreadCount: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    deleteAllNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
    undefined,
);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const authContext = useContext(AuthContext);
    const user = authContext?.user;
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUnreadCount = useCallback(async () => {
        try {
            const count = await notificationApi.getUnreadCount();
            setUnreadCount(count);
        } catch (err) {
            console.error('Failed to fetch unread count', err);
        }
    }, []);

    const fetchNotifications = useCallback(async (unreadOnly = false) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await notificationApi.getAll(unreadOnly);

            // Check for new unread messages logic
            const newCount = await notificationApi.getUnreadCount();

            setUnreadCount((prev) => {
                if (newCount > prev) {
                    try {
                        const audio = new Audio('/sounds/notification.mp3');
                        audio
                            .play()
                            .catch((e) => console.log('Audio play failed', e));
                    } catch (e) {
                        console.error('Audio setup failed', e);
                    }
                }
                return newCount;
            });

            setNotifications(data);
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                    'Erreur lors du chargement des notifications',
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    const markAsRead = useCallback(
        async (id: string) => {
            try {
                // Optimistic update
                setNotifications((prev) =>
                    prev.map((n) =>
                        n.id === id
                            ? {
                                  ...n,
                                  isRead: true,
                                  readAt: new Date().toISOString(),
                              }
                            : n,
                    ),
                );
                setUnreadCount((prev) => Math.max(0, prev - 1));

                await notificationApi.markAsRead(id);
            } catch (err: any) {
                console.error('Error marking as read', err);
                fetchNotifications();
            }
        },
        [fetchNotifications],
    );

    const deleteNotification = useCallback(
        async (id: string) => {
            try {
                // Optimistic update
                const notifToDelete = notifications.find((n) => n.id === id);
                setNotifications((prev) => prev.filter((n) => n.id !== id));

                if (notifToDelete && !notifToDelete.isRead) {
                    setUnreadCount((prev) => Math.max(0, prev - 1));
                }

                await notificationApi.delete(id);
            } catch (err: any) {
                console.error('Error deleting notification', err);
                fetchNotifications();
            }
        },
        [notifications, fetchNotifications],
    );

    const markAllAsRead = useCallback(async () => {
        try {
            setNotifications((prev) =>
                prev.map((n) => ({
                    ...n,
                    isRead: true,
                    readAt: new Date().toISOString(),
                })),
            );
            setUnreadCount(0);
            await notificationApi.markAllAsRead();
        } catch (err) {
            console.error('Error marking all as read', err);
            fetchNotifications();
        }
    }, [fetchNotifications]);

    const deleteAllNotifications = useCallback(async () => {
        try {
            setNotifications([]);
            setUnreadCount(0);
            await notificationApi.deleteAll();
        } catch (err) {
            console.error('Error deleting all notifications', err);
            fetchNotifications();
        }
    }, [fetchNotifications]);

    // Initial fetch and Real-time listener
    useEffect(() => {
        // Initial fetch
        fetchUnreadCount();
        fetchNotifications(); // Initial load of notifications to fill the list

        if (user?.id) {
            console.log(`Listening to App.Models.User.${user.id}`);
            window.Echo.private(`App.Models.User.${user.id}`).listen(
                'NotificationCreated',
                (data: any) => {
                    console.log('Notification received:', data);

                    // Add to list
                    setNotifications((prev) => [data, ...prev]);

                    // Increment unread count
                    setUnreadCount((prev) => {
                        const newCount = prev + 1;

                        // Play sound if enabled
                        if (user.play_notification_sound !== false) {
                            // Default to true if undefined
                            const audio = new Audio('/sounds/notification.mp3');
                            audio
                                .play()
                                .catch((e) =>
                                    console.log('Audio play failed', e),
                                );
                        }

                        return newCount;
                    });
                },
            );

            return () => {
                window.Echo.leave(`App.Models.User.${user.id}`);
            };
        }
    }, [
        user?.id,
        user?.play_notification_sound,
        fetchUnreadCount,
        fetchNotifications,
    ]);

    const value = useMemo(
        () => ({
            notifications,
            unreadCount,
            isLoading,
            error,
            fetchNotifications,
            fetchUnreadCount,
            markAsRead,
            markAllAsRead,
            deleteNotification,
            deleteAllNotifications,
        }),
        [
            notifications,
            unreadCount,
            isLoading,
            error,
            fetchNotifications,
            fetchUnreadCount,
            markAsRead,
            markAllAsRead,
            deleteNotification,
            deleteAllNotifications,
        ],
    );

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotificationContext() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error(
            'useNotificationContext must be used within a NotificationProvider',
        );
    }
    return context;
}
