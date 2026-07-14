import { DataCategoryCard } from '@/components/privacy/DataCategoryCard';
import { PrivacySection } from '@/components/privacy/PrivacySection';
import {
    PrivacyRequestType,
    RightsRequestForm,
} from '@/components/privacy/RightsRequestForm';
import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowDownToLine,
    BadgeCheck,
    BellRing,
    Building2,
    CheckCircle2,
    ChevronRight,
    CircleUserRound,
    CloudCog,
    Cookie,
    Database,
    FileClock,
    Fingerprint,
    Globe2,
    KeyRound,
    Landmark,
    LockKeyhole,
    Mail,
    Menu,
    RefreshCw,
    Scale,
    ServerCog,
    ShieldCheck,
    Smartphone,
    Sparkles,
    Trash2,
    UserCheck,
    UsersRound,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface PrivacyPageProps {
    contactEmail: string;
    controllerName: string;
    controllerAddress: string;
    updatedAt: string;
    prefill: { name: string; email: string };
    requestReceived?: { reference: string; type: string } | null;
}

const sections = [
    { id: 'essentiel', label: "L'essentiel" },
    { id: 'responsable', label: 'Responsable du traitement' },
    { id: 'donnees', label: 'Données collectées' },
    { id: 'finalites', label: 'Finalités et bases légales' },
    { id: 'partage', label: 'Partage et services tiers' },
    { id: 'securite', label: 'Sécurité' },
    { id: 'conservation', label: 'Conservation et suppression' },
    { id: 'droits', label: 'Vos droits' },
    { id: 'cookies', label: 'Cookies et stockage local' },
    { id: 'notifications', label: 'Notifications push' },
    { id: 'transferts', label: 'Transferts internationaux' },
    { id: 'mineurs', label: 'Mineurs et décisions automatisées' },
    { id: 'modifications', label: 'Modifications' },
    { id: 'contact', label: 'Contact et demandes' },
];

const dataCategories = [
    {
        title: 'Identité et contact',
        data: 'Nom, prénom, adresse email, photo de profil et numéro de téléphone facultatif.',
        purpose:
            'Créer et personnaliser le compte, communiquer avec vous et permettre la collaboration.',
        source: 'Données que vous fournissez directement.',
    },
    {
        title: 'Compte et sécurité',
        data: 'Informations de connexion, identifiants de session, statut de vérification et événements de sécurité.',
        purpose:
            'Authentifier, sécuriser et protéger le compte contre les abus.',
        source: 'Créées lors de votre inscription et de vos connexions.',
    },
    {
        title: 'Finances saisies par vous',
        data: 'Revenus, dépenses, budgets, catégories, soldes et objectifs financiers que vous enregistrez.',
        purpose:
            'Fournir les tableaux de bord, calculs, statistiques et outils de gestion financière.',
        source: 'Données que vous saisissez ou importez dans MaliyaFlow.',
    },
    {
        title: 'Productivité',
        data: 'Tâches, routines, projets, objectifs, progression, échéances et préférences de travail.',
        purpose:
            'Organiser votre activité, synchroniser vos contenus et générer vos indicateurs.',
        source: 'Données que vous créez et actions réalisées dans le service.',
    },
    {
        title: 'Collaboration',
        data: "Espaces de travail, membres, rôles, invitations et contenus partagés avec d'autres utilisateurs.",
        purpose:
            "Permettre le travail d'équipe et gérer les autorisations d'accès.",
        source: 'Vous, les administrateurs de vos espaces et vos collaborateurs.',
    },
    {
        title: 'Appareil et technique',
        data: "Type d'appareil, système d'exploitation, version de l'app, adresse IP et journaux techniques.",
        purpose:
            'Assurer la compatibilité, diagnostiquer les erreurs, prévenir la fraude et maintenir le service.',
        source: 'Collectées automatiquement lorsque vous utilisez le service.',
    },
    {
        title: 'Notifications',
        data: 'Identifiant Firebase, jeton de notification, préférences et état de livraison.',
        purpose:
            'Acheminer les alertes que vous avez activées et administrer vos préférences.',
        source: "Générées par l'appareil, le système et Firebase Cloud Messaging.",
    },
    {
        title: 'Support et vie privée',
        data: 'Messages, email, type de demande, référence, adresse IP et données nécessaires à la vérification.',
        purpose:
            "Répondre, sécuriser et conserver la preuve du traitement d'une demande.",
        source: 'Données fournies via nos formulaires ou échanges avec le support.',
    },
];

const retentionRows = [
    ['Compte et contenus actifs', "Pendant la durée d'utilisation du compte."],
    [
        'Données après suppression',
        'Suppression ou anonymisation des systèmes actifs dans un délai cible de 30 jours, sauf obligation légale ou litige.',
    ],
    [
        'Sauvegardes sécurisées',
        "Écrasement progressif, en principe sous 90 jours; elles ne sont restaurées qu'en cas de nécessité technique ou de sécurité.",
    ],
    [
        'Journaux techniques et sécurité',
        "Jusqu'à 12 mois, sauf incident, fraude ou obligation légale justifiant une durée supérieure.",
    ],
    [
        'Demandes de droits et support',
        "Jusqu'à 3 ans après clôture afin de documenter la réponse et défendre nos droits.",
    ],
    [
        'Données anonymisées',
        "Peuvent être conservées sans limite lorsqu'elles ne permettent raisonnablement plus de vous identifier.",
    ],
];

export default function PrivacyPage({
    contactEmail,
    controllerName,
    controllerAddress,
    updatedAt,
    prefill,
    requestReceived,
}: PrivacyPageProps) {
    const [activeSection, setActiveSection] = useState('essentiel');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] =
        useState<PrivacyRequestType>('contact');

    const formattedDate = useMemo(
        () =>
            new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(
                new Date(`${updatedAt}T12:00:00`),
            ),
        [updatedAt],
    );

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort(
                        (a, b) => b.intersectionRatio - a.intersectionRatio,
                    )[0];
                if (visible) setActiveSection(visible.target.id);
            },
            { rootMargin: '-18% 0px -68% 0px', threshold: [0, 0.2, 0.6] },
        );
        sections.forEach(({ id }) => {
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });
        return () => observer.disconnect();
    }, []);

    const startRequest = (type: PrivacyRequestType) => {
        setSelectedRequest(type);
        window.setTimeout(
            () =>
                document
                    .getElementById('contact')
                    ?.scrollIntoView({ behavior: 'smooth' }),
            0,
        );
    };

    const canonicalUrl = 'https://maliyaflow.com/privacy';
    const description =
        'Découvrez comment MaliyaFlow collecte, utilise, protège et supprime vos données personnelles.';
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'PrivacyPolicy',
        name: 'Politique de confidentialité MaliyaFlow',
        url: canonicalUrl,
        dateModified: updatedAt,
        inLanguage: 'fr',
        publisher: {
            '@type': 'Organization',
            name: controllerName,
            url: 'https://maliyaflow.com',
        },
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'privacy',
            email: contactEmail,
            availableLanguage: ['French', 'English'],
        },
    };

    return (
        <>
            <Head title="Politique de confidentialité">
                <meta name="description" content={description} />
                <meta
                    name="robots"
                    content="index, follow, max-image-preview:large"
                />
                <link rel="canonical" href={canonicalUrl} />
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="MaliyaFlow" />
                <meta
                    property="og:title"
                    content="Politique de confidentialité | MaliyaFlow"
                />
                <meta property="og:description" content={description} />
                <meta property="og:url" content={canonicalUrl} />
                <meta
                    property="og:image"
                    content="https://maliyaflow.com/logo.png"
                />
                <meta name="twitter:card" content="summary_large_image" />
                <meta
                    name="twitter:title"
                    content="Politique de confidentialité | MaliyaFlow"
                />
                <meta name="twitter:description" content={description} />
                <script type="application/ld+json">
                    {JSON.stringify(jsonLd)}
                </script>
            </Head>

            <div className="min-h-screen bg-[#f7f9f7] text-slate-900 selection:bg-emerald-200">
                <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
                    <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        <Link
                            href="/"
                            className="flex items-center gap-3"
                            aria-label="MaliyaFlow — Accueil"
                        >
                            <img
                                src="/logo.png"
                                alt=""
                                className="h-10 w-10 rounded-xl object-cover shadow-sm"
                            />
                            <div>
                                <p className="font-semibold tracking-tight text-slate-950">
                                    MaliyaFlow
                                </p>
                                <p className="text-[10px] font-semibold tracking-[0.18em] text-emerald-700 uppercase">
                                    Privacy Center
                                </p>
                            </div>
                        </Link>
                        <div className="hidden items-center gap-3 sm:flex">
                            <a
                                href={`mailto:${contactEmail}`}
                                className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-emerald-800"
                            >
                                Nous contacter
                            </a>
                            <Button
                                onClick={() => startRequest('deletion')}
                                variant="outline"
                                className="border-slate-300 bg-white"
                            >
                                Supprimer mon compte
                            </Button>
                        </div>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="rounded-xl border border-slate-200 p-2 sm:hidden"
                            aria-label="Ouvrir le sommaire"
                            aria-expanded={mobileMenuOpen}
                        >
                            {mobileMenuOpen ? (
                                <X className="h-5 w-5" />
                            ) : (
                                <Menu className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                    {mobileMenuOpen && (
                        <nav
                            className="max-h-[70vh] overflow-y-auto border-t border-slate-200 bg-white p-4 sm:hidden"
                            aria-label="Sommaire mobile"
                        >
                            {sections.map((section) => (
                                <a
                                    key={section.id}
                                    href={`#${section.id}`}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-emerald-50"
                                >
                                    {section.label}
                                    <ChevronRight className="h-4 w-4" />
                                </a>
                            ))}
                        </nav>
                    )}
                </header>

                <main>
                    <section className="relative overflow-hidden bg-slate-950 text-white">
                        <div className="absolute inset-0 [background-image:radial-gradient(circle_at_20%_20%,rgba(16,185,129,.45),transparent_28%),radial-gradient(circle_at_85%_70%,rgba(20,184,166,.25),transparent_30%)] opacity-40" />
                        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1.2fr_.8fr] lg:items-end lg:px-8">
                            <div>
                                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200">
                                    <ShieldCheck className="h-4 w-4" />{' '}
                                    Transparence. Contrôle. Sécurité.
                                </div>
                                <h1 className="max-w-4xl text-4xl leading-[1.05] font-semibold tracking-[-0.04em] sm:text-6xl lg:text-7xl">
                                    Vos données vous appartiennent.
                                </h1>
                                <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                                    Cette politique explique, en langage clair,
                                    comment MaliyaFlow traite vos données
                                    lorsque vous gérez vos finances, vos projets
                                    et votre productivité.
                                </p>
                                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                                    <Button
                                        onClick={() => startRequest('export')}
                                        className="h-12 bg-emerald-500 px-6 text-slate-950 hover:bg-emerald-400"
                                    >
                                        <ArrowDownToLine className="mr-2 h-5 w-5" />{' '}
                                        Télécharger mes données
                                    </Button>
                                    <Button
                                        onClick={() => startRequest('deletion')}
                                        variant="outline"
                                        className="h-12 border-white/25 bg-white/5 px-6 text-white hover:bg-white/10 hover:text-white"
                                    >
                                        <Trash2 className="mr-2 h-5 w-5" />{' '}
                                        Supprimer mon compte
                                    </Button>
                                </div>
                            </div>
                            <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-md sm:p-8">
                                <div className="flex items-center gap-3 text-emerald-300">
                                    <FileClock className="h-5 w-5" />
                                    <span className="text-xs font-bold tracking-[0.18em] uppercase">
                                        Dernière mise à jour
                                    </span>
                                </div>
                                <p className="mt-3 text-2xl font-semibold capitalize">
                                    {formattedDate}
                                </p>
                                <div className="my-6 h-px bg-white/10" />
                                <ul className="space-y-4 text-sm leading-6 text-slate-300">
                                    <li className="flex gap-3">
                                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                                        Aucune donnée personnelle vendue à des
                                        tiers.
                                    </li>
                                    <li className="flex gap-3">
                                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                                        Aucune donnée bancaire ou carte de
                                        paiement stockée par MaliyaFlow.
                                    </li>
                                    <li className="flex gap-3">
                                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                                        Export et suppression accessibles à tout
                                        utilisateur.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[250px_minmax(0,1fr)] lg:px-8">
                        <aside className="hidden lg:block">
                            <nav
                                className="sticky top-28 py-14"
                                aria-label="Sommaire de la politique"
                            >
                                <p className="mb-4 text-xs font-bold tracking-[0.2em] text-slate-500 uppercase">
                                    Sommaire
                                </p>
                                <div className="border-l border-slate-200">
                                    {sections.map((section) => (
                                        <a
                                            key={section.id}
                                            href={`#${section.id}`}
                                            className={`-ml-px block border-l-2 py-2 pl-4 text-sm transition ${activeSection === section.id ? 'border-emerald-600 font-semibold text-emerald-800' : 'border-transparent text-slate-500 hover:text-slate-950'}`}
                                            aria-current={
                                                activeSection === section.id
                                                    ? 'location'
                                                    : undefined
                                            }
                                        >
                                            {section.label}
                                        </a>
                                    ))}
                                </div>
                            </nav>
                        </aside>

                        <article className="min-w-0">
                            <PrivacySection
                                id="essentiel"
                                eyebrow="01 — En bref"
                                title="Les engagements qui guident MaliyaFlow"
                                icon={Sparkles}
                            >
                                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                    {[
                                        [
                                            LockKeyhole,
                                            'Protection par défaut',
                                            'HTTPS/TLS pour les communications, mots de passe hachés de façon irréversible et chiffrement des données sensibles.',
                                        ],
                                        [
                                            Landmark,
                                            'Pas une banque',
                                            "MaliyaFlow organise les informations financières que vous saisissez; l'app ne se connecte pas à votre banque et ne stocke aucune donnée bancaire ou carte de paiement.",
                                        ],
                                        [
                                            UserCheck,
                                            'Vous gardez le contrôle',
                                            'Vous pouvez corriger, exporter ou supprimer vos données et retirer les autorisations facultatives.',
                                        ],
                                        [
                                            BadgeCheck,
                                            'Pas de vente',
                                            'Nous ne vendons pas vos données et ne les partageons pas pour de la publicité comportementale intercontextuelle.',
                                        ],
                                        [
                                            Database,
                                            'Minimisation',
                                            'Nous limitons la collecte aux données nécessaires au service, à sa sécurité et à nos obligations.',
                                        ],
                                        [
                                            Scale,
                                            'Standards internationaux',
                                            'Nous appliquons les principes du RGPD et, lorsque la loi le prévoit, les droits CCPA/CPRA.',
                                        ],
                                    ].map(([Icon, title, text]) => {
                                        const CardIcon =
                                            Icon as typeof ShieldCheck;
                                        return (
                                            <div
                                                key={title as string}
                                                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                                            >
                                                <CardIcon className="h-6 w-6 text-emerald-700" />
                                                <h3 className="mt-4 font-semibold text-slate-950">
                                                    {title as string}
                                                </h3>
                                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                                    {text as string}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </PrivacySection>

                            <PrivacySection
                                id="responsable"
                                eyebrow="02 — Qui sommes-nous ?"
                                title="Responsable du traitement"
                                icon={Building2}
                            >
                                <div className="rounded-3xl bg-slate-950 p-6 text-slate-200 sm:p-8">
                                    <p className="text-lg leading-8">
                                        <strong className="text-white">
                                            {controllerName}
                                        </strong>{' '}
                                        détermine les finalités et moyens des
                                        traitements décrits dans cette politique
                                        et agit comme responsable du traitement
                                        pour le service MaliyaFlow.
                                    </p>
                                    <dl className="mt-6 grid gap-5 text-sm sm:grid-cols-2">
                                        <div>
                                            <dt className="text-slate-400">
                                                Adresse
                                            </dt>
                                            <dd className="mt-1 font-medium text-white">
                                                {controllerAddress}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-slate-400">
                                                Contact vie privée
                                            </dt>
                                            <dd className="mt-1">
                                                <a
                                                    href={`mailto:${contactEmail}`}
                                                    className="font-medium text-emerald-300 hover:text-emerald-200"
                                                >
                                                    {contactEmail}
                                                </a>
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </PrivacySection>

                            <PrivacySection
                                id="donnees"
                                eyebrow="03 — Inventaire"
                                title="Quelles données collectons-nous ?"
                                description="La collecte dépend des fonctions que vous utilisez, des informations que vous choisissez de fournir et des permissions accordées sur votre appareil."
                                icon={Database}
                            >
                                <div className="grid gap-4 md:grid-cols-2">
                                    {dataCategories.map((category) => (
                                        <DataCategoryCard
                                            key={category.title}
                                            {...category}
                                        />
                                    ))}
                                </div>
                                <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-950">
                                    <strong>Important :</strong> les montants,
                                    revenus, dépenses et budgets saisis sont des
                                    données financières personnelles, mais
                                    MaliyaFlow ne collecte ni ne stocke vos
                                    identifiants bancaires, numéros de carte,
                                    codes de sécurité, mots de passe bancaires
                                    ou données de paiement.
                                </div>
                            </PrivacySection>

                            <PrivacySection
                                id="finalites"
                                eyebrow="04 — Utilisation"
                                title="Pourquoi et sur quelle base utilisons-nous vos données ?"
                                icon={Fingerprint}
                            >
                                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                                    {[
                                        [
                                            'Exécuter le service',
                                            'Créer le compte, synchroniser les données, fournir les outils financiers et de productivité, gérer les espaces collaboratifs.',
                                            'Exécution du contrat',
                                        ],
                                        [
                                            'Sécuriser et améliorer',
                                            'Détecter les abus, diagnostiquer les erreurs, préserver la disponibilité et améliorer les performances.',
                                            'Intérêt légitime',
                                        ],
                                        [
                                            'Communiquer',
                                            'Envoyer les messages transactionnels, de sécurité, de support et répondre aux demandes.',
                                            'Contrat ou obligation légale',
                                        ],
                                        [
                                            'Fonctions facultatives',
                                            'Photo de profil, téléphone facultatif et notifications push non essentielles.',
                                            'Consentement ou choix de l’utilisateur',
                                        ],
                                        [
                                            'Respecter la loi',
                                            'Répondre aux autorités habilitées, défendre des droits et documenter la conformité.',
                                            'Obligation légale ou intérêt légitime',
                                        ],
                                    ].map(([title, text, basis], index) => (
                                        <div
                                            key={title}
                                            className={`grid gap-2 p-5 sm:grid-cols-[180px_1fr_170px] sm:gap-6 ${index ? 'border-t border-slate-200' : ''}`}
                                        >
                                            <h3 className="font-semibold text-slate-950">
                                                {title}
                                            </h3>
                                            <p className="text-sm leading-6 text-slate-600">
                                                {text}
                                            </p>
                                            <p className="text-xs font-semibold tracking-wide text-emerald-700 uppercase">
                                                {basis}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                <p className="mt-5 text-sm leading-6 text-slate-600">
                                    Nous ne prenons pas de décision produisant
                                    un effet juridique ou similaire fondée
                                    exclusivement sur un traitement automatisé.
                                    Les scores, tendances et recommandations
                                    éventuels sont informatifs et restent sous
                                    votre contrôle.
                                </p>
                            </PrivacySection>

                            <PrivacySection
                                id="partage"
                                eyebrow="05 — Destinataires"
                                title="Avec qui les données peuvent-elles être partagées ?"
                                icon={UsersRound}
                            >
                                <p className="mb-7 leading-7 text-slate-600">
                                    Nous ne partageons que ce qui est
                                    nécessaire, sous contrat et pour les
                                    finalités décrites. Nos prestataires doivent
                                    offrir un niveau de protection au moins
                                    équivalent à celui annoncé ici.
                                </p>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {[
                                        [
                                            CloudCog,
                                            'Hébergement et stockage cloud',
                                            'Infrastructure, base de données, sauvegardes et diffusion sécurisée du service.',
                                        ],
                                        [
                                            BellRing,
                                            'Google Firebase Cloud Messaging',
                                            "Acheminement des notifications push à l'aide d'un identifiant Firebase et d'un jeton de notification.",
                                        ],
                                        [
                                            ServerCog,
                                            'Services techniques et temps réel',
                                            'Synchronisation, diffusion des événements, journalisation et maintenance selon la configuration déployée.',
                                        ],
                                        [
                                            Mail,
                                            'Prestataire de messagerie',
                                            'Emails de vérification, sécurité, support et réponses aux demandes.',
                                        ],
                                        [
                                            Smartphone,
                                            'Apple et Google',
                                            "Distribution de l'app, services du système et gestion des permissions de l'appareil selon leurs propres politiques.",
                                        ],
                                        [
                                            Scale,
                                            'Autorités ou conseils',
                                            'Uniquement si la loi l’exige, pour protéger des personnes ou établir, exercer ou défendre des droits.',
                                        ],
                                    ].map(([Icon, title, text]) => {
                                        const ItemIcon =
                                            Icon as typeof ShieldCheck;
                                        return (
                                            <div
                                                key={title as string}
                                                className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5"
                                            >
                                                <ItemIcon className="h-6 w-6 shrink-0 text-emerald-700" />
                                                <div>
                                                    <h3 className="font-semibold text-slate-950">
                                                        {title as string}
                                                    </h3>
                                                    <p className="mt-1 text-sm leading-6 text-slate-600">
                                                        {text as string}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <p className="mt-6 text-sm leading-6 text-slate-600">
                                    Dans un espace collaboratif, les
                                    informations que vous partagez sont visibles
                                    par les membres autorisés selon leurs rôles.
                                    En cas de restructuration, fusion ou
                                    cession, les données peuvent être
                                    transférées avec des garanties appropriées
                                    et une information préalable lorsque la loi
                                    l’exige.
                                </p>
                            </PrivacySection>

                            <PrivacySection
                                id="securite"
                                eyebrow="06 — Protection"
                                title="Comment protégeons-nous les données ?"
                                icon={ShieldCheck}
                            >
                                <div className="grid gap-5 sm:grid-cols-2">
                                    {[
                                        [
                                            'Communications chiffrées',
                                            'HTTPS/TLS est obligatoire entre les applications, le site et notre API.',
                                        ],
                                        [
                                            'Secrets protégés',
                                            'Les mots de passe ne sont jamais stockés en clair : ils sont hachés de façon irréversible. Les données sensibles sont chiffrées lorsque cela est approprié.',
                                        ],
                                        [
                                            'Accès limités',
                                            'Authentification, contrôles d’autorisation, séparation des rôles et accès administratifs restreints.',
                                        ],
                                        [
                                            'Résilience',
                                            'Sauvegardes, surveillance, journaux de sécurité, mises à jour et procédures de réponse aux incidents.',
                                        ],
                                    ].map(([title, text]) => (
                                        <div
                                            key={title}
                                            className="rounded-2xl bg-slate-100 p-5"
                                        >
                                            <KeyRound className="h-5 w-5 text-emerald-700" />
                                            <h3 className="mt-3 font-semibold">
                                                {title}
                                            </h3>
                                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                                {text}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                <p className="mt-6 text-sm leading-6 text-slate-600">
                                    Aucun système n’est totalement invulnérable.
                                    En cas de violation susceptible d’engendrer
                                    un risque pour vos droits, nous enquêterons,
                                    limiterons l’incident et notifierons les
                                    personnes et autorités concernées lorsque la
                                    loi l’exige.
                                </p>
                            </PrivacySection>

                            <PrivacySection
                                id="conservation"
                                eyebrow="07 — Cycle de vie"
                                title="Combien de temps conservons-nous les données ?"
                                icon={FileClock}
                            >
                                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                                    {retentionRows.map(
                                        ([category, duration], index) => (
                                            <div
                                                key={category}
                                                className={`grid gap-2 p-5 sm:grid-cols-[210px_1fr] sm:gap-6 ${index ? 'border-t border-slate-200' : ''}`}
                                            >
                                                <h3 className="font-semibold text-slate-950">
                                                    {category}
                                                </h3>
                                                <p className="text-sm leading-6 text-slate-600">
                                                    {duration}
                                                </p>
                                            </div>
                                        ),
                                    )}
                                </div>
                                <p className="mt-6 text-sm leading-6 text-slate-600">
                                    Une suppression peut être limitée ou
                                    différée pour respecter une obligation
                                    légale, prévenir une fraude, résoudre un
                                    litige ou défendre des droits. Dans ce cas,
                                    seules les données nécessaires sont isolées,
                                    leur utilisation est restreinte et elles
                                    sont supprimées à l’expiration du motif de
                                    conservation.
                                </p>
                            </PrivacySection>

                            <PrivacySection
                                id="droits"
                                eyebrow="08 — Votre contrôle"
                                title="Vos droits sur vos données"
                                icon={Scale}
                            >
                                <div className="grid gap-4 md:grid-cols-2">
                                    {[
                                        [
                                            'Être informé et accéder',
                                            'Connaître les traitements et obtenir une copie de vos données.',
                                        ],
                                        [
                                            'Rectifier',
                                            'Corriger les données inexactes ou incomplètes.',
                                        ],
                                        [
                                            'Effacer',
                                            'Demander la suppression lorsque les conditions légales sont réunies.',
                                        ],
                                        [
                                            'Limiter ou vous opposer',
                                            'Restreindre certains traitements ou vous y opposer pour des motifs liés à votre situation.',
                                        ],
                                        [
                                            'Portabilité',
                                            'Recevoir les données que vous avez fournies dans un format structuré et lisible par machine.',
                                        ],
                                        [
                                            'Retirer votre consentement',
                                            'À tout moment, sans affecter les traitements déjà effectués licitement.',
                                        ],
                                        [
                                            'Ne pas subir de discrimination',
                                            'Les résidents californiens peuvent exercer leurs droits CCPA/CPRA sans traitement discriminatoire.',
                                        ],
                                        [
                                            'Réclamation',
                                            "Saisir l'autorité de protection des données compétente dans votre pays ou État.",
                                        ],
                                    ].map(([title, text]) => (
                                        <div
                                            key={title}
                                            className="rounded-2xl border border-slate-200 bg-white p-5"
                                        >
                                            <h3 className="font-semibold text-slate-950">
                                                {title}
                                            </h3>
                                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                                {text}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-6">
                                    <h3 className="font-semibold text-slate-950">
                                        Informations spécifiques Californie
                                    </h3>
                                    <p className="mt-2 text-sm leading-6 text-slate-600">
                                        Lorsque le CCPA/CPRA s’applique, vous
                                        pouvez demander à connaître, corriger ou
                                        supprimer vos informations personnelles,
                                        et obtenir leur portabilité. MaliyaFlow
                                        ne vend pas vos informations
                                        personnelles et ne les partage pas à des
                                        fins de publicité comportementale
                                        intercontextuelle; il n’y a donc pas de
                                        vente ou partage publicitaire auquel
                                        vous désinscrire. Un agent autorisé peut
                                        agir pour vous, sous réserve de
                                        vérification.
                                    </p>
                                </div>
                            </PrivacySection>

                            <PrivacySection
                                id="cookies"
                                eyebrow="09 — Web"
                                title="Cookies et stockage local"
                                icon={Cookie}
                            >
                                <p className="leading-7 text-slate-600">
                                    Le site et la version web utilisent
                                    uniquement des cookies ou technologies
                                    similaires nécessaires : session sécurisée,
                                    protection CSRF, préférences d’interface,
                                    maintien de connexion et fonctionnement hors
                                    ligne limité. Ils ne servent pas à la
                                    publicité ciblée. Vous pouvez les bloquer
                                    dans votre navigateur, mais certaines
                                    fonctions de connexion et de sécurité ne
                                    fonctionneront plus.
                                </p>
                                <div className="mt-6 rounded-2xl bg-slate-100 p-5 text-sm leading-6 text-slate-700">
                                    <strong>Application mobile :</strong>{' '}
                                    Flutter peut stocker localement des
                                    préférences, jetons de session et données
                                    techniques nécessaires à la synchronisation.
                                    Vous pouvez les effacer en vous
                                    déconnectant, via les réglages du système ou
                                    en désinstallant l’application.
                                </div>
                            </PrivacySection>

                            <PrivacySection
                                id="notifications"
                                eyebrow="10 — Alertes"
                                title="Notifications push"
                                icon={BellRing}
                            >
                                <p className="leading-7 text-slate-600">
                                    Si vous les autorisez, MaliyaFlow et
                                    Firebase Cloud Messaging utilisent un
                                    identifiant d’installation et un jeton pour
                                    acheminer des rappels de tâches, alertes de
                                    budget, mises à jour de collaboration et
                                    messages de sécurité. Le contenu affiché
                                    peut apparaître sur l’écran verrouillé selon
                                    vos réglages.
                                </p>
                                <p className="mt-4 leading-7 text-slate-600">
                                    Vous pouvez désactiver les notifications
                                    dans MaliyaFlow ou dans les réglages
                                    iOS/Android. Les notifications strictement
                                    liées à la sécurité ou au compte peuvent
                                    aussi être envoyées par email lorsque cela
                                    est nécessaire. Refuser les notifications
                                    push n’empêche pas l’accès aux fonctions
                                    principales.
                                </p>
                            </PrivacySection>

                            <PrivacySection
                                id="transferts"
                                eyebrow="11 — International"
                                title="Transferts internationaux de données"
                                icon={Globe2}
                            >
                                <p className="leading-7 text-slate-600">
                                    Nos prestataires peuvent traiter des données
                                    dans des pays différents du vôtre. Lorsque
                                    des données protégées par le RGPD sont
                                    transférées hors de l’Espace économique
                                    européen vers un pays sans décision
                                    d’adéquation, nous utilisons, selon le cas,
                                    les clauses contractuelles types de la
                                    Commission européenne, des mesures
                                    complémentaires et une évaluation du
                                    transfert. Vous pouvez demander des
                                    informations sur les garanties applicables
                                    via le formulaire ci-dessous.
                                </p>
                            </PrivacySection>

                            <PrivacySection
                                id="mineurs"
                                eyebrow="12 — Précisions"
                                title="Mineurs et décisions automatisées"
                                icon={CircleUserRound}
                            >
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                        <h3 className="font-semibold">
                                            Protection des mineurs
                                        </h3>
                                        <p className="mt-2 text-sm leading-6 text-slate-600">
                                            MaliyaFlow n’est pas destiné aux
                                            enfants de moins de 16 ans et nous
                                            ne cherchons pas sciemment à
                                            collecter leurs données. Un parent
                                            ou tuteur peut nous signaler un
                                            compte afin que nous prenions les
                                            mesures appropriées.
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                        <h3 className="font-semibold">
                                            Aucune décision juridique
                                            automatisée
                                        </h3>
                                        <p className="mt-2 text-sm leading-6 text-slate-600">
                                            Les analyses et indicateurs servent
                                            à vous informer. Ils n’accordent ni
                                            ne refusent un crédit, un emploi,
                                            une assurance ou un autre droit et
                                            n’ont pas d’effet juridique
                                            autonome.
                                        </p>
                                    </div>
                                </div>
                            </PrivacySection>

                            <PrivacySection
                                id="modifications"
                                eyebrow="13 — Évolution"
                                title="Modifications de cette politique"
                                icon={RefreshCw}
                            >
                                <p className="leading-7 text-slate-600">
                                    Nous pouvons mettre à jour cette politique
                                    pour refléter une évolution du service, de
                                    nos prestataires ou de la loi. La date en
                                    haut de page indique la version en vigueur.
                                    En cas de changement important, nous vous
                                    informerons par un avis dans l’application,
                                    par email ou par tout autre moyen approprié
                                    avant son entrée en vigueur lorsque cela est
                                    requis.
                                </p>
                            </PrivacySection>

                            <PrivacySection
                                id="contact"
                                eyebrow="14 — Agir"
                                title="Contact, export et suppression"
                                description="Envoyez votre demande directement au responsable du traitement. Ce formulaire est accessible sans connexion pour répondre aux exigences des stores."
                                icon={Mail}
                            >
                                <div className="mb-7 grid gap-4 sm:grid-cols-3">
                                    <button
                                        onClick={() =>
                                            setSelectedRequest('export')
                                        }
                                        className={`rounded-2xl border p-5 text-left transition ${selectedRequest === 'export' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white hover:border-emerald-300'}`}
                                    >
                                        <ArrowDownToLine className="h-6 w-6 text-emerald-700" />
                                        <span className="mt-3 block font-semibold">
                                            Télécharger mes données
                                        </span>
                                        <span className="mt-1 block text-sm text-slate-600">
                                            Demander un export structuré.
                                        </span>
                                    </button>
                                    <button
                                        onClick={() =>
                                            setSelectedRequest('deletion')
                                        }
                                        className={`rounded-2xl border p-5 text-left transition ${selectedRequest === 'deletion' ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white hover:border-red-300'}`}
                                    >
                                        <Trash2 className="h-6 w-6 text-red-600" />
                                        <span className="mt-3 block font-semibold">
                                            Supprimer mon compte
                                        </span>
                                        <span className="mt-1 block text-sm text-slate-600">
                                            Initier la suppression définitive.
                                        </span>
                                    </button>
                                    <button
                                        onClick={() =>
                                            setSelectedRequest('contact')
                                        }
                                        className={`rounded-2xl border p-5 text-left transition ${selectedRequest === 'contact' ? 'border-slate-500 bg-slate-100' : 'border-slate-200 bg-white hover:border-slate-400'}`}
                                    >
                                        <Mail className="h-6 w-6 text-slate-700" />
                                        <span className="mt-3 block font-semibold">
                                            Contacter la confidentialité
                                        </span>
                                        <span className="mt-1 block text-sm text-slate-600">
                                            Poser une question ou signaler un
                                            problème.
                                        </span>
                                    </button>
                                </div>
                                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
                                    <RightsRequestForm
                                        contactEmail={contactEmail}
                                        initialName={prefill.name}
                                        initialEmail={prefill.email}
                                        selectedType={selectedRequest}
                                        requestReceived={requestReceived}
                                    />
                                </div>
                                <div className="mt-6 rounded-2xl bg-slate-100 p-5 text-sm leading-6 text-slate-700">
                                    <strong>Conditions de traitement :</strong>{' '}
                                    nous accusons réception de la demande et
                                    pouvons vérifier votre identité afin de
                                    protéger le compte. Notre objectif est de
                                    répondre sous 30 jours. Selon la loi
                                    applicable, ce délai peut être prolongé (par
                                    exemple pour une demande complexe), avec
                                    information du demandeur. Les demandes sont
                                    gratuites sauf si elles sont manifestement
                                    infondées ou excessives. Contact direct :{' '}
                                    <a
                                        href={`mailto:${contactEmail}`}
                                        className="font-semibold text-emerald-800 underline underline-offset-2"
                                    >
                                        {contactEmail}
                                    </a>
                                    .
                                </div>
                            </PrivacySection>
                        </article>
                    </div>
                </main>

                <footer className="border-t border-slate-800 bg-slate-950 text-slate-300">
                    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
                        <div>
                            <p className="font-semibold text-white">
                                MaliyaFlow
                            </p>
                            <p className="mt-1 text-sm">
                                Finance et productivité, sous votre contrôle.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
                            <a
                                href={`mailto:${contactEmail}`}
                                className="hover:text-white"
                            >
                                Contact vie privée
                            </a>
                            <a href="#contact" className="hover:text-white">
                                Exercer mes droits
                            </a>
                            <a href="#essentiel" className="hover:text-white">
                                Retour en haut
                            </a>
                        </div>
                        <p className="text-sm text-slate-500">
                            © {new Date().getFullYear()} {controllerName}
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
