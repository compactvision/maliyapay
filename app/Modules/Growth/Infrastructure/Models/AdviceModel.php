<?php

declare(strict_types=1);

namespace App\Modules\Growth\Infrastructure\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class AdviceModel extends Model
{
    use HasUuids;

    protected $table = 'growth_advices';

    protected $fillable = [
        'title',
        'summary',
        'content',
        'category',
        'status',
        'featured',
        'video_url',
        'author_name',
        'reading_time_minutes',
        'images',
        'published_at',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'featured' => 'boolean',
        'images' => 'array',
    ];
}
