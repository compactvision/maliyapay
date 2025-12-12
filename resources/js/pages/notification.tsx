// resources/js/pages/NotificationPage.tsx

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
            
            <div className="mx-auto flex max-w-3xl flex-1 flex-col p-4 sm:p-6 lg:p-8">
                {/* Header Section - Pas de carte, juste du texte */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold tracking-tight">
                        Notifications
                    </h2>
                    <p className="text-muted-foreground">
                        Restez informé de votre activité financière et de vos
                        routines.
                    </p>
                </div>

                {/* Actions Section - Une carte dédiée */}
                <Card className="mb-6 border-0 shadow-sm">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                    <Bell className="h-4 w-4 text-primary" />
                                </span>
                                <span className="font-medium">
                                    {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                                </span>
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                                {unreadCount > 0 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => markAllAsRead()}
                                        className="h-11 text-base"
                                    >
                                        <Check className="mr-2 h-4 w-4" />
                                        <span className="hidden sm:inline">Tout marquer comme lu</span>
                                        <span className="sm:hidden">Marquer lu</span>
                                    </Button>
                                )}
                                {notifications.length > 0 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsDeleteAlertOpen(true)}
                                        className="h-11 text-base text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/20"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        <span className="hidden sm:inline">Tout supprimer</span>
                                        <span className="sm:hidden">Supprimer</span>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 
                  Notifications List Section - Un conteneur qui grandit pour remplir l'espace
                */}
                <div className="flex flex-1 flex-col">
                    <Card className="flex h-full flex-col border-0 shadow-sm">
                        <CardHeader className="border-b px-4 py-4 sm:px-6">
                            <CardTitle className="text-base">
                                Toutes les notifications
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex h-full flex-col p-0">
                            {notifications.length > 0 ? (
                                <div className="divide-y overflow-y-auto">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className="bg-card transition-colors hover:bg-muted/50"
                                        >
                                            <NotificationItem
                                                notification={notification}
                                                onMarkAsRead={markAsRead}
                                                onDelete={deleteNotification}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex h-full flex-1 flex-col items-center justify-center text-center text-muted-foreground">
                                    <Bell className="mb-4 h-12 w-12 opacity-20" />
                                    <p>Aucune notification pour le moment</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
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
                            className="bg-red-600 text-white hover:bg-red-700"
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
        </AppLayout>
    );
}