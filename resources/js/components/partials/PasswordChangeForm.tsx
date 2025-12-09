// resources/js/pages/Profile/Partials/PasswordChangeForm.tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { FormEventHandler } from 'react';
import { toast } from 'sonner';

export function PasswordChangeForm() {
    const { data, setData, patch, processing, errors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('password.update'), {
            onSuccess: () => {
                toast.success('Mot de passe mis à jour avec succès !');
                reset('password', 'password_confirmation');
            },
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Mettre à jour le mot de passe</CardTitle>
                <CardDescription>
                    Assurez-vous que votre compte utilise un mot de passe long et aléatoire pour rester en sécurité.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="current_password">Mot de passe actuel</Label>
                        <Input
                            id="current_password"
                            type="password"
                            value={data.current_password}
                            onChange={(e) => setData('current_password', e.target.value)}
                            required
                            autoComplete="current-password"
                        />
                        {errors.current_password && <p className="text-sm text-destructive">{errors.current_password}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Nouveau mot de passe</Label>
                        <Input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                        {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirmer le mot de passe</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    <Button type="submit" disabled={processing}>
                        {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Enregistrer le mot de passe
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}