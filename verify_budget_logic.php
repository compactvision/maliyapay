<?php

use App\Modules\Account\Domain\Entities\Account;
use App\Modules\Account\Domain\ValueObjects\AccountType;
use App\Modules\Account\Domain\ValueObjects\Balance;
use App\Modules\Budget\Domain\Entities\Budget;
use App\Modules\Budget\Domain\ValueObjects\BudgetPeriod;
use App\Modules\Transaction\Application\Commands\CreateTransactionCommand;
use App\Modules\Transaction\Application\Handlers\CreateTransactionHandler;
use App\Modules\Transaction\Domain\ValueObjects\TransactionType;
use Illuminate\Support\Facades\DB;
use Ramsey\Uuid\Uuid;

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Helpers
$user = \App\Models\User::first();
if (!$user) {
    echo "No user found. Run migration/seed first.\n";
    exit(1);
}
auth()->login($user);
$userId = (string) $user->id;

// 1. Setup Account & Category
$accountRepo = app(\App\Modules\Account\Domain\Repositories\AccountRepositoryInterface::class);
$accountId = Uuid::uuid4();
$account = Account::create($accountId, $userId, 'Test Account', AccountType::CHECKING, 'CDF', '#000000', [new Balance('CDF', 1000)]);
$accountRepo->save($account);

$categoryRepo = app(\App\Modules\Category\Domain\Repositories\CategoryRepositoryInterface::class);
$categoryId = Uuid::uuid4();
// Mock category creation if repo implementation allows or just assume ID exists if used in Budget/Transaction
// Actually need real category for FK constraints usually. 
// Let's just create one via DB facade to be quick
DB::table('categories')->insert([
    'id' => $categoryId->toString(),
    'user_id' => $userId,
    'name' => 'Test Category',
    'type' => 'expense',
    'color' => '#FF0000',
    'icon' => 'test',
    'created_at' => now(),
    'updated_at' => now(),
]);

// 2. Set Budget (Limit 100)
$budgetRepo = app(\App\Modules\Budget\Domain\Repositories\BudgetRepositoryInterface::class);
$budgetId = Uuid::uuid4();
$budget = Budget::create($budgetId, $userId, $categoryId->toString(), 100, 'CDF', BudgetPeriod::MONTHLY);
$budgetRepo->save($budget);

echo "Budget Set: 100 CDF\n";

// 3. Create Transaction (50 CDF)
$handler = app(CreateTransactionHandler::class);
try {
    $handler->handle(new CreateTransactionCommand(
        userId: $userId,
        accountId: $accountId->toString(),
        categoryId: $categoryId->toString(),
        amount: 50,
        currency: 'CDF',
        type: TransactionType::EXPENSE,
        description: 'Test Expense 1',
        date: new DateTimeImmutable()
    ));
    echo "Transaction 1 (50 CDF) Created.\n";
} catch (Exception $e) {
    echo "Error T1: " . $e->getMessage() . "\n";
}

// 4. Verify Spent Amount via Controller Logic
// We can't call Controller index easily here without Request mock, but we can check Repo/Handler logic.
$transactionRepo = app(\App\Modules\Transaction\Domain\Repositories\TransactionRepositoryInterface::class);
$spent = $transactionRepo->getSpentAmountForCategory(
    $userId,
    $categoryId->toString(),
    (new DateTimeImmutable())->modify('first day of this month')->setTime(0,0,0),
    (new DateTimeImmutable())->modify('last day of this month')->setTime(23,59,59)
);
echo "Spent Amount (Should be 50): $spent\n";

// 5. Create Transaction to Exceed (60 CDF -> Total 110 > 100)
try {
    $handler->handle(new CreateTransactionCommand(
        userId: $userId,
        accountId: $accountId->toString(),
        categoryId: $categoryId->toString(),
        amount: 60,
        currency: 'CDF',
        type: TransactionType::EXPENSE,
        description: 'Test Expense 2',
        date: new DateTimeImmutable()
    ));
    echo "Transaction 2 (60 CDF) Created (UNEXPECTED).\n";
} catch (Exception $e) {
    echo "Transaction 2 Blocked as Expected: " . $e->getMessage() . "\n";
}

// Cleanup
$accountRepo->delete($account);
$budgetRepo->delete($budget->id());
DB::table('categories')->where('id', $categoryId->toString())->delete();
DB::table('transactions')->where('account_id', $accountId->toString())->delete();

echo "\nVerification Complete.\n";
