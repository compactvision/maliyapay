<?php

declare(strict_types=1);

namespace App\Modules\Budget\Presentation\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SetBudgetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => ['required', 'string', 'exists:categories,id'],
            'amount' => ['required', 'numeric', 'min:0'],
            'currency' => ['required', 'string', 'size:3'],
            'period' => ['required', 'string', 'in:daily,weekly,monthly'],
        ];
    }
}
