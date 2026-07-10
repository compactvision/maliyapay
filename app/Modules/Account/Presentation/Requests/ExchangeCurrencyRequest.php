<?php

declare(strict_types=1);

namespace App\Modules\Account\Presentation\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ExchangeCurrencyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'from_currency' => ['required', 'string', 'size:3', 'different:to_currency'],
            'to_currency' => ['required', 'string', 'size:3'],
            'amount' => ['required', 'numeric', 'gt:0'],
            'rate' => ['required', 'numeric', 'gt:0'],
        ];
    }
}
