<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Infrastructure\Models;

use Illuminate\Database\Eloquent\Model;

class PerformanceMetricModel extends Model
{
    protected $table = 'performance_metrics';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'source',
        'date',
        'achieved',
        'expected',
        'delta',
        'metadata',
        'budget_adherence_score',
        'spending_vs_budget_ratio',
        'categories_over_budget',
    ];

    protected $casts = [
        'date' => 'date',
        'achieved' => 'float',
        'expected' => 'float',
        'delta' => 'float',
        'budget_adherence_score' => 'float',
        'spending_vs_budget_ratio' => 'float',
        'categories_over_budget' => 'array',
    ];
}
