import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { Coins, CreditCard, Sparkles, X } from 'lucide-react';

interface QuestPaymentBottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onPay: () => void;
    step: {
        id: string;
        title: string;
        priceAmount?: number;
    };
    business: {
        title: string;
    };
}

export const QuestPaymentBottomSheet = ({
    isOpen,
    onClose,
    onPay,
    step,
    business,
}: QuestPaymentBottomSheetProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Bottom Sheet */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{
                            type: 'spring',
                            damping: 30,
                            stiffness: 300,
                        }}
                        className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-lg"
                    >
                        <div className="relative rounded-t-3xl border-t-4 border-emerald-500 bg-background p-6 shadow-2xl md:p-8">
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 rounded-full p-2 transition-colors hover:bg-muted"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            {/* Payment Icon */}
                            <div className="mb-6 flex justify-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', delay: 0.2 }}
                                    className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-600 shadow-lg ring-4 ring-amber-500/20"
                                >
                                    <Coins className="h-10 w-10 text-white" />
                                </motion.div>
                            </div>

                            {/* Title & Info */}
                            <div className="mb-8 text-center">
                                <h2 className="mb-2 text-2xl font-bold text-foreground">
                                    Débloquer l'étape
                                </h2>
                                <p className="text-muted-foreground">
                                    {step.title} dans{' '}
                                    <span className="font-semibold text-emerald-600">
                                        {business.title}
                                    </span>
                                </p>
                            </div>

                            {/* Price Card */}
                            <div className="mb-8 rounded-2xl border-2 border-emerald-500/20 bg-muted/50 p-6 text-center">
                                <div className="mb-1 text-sm font-medium tracking-wider text-muted-foreground uppercase">
                                    Prix d'accès
                                </div>
                                <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400">
                                    {(step.priceAmount || 0).toLocaleString()}{' '}
                                    <span className="text-xl">$</span>
                                </div>
                            </div>

                            {/* Benefits */}
                            <div className="mb-8 space-y-3">
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <Sparkles className="h-4 w-4 text-amber-500" />
                                    <span>
                                        Accès illimité aux ressources de cette
                                        étape
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <CreditCard className="h-4 w-4 text-emerald-500" />
                                    <span>
                                        Paiement sécurisé via notre passerelle
                                    </span>
                                </div>
                            </div>

                            {/* Pay Button */}
                            <Button
                                onClick={onPay}
                                className="group relative w-full overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 py-6 text-lg font-bold text-white shadow-lg transition-all hover:shadow-emerald-500/50"
                            >
                                <span className="relative flex items-center justify-center gap-2">
                                    Procéder au paiement
                                    <CreditCard className="h-5 w-5 transition-transform group-hover:scale-110" />
                                </span>
                            </Button>

                            <p className="mt-4 text-center text-xs text-muted-foreground">
                                En procédant au paiement, vous acceptez nos
                                conditions générales de vente.
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
