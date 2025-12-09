<?php

return [
    App\Providers\AppServiceProvider::class,
    App\Providers\FortifyServiceProvider::class,
    App\Modules\Category\CategoryServiceProvider::class,
    App\Modules\Identity\IdentityServiceProvider::class,
    App\Modules\Budget\BudgetServiceProvider::class,
    App\Modules\Transaction\TransactionServiceProvider::class,
];
