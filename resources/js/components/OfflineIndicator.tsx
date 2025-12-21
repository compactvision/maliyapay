import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';

export const OfflineIndicator = () => {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [showWarning, setShowWarning] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOffline(false);
            setShowWarning(false);
        };
        const handleOffline = () => {
            setIsOffline(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Listen for service worker messages (e.g. when networkTimeout happens)
        // Note: This is a bit more complex to catch specifically from workbox here
        // without custom SW logic, but we can detect if a page load was slow or failed.

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!isOffline && !showWarning) return null;

    return (
        <div className="fixed top-0 right-0 left-0 z-[100] animate-in duration-300 fade-in slide-in-from-top">
            <div
                className={`flex items-center justify-center gap-3 px-4 py-2 text-sm font-medium text-white shadow-lg ${isOffline ? 'bg-red-600' : 'bg-amber-500'}`}
            >
                {isOffline ? (
                    <>
                        <WifiOff className="h-4 w-4" />
                        <span>
                            Vous êtes hors ligne. Certaines fonctionnalités
                            peuvent être limitées.
                        </span>
                    </>
                ) : (
                    <>
                        <AlertCircle className="h-4 w-4" />
                        <span>
                            Connexion lente. Affichage du contenu mis en cache.
                        </span>
                        <button
                            onClick={() => window.location.reload()}
                            className="ml-2 flex items-center gap-1 rounded bg-white/20 px-2 py-0.5 transition-colors hover:bg-white/30"
                        >
                            <RefreshCw className="h-3 w-3" />
                            Actualiser
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};
