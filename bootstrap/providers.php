<?php

return [
    App\Providers\AppServiceProvider::class,
    App\Providers\FortifyServiceProvider::class,
    App\Modules\Category\CategoryServiceProvider::class,
    App\Modules\Identity\IdentityServiceProvider::class,
    App\Modules\Budget\BudgetServiceProvider::class,
    App\Modules\Transaction\TransactionServiceProvider::class,
    App\Modules\Task\TaskServiceProvider::class,
    App\Modules\Routine\RoutineServiceProvider::class,
    App\Modules\Notification\NotificationServiceProvider::class,
];
