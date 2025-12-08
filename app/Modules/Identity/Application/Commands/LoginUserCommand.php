<?php

declare(strict_types=1);

namespace App\Modules\Identity\Application\Commands;

/**
 * LoginUserCommand
 */
final class LoginUserCommand
{
    public function __construct(
        public readonly string $email,
        public readonly string $password,
        public readonly bool $remember,
        public readonly string $ipAddress
    ) {
    }
}
