<?php

declare(strict_types=1);

namespace App\Modules\Routine\Presentation\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateRoutineRequest extends FormRequest
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
            'tasks' => ['nullable', 'array'],
            'tasks.*.title' => ['required', 'string', 'min:1', 'max:255'],
            'tasks.*.description' => ['nullable', 'string', 'max:1000'],
            'tasks.*.dayOfWeek' => ['required', 'integer', 'min:1', 'max:7'],
            'tasks.*.timeStart' => ['nullable', 'date_format:H:i'],
            'tasks.*.timeEnd' => ['nullable', 'date_format:H:i', 'after:tasks.*.timeStart'],
            'tasks.*.priority' => ['nullable', 'string', 'in:low,medium,high'],
            'tasks.*.orderIndex' => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Le nom de la routine est requis',
            'name.min' => 'Le nom doit contenir au moins 1 caractère',
            'name.max' => 'Le nom ne peut pas dépasser 255 caractères',
            'color.regex' => 'La couleur doit être au format hexadécimal (#RRGGBB)',
            'tasks.*.title.required' => 'Le titre de la tâche est requis',
            'tasks.*.dayOfWeek.required' => 'Le jour de la semaine est requis',
            'tasks.*.dayOfWeek.min' => 'Le jour doit être entre 1 (Lundi) et 7 (Dimanche)',
            'tasks.*.dayOfWeek.max' => 'Le jour doit être entre 1 (Lundi) et 7 (Dimanche)',
            'tasks.*.timeStart.date_format' => 'L\'heure de début doit être au format HH:MM',
            'tasks.*.timeEnd.date_format' => 'L\'heure de fin doit être au format HH:MM',
            'tasks.*.timeEnd.after' => 'L\'heure de fin doit être après l\'heure de début',
        ];
    }
}
