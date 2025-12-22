import { UnlockScreen } from '@/components/auth/UnlockScreen';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { LockKeyhole, ShieldAlert } from 'lucide-react';
import { useState } from 'react';

export default function Forbidden() {
    const { isAuthenticated, user } = useAuth();
    const [showUnlock, setShowUnlock] = useState(false);

    return (
        <AppLayout>
            <Head title="Accès refusé" />

            <div className="flex min-h-[70vh] flex-col items-center justify-center p-4 text-center">
                <div className="mb-6 rounded-full bg-red-50 p-6 dark:bg-red-900/20">
                    <ShieldAlert className="h-20 w-20 text-red-600 dark:text-red-400" />
                </div>

                <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl dark:text-gray-100">
                    Accès Interdit
                </h1>

                <p className="mb-8 max-w-md text-lg text-gray-600 dark:text-gray-400">
                    Désolé, vous n'avons pas les permissions nécessaires pour
                    accéder à cette page. Si vous pensez qu'il s'agit d'une
                    erreur, contactez votre administrateur.
                </p>

                <div className="flex flex-col gap-3 sm:flex-row">
                    {isAuthenticated && user?.pin_code_set && (
                        <Button
                            onClick={() => setShowUnlock(true)}
                            size="lg"
                            className="bg-emerald-600 px-8 hover:bg-emerald-700"
                        >
                            <LockKeyhole className="mr-2 h-5 w-5" />
                            Déverrouiller avec PIN
                        </Button>
                    )}
                    <Button
                        asChild
                        size="lg"
                        className="px-8"
                        variant={isAuthenticated ? 'outline' : 'default'}
                    >
                        <Link href="/">Retour au tableau de bord</Link>
                    </Button>
                    {!isAuthenticated && (
                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="px-8"
                        >
                            <Link href="/login">Se connecter</Link>
                        </Button>
                    )}
                </div>
            </div>

            {showUnlock && (
                <UnlockScreen
                    onSuccess={() => {
                        setShowUnlock(false);
                        window.location.reload();
                    }}
                />
            )}
        </AppLayout>
    );
}
