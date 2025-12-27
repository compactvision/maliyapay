<?php

declare(strict_types=1);

namespace App\Modules\Growth\Infrastructure\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class BusinessModel extends Model
{
    use HasUuids;

    protected $table = 'growth_business_models';

    protected $fillable = [
        'title',
        'description',
        'icon',
        'difficulty',
        'potential',
        'sector',
        'season',
        'cycle_duration',
        'soil_types',
        'yield_potential',
        'main_risks',
        'business_plan',
        'status',
    ];

    protected $casts = [
        'soil_types' => 'array',
        'main_risks' => 'array',
        'business_plan' => 'array',
    ];

    public function steps()
    {
        return $this->hasMany(BusinessStepModel::class, 'business_model_id')->orderBy('order_index');
    }
}
