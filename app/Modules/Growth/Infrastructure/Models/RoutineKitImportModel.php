<?php

declare(strict_types=1);

namespace App\Modules\Growth\Infrastructure\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class RoutineKitImportModel extends Model
{
    use HasUuids;

    protected $table = 'growth_routine_kit_imports';

    protected $fillable = [
        'user_id',
        'kit_id',
        'imported_at',
    ];

    protected $casts = [
        'imported_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    public function kit()
    {
        return $this->belongsTo(RoutineKitModel::class, 'kit_id');
    }
}
