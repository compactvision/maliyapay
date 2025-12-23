import { AccountForm } from '@/components/accounts/AccountForm';
import { BudgetForm } from '@/components/budgets/BudgetForm';
import { CategoryForm } from '@/components/categories/CategoryForm';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { useQuickAction } from '@/contexts/QuickActionContext';
import { router } from '@inertiajs/react';

export function QuickActionModals() {
    const { activeModal, closeModal } = useQuickAction();

    const handleSuccess = () => {
        // Refresh the current page data if needed
        router.reload({ preserveScroll: true });
    };

    return (
        <>
            <TransactionForm
                open={activeModal === 'transaction'}
                onOpenChange={(open) => !open && closeModal()}
                onSuccess={handleSuccess}
            />
            <BudgetForm
                open={activeModal === 'budget'}
                onOpenChange={(open) => !open && closeModal()}
                onSuccess={handleSuccess}
            />
            <CategoryForm
                open={activeModal === 'category'}
                onOpenChange={(open) => !open && closeModal()}
                onSuccess={handleSuccess}
            />
            <AccountForm
                open={activeModal === 'account'}
                onOpenChange={(open) => !open && closeModal()}
                onSuccess={handleSuccess}
            />
        </>
    );
}
