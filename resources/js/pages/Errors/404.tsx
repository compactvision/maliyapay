import { Button } from '@/components/ui/button';
import { AppLayout } from '@/layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
    return (
        <AppLayout>
            <Head title="Page non trouvée" />

            <div className="flex min-h-[70vh] flex-col items-center justify-center p-4 text-center">
                <div className="mb-6 rounded-full bg-blue-50 p-6 dark:bg-blue-900/20">
                    <FileQuestion className="h-20 w-20 text-blue-600 dark:text-blue-400" />
                </div>

                <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl dark:text-gray-100">
                    Oups ! Lien erroné
                </h1>

                <p className="mb-8 max-w-md text-lg text-gray-600 dark:text-gray-400">
                    Désolé, nous n'avons pas pu trouver la page que vous
                    cherchez. Il est possible qu'elle ait été déplacée ou
                    supprimée.
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
                        <Link href={route('settings.index')}>Paramètres</Link>
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
