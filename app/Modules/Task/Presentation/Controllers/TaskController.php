<?php

declare(strict_types=1);

namespace App\Modules\Task\Presentation\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Task\Application\Commands\CreateTaskCommand;
use App\Modules\Task\Application\Commands\CreateTaskCommandHandler;
use App\Modules\Task\Application\Commands\DeleteTaskCommand;
use App\Modules\Task\Application\Commands\DeleteTaskCommandHandler;
use App\Modules\Task\Application\Commands\ToggleTaskCompletionCommand;
use App\Modules\Task\Application\Commands\ToggleTaskCompletionCommandHandler;
use App\Modules\Task\Application\Commands\UpdateTaskCommand;
use App\Modules\Task\Application\Commands\UpdateTaskCommandHandler;
use App\Modules\Task\Application\Queries\GetUserTasksQuery;
use App\Modules\Task\Application\Queries\GetUserTasksQueryHandler;
use App\Modules\Task\Presentation\Requests\CreateTaskRequest;
use App\Modules\Task\Presentation\Requests\UpdateTaskRequest;
use App\Modules\Task\Presentation\Resources\TaskResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function __construct(
        private CreateTaskCommandHandler $createTaskHandler,
        private UpdateTaskCommandHandler $updateTaskHandler,
        private ToggleTaskCompletionCommandHandler $toggleCompletionHandler,
        private DeleteTaskCommandHandler $deleteTaskHandler,
        private GetUserTasksQueryHandler $getUserTasksHandler
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $query = new GetUserTasksQuery($userId);
        $tasks = $this->getUserTasksHandler->handle($query);

        return response()->json([
            'tasks' => array_map(
                fn($task) => (new TaskResource($task))->toArray($request),
                $tasks
            ),
        ]);
    }

    public function store(CreateTaskRequest $request): JsonResponse
    {
        $userId = $request->user()->id;

        $command = new CreateTaskCommand(
            userId: $userId,
            title: $request->input('title'),
            description: $request->input('description'),
            priority: $request->input('priority'),
            dueDate: $request->input('dueDate')
        );

        try {
            $task = $this->createTaskHandler->handle($command);

            return response()->json([
                'message' => 'Tâche créée avec succès',
                'task' => (new TaskResource($task))->toArray($request),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la création de la tâche',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(UpdateTaskRequest $request, string $id): JsonResponse
    {
        $userId = $request->user()->id;

        $command = new UpdateTaskCommand(
            taskId: $id,
            userId: $userId,
            title: $request->input('title'),
            description: $request->input('description'),
            priority: $request->input('priority'),
            dueDate: $request->input('dueDate')
        );

        try {
            $this->updateTaskHandler->handle($command);

            return response()->json([
                'message' => 'Tâche mise à jour avec succès',
            ]);
        } catch (\DomainException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], $e->getMessage() === 'Task not found' ? 404 : 403);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la mise à jour de la tâche',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function toggleCompletion(Request $request, string $id): JsonResponse
    {
        $userId = $request->user()->id;

        $command = new ToggleTaskCompletionCommand(
            taskId: $id,
            userId: $userId
        );

        try {
            $this->toggleCompletionHandler->handle($command);

            return response()->json([
                'message' => 'État de la tâche modifié avec succès',
            ]);
        } catch (\DomainException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], $e->getMessage() === 'Task not found' ? 404 : 403);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la modification de la tâche',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $userId = $request->user()->id;

        $command = new DeleteTaskCommand(
            taskId: $id,
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
            ], $e->getMessage() === 'Task not found' ? 404 : 403);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la suppression de la tâche',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
