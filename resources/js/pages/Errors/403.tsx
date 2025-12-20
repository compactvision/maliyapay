import { Button } from '@/components/ui/button';
import { AppLayout } from '@/layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { ShieldAlert } from 'lucide-react';

export default function Forbidden() {
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
                    <Button asChild size="lg" className="px-8">
                        <Link href="/">Retour au tableau de bord</Link>
                    </Button>
                    <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="px-8"
                    >
                        <Link href="/">Acceuil</Link>
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
