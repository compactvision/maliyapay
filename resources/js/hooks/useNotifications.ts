import { Notification, notificationApi } from '@/api/notificationApi';
import { useCallback, useEffect, useState } from 'react';

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchNotifications = useCallback(async (unreadOnly = false) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await notificationApi.getAll(unreadOnly);

            // Check for new unread messages compared to previous state to play sound
            // This logic is simple: if unread count increases, play sound.
            // But here we set notifications first.

            // Better approach: Get unread count. If it's higher than current, play sound.
            const newCount = await notificationApi.getUnreadCount();

            setUnreadCount((prev) => {
                if (newCount > prev) {
                    // Play sound
                    try {
                        const audio = new Audio('/sounds/notification.mp3'); // Assurez-vous d'avoir ce fichier
                        // Fallback si le fichier n'existe pas, on utilise une URL publique ou data URI
                        // Pour la démo, utilisons un bip simple si pas de fichier
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

    const fetchUnreadCount = useCallback(async () => {
        try {
            const count = await notificationApi.getUnreadCount();
            setUnreadCount(count);
        } catch (err) {
            console.error('Failed to fetch unread count', err);
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
                // Revert on error (could typically be ignored for read status but good practice)
                console.error('Error marking as read', err);
                // Re-fetch to sync
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
            // Optimistic update
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
            // Optimistic update
            setNotifications([]);
            setUnreadCount(0);
            await notificationApi.deleteAll();
        } catch (err) {
            console.error('Error deleting all notifications', err);
            fetchNotifications();
        }
    }, [fetchNotifications]);

    // Initial fetch and Polling
    useEffect(() => {
        fetchUnreadCount();

        // Poll every 30 seconds
        const intervalId = setInterval(() => {
            fetchUnreadCount();
            // Optionally fetch recent notifications if panel is open?
            // For now, just badge count is enough to alert user.
        }, 30000);

        return () => clearInterval(intervalId);
    }, [fetchUnreadCount]);

    return {
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
    };
}
