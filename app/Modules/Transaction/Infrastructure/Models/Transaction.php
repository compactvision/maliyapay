<?php

declare(strict_types=1);

namespace App\Modules\Transaction\Infrastructure\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    use HasFactory;

    protected $table = 'transactions';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'user_id',
        'account_id',
        'category_id',
        'amount',
        'currency',
        'type',
        'description',
        'date',
    ];

    protected $casts = [
        'amount' => 'float',
        'date' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(\App\Modules\Account\Infrastructure\Models\Account::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(\App\Modules\Category\Infrastructure\Models\Category::class);
    }
}
