<?php

declare(strict_types=1);

namespace App\Modules\Growth\Infrastructure\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class BusinessStepModel extends Model
{
    use HasUuids;

    protected $table = 'growth_business_steps';

    protected $fillable = [
        'business_model_id',
        'title',
        'description',
        'order_index',
        'level',
        'objective',
        'knowledge',
        'actions',
        'costs',
        'routines',
        'progression',
        'locked',
        'is_paid',
        'price_amount',
    ];

    protected $casts = [
        'knowledge' => 'array',
        'actions' => 'array',
        'costs' => 'array',
        'routines' => 'array',
        'progression' => 'array',
        'locked' => 'boolean',
        'is_paid' => 'boolean',
    ];

    public function businessModel()
    {
        return $this->belongsTo(BusinessModel::class, 'business_model_id');
    }
}
