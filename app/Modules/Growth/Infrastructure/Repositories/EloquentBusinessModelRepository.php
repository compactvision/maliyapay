<?php

declare(strict_types=1);

namespace App\Modules\Growth\Infrastructure\Repositories;

use App\Modules\Growth\Domain\Entities\BusinessModel;
use App\Modules\Growth\Domain\Entities\BusinessStep;
use App\Modules\Growth\Domain\Repositories\BusinessModelRepositoryInterface;
use App\Modules\Growth\Infrastructure\Models\BusinessModel as BusinessEloquentModel;
use App\Modules\Growth\Infrastructure\Models\BusinessStepModel;

class EloquentBusinessModelRepository implements BusinessModelRepositoryInterface
{
    public function findAll(): array
    {
        return BusinessEloquentModel::with('steps')
            ->get()
            ->map(fn($model) => $this->toDomain($model))
            ->all();
    }

    public function findById(string $id): ?BusinessModel
    {
        $model = BusinessEloquentModel::with('steps')->find($id);
        return $model ? $this->toDomain($model) : null;
    }

    public function save(BusinessModel $busModel): void
    {
        $model = BusinessEloquentModel::updateOrCreate(
            ['id' => $busModel->id],
            [
                'title' => $busModel->title,
                'description' => $busModel->description,
                'icon' => $busModel->icon,
                'difficulty' => $busModel->difficulty,
                'potential' => $busModel->potential,
                'sector' => $busModel->sector,
                'image' => $busModel->image,
                'season' => $busModel->season,
                'cycle_duration' => $busModel->cycleDuration,
                'soil_types' => $busModel->soilTypes,
                'yield_potential' => $busModel->yieldPotential,
                'main_risks' => $busModel->mainRisks,
                'business_plan' => $busModel->businessPlan,
                'status' => $busModel->status,
            ]
        );

        $model->steps()->delete();
        foreach ($busModel->steps as $step) {
            BusinessStepModel::create([
                'id' => $step->id,
                'business_model_id' => $model->id,
                'title' => $step->title,
                'description' => $step->description,
                'order_index' => $step->orderIndex,
                'level' => $step->level,
                'objective' => $step->objective,
                'knowledge' => $step->knowledge,
                'actions' => $step->actions,
                'costs' => $step->costs,
                'routines' => $step->routines,
                'progression' => $step->progression,
                'locked' => $step->locked,
                'is_paid' => $step->isPaid,
                'price_amount' => $step->priceAmount,
            ]);
        }
    }

    public function delete(string $id): void
    {
        BusinessEloquentModel::destroy($id);
    }

    private function toDomain(BusinessEloquentModel $model): BusinessModel
    {
        $steps = $model->steps->map(function ($stepModel) {
            return new BusinessStep(
                $stepModel->id,
                $stepModel->business_model_id,
                $stepModel->title,
                $stepModel->description,
                $stepModel->order_index,
                (int) $stepModel->level,
                $stepModel->objective,
                $stepModel->knowledge ?? [],
                $stepModel->actions ?? [],
                $stepModel->costs ?? [],
                $stepModel->routines ?? [],
                $stepModel->progression ?? [],
                (bool) $stepModel->locked,
                (bool) $stepModel->is_paid,
                $stepModel->price_amount ? (float) $stepModel->price_amount : null,
            );
        })->all();

        return new BusinessModel(
            $model->id,
            $model->title,
            $model->description,
            $model->icon,
            $model->difficulty,
            $model->potential,
            $model->sector,
            $model->image,
            $model->season,
            $model->cycle_duration,
            $model->soil_types ?? [],
            $model->yield_potential,
            $model->main_risks ?? [],
            $model->business_plan ?? [],
            $steps,
            $model->status ?? 'published'
        );
    }
}
