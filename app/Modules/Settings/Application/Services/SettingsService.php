<?php

namespace App\Modules\Settings\Application\Services;

use App\Modules\Settings\Domain\Models\Setting;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class SettingsService
{
    public function getAll(): array
    {
        return Setting::all()->pluck('value', 'key')->toArray();
    }

    public function update(array $data): void
    {
        foreach ($data as $key => $value) {
            if ($key === 'logo' && $value instanceof UploadedFile) {
                $this->updateLogo($value);
                continue;
            }
            
            // Handle null values
            if (is_null($value)) {
                $value = ''; 
            }

            Setting::set((string) $key, (string) $value);
        }
    }

    protected function updateLogo(UploadedFile $file): void
    {
        $path = $file->store('public/settings');
        // Convert to public URL
        $url = Storage::url($path);
        Setting::set('app_logo', $url);
    }

    public function isMaintenanceMode(): bool
    {
        return (bool) Setting::get('maintenance_mode', false);
    }
}
