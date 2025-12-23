<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Infrastructure\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class PerformanceSnapshotModel extends Model
{
    use HasUuids;

    protected $table = 'performance_snapshots';

    protected $fillable = [
        'user_id',
        'date',
        'financial_score',
        'task_score',
        'overall_score',
        'xp_gained',
        'xp_lost',
        'insights',
    ];

    protected $casts = [
        'date' => 'date',
        'financial_score' => 'integer',
        'task_score' => 'integer',
        'overall_score' => 'integer',
        'xp_gained' => 'integer',
        'xp_lost' => 'integer',
        'insights' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }
}
