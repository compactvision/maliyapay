<?php

declare(strict_types=1);

namespace App\Modules\Routine\Presentation\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRoutineRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:1', 'max:255'],
            'color' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Le nom de la routine est requis',
            'name.min' => 'Le nom doit contenir au moins 1 caractère',
            'name.max' => 'Le nom ne peut pas dépasser 255 caractères',
            'color.regex' => 'La couleur doit être au format hexadécimal (#RRGGBB)',
        ];
    }
}
