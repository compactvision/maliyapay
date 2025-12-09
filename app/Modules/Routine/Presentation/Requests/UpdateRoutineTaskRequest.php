<?php

declare(strict_types=1);

namespace App\Modules\Routine\Presentation\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRoutineTaskRequest extends FormRequest
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
            'dayOfWeek' => ['required', 'integer', 'min:1', 'max:7'],
            'timeStart' => ['nullable', 'date_format:H:i'],
            'timeEnd' => ['nullable', 'date_format:H:i', 'after:timeStart'],
            'priority' => ['required', 'string', 'in:low,medium,high'],
            'orderIndex' => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Le titre de la tâche est requis',
            'dayOfWeek.required' => 'Le jour de la semaine est requis',
            'dayOfWeek.min' => 'Le jour doit être entre 1 (Lundi) et 7 (Dimanche)',
            'dayOfWeek.max' => 'Le jour doit être entre 1 (Lundi) et 7 (Dimanche)',
            'timeStart.date_format' => 'L\'heure de début doit être au format HH:MM',
            'timeEnd.date_format' => 'L\'heure de fin doit être au format HH:MM',
            'timeEnd.after' => 'L\'heure de fin doit être après l\'heure de début',
            'priority.required' => 'La priorité est requise',
            'priority.in' => 'La priorité doit être low, medium ou high',
        ];
    }
}
