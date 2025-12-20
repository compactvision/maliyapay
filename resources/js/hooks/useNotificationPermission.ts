import { useEffect, useState } from 'react';

export const useNotificationPermission = () => {
    const [permission, setPermission] =
        useState<NotificationPermission>('default');
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        // Check if notifications are supported
        if ('Notification' in window) {
            setIsSupported(true);
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = async (): Promise<NotificationPermission> => {
        if (!isSupported) {
            console.warn('Notifications are not supported in this browser');
            return 'denied';
        }

        try {
            const result = await Notification.requestPermission();
            setPermission(result);
            return result;
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return 'denied';
        }
    };

    const sendNotification = (title: string, options?: NotificationOptions) => {
        if (permission === 'granted' && isSupported) {
            try {
                new Notification(title, options);
            } catch (error) {
                console.error('Error sending notification:', error);
            }
        }
    };

    return {
        permission,
        isSupported,
        requestPermission,
        sendNotification,
    };
};
