<?php

declare(strict_types=1);

namespace App\Modules\Account\Presentation\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AddCurrencyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('initial_balance') && $this->initial_balance === '') {
            $this->merge(['initial_balance' => null]);
        }
    }

    public function rules(): array
    {
        return [
            'currency_code' => ['required', 'string', 'size:3'],
            'initial_balance' => ['nullable', 'numeric'],
        ];
    }
}
