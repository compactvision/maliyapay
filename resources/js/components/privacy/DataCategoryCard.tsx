import { Check } from 'lucide-react';

interface DataCategoryCardProps {
    title: string;
    data: string;
    purpose: string;
    source: string;
}

export function DataCategoryCard({
    title,
    data,
    purpose,
    source,
}: DataCategoryCardProps) {
    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-4 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                    <Check className="h-4 w-4" aria-hidden="true" />
                </span>
                <h3 className="font-semibold text-slate-950">{title}</h3>
            </div>
            <dl className="space-y-3 text-sm leading-6">
                <div>
                    <dt className="font-medium text-slate-900">Données</dt>
                    <dd className="text-slate-600">{data}</dd>
                </div>
                <div>
                    <dt className="font-medium text-slate-900">Finalité</dt>
                    <dd className="text-slate-600">{purpose}</dd>
                </div>
                <div>
                    <dt className="font-medium text-slate-900">Origine</dt>
                    <dd className="text-slate-600">{source}</dd>
                </div>
            </dl>
        </article>
    );
}
