import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthGuard } from './components/auth/AuthGuard';
import { GuestGuard } from './components/auth/GuestGuard';

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
        const isAuthPage = name === 'auth' || name === 'auth/register';

        // Return new object with wrapped component (can't modify page.default directly)
        if (isAuthPage) {
            // Wrap auth pages with GuestGuard
            return {
                default: (props: any) => (
                    <GuestGuard>
                        <Component {...props} />
                    </GuestGuard>
                ),
            };
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
                <App {...props} />
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});
