// resources/js/pages/Profile/Partials/DeleteAccountSection.tsx

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { FormEventHandler } from 'react';
import { toast } from 'sonner';

export function DeleteAccountSection() {
    const { data, setData, delete: destroy, processing } = useForm({
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        destroy(route('settings.profile.destroy'), {
            onSuccess: () => toast.success('Compte supprimé.'),
            onError: () => toast.error('Le mot de passe est incorrect.'),
            preserveScroll: true,
        });
    };

    return (
        <Card className="border-red-200/50 dark:border-red-900/50">
            <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400">
                    Supprimer le compte
                </CardTitle>
                <CardDescription>
                    Une fois votre compte supprimé, toutes ses ressources et données seront définitivement effacées.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Alert 
                    variant="destructive" 
                    className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50"
                >
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Attention</AlertTitle>
                    <AlertDescription className="dark:text-red-200">
                        Cette action est irréversible. Veuillez être certain de votre choix.
                    </AlertDescription>
                </Alert>

                <form onSubmit={submit} className="mt-6 space-y-4">
                    <div className="space-y-2 rounded-lg border border-dashed border-red-300/50 p-4 dark:border-red-800/50">
                        <Label htmlFor="password" className="text-red-700 dark:text-red-300">
                            Mot de passe
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Entrez votre mot de passe pour confirmer"
                            className="h-11 text-base border-red-300/50 focus:border-red-500 focus:ring-red-500/20 dark:border-red-800/50 dark:focus:border-red-600" // <-- CORRECTION
                            required
                        />
                    </div>

                    <Button 
                        type="submit" 
                        variant="destructive" 
                        disabled={processing}
                        className="h-11 w-full sm:w-auto bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600" // <-- AMÉLIORATION
                    >
                        {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Supprimer définitivement mon compte
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
