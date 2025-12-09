import axios from 'axios';

export interface Notification {
    id: string;
    type: string;
    typeLabel: string;
    typeIcon: string;
    typeColor: string;
    priority: string;
    priorityLabel: string;
    title: string;
    message: string;
    data: any;
    isRead: boolean;
    readAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface NotificationsResponse {
    notifications: Notification[];
}

export interface UnreadCountResponse {
    count: number;
}

export const notificationApi = {
    getAll: async (unreadOnly = false): Promise<Notification[]> => {
        const response = await axios.get<NotificationsResponse>(
            '/api/notifications',
            {
                params: { unread_only: unreadOnly },
            },
        );
        return response.data.notifications;
    },

    getUnreadCount: async (): Promise<number> => {
        const response = await axios.get<UnreadCountResponse>(
            '/api/notifications/unread-count',
        );
        return response.data.count;
    },

    markAsRead: async (id: string): Promise<void> => {
        await axios.post(`/api/notifications/${id}/mark-as-read`);
    },

    delete: async (id: string): Promise<void> => {
        await axios.delete(`/api/notifications/${id}`);
    },

    markAllAsRead: async (): Promise<void> => {
        await axios.post('/api/notifications/mark-all-as-read');
    },

    deleteAll: async (): Promise<void> => {
        await axios.delete('/api/notifications/delete-all');
    },
};
