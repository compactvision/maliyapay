<?php
try {
    $user = \App\Models\User::first();
    if (!$user) {
        echo "No user found.\n";
        exit;
    }

    echo "Testing with user ID: " . $user->id . "\n";

    $handler = app(\App\Modules\Account\Application\Handlers\CreateAccountHandler::class);
    $command = new \App\Modules\Account\Application\Commands\CreateAccountCommand(
        id: \Ramsey\Uuid\Uuid::uuid4(),
        userId: (string) $user->id,
        name: 'Debug Account ' . time(),
        type: 'cash',
        color: '#000000',
        initialCurrency: 'USD',
        initialBalance: 100.0
    );

    $handler->handle($command);
    echo "Account created successfully.\n";

} catch (\Throwable $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
