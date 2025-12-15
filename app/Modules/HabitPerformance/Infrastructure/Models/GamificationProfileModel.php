<?php

namespace App\Modules\HabitPerformance\Infrastructure\Models;

use Illuminate\Database\Eloquent\Model;
use Ramsey\Uuid\Uuid;

class GamificationProfileModel extends Model
{
    protected $table = 'gamification_profiles';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'user_id',
        'xp',
        'current_level',
        'coins',
        'streak_count',
        'last_activity_date',
        'last_daily_bonus_claimed_at'
    ];

    protected $casts = [
        'last_activity_date' => 'date',
        'last_daily_bonus_claimed_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = Uuid::uuid4()->toString();
            }
        });
    }
}
