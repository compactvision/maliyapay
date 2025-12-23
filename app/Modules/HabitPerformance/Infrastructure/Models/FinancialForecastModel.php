<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Infrastructure\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class FinancialForecastModel extends Model
{
    use HasUuids;

    protected $table = 'financial_forecasts';

    protected $fillable = [
        'user_id',
        'generated_at',
        'currency',
        'current_balance',
        'avg_daily_spending',
        'projected_end_balance',
        'zero_balance_date',
        'status',
        'recommendations',
    ];

    protected $casts = [
        'generated_at' => 'datetime',
        'current_balance' => 'decimal:2',
        'avg_daily_spending' => 'decimal:2',
        'projected_end_balance' => 'decimal:2',
        'zero_balance_date' => 'datetime',
        'recommendations' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }
}
