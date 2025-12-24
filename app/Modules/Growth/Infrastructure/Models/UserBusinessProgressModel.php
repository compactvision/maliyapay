<?php

declare(strict_types=1);

namespace App\Modules\Growth\Infrastructure\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class UserBusinessProgressModel extends Model
{
    use HasUuids;

    protected $table = 'growth_user_business_progress';

    protected $fillable = [
        'user_id',
        'business_model_id',
        'completed_steps',
        'status',
    ];

    protected $casts = [
        'completed_steps' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    public function businessModel()
    {
        return $this->belongsTo(BusinessModel::class, 'business_model_id');
    }
}
