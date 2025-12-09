<?php

declare(strict_types=1);

namespace App\Modules\Transaction\Presentation\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'account_id' => ['required', 'uuid', 'exists:accounts,id'],
            'category_id' => ['required', 'uuid', 'exists:categories,id'],
            'amount' => ['required', 'numeric', 'min:0'],
            'currency' => ['required', 'string', 'size:3'],
            'type' => ['required', 'in:income,expense'],
            'description' => ['required', 'string', 'max:255'],
            'date' => ['required', 'date'],
        ];
    }
}
