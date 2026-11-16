<?php

declare(strict_types=1);

namespace App\Modules\Transaction\Presentation\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Transaction\Application\Commands\CreateTransactionCommand;
use App\Modules\Transaction\Application\Commands\DeleteTransactionCommand;
use App\Modules\Transaction\Application\Exceptions\ExchangeIsReadOnly;
use App\Modules\Transaction\Application\Exceptions\TransactionIdempotencyConflict;
use App\Modules\Transaction\Application\Handlers\CreateTransactionHandler;
use App\Modules\Transaction\Application\Handlers\DeleteTransactionHandler;
use App\Modules\Transaction\Domain\Repositories\TransactionRepositoryInterface;
use App\Modules\Transaction\Domain\ValueObjects\TransactionType;
use App\Modules\Transaction\Infrastructure\Models\Transaction as TransactionModel;
use App\Modules\Transaction\Presentation\Requests\CreateTransactionRequest;
use App\Modules\Transaction\Presentation\Resources\TransactionResource;
use DateTimeImmutable;
use DomainException;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

use App\Modules\Notification\Domain\Services\BudgetNotificationService;
// use App\Modules\Transaction\Application\Handlers\CreateTransactionHandler;
use App\Modules\Transaction\Infrastructure\Repositories\EloquentTransactionRepository;

class TransactionController extends Controller
{
    public function __construct(
        private readonly CreateTransactionHandler $createHandler,
        private readonly DeleteTransactionHandler $deleteHandler,
        private readonly EloquentTransactionRepository $repository,
        private readonly BudgetNotificationService $budgetNotificationService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $month = $request->input('month', date('Y-m')); // Default current month
        $startDate = new DateTimeImmutable($month . '-01 00:00:00');
        $nextMonth = $startDate->modify('first day of next month');
        $offsetOptions = ['options' => ['min_range' => -840, 'max_range' => 840]];
        $startOffset = filter_var($request->header('X-Month-Start-Offset'), FILTER_VALIDATE_INT, $offsetOptions);
        $endOffset = filter_var($request->header('X-Month-End-Offset'), FILTER_VALIDATE_INT, $offsetOptions);

        if ($startOffset !== false && $endOffset !== false && ($startOffset !== 0 || $endOffset !== 0)) {
            $filtered = $this->repository->findHistoryByUserAndPeriod(
                (string) auth()->id(),
                $startDate,
                $nextMonth,
                $startDate->modify(sprintf('%+d minutes', -$startOffset)),
                $nextMonth->modify(sprintf('%+d minutes', -$endOffset)),
            );
        } else {
            $filtered = $this->repository->findByUserAndPeriod(
                (string) auth()->id(),
                $startDate,
                $nextMonth->modify('-1 second'),
            );
        }

        // Calculate Totals for this month grouped by currency
        $totals = [];
        foreach ($filtered as $t) {
            if ($t->type() === TransactionType::EXCHANGE) {
                continue;
            }

            $currency = $t->currency();
            if (!isset($totals[$currency])) {
                $totals[$currency] = ['income' => 0, 'expenses' => 0];
            }
            
            if ($t->type() === TransactionType::INCOME) {
                $totals[$currency]['income'] += $t->amount();
            } else {
                $totals[$currency]['expenses'] += $t->amount();
            }
        }

        return response()->json([
            'data' => array_map(fn ($transaction) => [
                ...TransactionResource::make($transaction)->resolve($request),
                'user_id' => $transaction->userId(),
            ], $filtered),
            'meta' => [
                'totals' => $totals,
            ]
        ]);
    }

    public function store(CreateTransactionRequest $request): JsonResponse
    {
        $key = $request->validated('idempotency_key');

        try {
            $command = new CreateTransactionCommand(
                userId: (string) auth()->id(),
                accountId: strtolower($request->validated('account_id')),
                categoryId: strtolower($request->validated('category_id')),
                amount: (float) $request->validated('amount'),
                currency: $request->validated('currency'),
                type: TransactionType::from($request->validated('type')),
                description: $request->validated('description'),
                date: new DateTimeImmutable($request->validated('date')),
                idempotencyKey: $key,
            );

            $transactionId = $this->createHandler->handle($command);

            return response()->json([
                'message' => 'Transaction created successfully',
                'transaction_id' => $transactionId,
            ], Response::HTTP_CREATED);
        } catch (TransactionIdempotencyConflict) {
            return response()->json([
                'message' => 'This idempotency key has already been used for a different transaction.',
            ], Response::HTTP_CONFLICT);
        } catch (DomainException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], $key === null ? Response::HTTP_BAD_REQUEST : Response::HTTP_UNPROCESSABLE_ENTITY);
        }
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $transaction = TransactionModel::where('user_id', auth()->id())->findOrFail($id);

        if ($transaction->type === TransactionType::EXCHANGE->value) {
            return response()->json(['message' => ExchangeIsReadOnly::MESSAGE], Response::HTTP_CONFLICT);
        }

        $request->validate([
            'type' => ['sometimes', 'required', 'in:income,expense'],
            'category_id' => ['sometimes', 'required', 'uuid'],
        ]);

        $transaction->update($request->only([
            'account_id', 'category_id', 'amount', 'currency', 'type', 'description', 'date',
        ]));

        return response()->json(['message' => 'Transaction updated']);
    }

    public function destroy(string $id): JsonResponse
    {
        try {
            $command = new DeleteTransactionCommand(
                transactionId: $id,
                userId: (string) auth()->id()
            );

            $this->deleteHandler->handle($command);

            return response()->json(['message' => 'Transaction deleted successfully']);

        } catch (ExchangeIsReadOnly $e) {
            return response()->json(['message' => $e->getMessage()], Response::HTTP_CONFLICT);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
}
