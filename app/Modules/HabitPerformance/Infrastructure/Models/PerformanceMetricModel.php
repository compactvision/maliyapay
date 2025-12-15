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
    ];

    protected $casts = [
        'date' => 'date',
        'achieved' => 'decimal:2',
        'expected' => 'decimal:2',
        'delta' => 'decimal:2',
    ];
}
