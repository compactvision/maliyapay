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
            'images' => 'nullable|array',
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
            'images' => 'nullable|array',
            'existing_images' => 'nullable|array',
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
        // Decode JSON fields if they're sent as strings (from FormData)
        $requestData = $request->all();
        if (isset($requestData['tasks']) && is_string($requestData['tasks'])) {
            $requestData['tasks'] = json_decode($requestData['tasks'], true) ?? [];
        }
        $request->merge($requestData);
        
        $data = $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'category' => 'nullable|string',
            'color' => 'nullable|string',
            'status' => 'nullable|string',
            'is_paid' => 'nullable|boolean',
            'price_amount' => 'nullable|numeric',
            'price_currency' => 'nullable|string|in:MONEY,XP',
            'tasks' => 'nullable|array',
            'tasks.*.id' => 'nullable|string',
            'tasks.*.title' => 'required_with:tasks|string',
            'tasks.*.description' => 'nullable|string',
            'tasks.*.day_of_week' => 'nullable|integer|min:1|max:7',
            'tasks.*.order_index' => 'nullable|integer|min:0',
            'tasks.*.time_start' => 'nullable|string',
            'tasks.*.time_end' => 'nullable|string',
            'tasks.*.priority' => 'nullable|string|in:low,medium,high',
            'images' => 'nullable|array',
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
            'status' => 'nullable|string',
            'is_paid' => 'nullable|boolean',
            'price_amount' => 'nullable|numeric',
            'price_currency' => 'nullable|string',
            'tasks' => 'nullable|array',
            'tasks.*.id' => 'nullable|string',
            'tasks.*.title' => 'required_with:tasks|string',
            'tasks.*.description' => 'nullable|string',
            'tasks.*.day_of_week' => 'nullable|integer|min:1|max:7',
            'tasks.*.order_index' => 'nullable|integer|min:0',
            'tasks.*.time_start' => 'nullable|string',
            'tasks.*.time_end' => 'nullable|string',
            'tasks.*.priority' => 'nullable|string|in:low,medium,high',
            'images' => 'nullable|array',
            'existing_images' => 'nullable|array',
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
            'season' => 'nullable|string',
            'cycle_duration' => 'nullable|string',
            'soil_types' => 'nullable', // Allow array or string
            'yield_potential' => 'nullable|string',
            'main_risks' => 'nullable', // Allow array or string
            'business_plan' => 'nullable', // Allow array or string
            'steps' => 'nullable|array',
            'steps.*.title' => 'required_with:steps|string',
            'steps.*.description' => 'nullable|string',
            'steps.*.order_index' => 'nullable|integer',
            'steps.*.level' => 'nullable|integer',
            'steps.*.objective' => 'nullable|string',
            'steps.*.knowledge' => 'nullable', // Allow array or string (will be parsed)
            'steps.*.actions' => 'nullable',
            'steps.*.costs' => 'nullable',
            'steps.*.routines' => 'nullable',
            'steps.*.progression' => 'nullable',
            'steps.*.locked' => 'nullable|boolean',
            'steps.*.completed' => 'nullable|boolean',
            'steps.*.is_paid' => 'nullable|boolean',
            'steps.*.price_amount' => 'nullable|numeric',
            'steps.*.knowledge_images' => 'nullable|array',
            'steps.*.knowledge_images.*' => 'file|image|max:5120',
            'image' => 'nullable|file|image|max:10240',
        ]);

        $this->growthService->createBusinessModel($data);
        return response()->json(['message' => 'Business Model created successfully'], 201);
    }

    public function updateBusinessModel(Request $request, string $id): JsonResponse
    {
        // Decode specific JSON fields if they're sent as strings (from FormData)
        $jsonFields = ['steps', 'soil_types', 'main_risks', 'business_plan'];
        $decodedData = [];
        
        foreach ($jsonFields as $field) {
            if ($request->has($field) && is_string($request->input($field))) {
                $decodedData[$field] = json_decode($request->input($field), true) ?? [];
            }
        }
        
        // Merge decoded data back into request for validation
        if (!empty($decodedData)) {
            $request->merge($decodedData);
        }
        
        $data = $request->validate([
            'title' => 'nullable|string',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'difficulty' => 'nullable|string',
            'potential' => 'nullable|string',
            'sector' => 'nullable|string',
            'season' => 'nullable|string',
            'cycle_duration' => 'nullable|string',
            'soil_types' => 'nullable', // Allow array or string
            'yield_potential' => 'nullable|string',
            'main_risks' => 'nullable', // Allow array or string
            'business_plan' => 'nullable', // Allow array or string
            'steps' => 'nullable|array',
            'steps.*.title' => 'required_with:steps|string',
            'steps.*.description' => 'nullable|string',
            'steps.*.order_index' => 'nullable|integer',
            'steps.*.level' => 'nullable|integer',
            'steps.*.objective' => 'nullable|string',
            'steps.*.knowledge' => 'nullable', // Allow array or string (will be parsed)
            'steps.*.actions' => 'nullable',
            'steps.*.costs' => 'nullable',
            'steps.*.routines' => 'nullable',
            'steps.*.progression' => 'nullable',
            'steps.*.locked' => 'nullable|boolean',
            'steps.*.completed' => 'nullable|boolean',
            'steps.*.is_paid' => 'nullable|boolean',
            'steps.*.price_amount' => 'nullable|numeric',
            'steps.*.knowledge_images' => 'nullable|array',
            'steps.*.knowledge_images.*' => 'file|image|max:5120',
            'image' => 'nullable|file|image|max:10240',
            'existing_image' => 'nullable|string',
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
