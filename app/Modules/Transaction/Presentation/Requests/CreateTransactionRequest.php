<?php

declare(strict_types=1);

namespace App\Modules\Transaction\Presentation\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateTransactionRequest extends FormRequest
{
    public function validationData(): array
    {
        return array_replace(parent::validationData(), [
            'idempotency_key' => $this->header('Idempotency-Key'),
        ]);
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Only the shape is checked before a replay. Its original records may have been deleted.
        $keyed = $this->routeIs('api.transactions.idempotent') || $this->hasHeader('Idempotency-Key');

        return [
            'idempotency_key' => [
                $keyed ? 'required' : 'nullable',
                'string',
                'regex:/\A[A-Za-z0-9._~-]{1,128}\z/',
            ],
            'account_id' => $keyed ? ['required', 'uuid'] : ['required', 'uuid', 'exists:accounts,id'],
            'category_id' => $keyed ? ['required', 'uuid'] : ['required', 'uuid', 'exists:categories,id'],
            'amount' => ['required', 'numeric', 'min:0', 'max:9999999999999.99'],
            'currency' => ['required', 'string', 'size:3'],
            'type' => ['required', 'in:income,expense'],
            'description' => ['required', 'string', 'max:255'],
            'date' => ['required', 'date'],
        ];
    }
}
