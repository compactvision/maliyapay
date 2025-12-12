import { Head } from '@inertiajs/react';

export default function Maintenance() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4 text-center dark:bg-gray-900">
            <Head title="Maintenance" />

            <div className="space-y-4">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">
                    Maintenance en cours
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    Nous mettons à jour l'application pour améliorer votre
                    expérience. <br />
                    Veuillez revenir dans quelques instants.
                </p>
                <div className="pt-8">
                    <svg
                        className="mx-auto h-10 w-10 animate-spin text-blue-600"
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
    );
}
