<?php

declare(strict_types=1);

namespace App\Modules\Transaction\Presentation\Resources;

use App\Modules\Transaction\Domain\Entities\Transaction;
use App\Modules\Transaction\Domain\ValueObjects\TransactionType;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Transaction */
final class TransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isExchange = $this->type() === TransactionType::EXCHANGE;

        return [
            'id' => $this->id()->toString(),
            'account_id' => $this->accountId(),
            'category_id' => $this->categoryId(),
            'amount' => $this->amount(),
            'currency' => $this->currency(),
            'type' => $this->type()->value,
            'description' => $this->description(),
            'date' => $this->date()->format($isExchange ? DATE_ATOM : 'Y-m-d H:i:s'),
            ...($isExchange ? [
                'converted_amount' => $this->convertedAmount(),
                'to_currency' => $this->toCurrency(),
                'exchange_rate' => $this->exchangeRate(),
            ] : []),
        ];
    }
}
