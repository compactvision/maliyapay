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
use Ramsey\Uuid\Uuid;

class GrowthService
{
    public function __construct(
        private readonly AdviceRepositoryInterface $adviceRepository,
        private readonly RoutineKitRepositoryInterface $routineKitRepository,
        private readonly BusinessModelRepositoryInterface $businessModelRepository,
        private readonly UserBusinessProgressRepositoryInterface $progressRepository
    ) {}

    public function getAllAdvices(): array
    {
        return $this->adviceRepository->findAll();
    }

    public function getAllRoutineKits(): array
    {
        return $this->routineKitRepository->findAll();
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
                foreach ($model->steps as $step) {
                    $step->completed = in_array($step->id, $progress->completedSteps);
                }
            } else {
                foreach ($model->steps as $step) {
                    $step->completed = false;
                }
            }
        }

        return $models;
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
            $this->parseJson($data['images'] ?? null, []),
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
            $this->parseJson($data['images'] ?? $existing->images, $existing->images),
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
        $kit = new RoutineKit(
            Uuid::uuid4()->toString(),
            $data['name'],
            $data['description'] ?? null,
            $data['category'] ?? null,
            $data['color'] ?? null,
            $data['status'] ?? 'published',
            (bool) ($data['is_paid'] ?? false),
            isset($data['price_amount']) ? (float) $data['price_amount'] : null,
            $data['price_currency'] ?? null,
            $this->combineImages($data),
            [] // Tasks can be added via kit management later
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
                    $taskData['priority'] ?? 'medium'
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
        $model = new BusinessModel(
            Uuid::uuid4()->toString(),
            $data['title'],
            $data['description'],
            $data['icon'] ?? null,
            $data['difficulty'] ?? 'Moyen',
            $data['potential'] ?? 'Élevé',
            $data['sector'] ?? 'Général',
            $data['image'] ?? null,
            $data['season'] ?? null,
            $data['cycle_duration'] ?? null,
            $this->parseJson($data['soil_types'] ?? null, []),
            $data['yield_potential'] ?? null,
            $this->parseJson($data['main_risks'] ?? null, []),
            $this->parseJson($data['business_plan'] ?? null, []),
            []
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
            foreach ($stepsData as $stepData) {
                $stepId = $stepData['id'] ?? Uuid::uuid4()->toString();
                if (is_numeric($stepId) || strlen($stepId) < 10) {
                     $stepId = Uuid::uuid4()->toString();
                }

                $steps[] = new BusinessStep(
                    $stepId,
                    $id,
                    $stepData['title'],
                    $stepData['description'] ?? null,
                    (int) ($stepData['order_index'] ?? 0),
                    (int) ($stepData['level'] ?? 1),
                    $stepData['objective'] ?? null,
                    $this->parseJson($stepData['knowledge'] ?? null, []),
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
            $data['image'] ?? $data['existing_image'] ?? $existing->image,
            $data['season'] ?? $existing->season,
            $data['cycle_duration'] ?? $existing->cycleDuration,
            $this->parseJson($data['soil_types'] ?? $existing->soilTypes, []),
            $data['yield_potential'] ?? $existing->yieldPotential,
            $this->parseJson($data['main_risks'] ?? $existing->mainRisks, []),
            $this->parseJson($data['business_plan'] ?? $existing->businessPlan, []),
            $steps
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
        $combined = [];
        if (isset($data['existing_images'])) {
            $combined = (array)$data['existing_images'];
        }
        if (isset($data['images'])) {
            $combined = array_merge($combined, (array)$data['images']);
        }
        return $combined ?: $existing;
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
}
