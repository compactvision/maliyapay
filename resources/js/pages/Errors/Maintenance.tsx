import { AppLayout } from '@/layouts/AppLayout';
import { Head } from '@inertiajs/react';

interface Props {
    title?: string;
    message?: string;
}

export default function Maintenance({
    title = 'Maintenance en cours',
    message = "Nous mettons à jour l'application pour améliorer votre expérience.\nVeuillez revenir dans quelques instants.",
}: Props) {
    return (
        <AppLayout>
            <Head title={title} />

            <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center">
                <div className="space-y-4">
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">
                        {title}
                    </h1>
                    <p className="text-lg whitespace-pre-line text-gray-600 dark:text-gray-400">
                        {message}
                    </p>
                    <div className="pt-8">
                        <svg
                            className="mx-auto h-12 w-12 animate-spin text-blue-600"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
