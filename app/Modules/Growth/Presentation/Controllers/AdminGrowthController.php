<?php

declare(strict_types=1);

namespace App\Modules\Growth\Presentation\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Growth\Domain\Services\GrowthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminGrowthController extends Controller
{
    public function __construct(
        private readonly GrowthService $growthService
    ) {}

    public function storeAdvice(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => 'required|string',
            'summary' => 'required|string',
            'content' => 'nullable|string',
            'category' => 'required|string',
            'published_at' => 'nullable|date',
        ]);

        $this->growthService->createAdvice($data);
        return response()->json(['message' => 'Advice created successfully'], 201);
    }

    public function updateAdvice(Request $request, string $id): JsonResponse
    {
        // Decode JSON fields if they're sent as strings (from FormData)
        $requestData = $request->all();
        if (isset($requestData['images']) && is_string($requestData['images'])) {
            $requestData['images'] = json_decode($requestData['images'], true) ?? [];
        }
        $request->merge($requestData);
        
        $data = $request->validate([
            'title' => 'nullable|string',
            'summary' => 'nullable|string',
            'content' => 'nullable|string',
            'category' => 'nullable|string',
            'published_at' => 'nullable|date',
        ]);

        $this->growthService->updateAdvice($id, $data);
        return response()->json(['message' => 'Advice updated successfully']);
    }

    public function destroyAdvice(string $id): JsonResponse
    {
        $this->growthService->deleteAdvice($id);
        return response()->json(['message' => 'Advice deleted successfully']);
    }

    public function storeRoutineKit(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'category' => 'nullable|string',
            'color' => 'nullable|string',
            'is_paid' => 'nullable|boolean',
            'price_amount' => 'nullable|numeric',
            'price_currency' => 'nullable|string|in:MONEY,XP',
        ]);

        $this->growthService->createRoutineKit($data);
        return response()->json(['message' => 'Routine Kit created successfully'], 201);
    }

    public function updateRoutineKit(Request $request, string $id): JsonResponse
    {
        // Decode JSON fields if they're sent as strings (from FormData)
        $requestData = $request->all();
        if (isset($requestData['tasks']) && is_string($requestData['tasks'])) {
            $requestData['tasks'] = json_decode($requestData['tasks'], true) ?? [];
        }
        $request->merge($requestData);
        
        $data = $request->validate([
            'name' => 'nullable|string',
            'description' => 'nullable|string',
            'category' => 'nullable|string',
            'color' => 'nullable|string',
            'is_paid' => 'nullable|boolean',
            'price_amount' => 'nullable|numeric',
            'price_currency' => 'nullable|string',
            'tasks' => 'nullable|array',
            'tasks.*.title' => 'required_with:tasks|string',
        ]);

        $this->growthService->updateRoutineKit($id, $data);
        return response()->json(['message' => 'Routine Kit updated successfully']);
    }

    public function destroyRoutineKit(string $id): JsonResponse
    {
        $this->growthService->deleteRoutineKit($id);
        return response()->json(['message' => 'Routine Kit deleted successfully']);
    }

    public function storeBusinessModel(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => 'required|string',
            'description' => 'required|string',
            'icon' => 'nullable|string',
            'difficulty' => 'nullable|string',
            'potential' => 'nullable|string',
            'sector' => 'nullable|string',
        ]);

        $this->growthService->createBusinessModel($data);
        return response()->json(['message' => 'Business Model created successfully'], 201);
    }

    public function updateBusinessModel(Request $request, string $id): JsonResponse
    {
        // Decode JSON fields if they're sent as strings (from FormData)
        $requestData = $request->all();
        
        $jsonFields = ['steps', 'soil_types', 'main_risks', 'business_plan'];
        foreach ($jsonFields as $field) {
            if (isset($requestData[$field]) && is_string($requestData[$field])) {
                $requestData[$field] = json_decode($requestData[$field], true) ?? [];
            }
        }
        
        // Merge back into request for validation
        $request->merge($requestData);
        
        $data = $request->validate([
            'title' => 'nullable|string',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'difficulty' => 'nullable|string',
            'potential' => 'nullable|string',
            'sector' => 'nullable|string',
            'steps' => 'nullable|array',
            'steps.*.title' => 'required_with:steps|string',
            'steps.*.is_paid' => 'nullable|boolean',
            'steps.*.price_amount' => 'nullable|numeric',
        ]);

        $this->growthService->updateBusinessModel($id, $data);
        return response()->json(['message' => 'Business Model updated successfully']);
    }

    public function destroyBusinessModel(string $id): JsonResponse
    {
        $this->growthService->deleteBusinessModel($id);
        return response()->json(['message' => 'Business Model deleted successfully']);
    }
}
