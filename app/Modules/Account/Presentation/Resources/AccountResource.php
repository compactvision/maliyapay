<?php

declare(strict_types=1);

namespace App\Modules\Account\Presentation\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AccountResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id()->toString(),
            'name' => $this->name(),
            'type' => $this->type()->value,
            'color' => $this->color(),
            'is_archived' => $this->isArchived(),
            'balances' => array_map(fn ($balance) => [
                'currency_code' => $balance->currencyCode(),
                'amount' => $balance->amount(),
            ], $this->balances()),
            'created_at' => $this->createdAt()->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt()->format('Y-m-d H:i:s'),
        ];
    }
}
