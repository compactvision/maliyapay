<?php

declare(strict_types=1);

namespace App\Modules\Growth\Domain\Services;

use App\Modules\Growth\Domain\Entities\Advice;
use App\Modules\Growth\Domain\Entities\BusinessModel;
use App\Modules\Growth\Domain\Entities\BusinessStep;
use App\Modules\Growth\Domain\Entities\RoutineKit;
use App\Modules\Growth\Domain\Entities\RoutineKitTask;
use App\Modules\Growth\Domain\Repositories\AdviceRepositoryInterface;
use App\Modules\Growth\Domain\Repositories\BusinessModelRepositoryInterface;
use App\Modules\Growth\Domain\Repositories\RoutineKitRepositoryInterface;
use App\Modules\Growth\Domain\Repositories\UserBusinessProgressRepositoryInterface;
use App\Modules\Growth\Domain\Entities\UserBusinessProgress;
use App\Modules\Growth\Infrastructure\Models\AdviceViewModel;
use Ramsey\Uuid\Uuid;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class GrowthService
{
    public function __construct(
        private readonly AdviceRepositoryInterface $adviceRepository,
        private readonly RoutineKitRepositoryInterface $routineKitRepository,
        private readonly BusinessModelRepositoryInterface $businessModelRepository,
        private readonly UserBusinessProgressRepositoryInterface $progressRepository
    ) {}

    public function getAdvice(string $id): ?Advice
    {
        return $this->adviceRepository->findById($id);
    }

    public function getAllAdvices(): array
    {
        $advices = $this->adviceRepository->findAll();
        
        // Add view counts to each advice
        foreach ($advices as $advice) {
            $viewCount = \App\Modules\Growth\Infrastructure\Models\AdviceModel::where('id', $advice->id)
                ->withCount('views')
                ->first();
            $advice->viewsCount = $viewCount ? $viewCount->views_count : 0;
        }
        
        return $advices;
    }

    public function getPublishedAdvices(): array
    {
        // Filter advices where status is 'published'
        // Since findAll returns an array of entities, we can filter them here
        // Ideally, the repository should support filtering, but for now we filter in memory to match getAllAdvices pattern
        $allAdvices = $this->getAllAdvices();
        
        return array_values(array_filter($allAdvices, function ($advice) {
            return $advice->status === 'published';
        }));
    }

    public function getAllRoutineKits(): array
    {
        $kits = $this->routineKitRepository->findAll();
        
        // Add import counts to each kit
        foreach ($kits as $kit) {
            $importCount = \App\Modules\Growth\Infrastructure\Models\RoutineKitModel::where('id', $kit->id)
                ->withCount('imports')
                ->first();
            $kit->imports = $importCount ? $importCount->imports_count : 0;
        }
        
        return $kits;
    }

    public function getPublishedRoutineKits(): array
    {
        $allKits = $this->getAllRoutineKits();
        
        return array_values(array_filter($allKits, function ($kit) {
            return $kit->status === 'published';
        }));
    }

    public function getAllBusinessModelsWithProgress(int $userId): array
    {
        $models = $this->businessModelRepository->findAll();
        $progressRecords = $this->progressRepository->findByUserId($userId);
        
        $progressMap = [];
        foreach ($progressRecords as $p) {
            $progressMap[$p->businessModelId] = $p;
        }

        foreach ($models as $model) {
            $progress = $progressMap[$model->id] ?? null;
            if ($progress) {
                $model->started = true;
                foreach ($model->steps as $step) {
                    $step->completed = in_array($step->id, $progress->completedSteps);
                }
            } else {
                $model->started = false;
                foreach ($model->steps as $step) {
                    $step->completed = false;
                }
            }
        }

        return $models;
    }

    public function getPublishedBusinessModelsWithProgress(int $userId): array
    {
        $allModels = $this->getAllBusinessModelsWithProgress($userId);
        
        return array_values(array_filter($allModels, function ($model) {
            return $model->status === 'published';
        }));
    }

    public function getBusinessModelWithProgress(int $userId, string $businessId): mixed
    {
        $model = $this->businessModelRepository->findById($businessId);
        
        if (!$model) {
            return null;
        }

        $progressRecords = $this->progressRepository->findByUserId($userId);
        $progress = collect($progressRecords)->firstWhere('businessModelId', $businessId);

        if ($progress) {
            $model->started = true;
            foreach ($model->steps as $step) {
                $step->completed = in_array($step->id, $progress->completedSteps);
            }
        } else {
            $model->started = false;
            foreach ($model->steps as $step) {
                $step->completed = false;
            }
        }

        return $model;
    }


    public function createAdvice(array $data): void
    {
        $advice = new Advice(
            Uuid::uuid4()->toString(),
            $data['title'],
            $data['summary'],
            $data['content'] ?? null,
            $data['category'],
            $data['status'] ?? 'draft',
            (bool) ($data['featured'] ?? false),
            $data['video_url'] ?? null,
            $data['author_name'] ?? null,
            (int) ($data['reading_time_minutes'] ?? 5),
            $this->combineImages($data),
            isset($data['published_at']) ? new \DateTime($data['published_at']) : new \DateTime(),
            new \DateTime(),
            new \DateTime()
        );
        $this->adviceRepository->save($advice);
    }

    public function updateAdvice(string $id, array $data): void
    {
        $existing = $this->adviceRepository->findById($id);
        if (!$existing) return;

        $advice = new Advice(
            $id,
            $data['title'] ?? $existing->title,
            $data['summary'] ?? $existing->summary,
            $data['content'] ?? $existing->content,
            $data['category'] ?? $existing->category,
            $data['status'] ?? $existing->status,
            isset($data['featured']) ? (bool) $data['featured'] : $existing->featured,
            $data['video_url'] ?? $existing->videoUrl,
            $data['author_name'] ?? $existing->authorName,
            isset($data['reading_time_minutes']) ? (int) $data['reading_time_minutes'] : $existing->readingTimeMinutes,
            $this->combineImages($data, $existing->images),
            isset($data['published_at']) ? new \DateTime($data['published_at']) : $existing->publishedAt,
            $existing->createdAt,
            new \DateTime()
        );
        $this->adviceRepository->save($advice);
    }

    public function deleteAdvice(string $id): void
    {
        $this->adviceRepository->delete($id);
    }

    public function createRoutineKit(array $data): void
    {
        $kitId = Uuid::uuid4()->toString();
        
        // Handle Tasks
        $tasks = [];
        if (isset($data['tasks'])) {
            $tasksData = $this->parseJson($data['tasks'], []);
            foreach ($tasksData as $taskData) {
                $taskId = $taskData['id'] ?? Uuid::uuid4()->toString();
                // Fix for provisional IDs
                if (is_numeric($taskId) || strlen($taskId) < 10) {
                     $taskId = Uuid::uuid4()->toString();
                }

                $tasks[] = new RoutineKitTask(
                    $taskId,
                    $kitId,
                    $taskData['title'],
                    $taskData['description'] ?? null,
                    (int) ($taskData['order_index'] ?? 0),
                    isset($taskData['day_of_week']) ? (int)$taskData['day_of_week'] : null,
                    $taskData['time_start'] ?? null,
                    $taskData['time_end'] ?? null,
                    $taskData['priority'] ?? 'medium',
                    (int) ($taskData['xp'] ?? 0)
                );
            }
        }
        
        $kit = new RoutineKit(
            $kitId,
            $data['name'],
            $data['description'] ?? null,
            $data['category'] ?? null,
            $data['color'] ?? null,
            $data['status'] ?? 'published',
            (bool) ($data['is_paid'] ?? false),
            isset($data['price_amount']) ? (float) $data['price_amount'] : null,
            $data['price_currency'] ?? null,
            $this->combineImages($data),
            $tasks
        );
        $this->routineKitRepository->save($kit);
    }

    public function updateRoutineKit(string $id, array $data): void
    {
        $existing = $this->routineKitRepository->findById($id);
        if (!$existing) return;

        // Handle Tasks
        $tasks = [];
        if (isset($data['tasks'])) {
            $tasksData = $this->parseJson($data['tasks'], []);
            foreach ($tasksData as $taskData) {
                $taskId = $taskData['id'] ?? Uuid::uuid4()->toString();
                // Fix for provisional IDs
                if (is_numeric($taskId) || strlen($taskId) < 10) {
                     $taskId = Uuid::uuid4()->toString();
                }

                $tasks[] = new RoutineKitTask(
                    $taskId,
                    $id,
                    $taskData['title'],
                    $taskData['description'] ?? null,
                    (int) ($taskData['order_index'] ?? 0),
                    isset($taskData['day_of_week']) ? (int)$taskData['day_of_week'] : null,
                    $taskData['time_start'] ?? null,
                    $taskData['time_end'] ?? null,
                    $taskData['priority'] ?? 'medium',
                    (int) ($taskData['xp'] ?? 0)
                );
            }
        } else {
            $tasks = $existing->tasks;
        }

        $kit = new RoutineKit(
            $id,
            $data['name'] ?? $existing->name,
            $data['description'] ?? $existing->description,
            $data['category'] ?? $existing->category,
            $data['color'] ?? $existing->color,
            $data['status'] ?? $existing->status,
            isset($data['is_paid']) ? (bool) $data['is_paid'] : $existing->isPaid,
            isset($data['price_amount']) ? (float) $data['price_amount'] : $existing->priceAmount,
            $data['price_currency'] ?? $existing->priceCurrency,
            $this->combineImages($data, $existing->images),
            $tasks
        );
        $this->routineKitRepository->save($kit);
    }

    public function deleteRoutineKit(string $id): void
    {
        $this->routineKitRepository->delete($id);
    }

    public function createBusinessModel(array $data): void
    {
        // Note: Currently createBusinessModel does not support initial steps creation. 
        // Steps are expected to be added via updates.
        $steps = []; // Initialize steps array

        $model = new BusinessModel(
            Uuid::uuid4()->toString(),
            $data['title'],
            $data['description'],
            $data['icon'] ?? null,
            $data['difficulty'] ?? 'Moyen',
            $data['potential'] ?? 'Élevé',
            $data['sector'] ?? 'Général',
            $this->handleSingleImage($data),
            $data['season'] ?? null,
            $data['cycle_duration'] ?? null,
            $this->parseJson($data['soil_types'] ?? null, []),
            $data['yield_potential'] ?? null,
            $this->parseJson($data['main_risks'] ?? null, []),
            $this->parseJson($data['business_plan'] ?? null, []),
            $steps,
            $data['status'] ?? 'published'
        );
        $this->businessModelRepository->save($model);
    }

    public function updateBusinessModel(string $id, array $data): void
    {
        $existing = $this->businessModelRepository->findById($id);
        if (!$existing) return;

        $steps = [];
        if (isset($data['steps'])) {
            $stepsData = $this->parseJson($data['steps'], []);
            foreach ($stepsData as $index => $stepData) {
                $stepId = $stepData['id'] ?? Uuid::uuid4()->toString();
                if (is_numeric($stepId) || strlen($stepId) < 10) {
                     $stepId = Uuid::uuid4()->toString();
                }

                // Handle Knowledge Images
                $knowledge = $this->parseJson($stepData['knowledge'] ?? null, []);
                
                // Get uploaded files for this step if any
                $uploadedFiles = $data['steps'][$index]['knowledge_images'] ?? [];
                
                if (!empty($uploadedFiles)) {
                    // Ensure images array exists
                    if (!isset($knowledge['images'])) {
                        $knowledge['images'] = [];
                    }
                    
                    foreach ($uploadedFiles as $file) {
                        if ($file instanceof UploadedFile) {
                            $path = $file->store('growth/knowledge', 'public');
                            $knowledge['images'][] = Storage::url($path);
                        }
                    }
                }

                $steps[] = new BusinessStep(
                    $stepId,
                    $id,
                    $stepData['title'],
                    $stepData['description'] ?? null,
                    (int) ($stepData['order_index'] ?? 0),
                    (int) ($stepData['level'] ?? 1),
                    $stepData['objective'] ?? null,
                    $knowledge,
                    $this->parseJson($stepData['actions'] ?? null, []),
                    $this->parseJson($stepData['costs'] ?? null, []),
                    $this->parseJson($stepData['routines'] ?? null, []),
                    $this->parseJson($stepData['progression'] ?? null, []),
                    (bool) ($stepData['locked'] ?? false),
                    (bool) ($stepData['is_paid'] ?? false),
                    isset($stepData['price_amount']) ? (float) $stepData['price_amount'] : null
                );
            }
        } else {
            $steps = $existing->steps;
        }

        $model = new BusinessModel(
            $id,
            $data['title'] ?? $existing->title,
            $data['description'] ?? $existing->description,
            $data['icon'] ?? $existing->icon,
            $data['difficulty'] ?? $existing->difficulty,
            $data['potential'] ?? $existing->potential,
            $data['sector'] ?? $existing->sector,
            $this->handleSingleImage($data, $existing->image),
            $data['season'] ?? $existing->season,
            $data['cycle_duration'] ?? $existing->cycleDuration,
            $this->parseJson($data['soil_types'] ?? $existing->soilTypes, []),
            $data['yield_potential'] ?? $existing->yieldPotential,
            $this->parseJson($data['main_risks'] ?? $existing->mainRisks, []),
            $this->parseJson($data['business_plan'] ?? $existing->businessPlan, []),
            $steps,
            $data['status'] ?? $existing->status
        );
        $this->businessModelRepository->save($model);
    }

    public function deleteBusinessModel(string $id): void
    {
        $this->businessModelRepository->delete($id);
    }

    private function parseJson($value, $default = [])
    {
        if (is_array($value)) return $value;
        if (is_string($value)) {
            $decoded = json_decode($value, true);
            return is_array($decoded) ? $decoded : $default;
        }
        return $default;
    }

    private function combineImages(array $data, array $existing = []): array
    {
        $finalImages = [];

        // 1. Handle existing images (strings passed from frontend)
        if (isset($data['existing_images'])) {
            $finalImages = is_array($data['existing_images']) ? $data['existing_images'] : [];
        } elseif (!array_key_exists('images', $data)) {
            // If neither existing_images nor images are provided, keep original existing
            $finalImages = $existing;
        }

        // 2. Handle new uploads
        if (isset($data['images']) && is_array($data['images'])) {
            foreach ($data['images'] as $file) {
                if ($file instanceof UploadedFile) {
                    $path = $file->store('growth/routine-kits', 'public');
                    $finalImages[] = Storage::url($path);
                } elseif (is_string($file)) {
                    $finalImages[] = $file;
                }
            }
        }

        return $finalImages;
    }

    private function handleSingleImage(array $data, ?string $existing = null): ?string
    {
        // 1. New upload
        if (isset($data['image']) && $data['image'] instanceof UploadedFile) {
            $path = $data['image']->store('growth/business-models', 'public');
            return Storage::url($path);
        }

        // 2. String passed
        if (isset($data['image']) && is_string($data['image'])) {
            return $data['image'];
        }

        // 3. Existing
        return $data['existing_image'] ?? $existing;
    }

    public function startBusinessQuest(int $userId, string $businessModelId): void
    {
        $progress = $this->progressRepository->findByUserAndModel($userId, $businessModelId);
        
        if (!$progress) {
            $progress = new UserBusinessProgress(
                Uuid::uuid4()->toString(),
                $userId,
                $businessModelId,
                [],
                'in_progress'
            );
            $this->progressRepository->save($progress);
        }
    }

    public function updateBusinessProgress(int $userId, string $businessModelId, string $stepId): void
    {
        $progress = $this->progressRepository->findByUserAndModel($userId, $businessModelId);
        
        if (!$progress) {
            $progress = new UserBusinessProgress(
                Uuid::uuid4()->toString(),
                $userId,
                $businessModelId,
                [$stepId],
                'in_progress'
            );
        } else {
            $completedSteps = $progress->completedSteps;
            if (!in_array($stepId, $completedSteps)) {
                $completedSteps[] = $stepId;
                $progress = new UserBusinessProgress(
                    $progress->id,
                    $progress->userId,
                    $progress->businessModelId,
                    $completedSteps,
                    $progress->status
                );
            }
        }

        $this->progressRepository->save($progress);
    }

    public function trackAdviceView(string $adviceId, int $userId): bool
    {
        try {
            // Check if user has already viewed this advice
            $existingView = AdviceViewModel::where('user_id', $userId)
                ->where('advice_id', $adviceId)
                ->first();
            
            if ($existingView) {
                return false; // Already viewed
            }
            
            // Create new view record
            AdviceViewModel::create([
                'id' => Uuid::uuid4()->toString(),
                'user_id' => $userId,
                'advice_id' => $adviceId,
                'viewed_at' => now(),
            ]);
            
            return true;
        } catch (\Exception $e) {
            \Log::error('Failed to track advice view: ' . $e->getMessage());
            return false;
        }
    }
}
