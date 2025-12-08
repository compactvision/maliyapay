/**
 * withAuthGuard HOC
 *
 * Higher Order Component to wrap pages with AuthGuard
 */

import { AuthGuard } from './AuthGuard';

export function withAuthGuard<P extends object>(
    Component: React.ComponentType<P>,
): React.FC<P> {
    return function ProtectedComponent(props: P) {
        return (
            <AuthGuard>
                <Component {...props} />
            </AuthGuard>
        );
    };
}
