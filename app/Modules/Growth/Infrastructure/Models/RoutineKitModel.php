<?php

declare(strict_types=1);

namespace App\Modules\Growth\Infrastructure\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class RoutineKitModel extends Model
{
    use HasUuids;

    protected $table = 'growth_routine_kits';

    protected $fillable = [
        'name',
        'description',
        'category',
        'color',
        'status',
        'is_paid',
        'price_amount',
        'price_currency',
        'images',
    ];

    protected $casts = [
        'images' => 'array',
        'is_paid' => 'boolean',
    ];

    public function tasks()
    {
        return $this->hasMany(RoutineKitTaskModel::class, 'kit_id');
    }

    public function imports()
    {
        return $this->hasMany(RoutineKitImportModel::class, 'kit_id');
    }

    public function getImportsCountAttribute()
    {
        return $this->imports()->count();
    }
}
