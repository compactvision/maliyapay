<?php

declare(strict_types=1);

namespace App\Modules\Growth\Infrastructure\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class AdviceViewModel extends Model
{
    use HasUuids;

    protected $table = 'growth_advice_views';

    protected $fillable = [
        'user_id',
        'advice_id',
        'viewed_at',
    ];

    protected $casts = [
        'viewed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    public function advice()
    {
        return $this->belongsTo(AdviceModel::class, 'advice_id');
    }
}
