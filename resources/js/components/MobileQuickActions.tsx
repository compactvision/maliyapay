import { useQuickAction } from '@/contexts/QuickActionContext';
import { AnimatePresence, motion } from 'framer-motion';
import { CreditCard, Plus, Receipt, Tags, Wallet, X } from 'lucide-react';
import { useState } from 'react';

export const MobileQuickActions = () => {
    const [isOpen, setIsOpen] = useState(false);
    const {
        openTransactionModal,
        openBudgetModal,
        openCategoryModal,
        openAccountModal,
    } = useQuickAction();

    const actions = [
        {
            title: 'Transaction',
            icon: Receipt,
            color: 'bg-emerald-500',
            action: openTransactionModal,
        },
        {
            title: 'Budget',
            icon: Wallet,
            color: 'bg-amber-500',
            action: openBudgetModal,
        },
        {
            title: 'Catégorie',
            icon: Tags,
            color: 'bg-indigo-500',
            action: openCategoryModal,
        },
        {
            title: 'Compte',
            icon: CreditCard,
            color: 'bg-sky-500',
            action: openAccountModal,
        },
    ];

    const handleActionClick = (actionFn: () => void) => {
        setIsOpen(false);
        actionFn();
    };

    const toggleMenu = () => setIsOpen(!isOpen);

    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    };

    const menuVariants = {
        hidden: { opacity: 0, scale: 0.8, y: 20 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                staggerChildren: 0.05,
                delayChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0 },
    };

    return (
        <div className="fixed right-4 bottom-20 z-50 lg:hidden">
            {/* Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={backdropVariants}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            {/* Actions Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={menuVariants}
                        className="absolute right-0 bottom-16 z-50 flex flex-col items-end gap-4"
                    >
                        {actions.map((action, index) => (
                            <motion.div
                                key={action.title}
                                variants={itemVariants}
                                className="flex items-center gap-3"
                            >
                                <button
                                    onClick={() =>
                                        handleActionClick(action.action)
                                    }
                                    className="flex items-center gap-3"
                                >
                                    <motion.span
                                        className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white shadow-sm backdrop-blur-md"
                                        initial={{ x: 10, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{
                                            delay: 0.2 + index * 0.05,
                                        }}
                                    >
                                        {action.title}
                                    </motion.span>
                                    <div
                                        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${action.color} text-white shadow-lg`}
                                    >
                                        <action.icon className="h-6 w-6" />
                                    </div>
                                </button>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main FAB Toggle */}
            <motion.button
                onClick={toggleMenu}
                className={`relative z-50 flex h-14 w-14 items-center justify-center rounded-2xl shadow-xl transition-colors duration-300 ${
                    isOpen
                        ? 'bg-slate-800 text-white'
                        : 'bg-gradient-to-br from-emerald-500 to-sky-400 text-white'
                }`}
                whileTap={{ scale: 0.9 }}
                animate={isOpen ? { rotate: 0 } : { rotate: 0 }}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <X className="h-7 w-7" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="plus"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Plus className="h-7 w-7" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Pulsing ring animation when closed */}
                {!isOpen && (
                    <motion.div
                        className="absolute inset-0 rounded-2xl border-2 border-emerald-500"
                        animate={{
                            scale: [1, 1.4, 1.5],
                            opacity: [0.5, 0.2, 0],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeOut',
                        }}
                    />
                )}
            </motion.button>
        </div>
    );
};
