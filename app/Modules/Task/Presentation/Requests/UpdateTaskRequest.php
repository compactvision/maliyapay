<?php

declare(strict_types=1);

namespace App\Modules\Task\Presentation\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'min:1', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'priority' => ['required', 'string', 'in:low,medium,high'],
            'dueDate' => ['nullable', 'date'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Le titre est requis',
            'title.min' => 'Le titre doit contenir au moins 1 caractère',
            'title.max' => 'Le titre ne peut pas dépasser 255 caractères',
            'priority.required' => 'La priorité est requise',
            'priority.in' => 'La priorité doit être low, medium ou high',
            'dueDate.date' => 'La date d\'échéance doit être une date valide',
        ];
    }
}
