import type { LucideIcon } from 'lucide-react';
import type { PropsWithChildren } from 'react';

interface PrivacySectionProps extends PropsWithChildren {
    id: string;
    eyebrow: string;
    title: string;
    description?: string;
    icon: LucideIcon;
}

export function PrivacySection({
    id,
    eyebrow,
    title,
    description,
    icon: Icon,
    children,
}: PrivacySectionProps) {
    return (
        <section
            id={id}
            className="scroll-mt-28 border-b border-slate-200/80 py-14 last:border-0 sm:py-20"
        >
            <div className="mb-8 grid gap-5 md:grid-cols-[72px_1fr] md:items-start">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-lg shadow-emerald-900/15">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                    <p className="mb-2 text-xs font-bold tracking-[0.22em] text-emerald-700 uppercase">
                        {eyebrow}
                    </p>
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                        {title}
                    </h2>
                    {description && (
                        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                            {description}
                        </p>
                    )}
                </div>
            </div>
            <div className="md:pl-[92px]">{children}</div>
        </section>
    );
}
