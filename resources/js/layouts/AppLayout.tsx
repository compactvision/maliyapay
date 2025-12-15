// resources/js/Layouts/AppLayout.tsx

import {
    DesktopHeaderProfile,
    DesktopSidebar,
    MobileBottomNavbar,
    MobileTopBar,
    RightMenu,
    SidebarTrigger,
    useLayout,
} from '@/components/LayoutComponents';
import { ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
    return <AppLayoutContent>{children}</AppLayoutContent>;
}

// Composant interne pour accéder au contexte
function AppLayoutContent({ children }: { children: ReactNode }) {
    const { sidebarIsOpen } = useLayout();

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 antialiased transition-colors duration-300 dark:bg-gray-900 dark:text-gray-100">
            {/* --- Éléments de Navigation --- */}
            <DesktopSidebar />
            <MobileTopBar />
            <RightMenu />
            <MobileBottomNavbar />

            {/* --- Contenu Principal --- */}
            <main className="flex flex-col">
                {/* Header Desktop avec le bouton pour la sidebar et le profil */}
                <header className="hidden h-16 shrink-0 items-center justify-between gap-4 border-b border-gray-200 bg-white px-6 lg:flex dark:border-gray-700 dark:bg-gray-800">
                    <SidebarTrigger />
                    <DesktopHeaderProfile />
                </header>

                {/* Le conteneur du contenu est maintenant centré avec une belle marge */}
                <div
                    className={`flex-1 pt-14 pb-16 transition-all duration-300 lg:pt-0 lg:pb-0 ${sidebarIsOpen ? 'lg:pl-64' : 'lg:pl-16'}`}
                >
                    <div className="max-w-9xl mx-auto w-full p-4 sm:p-6 lg:p-8">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
