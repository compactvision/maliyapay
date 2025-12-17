<?php

declare(strict_types=1);

namespace App\Modules\Account\Presentation\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Account\Application\Commands\AddCurrencyToAccountCommand;
use App\Modules\Account\Application\Commands\CreateAccountCommand;
use App\Modules\Account\Application\Commands\DeleteAccountCommand;
use App\Modules\Account\Application\Handlers\AddCurrencyToAccountHandler;
use App\Modules\Account\Application\Handlers\CreateAccountHandler;
use App\Modules\Account\Application\Handlers\DeleteAccountHandler;
use App\Modules\Account\Application\Handlers\GetAccountByIdHandler;
use App\Modules\Account\Application\Handlers\GetAllAccountsHandler;
use App\Modules\Account\Application\Queries\GetAccountByIdQuery;
use App\Modules\Account\Application\Queries\GetAllAccountsQuery;
use App\Modules\Account\Presentation\Requests\AddCurrencyRequest;
use App\Modules\Account\Presentation\Requests\CreateAccountRequest;
use App\Modules\Account\Presentation\Resources\AccountCollection;
use App\Modules\Account\Presentation\Resources\AccountResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Ramsey\Uuid\Uuid;

class AccountController extends Controller
{
    public function __construct(
        private readonly CreateAccountHandler $createHandler,
        private readonly AddCurrencyToAccountHandler $addCurrencyHandler,
        private readonly GetAllAccountsHandler $getAllHandler,
        private readonly GetAccountByIdHandler $getByIdHandler,
        private readonly DeleteAccountHandler $deleteHandler
    ) {
    }

    public function index(): JsonResponse
    {
        try {
            $userId = (string) auth()->id();
            $query = new GetAllAccountsQuery($userId);
            $accounts = $this->getAllHandler->handle($query);

            return response()->json(new AccountCollection($accounts));
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve accounts',
                'error' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function store(CreateAccountRequest $request): JsonResponse
    {
        try {
            $command = new CreateAccountCommand(
                id: Uuid::uuid4(),
                userId: (string) auth()->id(),
                name: $request->input('name'),
                type: $request->input('type'),
                color: $request->input('color'),
                initialCurrency: $request->input('initial_currency'),
                initialBalance: $request->input('initial_balance') ? (float) $request->input('initial_balance') : 0.0
            );

            $this->createHandler->handle($command);

            return response()->json([
                'message' => 'Account created successfully',
                'id' => $command->id->toString(),
            ], Response::HTTP_CREATED);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create account',
                'error' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function show(string $id): JsonResponse
    {
        try {
            $userId = (string) auth()->id();
            $query = new GetAccountByIdQuery(Uuid::fromString($id), $userId);
            $account = $this->getByIdHandler->handle($query);

            if ($account === null) {
                return response()->json(['message' => 'Account not found'], Response::HTTP_NOT_FOUND);
            }

            return response()->json(new AccountResource($account));
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve account',
                'error' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function addCurrency(AddCurrencyRequest $request, string $id): JsonResponse
    {
        try {
            $command = new AddCurrencyToAccountCommand(
                accountId: Uuid::fromString($id),
                userId: (string) auth()->id(),
                currencyCode: $request->input('currency_code'),
                initialBalance: $request->input('initial_balance') ? (float) $request->input('initial_balance') : 0.0
            );

            $this->addCurrencyHandler->handle($command);

            return response()->json([
                'message' => 'Currency added successfully',
            ], Response::HTTP_OK);
        } catch (\InvalidArgumentException $e) { // Account not found
             return response()->json(['message' => $e->getMessage()], Response::HTTP_NOT_FOUND);
        } catch (\DomainException $e) { // Currency exists
             return response()->json(['message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to add currency',
                'error' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function destroy(string $id): JsonResponse
    {
        try {
            $command = new DeleteAccountCommand(
                accountId: Uuid::fromString($id),
                userId: (string) auth()->id()
            );

            $this->deleteHandler->handle($command);

            return response()->json([
                'message' => 'Account deleted successfully',
            ], Response::HTTP_OK);
        } catch (\DomainException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], Response::HTTP_BAD_REQUEST);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete account',
                'error' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
