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
        destroy(route('profile.destroy'), {
            onSuccess: () => toast.success('Compte supprimé.'),
            onError: () => toast.error('Le mot de passe est incorrect.'),
            preserveScroll: true,
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-destructive">Supprimer le compte</CardTitle>
                <CardDescription>
                    Une fois votre compte supprimé, toutes ses ressources et données seront définitivement effacées.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Alert variant="destructive" className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Attention</AlertTitle>
                    <AlertDescription>
                        Cette action est irréversible. Veuillez être certain.
                    </AlertDescription>
                </Alert>

                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="password">Mot de passe</Label>
                        <Input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Entrez votre mot de passe pour confirmer"
                            required
                        />
                    </div>

                    <Button type="submit" variant="destructive" disabled={processing}>
                        {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Supprimer définitivement mon compte
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}