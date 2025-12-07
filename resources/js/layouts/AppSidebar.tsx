// resources/js/Components/AppSidebar.tsx

import React, { createContext, useContext } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    LayoutDashboard,
    ArrowUpDown,
    Wallet,
    Tags,
    PiggyBank,
    BarChart3,
    CheckSquare,
    User,
    LogOut,
    Sparkles,
    Menu,
    ChevronDown,
} from 'lucide-react';

// --- Types ---
interface User {
    id: number;
    name: string;
    email: string;
}

// --- Contexte pour la Sidebar Desktop (uniquement pour l'état d'ouverture/fermeture) ---
interface SidebarContextType {
    isOpen: boolean;
    toggle: () => void;
}
const SidebarContext = createContext<SidebarContextType>({ isOpen: true, toggle: () => {} });
export const useSidebar = () => useContext(SidebarContext);
export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = React.useState(true);
    const toggle = () => setIsOpen(!isOpen);
    return <SidebarContext.Provider value={{ isOpen, toggle }}>{children}</SidebarContext.Provider>;
};

// --- Utilitaire pour les classes CSS ---
const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

// --- Données de navigation ---
const mainNavItems = [
    { title: 'Tableau de bord', url: '/dashboard', icon: LayoutDashboard },
    { title: 'Transactions', url: '/transactions', icon: ArrowUpDown },
    { title: 'Comptes', url: '/accounts', icon: Wallet },
    { title: 'Catégories', url: '/categories', icon: Tags },
    { title: 'Budgets', url: '/budgets', icon: PiggyBank },
    { title: 'Statistiques', url: '/statistics', icon: BarChart3 },
    { title: 'Tâches', url: '/todos', icon: CheckSquare },
];

const mobileNavItems = [
    { title: 'Accueil', url: '/dashboard', icon: LayoutDashboard },
    { title: 'Transactions', url: '/transactions', icon: ArrowUpDown },
    { title: 'Comptes', url: '/accounts', icon: Wallet },
    { title: 'Activité', url: '/statistics', icon: BarChart3 }, // Exemple de nom différent
];

// --- Composant pour la Sidebar Desktop ---
export const DesktopSidebar = () => {
    const { isOpen } = useSidebar();
    const currentUrl = usePage().url;
    const { props } = usePage();
    const user = props.auth.user as User;

    return (
        <aside className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-20 lg:border-r lg:border-gray-200 lg:bg-white lg:transition-all lg:duration-300 ${!isOpen ? 'lg:w-16' : 'lg:w-64'}`}>
            <div className="flex h-14 items-center border-b border-gray-200 px-4">
                <div className={cn("flex items-center gap-2", !isOpen && "justify-center")}>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                        <Sparkles className="h-4 w-4" />
                    </div>
                    {isOpen && <span className="text-lg font-semibold text-gray-900">MindWallet</span>}
                </div>
            </div>
            <nav className="flex-1 overflow-y-auto p-4">
                <ul className="space-y-1">{mainNavItems.map((item) => (
                    <li key={item.title}>
                        <Link href={item.url} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900", currentUrl.startsWith(item.url) && "bg-gray-100 text-gray-900 font-medium")}>
                            <item.icon className="h-4 w-4 shrink-0" />
                            {isOpen && <span>{item.title}</span>}
                        </Link>
                    </li>
                ))}</ul>
            </nav>
            <div className="border-t border-gray-200 p-4">
                <ul className="space-y-1">
                    <li>
                        <Link href="/profile" className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900", currentUrl.startsWith('/profile') && "bg-gray-100 text-gray-900 font-medium")}>
                            <User className="h-4 w-4 shrink-0" />
                            {isOpen && <span>{user?.name || 'Profil'}</span>}
                        </Link>
                    </li>
                    <li>
                        <form onSubmit={(e) => { e.preventDefault(); router.post('/logout'); }}>
                            <button type="submit" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600">
                                <LogOut className="h-4 w-4 shrink-0" />
                                {isOpen && <span>Déconnexion</span>}
                            </button>
                        </form>
                    </li>
                </ul>
            </div>
        </aside>
    );
};

// --- Composant pour la Top Bar et le Menu Profil Mobile ---
export const MobileTopBar = ({ isProfileMenuOpen, setIsProfileMenuOpen }: { isProfileMenuOpen: boolean; setIsProfileMenuOpen: (open: boolean) => void }) => {
    const { props } = usePage();
    const user = props.auth.user as User;

    return (
        <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4">
            <span className="font-medium text-gray-900">Bonjour, {user?.name}</span>
            <div className="relative">
                <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="flex items-center gap-1 rounded-md p-1 text-gray-600 hover:bg-gray-100">
                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                    </div>
                    <ChevronDown className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

export const MobileProfileDropdown = ({ isProfileMenuOpen, setIsProfileMenuOpen }: { isProfileMenuOpen: boolean; setIsProfileMenuOpen: (open: boolean) => void }) => {
    const currentUrl = usePage().url;

    if (!isProfileMenuOpen) return null;

    return (
        <div className="lg:hidden fixed top-14 right-4 z-40 w-48 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
            <Link href="/profile" onClick={() => setIsProfileMenuOpen(false)} className={cn("block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100", currentUrl.startsWith('/profile') && "bg-gray-100 font-medium")}>
                Mon Profil
            </Link>
            <form onSubmit={(e) => { e.preventDefault(); router.post('/logout'); }}>
                <button type="submit" className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100">
                    Déconnexion
                </button>
            </form>
        </div>
    );
};

// --- Composant pour la Bottom Navbar Mobile ---
export const MobileBottomNavbar = () => {
    const currentUrl = usePage().url;
    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-gray-200 bg-white">
            {mobileNavItems.map((item) => (
                <Link key={item.title} href={item.url} className={cn("flex flex-col items-center justify-center gap-1 p-2 text-xs text-gray-600 transition-colors", currentUrl.startsWith(item.url) && "text-blue-600")}>
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                </Link>
            ))}
        </nav>
    );
};

// --- Bouton pour la Sidebar Desktop ---
export const SidebarTrigger = ({ className = '' }: { className?: string }) => {
    const { toggle } = useSidebar();
    return <button onClick={toggle} className={cn("hidden lg:flex p-2 rounded-md text-gray-600 hover:bg-gray-100", className)}><Menu className="h-5 w-5" /></button>;
};