<?php

declare(strict_types=1);

namespace App\Modules\Transaction\Application\Exceptions;

use RuntimeException;

final class TransactionIdempotencyConflict extends RuntimeException
{
}
