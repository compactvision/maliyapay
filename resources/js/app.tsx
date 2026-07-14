import '../css/app.css';

import { createInertiaApp, router } from '@inertiajs/react';
import axios from 'axios';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { toast } from 'sonner';
import { AuthGuard } from './components/auth/AuthGuard';
import { GuestGuard } from './components/auth/GuestGuard';
import ErrorBoundary from './components/ErrorBoundary';
import { LayoutProvider } from './components/LayoutComponents';
import { Toaster } from './components/ui/sonner';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { QuickActionProvider } from './contexts/QuickActionContext';

// --- Axios Configuration ---
window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.withCredentials = true;

axios.interceptors.request.use((config) => {
    // Add CSRF token from cookie if meta tag is stale
    const xsrfToken = document.cookie
        .split('; ')
        .find((row) => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];

    if (xsrfToken) {
        config.headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
    } else {
        const token = document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content');
        if (token) {
            config.headers['X-CSRF-TOKEN'] = token;
        }
    }

    // Add Auth token
    const authToken = localStorage.getItem('auth_token');
    if (authToken) {
        config.headers['Authorization'] = `Bearer ${authToken}`;
    }

    return config;
});

axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 403) {
            const isGet = error.config?.method?.toLowerCase() === 'get';
            if (!isGet) {
                toast.error(
                    "Vous n'êtes pas autorisé à effectuer cette action",
                    {
                        description:
                            "Veuillez contacter un administrateur si vous pensez qu'il s'agit d'une erreur.",
                    },
                );
            }
        }
        return Promise.reject(error);
    },
);

// --- Inertia Global Listeners ---
router.on('invalid', (event) => {
    if (event.detail.response.status === 403) {
        event.preventDefault();
        toast.error("Vous n'êtes pas autorisé à effectuer cette action", {
            description:
                "Veuillez contacter un administrateur si vous pensez qu'il s'agit d'une erreur.",
        });
    }
});

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

import { OnboardingOverlay } from './components/onboarding/OnboardingOverlay';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: async (name) => {
        const page: any = await resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        );

        const Component = page.default;
        const isGuestPage =
            name === 'auth' ||
            name === 'forgot-password' ||
            name === 'reset-password' ||
            name === 'auth/login' ||
            name === 'auth/register' ||
            name === 'auth/forgot-password' ||
            name === 'auth/reset-password' ||
            name === 'auth/two-factor-challenge';

        const isPublicPage = name === 'verify-email' || name === 'privacy';

        if (isGuestPage) {
            return {
                default: (props: any) => (
                    <GuestGuard>
                        <Component {...props} />
                    </GuestGuard>
                ),
            };
        } else if (isPublicPage) {
            return page;
        } else {
            return {
                default: (props: any) => (
                    <AuthGuard>
                        <Component {...props} />
                    </AuthGuard>
                ),
            };
        }
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <ErrorBoundary>
                <AuthProvider
                    initialAuth={(props as any).initialPage.props.auth}
                >
                    <NotificationProvider>
                        <QuickActionProvider>
                            <LayoutProvider>
                                <App {...props} />
                                <Toaster />
                                <OnboardingOverlay />
                            </LayoutProvider>
                        </QuickActionProvider>
                    </NotificationProvider>
                </AuthProvider>
            </ErrorBoundary>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// PWA Service Worker Registration
import { registerSW } from 'virtual:pwa-register';
import './echo';

if ('serviceWorker' in navigator) {
    registerSW({
        immediate: true,
        onNeedRefresh() {
            // Check for updates
        },
        onOfflineReady() {
            // Ready for offline
        },
    });
}
