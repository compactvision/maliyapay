<?php

declare(strict_types=1);

namespace App\Modules\Transaction\Domain\ValueObjects;

enum TransactionType: string
{
    case INCOME = 'income';
    case EXPENSE = 'expense';
}
