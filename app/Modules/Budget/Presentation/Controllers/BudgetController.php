<?php

declare(strict_types=1);

namespace App\Modules\Budget\Presentation\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Budget\Application\Commands\DeleteBudgetCommand;
use App\Modules\Budget\Application\Commands\SetBudgetCommand;
use App\Modules\Budget\Application\Handlers\DeleteBudgetHandler;
use App\Modules\Budget\Application\Handlers\SetBudgetHandler;
use App\Modules\Budget\Domain\Repositories\BudgetRepositoryInterface;
use App\Modules\Budget\Presentation\Requests\SetBudgetRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Ramsey\Uuid\Uuid;

class BudgetController extends Controller
{
    public function __construct(
        private readonly SetBudgetHandler $setHandler,
        private readonly DeleteBudgetHandler $deleteHandler,
        private readonly BudgetRepositoryInterface $repository,
        private readonly \App\Modules\Transaction\Domain\Repositories\TransactionRepositoryInterface $transactionRepository
    ) {}

    public function index(): JsonResponse
    {
        $userId = (string) auth()->id();
        $budgets = $this->repository->findAllByUser($userId);

        $data = array_map(function ($b) use ($userId) {
            // Calculate period dates
            $now = new \DateTimeImmutable;
            $startDate = match ($b->period()->value) {
                'daily' => $now->setTime(0, 0, 0),
                'weekly' => $now->modify('monday this week')->setTime(0, 0, 0),
                'monthly' => $now->modify('first day of this month')->setTime(0, 0, 0),
            };

            $endDate = match ($b->period()->value) {
                'daily' => $now->setTime(23, 59, 59),
                'weekly' => $now->modify('sunday this week')->setTime(23, 59, 59),
                'monthly' => $now->modify('last day of this month')->setTime(23, 59, 59),
            };

            $spent = $this->transactionRepository->getSpentAmountForCategory(
                $userId,
                $b->categoryId(),
                $startDate,
                $endDate,
                $b->currency()
            );

            return [
                'id' => $b->id()->toString(),
                'category_id' => $b->categoryId(),
                'amount' => $b->amount(),
                'currency' => $b->currency(),
                'period' => $b->period()->value,
                'spent_amount' => $spent,
            ];
        }, $budgets);

        return response()->json([
            'data' => $data,
        ]);
    }

    public function store(SetBudgetRequest $request): JsonResponse
    {
        DB::transaction(fn () => $this->saveBudgetFromRequest($request));

        return response()->json([
            'message' => 'Budget set successfully',
        ], Response::HTTP_OK);
    }

    public function update(SetBudgetRequest $request, string $id): JsonResponse
    {
        $budget = $this->repository->findById(Uuid::fromString($id));

        abort_if(
            $budget === null || $budget->userId() !== (string) auth()->id(),
            Response::HTTP_NOT_FOUND
        );

        DB::transaction(fn () => $this->saveBudgetFromRequest($request));

        return response()->json([
            'message' => 'Budget updated successfully',
        ], Response::HTTP_OK);
    }

    private function saveBudgetFromRequest(SetBudgetRequest $request): void
    {
        $command = new SetBudgetCommand(
            userId: (string) auth()->id(),
            categoryId: $request->input('category_id'),
            amount: (float) $request->input('amount'),
            currency: strtoupper($request->input('currency')),
            period: $request->input('period')
        );

        $this->setHandler->handle($command);

        if ($request->filled('equivalent_amount') && $request->filled('equivalent_currency')) {
            $this->setHandler->handle(new SetBudgetCommand(
                userId: (string) auth()->id(),
                categoryId: $request->input('category_id'),
                amount: (float) $request->input('equivalent_amount'),
                currency: strtoupper($request->input('equivalent_currency')),
                period: $request->input('period')
            ));
        }
    }

    public function destroy(string $id): JsonResponse
    {
        $this->deleteHandler->handle(new DeleteBudgetCommand(Uuid::fromString($id)));

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
