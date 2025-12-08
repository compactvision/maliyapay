import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import axios from 'axios';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthGuard } from './components/auth/AuthGuard';
import { GuestGuard } from './components/auth/GuestGuard';
import { AuthProvider } from './contexts/AuthContext';

// --- Axios Configuration ---
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.withCredentials = true;

axios.interceptors.request.use((config) => {
    // Add CSRF token
    const token = document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute('content');
    if (token) {
        config.headers['X-CSRF-TOKEN'] = token;
    }

    // Add Auth token
    const authToken = localStorage.getItem('auth_token');
    if (authToken) {
        config.headers['Authorization'] = `Bearer ${authToken}`;
    }

    return config;
});

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: async (name) => {
        const page: any = await resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        );

        // Wrap page component with auth guard based on page name
        const Component = page.default;
        const isGuestPage =
            name === 'auth' ||
            name === 'forgot-password' ||
            name === 'reset-password';

        // Special pages that manage their own guards or have specific requirements
        const isSpecialPage = name === 'verify-email';

        // Return new object with wrapped component (can't modify page.default directly)
        if (isGuestPage) {
            // Wrap auth pages with GuestGuard
            return {
                default: (props: any) => (
                    <GuestGuard>
                        <Component {...props} />
                    </GuestGuard>
                ),
            };
        } else if (isSpecialPage) {
            // Don't wrap special pages, they handle their own guards
            return page;
        } else {
            // Wrap all other pages with AuthGuard
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
            <StrictMode>
                <AuthProvider>
                    <App {...props} />
                </AuthProvider>
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});
