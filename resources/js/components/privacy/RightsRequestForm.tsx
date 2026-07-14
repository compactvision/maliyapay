import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { CheckCircle2, Loader2, LockKeyhole, Send } from 'lucide-react';
import { FormEvent, useEffect } from 'react';

export type PrivacyRequestType =
    | 'contact'
    | 'access'
    | 'export'
    | 'deletion'
    | 'rectification'
    | 'restriction'
    | 'objection';

interface RightsRequestFormProps {
    contactEmail: string;
    initialName: string;
    initialEmail: string;
    selectedType: PrivacyRequestType;
    requestReceived?: { reference: string; type: string } | null;
}

const requestLabels: Record<PrivacyRequestType, string> = {
    contact: 'Question générale',
    access: 'Accéder à mes données',
    export: 'Télécharger / exporter mes données',
    deletion: 'Supprimer mon compte et mes données',
    rectification: 'Rectifier mes données',
    restriction: 'Limiter le traitement',
    objection: "M'opposer à un traitement",
};

export function RightsRequestForm({
    contactEmail,
    initialName,
    initialEmail,
    selectedType,
    requestReceived,
}: RightsRequestFormProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: initialName,
        email: initialEmail,
        request_type: selectedType,
        message: '',
        confirmation: false,
        website: '',
    });

    useEffect(() => {
        setData('request_type', selectedType);
    }, [selectedType, setData]);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        post('/privacy/requests', {
            preserveScroll: true,
            onSuccess: () => reset('message', 'confirmation'),
        });
    };

    if (requestReceived) {
        return (
            <div
                className="rounded-3xl border border-emerald-200 bg-emerald-50 p-7 text-center sm:p-10"
                role="status"
            >
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
                <h3 className="mt-4 text-xl font-semibold text-emerald-950">
                    Votre demande a bien été enregistrée
                </h3>
                <p className="mt-2 text-emerald-800">
                    Référence <strong>{requestReceived.reference}</strong>.
                    Conservez-la pour tout suivi avec {contactEmail}.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={submit} className="grid gap-5" noValidate>
            <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="privacy-name">Nom complet</Label>
                    <Input
                        id="privacy-name"
                        autoComplete="name"
                        value={data.name}
                        onChange={(event) =>
                            setData('name', event.target.value)
                        }
                        aria-invalid={Boolean(errors.name)}
                        className="h-12 bg-white"
                        required
                    />
                    {errors.name && (
                        <p className="text-sm text-red-600">{errors.name}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="privacy-email">
                        Adresse email du compte
                    </Label>
                    <Input
                        id="privacy-email"
                        type="email"
                        autoComplete="email"
                        value={data.email}
                        onChange={(event) =>
                            setData('email', event.target.value)
                        }
                        aria-invalid={Boolean(errors.email)}
                        className="h-12 bg-white"
                        required
                    />
                    {errors.email && (
                        <p className="text-sm text-red-600">{errors.email}</p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="request-type">Objet de la demande</Label>
                <select
                    id="request-type"
                    value={data.request_type}
                    onChange={(event) =>
                        setData(
                            'request_type',
                            event.target.value as PrivacyRequestType,
                        )
                    }
                    className="flex h-12 w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                    {Object.entries(requestLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </select>
                {errors.request_type && (
                    <p className="text-sm text-red-600">
                        {errors.request_type}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="privacy-message">
                    Message{' '}
                    {data.request_type === 'contact' ? '' : '(facultatif)'}
                </Label>
                <Textarea
                    id="privacy-message"
                    value={data.message}
                    onChange={(event) => setData('message', event.target.value)}
                    placeholder="Ajoutez les informations utiles pour identifier votre compte et comprendre votre demande. Ne communiquez jamais votre mot de passe."
                    className="min-h-32 resize-y bg-white"
                    required={data.request_type === 'contact'}
                />
                {errors.message && (
                    <p className="text-sm text-red-600">{errors.message}</p>
                )}
            </div>

            <div className="hidden" aria-hidden="true">
                <Label htmlFor="website">Site web</Label>
                <Input
                    id="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={data.website}
                    onChange={(event) => setData('website', event.target.value)}
                />
            </div>

            {data.request_type === 'deletion' && (
                <label className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                    <input
                        type="checkbox"
                        checked={data.confirmation}
                        onChange={(event) =>
                            setData('confirmation', event.target.checked)
                        }
                        className="mt-1 h-4 w-4 rounded border-amber-400 text-emerald-700"
                        required
                    />
                    <span>
                        Je comprends que la suppression du compte est définitive
                        après vérification de mon identité, sous réserve des
                        obligations légales de conservation.
                    </span>
                </label>
            )}
            {errors.confirmation && (
                <p className="text-sm text-red-600">{errors.confirmation}</p>
            )}

            <div className="flex flex-col gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex max-w-xl items-start gap-2 text-xs leading-5 text-slate-500">
                    <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" />
                    Une vérification d’identité peut être demandée. N’envoyez
                    jamais de mot de passe, de code PIN ou de données bancaires.
                </p>
                <Button
                    type="submit"
                    disabled={processing}
                    className="h-12 bg-slate-950 px-6 hover:bg-emerald-800"
                >
                    {processing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Send className="mr-2 h-4 w-4" />
                    )}
                    Envoyer la demande
                </Button>
            </div>
        </form>
    );
}
