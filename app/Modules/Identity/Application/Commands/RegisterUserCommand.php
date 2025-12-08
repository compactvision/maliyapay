<?php

declare(strict_types=1);

namespace App\Modules\Identity\Application\Commands;

/**
 * RegisterUserCommand
 */
final class RegisterUserCommand
{
    public function __construct(
        public readonly string $name,
        public readonly string $email,
        public readonly string $password,
        public readonly string $ipAddress
    ) {
    }
}
