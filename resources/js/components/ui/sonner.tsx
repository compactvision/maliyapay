import { useLayout } from '@/components/LayoutComponents';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
    // Optional: Sync theme with layout if needed, or rely on system/classes
    // Since we don't have next-themes, we can try to get theme from useLayout if strictly needed for Sonner's internal logic,
    // but usually classNames with tailwind dark: modifiers work fine if Sonner is styled via classes.
    // However, Sonner has a 'theme' prop.
    const { isDarkMode } = useLayout();

    return (
        <Sonner
            theme={isDarkMode ? 'dark' : 'light'}
            className="toaster group"
            toastOptions={{
                classNames: {
                    toast: 'group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-950 group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg dark:group-[.toaster]:bg-gray-950 dark:group-[.toaster]:text-gray-50 dark:group-[.toaster]:border-gray-800',
                    description:
                        'group-[.toast]:text-gray-500 dark:group-[.toast]:text-gray-400',
                    actionButton:
                        'group-[.toast]:bg-gray-900 group-[.toast]:text-gray-50 dark:group-[.toast]:bg-gray-50 dark:group-[.toast]:text-gray-900',
                    cancelButton:
                        'group-[.toast]:bg-gray-100 group-[.toast]:text-gray-500 dark:group-[.toast]:bg-gray-800 dark:group-[.toast]:text-gray-400',
                },
            }}
            {...props}
        />
    );
};

export { Toaster };
