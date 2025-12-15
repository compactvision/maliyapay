<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Infrastructure\Models;

use Illuminate\Database\Eloquent\Model;

class HabitInsightModel extends Model
{
    protected $table = 'habit_insights';
    public $timestamps = false;
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'type',
        'period',
        'score',
        'summary',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];
}
