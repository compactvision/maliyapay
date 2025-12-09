<?php

declare(strict_types=1);

namespace App\Modules\Routine\Presentation\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Routine\Application\Commands\CreateRoutineCommand;
use App\Modules\Routine\Application\Commands\CreateRoutineCommandHandler;
use App\Modules\Routine\Application\Commands\DeleteRoutineCommand;
use App\Modules\Routine\Application\Commands\DeleteRoutineCommandHandler;
use App\Modules\Routine\Application\Commands\ToggleRoutineActiveCommand;
use App\Modules\Routine\Application\Commands\ToggleRoutineActiveCommandHandler;
use App\Modules\Routine\Application\Commands\UpdateRoutineCommand;
use App\Modules\Routine\Application\Commands\UpdateRoutineCommandHandler;
use App\Modules\Routine\Application\Queries\GetRoutineTasksForDayQuery;
use App\Modules\Routine\Application\Queries\GetRoutineTasksForDayQueryHandler;
use App\Modules\Routine\Application\Queries\GetUserRoutinesQuery;
use App\Modules\Routine\Application\Queries\GetUserRoutinesQueryHandler;
use App\Modules\Routine\Presentation\Requests\CreateRoutineRequest;
use App\Modules\Routine\Presentation\Requests\UpdateRoutineRequest;
use App\Modules\Routine\Presentation\Resources\RoutineResource;
use App\Modules\Routine\Presentation\Resources\RoutineTaskResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoutineController extends Controller
{
    public function __construct(
        private CreateRoutineCommandHandler $createRoutineHandler,
        private UpdateRoutineCommandHandler $updateRoutineHandler,
        private DeleteRoutineCommandHandler $deleteRoutineHandler,
        private ToggleRoutineActiveCommandHandler $toggleActiveHandler,
        private GetUserRoutinesQueryHandler $getUserRoutinesHandler,
        private GetRoutineTasksForDayQueryHandler $getRoutineTasksForDayHandler
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $activeOnly = $request->boolean('active_only', false);

        $query = new GetUserRoutinesQuery($userId, $activeOnly);
        $routines = $this->getUserRoutinesHandler->handle($query);

        return response()->json([
            'routines' => array_map(
                fn($routine) => (new RoutineResource($routine))->toArray($request),
                $routines
            ),
        ]);
    }

    public function store(CreateRoutineRequest $request): JsonResponse
    {
        $userId = $request->user()->id;

        $command = new CreateRoutineCommand(
            userId: $userId,
            name: $request->input('name'),
            color: $request->input('color'),
            tasks: $request->input('tasks', [])
        );

        try {
            $routine = $this->createRoutineHandler->handle($command);

            return response()->json([
                'message' => 'Routine créée avec succès',
                'routine' => (new RoutineResource($routine))->toArray($request),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la création de la routine',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(UpdateRoutineRequest $request, string $id): JsonResponse
    {
        $userId = $request->user()->id;

        $command = new UpdateRoutineCommand(
            routineId: $id,
            userId: $userId,
            name: $request->input('name'),
            color: $request->input('color')
        );

        try {
            $this->updateRoutineHandler->handle($command);

            return response()->json([
                'message' => 'Routine mise à jour avec succès',
            ]);
        } catch (\DomainException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], $e->getMessage() === 'Routine not found' ? 404 : 403);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la mise à jour de la routine',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function toggleActive(Request $request, string $id): JsonResponse
    {
        $userId = $request->user()->id;

        $command = new ToggleRoutineActiveCommand(
            routineId: $id,
            userId: $userId
        );

        try {
            $this->toggleActiveHandler->handle($command);

            return response()->json([
                'message' => 'État de la routine modifié avec succès',
            ]);
        } catch (\DomainException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], $e->getMessage() === 'Routine not found' ? 404 : 403);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la modification de la routine',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $userId = $request->user()->id;

        $command = new DeleteRoutineCommand(
            routineId: $id,
            userId: $userId
        );

        try {
            $this->deleteRoutineHandler->handle($command);

            return response()->json([
                'message' => 'Routine supprimée avec succès',
            ]);
        } catch (\DomainException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], $e->getMessage() === 'Routine not found' ? 404 : 403);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la suppression de la routine',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function tasksForDay(Request $request, int $dayOfWeek): JsonResponse
    {
        $userId = $request->user()->id;

        $query = new GetRoutineTasksForDayQuery($userId, $dayOfWeek);
        $routineTasks = $this->getRoutineTasksForDayHandler->handle($query);

        return response()->json([
            'tasks' => array_map(
                fn($task) => (new RoutineTaskResource($task))->toArray($request),
                $routineTasks
            ),
        ]);
    }
}
