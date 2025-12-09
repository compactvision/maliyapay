import { NotificationItem } from '@/components/notifications/NotificationItem';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotifications } from '@/hooks/useNotifications';
import { AppLayout } from '@/layouts/AppLayout';
import { Head } from '@inertiajs/react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function NotificationPage() {
    const {
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications,
        fetchNotifications,
    } = useNotifications();

    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    if (isLoading) {
        return (
            <AppLayout>
                <Head title="Notifications" />
                <div className="flex h-64 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title="Notifications" />

            <div className="mx-auto max-w-3xl space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        Notifications
                    </h2>
                    <p className="text-muted-foreground">
                        Restez informé de votre activité financière et de vos
                        routines.
                    </p>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                            <Bell className="h-4 w-4 text-primary" />
                        </span>
                        <span className="font-medium">
                            {unreadCount} non lues
                        </span>
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAllAsRead()}
                            className="gap-2"
                        >
                            <Check className="h-3.5 w-3.5" />
                            Tout marquer comme lu
                        </Button>
                    )}
                    {notifications.length > 0 && (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsDeleteAlertOpen(true)}
                                className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/20"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                Tout supprimer
                            </Button>

                            <AlertDialog
                                open={isDeleteAlertOpen}
                                onOpenChange={setIsDeleteAlertOpen}
                            >
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Tout supprimer ?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Cette action est irréversible.
                                            Toutes les notifications seront
                                            définitivement supprimées.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>
                                            Annuler
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                                            onClick={() => {
                                                deleteAllNotifications();
                                                setIsDeleteAlertOpen(false);
                                            }}
                                        >
                                            Supprimer
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </>
                    )}
                </div>

                <Card>
                    <CardHeader className="border-b px-6 py-4">
                        <CardTitle className="text-base">
                            Toutes les notifications
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {notifications.length > 0 ? (
                            <div className="divide-y">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className="bg-card transition-colors hover:bg-muted/50"
                                    >
                                        <NotificationItem
                                            notification={notification}
                                            onRead={markAsRead}
                                            onDelete={deleteNotification}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                <Bell className="mb-4 h-12 w-12 opacity-20" />
                                <p>Aucune notification pour le moment</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
