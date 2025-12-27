<?php

declare(strict_types=1);

namespace App\Modules\Growth\Presentation\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Growth\Domain\Services\GrowthService;
use App\Modules\Growth\Domain\Services\RoutineImportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GrowthController extends Controller
{
    public function __construct(
        private readonly GrowthService $growthService,
        private readonly RoutineImportService $routineImportService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // If user has permission to manage growth content, show all items (including drafts)
        // Otherwise, show only published items
        if ($user->can('manage growth') || $user->hasRole('admin')) {
             $advices = $this->growthService->getAllAdvices();
             $routineKits = $this->growthService->getAllRoutineKits();
             $businessModels = $this->growthService->getAllBusinessModelsWithProgress((int) $user->id);
        } else {
             $advices = $this->growthService->getPublishedAdvices();
             $routineKits = $this->growthService->getPublishedRoutineKits();
             $businessModels = $this->growthService->getPublishedBusinessModelsWithProgress((int) $user->id);
        }

        return response()->json([
            'advices' => $advices,
            'routine_kits' => $routineKits,
            'business_models' => $businessModels,
        ]);
    }

    public function showAdvice(string $id, Request $request): \Inertia\Response
    {
        $advice = $this->growthService->getAdvice($id);
        if (!$advice) {
            abort(404);
        }

        // Track the view
        if ($request->user()) {
            $this->growthService->trackAdviceView($id, (int) $request->user()->id);
        }

        return Inertia::render('growth/AdviceDetail', [
            'advice' => $advice,
        ]);
    }

    public function showQuestStep(string $businessId, string $stepId, Request $request): \Inertia\Response
    {
        $business = $this->growthService->getBusinessModelWithProgress((int) $request->user()->id, $businessId);
        
        if (!$business) {
            abort(404, 'Business model not found');
        }

        // Find the step
        $step = collect($business->steps)->firstWhere('id', $stepId);
        
        if (!$step) {
            abort(404, 'Step not found');
        }

        return Inertia::render('growth/QuestStepDetail', [
            'business' => $business,
            'stepId' => $stepId,
        ]);
    }


    public function updateBusinessProgress(Request $request): JsonResponse
    {
        $data = $request->validate([
            'business_model_id' => 'required|string',
            'step_id' => 'required|string',
        ]);

        $this->growthService->updateBusinessProgress(
            (int) $request->user()->id,
            $data['business_model_id'],
            $data['step_id']
        );

        return response()->json(['message' => 'Progress updated successfully']);
    }

    public function startQuest(Request $request): JsonResponse
    {
        $data = $request->validate([
            'business_model_id' => 'required|string',
        ]);

        $this->growthService->startBusinessQuest(
            (int) $request->user()->id,
            $data['business_model_id']
        );

        return response()->json(['message' => 'Quest started successfully']);
    }

    public function importRoutineKit(string $id, Request $request): JsonResponse
    {
        try {
            $this->routineImportService->importKitToUser($id, (int) $request->user()->id);
            return response()->json(['message' => 'Routine kit imported successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function config(Request $request)
    {
        $item = json_decode($request->get('item'), true);
        $type = $request->get('type');
        
        return Inertia::render('admin/growth/Config', [
            'item' => $item,
            'type' => $type,
        ]);
    }

    public function adviceConfig(Request $request)
    {
        return Inertia::render('admin/growth/AdviceConfig', [
            'item' => json_decode($request->get('item'), true),
        ]);
    }

    public function kitConfig(Request $request)
    {
        return Inertia::render('admin/growth/KitConfig', [
            'item' => json_decode($request->get('item'), true),
        ]);
    }

    public function businessConfig(Request $request)
    {
        return Inertia::render('admin/growth/BusinessConfig', [
            'item' => json_decode($request->get('item'), true),
        ]);
    }
}
