<?php

declare(strict_types=1);

namespace App\Modules\Routine\Presentation\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Routine\Application\Commands\CreateRoutineTaskCommand;
use App\Modules\Routine\Application\Commands\CreateRoutineTaskCommandHandler;
use App\Modules\Routine\Application\Commands\DeleteRoutineTaskCommand;
use App\Modules\Routine\Application\Commands\DeleteRoutineTaskCommandHandler;
use App\Modules\Routine\Application\Commands\UpdateRoutineTaskCommand;
use App\Modules\Routine\Application\Commands\UpdateRoutineTaskCommandHandler;
use App\Modules\Routine\Application\Queries\GetRoutineTasksQuery;
use App\Modules\Routine\Application\Queries\GetRoutineTasksQueryHandler;
use App\Modules\Routine\Presentation\Requests\CreateRoutineTaskRequest;
use App\Modules\Routine\Presentation\Requests\UpdateRoutineTaskRequest;
use App\Modules\Routine\Presentation\Resources\RoutineTaskResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoutineTaskController extends Controller
{
    public function __construct(
        private CreateRoutineTaskCommandHandler $createTaskHandler,
        private UpdateRoutineTaskCommandHandler $updateTaskHandler,
        private DeleteRoutineTaskCommandHandler $deleteTaskHandler,
        private GetRoutineTasksQueryHandler $getRoutineTasksHandler
    ) {
    }

    public function index(Request $request, string $routineId): JsonResponse
    {
        $userId = $request->user()->id;

        $query = new GetRoutineTasksQuery($routineId, $userId);

        try {
            $tasks = $this->getRoutineTasksHandler->handle($query);

            return response()->json([
                'tasks' => array_map(
                    fn($task) => (new RoutineTaskResource($task))->toArray($request),
                    $tasks
                ),
            ]);
        } catch (\DomainException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 403);
        }
    }

    public function store(CreateRoutineTaskRequest $request, string $routineId): JsonResponse
    {
        $userId = $request->user()->id;

        $command = new CreateRoutineTaskCommand(
            routineId: $routineId,
            userId: $userId,
            title: $request->input('title'),
            description: $request->input('description'),
            dayOfWeek: $request->input('dayOfWeek'),
            timeStart: $request->input('timeStart'),
            timeEnd: $request->input('timeEnd'),
            priority: $request->input('priority', 'medium'),
            orderIndex: $request->input('orderIndex', 0)
        );

        try {
            $task = $this->createTaskHandler->handle($command);

            return response()->json([
                'message' => 'Tâche créée avec succès',
                'task' => (new RoutineTaskResource($task))->toArray($request),
            ], 201);
        } catch (\DomainException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], $e->getMessage() === 'Routine not found' ? 404 : 403);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la création de la tâche',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(UpdateRoutineTaskRequest $request, string $routineId, string $taskId): JsonResponse
    {
        $userId = $request->user()->id;

        $command = new UpdateRoutineTaskCommand(
            routineTaskId: $taskId,
            userId: $userId,
            title: $request->input('title'),
            description: $request->input('description'),
            dayOfWeek: $request->input('dayOfWeek'),
            timeStart: $request->input('timeStart'),
            timeEnd: $request->input('timeEnd'),
            priority: $request->input('priority'),
            orderIndex: $request->input('orderIndex', 0)
        );

        try {
            $this->updateTaskHandler->handle($command);

            return response()->json([
                'message' => 'Tâche mise à jour avec succès',
            ]);
        } catch (\DomainException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], $e->getMessage() === 'Routine task not found' ? 404 : 403);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la mise à jour de la tâche',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(Request $request, string $routineId, string $taskId): JsonResponse
    {
        $userId = $request->user()->id;

        $command = new DeleteRoutineTaskCommand(
            routineTaskId: $taskId,
            userId: $userId
        );

        try {
            $this->deleteTaskHandler->handle($command);

            return response()->json([
                'message' => 'Tâche supprimée avec succès',
            ]);
        } catch (\DomainException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], $e->getMessage() === 'Routine task not found' ? 404 : 403);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la suppression de la tâche',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
