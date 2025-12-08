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
use Ramsey\Uuid\Uuid;

class BudgetController extends Controller
{
    public function __construct(
        private readonly SetBudgetHandler $setHandler,
        private readonly DeleteBudgetHandler $deleteHandler,
        private readonly BudgetRepositoryInterface $repository
    ) {
    }

    public function index(): JsonResponse
    {
        $budgets = $this->repository->findAllByUser((string) auth()->id());

        return response()->json([
            'data' => array_map(fn ($b) => [
                'id' => $b->id()->toString(),
                'category_id' => $b->categoryId(),
                'amount' => $b->amount(),
                'currency' => $b->currency(),
                'period' => $b->period()->value,
            ], $budgets)
        ]);
    }

    public function store(SetBudgetRequest $request): JsonResponse
    {
        $command = new SetBudgetCommand(
            userId: (string) auth()->id(),
            categoryId: $request->input('category_id'),
            amount: (float) $request->input('amount'),
            currency: $request->input('currency'),
            period: $request->input('period')
        );

        $this->setHandler->handle($command);

        return response()->json([
            'message' => 'Budget set successfully',
        ], Response::HTTP_OK); // Using OK because it might be an update
    }

    public function destroy(string $id): JsonResponse
    {
        $this->deleteHandler->handle(new DeleteBudgetCommand(Uuid::fromString($id)));

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
