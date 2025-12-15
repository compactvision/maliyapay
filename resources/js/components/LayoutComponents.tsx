// resources/js/Components/LayoutComponents.tsx

import { useAuth } from '@/hooks/useAuth';
import { getDynamicGreeting } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import {
    ArrowUpDown,
    BarChart3,
    Calendar,
    CheckSquare,
    LayoutDashboard,
    LogOut,
    Moon,
    PiggyBank,
    Settings,
    Sparkles,
    Sun,
    Tags,
    User,
    Wallet,
    X,
} from 'lucide-react';
import React, { createContext, useContext } from 'react';
import { NotificationBell } from './notifications/NotificationBell';

// --- Types ---
interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    roles?: string[];
}

// --- Contexte Global pour le Layout ---
interface LayoutContextType {
    sidebarIsOpen: boolean;
    toggleSidebar: () => void;
    rightMenuIsOpen: boolean;
    toggleRightMenu: () => void;
    closeRightMenu: () => void;
    isDarkMode: boolean;
    toggleTheme: () => void;
}

const LayoutContext = createContext<LayoutContextType>({
    sidebarIsOpen: true,
    toggleSidebar: () => {},
    rightMenuIsOpen: false,
    toggleRightMenu: () => {},
    closeRightMenu: () => {},
    isDarkMode: false,
    toggleTheme: () => {},
});

export const useLayout = () => useContext(LayoutContext);

export const LayoutProvider = ({ children }: { children: React.ReactNode }) => {
    const [sidebarIsOpen, setSidebarIsOpen] = React.useState(true);
    const [rightMenuIsOpen, setRightMenuIsOpen] = React.useState(false);
    const [isDarkMode, setIsDarkMode] = React.useState(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) return savedTheme === 'dark';
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });

    // Initialiser le thème au montage
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            document.documentElement.classList.toggle('dark', isDarkMode);
        }
    }, [isDarkMode]);

    const toggleSidebar = () => setSidebarIsOpen(!sidebarIsOpen);
    const toggleRightMenu = () => setRightMenuIsOpen(!rightMenuIsOpen);
    const closeRightMenu = () => setRightMenuIsOpen(false);
    const toggleTheme = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        localStorage.setItem('theme', newMode ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark', newMode);
    };

    return (
        <LayoutContext.Provider
            value={{
                sidebarIsOpen,
                toggleSidebar,
                rightMenuIsOpen,
                toggleRightMenu,
                closeRightMenu,
                isDarkMode,
                toggleTheme,
            }}
        >
            {children}
        </LayoutContext.Provider>
    );
};

// --- Utilitaire pour les classes CSS ---
const cn = (...classes: (string | undefined | null | false)[]) =>
    classes.filter(Boolean).join(' ');

// --- Données de navigation ---
const mainNavItems = [
    { title: 'Tableau de bord', url: '/', icon: LayoutDashboard },
    { title: 'Transactions', url: '/transaction', icon: ArrowUpDown },
    { title: 'Comptes', url: '/account', icon: Wallet },
    { title: 'Catégories', url: '/category', icon: Tags },
    { title: 'Budgets', url: '/budget', icon: PiggyBank },
    { title: 'Statistiques', url: '/statistic', icon: BarChart3 },
    { title: 'Tâches', url: '/task', icon: CheckSquare },
    { title: 'Routine', url: '/routine', icon: CheckSquare },
    { title: 'Performance', url: '/habits', icon: CheckSquare },
];

const mobileNavItems = [
    { title: 'Accueil', url: '/', icon: LayoutDashboard },
    { title: 'Transactions', url: '/transaction', icon: ArrowUpDown },
    { title: 'Comptes', url: '/account', icon: Wallet },
    { title: 'Tâches', url: '/task', icon: CheckSquare },
    { title: 'Activité', url: '/statistic', icon: BarChart3 },
    { title: 'Performance', url: '/habits', icon: CheckSquare },
];

// --- Composant Toggle pour le Thème ---
export const ThemeToggle = () => {
    const { isDarkMode, toggleTheme } = useLayout();
    return (
        <button
            onClick={toggleTheme}
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:bg-gray-600"
            aria-label={
                isDarkMode ? 'Passer en mode clair' : 'Passer en mode sombre'
            }
        >
            <span className="sr-only">Changer de thème</span>
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`}
            />
            {/* Icône Sun visible en mode clair */}
            <Sun
                className={`absolute left-1 h-3 w-3 text-yellow-500 transition-opacity ${isDarkMode ? 'opacity-0' : 'opacity-100'}`}
            />
            {/* Icône Moon visible en mode sombre */}
            <Moon
                className={`absolute right-1 h-3 w-3 text-blue-300 transition-opacity ${isDarkMode ? 'opacity-100' : 'opacity-0'}`}
            />
        </button>
    );
};

// --- Composant pour la Sidebar Desktop ---
export const DesktopSidebar = () => {
    const { sidebarIsOpen } = useLayout();
    const currentUrl = usePage().url;

    return (
        <aside
            className={`hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-20 lg:flex lg:flex-col lg:border-r lg:border-gray-200 lg:bg-white lg:transition-all lg:duration-300 dark:border-gray-700 dark:bg-gray-800 ${!sidebarIsOpen ? 'lg:w-16' : 'lg:w-64'}`}
        >
            <div className="flex h-16 items-center border-b border-gray-200 px-4 dark:border-gray-700">
                <div
                    className={cn(
                        'flex items-center gap-2',
                        !sidebarIsOpen && 'justify-center',
                    )}
                >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
                        <Sparkles className="h-4 w-4" />
                    </div>
                    {sidebarIsOpen && (
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                            MindWallet
                        </span>
                    )}
                </div>
            </div>
            <nav className="flex-1 overflow-y-auto p-4">
                <ul className="space-y-2">
                    {mainNavItems.map((item) => (
                        <li key={item.title}>
                            <Link
                                href={item.url}
                                className={cn(
                                    'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white',
                                    (item.url === '/'
                                        ? currentUrl === '/'
                                        : currentUrl.startsWith(item.url)) &&
                                        'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600',
                                )}
                            >
                                <item.icon className="h-5 w-5 shrink-0" />
                                {sidebarIsOpen && <span>{item.title}</span>}
                            </Link>
                        </li>
                    ))}

                    {/* Admin Link */}
                    {/* Access user via useAuth hook inside the component not accessible here easily without refactoring mainNavItems to be dynamic or checking here */}
                    {/* Actually DesktopSidebar uses useLayout(), lets grab useAuth() there too */}
                    <AdminSidebarLink
                        sidebarIsOpen={sidebarIsOpen}
                        currentUrl={currentUrl}
                    />
                </ul>
            </nav>
        </aside>
    );
};

// Helper component to access auth context inside sidebar
const AdminSidebarLink = ({
    sidebarIsOpen,
    currentUrl,
}: {
    sidebarIsOpen: boolean;
    currentUrl: string;
}) => {
    const { user } = useAuth();
    // Check if user has admin role.
    // Optimization: in real app, might want to memoize or check permissions more robustly.
    const isAdmin =
        user?.roles?.includes('admin') || user?.email === 'admin@admin.com';

    if (!isAdmin) return null;

    return (
        <li>
            <Link
                href="/admin/settings"
                className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-all duration-200 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300',
                    currentUrl.startsWith('/admin') &&
                        'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-900/50',
                )}
            >
                <Settings className="h-5 w-5 shrink-0" />
                {sidebarIsOpen && <span>Administration</span>}
            </Link>
        </li>
    );
};

// --- Composant pour la Top Bar Mobile (CORRIGÉ) ---
export const MobileTopBar = () => {
    const { toggleRightMenu } = useLayout();
    const { user } = useAuth();

    // On calcule les initiales avec une valeur par défaut si le nom n'existe pas
    const initials = user?.name
        ? user.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)
        : 'U';

    const greetingMessage = getDynamicGreeting(user?.name || '');

    return (
        <header className="fixed top-0 right-0 left-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white/80 px-4 backdrop-blur-md lg:hidden dark:border-gray-700 dark:bg-gray-900/80">
            {/* On affiche le nom de l'utilisateur ou "Invité" par défaut */}
            {/* <span className="font-semibold text-gray-900 dark:text-white">
                {getShortDynamicGreeting(user?.name || '')}
            </span> */}
            <span className="block max-w-[200px] truncate font-semibold text-gray-900 sm:max-w-md dark:text-white">
                {greetingMessage}
            </span>
            <div className="flex items-center gap-2">
                <NotificationBell />
                <button
                    onClick={toggleRightMenu}
                    className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white shadow-md"
                >
                    {user?.avatar ? (
                        <img
                            src={user.avatar}
                            alt={user.name}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                            <span className="text-sm font-bold">
                                {initials}
                            </span>
                        </div>
                    )}
                </button>
            </div>
        </header>
    );
};

// --- Composant pour le Menu de Droite (Right Menu) (CORRIGÉ) ---
export const RightMenu = () => {
    const { rightMenuIsOpen, closeRightMenu } = useLayout();
    const { logout, user } = useAuth();

    // On calcule les initiales avec une valeur par défaut
    const initials = user?.name
        ? user.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)
        : 'U';

    return (
        <>
            <div
                className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${rightMenuIsOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
                onClick={closeRightMenu}
            ></div>
            <div
                className={`fixed top-0 right-0 z-50 flex h-full w-80 flex-col border-l border-gray-200 bg-white shadow-2xl transition-transform duration-300 dark:border-gray-700 dark:bg-gray-800 ${rightMenuIsOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Menu
                    </h2>
                    <button
                        onClick={closeRightMenu}
                        className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="flex flex-col items-center p-6 text-center">
                    {user?.avatar ? (
                        <div className="h-20 w-20 overflow-hidden rounded-full shadow-lg">
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-2xl font-bold text-white shadow-lg">
                            {initials}
                        </div>
                    )}
                    {/* On affiche le nom/email ou des valeurs par défaut */}
                    <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                        {user?.name || 'Utilisateur'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user?.email || 'non défini'}
                    </p>
                </div>
                <nav className="flex-1 space-y-1 px-4">
                    <Link
                        href="/profile"
                        onClick={closeRightMenu}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                    >
                        <User className="h-5 w-5" />
                        Mon Profil
                    </Link>

                    {/* Admin Link for Mobile/RightMenu */}
                    {(user?.roles?.includes('admin') ||
                        user?.email === 'admin@admin.com') && (
                        <Link
                            href="/admin/settings"
                            onClick={closeRightMenu}
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                        >
                            <Settings className="h-5 w-5" />
                            Administration
                        </Link>
                    )}
                    <Link
                        href="/budget"
                        onClick={closeRightMenu}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                    >
                        <BarChart3 />
                        Budgets
                    </Link>
                    <Link
                        href="/category"
                        onClick={closeRightMenu}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                    >
                        <Tags className="h-5 w-5" />
                        Catégories
                    </Link>
                    <Link
                        href="/routine"
                        onClick={closeRightMenu}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                    >
                        <Calendar className="h-5 w-5" />
                        Routine
                    </Link>
                    <Link
                        href="/settings"
                        onClick={closeRightMenu}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                    >
                        <Settings className="h-5 w-5" />
                        Paramètres
                    </Link>
                    <div className="flex items-center justify-between rounded-lg px-3 py-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Thème Sombre
                        </span>
                        <ThemeToggle />
                    </div>
                </nav>
                <div className="border-t border-gray-200 p-4 dark:border-gray-700">
                    <button
                        onClick={() => logout()}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2 font-medium text-white shadow transition-colors hover:bg-red-600"
                    >
                        <LogOut className="h-5 w-5" />
                        Déconnexion
                    </button>
                </div>
            </div>
        </>
    );
};

// --- Composant pour la Bottom Navbar Mobile (Stylée) ---
export const MobileBottomNavbar = () => {
    const currentUrl = usePage().url;
    return (
        <nav className="fixed right-0 bottom-0 left-0 z-30 border-t border-gray-200 bg-white/80 backdrop-blur-md lg:hidden dark:border-gray-700 dark:bg-gray-900/80">
            <div className="flex h-16 items-center justify-around">
                {mobileNavItems.map((item) => (
                    <Link
                        key={item.title}
                        href={item.url}
                        className={cn(
                            'group flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-all duration-200',
                            (
                                item.url === '/'
                                    ? currentUrl === '/'
                                    : currentUrl.startsWith(item.url)
                            )
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-gray-600 dark:text-gray-400',
                        )}
                    >
                        <item.icon
                            className={cn(
                                'h-5 w-5 transition-transform duration-200 group-hover:scale-110',
                                (item.url === '/'
                                    ? currentUrl === '/'
                                    : currentUrl.startsWith(item.url)) &&
                                    'scale-110',
                            )}
                        />
                        <span>{item.title}</span>
                    </Link>
                ))}
            </div>
        </nav>
    );
};

// --- Bouton pour la Sidebar Desktop ---
export const SidebarTrigger = () => {
    const { toggleSidebar } = useLayout();
    return (
        <button
            onClick={toggleSidebar}
            className="hidden rounded-md p-2 text-gray-600 hover:bg-gray-100 lg:flex dark:text-gray-400 dark:hover:bg-gray-700"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-menu h-5 w-5"
            >
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
        </button>
    );
};

// --- Composant pour le Profil dans le Header Desktop ---
export const DesktopHeaderProfile = () => {
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const { isDarkMode, toggleTheme } = useLayout();
    const { logout, user } = useAuth();

    // Calculer les initiales
    const initials = user?.name
        ? user.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)
        : 'U';

    // Fermer le dropdown quand on clique en dehors
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('[data-dropdown-container]')) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isDropdownOpen]);

    return (
        <div className="flex items-center gap-4" data-dropdown-container>
            {/* Toggle Dark Mode */}
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {isDarkMode ? (
                        <Moon className="h-4 w-4" />
                    ) : (
                        <Sun className="h-4 w-4" />
                    )}
                </span>
                <ThemeToggle />
            </div>

            <NotificationBell />

            {/* Séparateur */}
            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />

            {/* Profil utilisateur avec dropdown */}
            <div className="relative">
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                    {user?.avatar ? (
                        <div className="h-8 w-8 overflow-hidden rounded-full shadow-md">
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white shadow-md">
                            {initials}
                        </div>
                    )}
                    <div className="hidden text-left xl:block">
                        <p className="text-sm font-medium">
                            {user?.name || 'Utilisateur'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {user?.email || 'non défini'}
                        </p>
                    </div>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                    >
                        <path d="m6 9 6 6 6-6" />
                    </svg>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                    <div className="absolute top-full right-0 z-50 mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                        <div className="p-2">
                            <Link
                                href="/profile"
                                onClick={() => setIsDropdownOpen(false)}
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                <User className="h-4 w-4" />
                                Mon Profil
                            </Link>
                            <Link
                                href="/settings"
                                onClick={() => setIsDropdownOpen(false)}
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                <Settings className="h-4 w-4" />
                                Paramètres
                            </Link>
                        </div>
                        <div className="border-t border-gray-200 p-2 dark:border-gray-700">
                            <button
                                onClick={() => logout()}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                            >
                                <LogOut className="h-4 w-4" />
                                Déconnexion
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
