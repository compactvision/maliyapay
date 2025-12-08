<?php

declare(strict_types=1);

namespace App\Modules\Account\Presentation\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateAccountRequest extends FormRequest
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
        
        if ($this->has('initial_currency') && $this->initial_currency === '') {
            $this->merge(['initial_currency' => null]);
        }
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'in:cash,bank,mobile_money,saving,other'],
            'color' => ['nullable', 'string', 'max:7'],
            'initial_currency' => ['nullable', 'string', 'size:3'],
            'initial_balance' => ['nullable', 'numeric'],
        ];
    }
}
