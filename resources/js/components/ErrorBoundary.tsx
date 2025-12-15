import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    public static getDerivedStateFromError(error: Error): State {
        // Always catch the error and update state to prevent infinite retry loops
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log errors, but handle removeChild specifically
        if (error.message?.includes('removeChild')) {
            console.warn('DOM synchronization error caught by ErrorBoundary');
            // We don't need to do anything else, rendering the fallback will stabilize the tree
            return;
        }
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            // For removeChild errors (which effectively broke the previous render),
            // we can try to render the children again in a fresh state,
            // OR render a fallback.
            // Since the user says "refreshing fails", the app is likely in a bad state.
            // Let's render a minimal UI that allows a clean reload.

            return (
                <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center dark:bg-gray-900">
                    <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Une erreur est survenue
                    </h1>
                    <p className="mb-6 max-w-md text-gray-600 dark:text-gray-400">
                        L'application a rencontré un problème d'affichage.
                    </p>
                    <button
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:outline-none"
                        onClick={() => window.location.reload()}
                    >
                        Recharger l'application
                    </button>
                    <button
                        className="mt-4 rounded-lg px-4 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300"
                        onClick={() => {
                            // Attempt to recover by clearing state/storage if needed,
                            // but for now just hard reload cache
                            window.location.href = window.location.href;
                        }}
                    >
                        Forcer le rechargement
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
