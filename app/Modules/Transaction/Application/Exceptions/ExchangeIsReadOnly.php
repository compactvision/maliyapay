<?php

declare(strict_types=1);

namespace App\Modules\Transaction\Application\Exceptions;

use DomainException;

final class ExchangeIsReadOnly extends DomainException
{
    public const MESSAGE = 'Les changes sont en lecture seule.';

    public function __construct()
    {
        parent::__construct(self::MESSAGE);
    }
}
