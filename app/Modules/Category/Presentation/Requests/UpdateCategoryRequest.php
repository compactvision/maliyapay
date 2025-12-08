<?php

declare(strict_types=1);

namespace App\Modules\Category\Presentation\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * UpdateCategoryRequest
 * 
 * Validates incoming request to update a category
 */
class UpdateCategoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled by middleware
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => [
                'sometimes',
                'required',
                'string',
                'min:2',
                'max:100',
                Rule::unique('categories', 'name')
                    ->where('user_id', $this->user()->id)
                    ->ignore($this->route('id'))
                    ->whereNull('deleted_at'),
            ],
            'type' => [
                'sometimes',
                'required',
                'string',
                Rule::in(['income', 'expense']),
            ],
            'color' => [
                'sometimes',
                'required',
                'string',
                'regex:/^#[0-9A-F]{6}$/i',
            ],
        ];
    }

    /**
     * Get custom error messages
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Le nom de la catégorie est requis',
            'name.min' => 'Le nom doit contenir au moins 2 caractères',
            'name.max' => 'Le nom ne peut pas dépasser 100 caractères',
            'name.unique' => 'Une catégorie avec ce nom existe déjà',
            'type.required' => 'Le type est requis',
            'type.in' => 'Le type doit être "income" ou "expense"',
            'color.required' => 'La couleur est requise',
            'color.regex' => 'La couleur doit être au format hexadécimal (#RRGGBB)',
        ];
    }
}
