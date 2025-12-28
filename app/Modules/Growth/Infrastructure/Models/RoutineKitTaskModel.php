<?php

declare(strict_types=1);

namespace App\Modules\Growth\Infrastructure\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class RoutineKitTaskModel extends Model
{
    use HasUuids;

    protected $table = 'growth_routine_kit_tasks';

    protected $fillable = [
        'kit_id',
        'title',
        'description',
        'order_index',
        'day_of_week',
        'time_start',
        'time_end',
        'priority',
        'xp',
    ];

    public function kit()
    {
        return $this->belongsTo(RoutineKitModel::class, 'kit_id');
    }
}
