import { createContext, ReactNode, useContext, useState } from 'react';

type ModalType = 'transaction' | 'budget' | 'category' | 'account' | null;

interface QuickActionContextType {
    activeModal: ModalType;
    openTransactionModal: () => void;
    openBudgetModal: () => void;
    openCategoryModal: () => void;
    openAccountModal: () => void;
    closeModal: () => void;
}

const QuickActionContext = createContext<QuickActionContextType | undefined>(
    undefined,
);

export function QuickActionProvider({ children }: { children: ReactNode }) {
    const [activeModal, setActiveModal] = useState<ModalType>(null);

    const openTransactionModal = () => setActiveModal('transaction');
    const openBudgetModal = () => setActiveModal('budget');
    const openCategoryModal = () => setActiveModal('category');
    const openAccountModal = () => setActiveModal('account');
    const closeModal = () => setActiveModal(null);

    return (
        <QuickActionContext.Provider
            value={{
                activeModal,
                openTransactionModal,
                openBudgetModal,
                openCategoryModal,
                openAccountModal,
                closeModal,
            }}
        >
            {children}
        </QuickActionContext.Provider>
    );
}

export function useQuickAction() {
    const context = useContext(QuickActionContext);
    if (context === undefined) {
        throw new Error(
            'useQuickAction must be used within a QuickActionProvider',
        );
    }
    return context;
}
