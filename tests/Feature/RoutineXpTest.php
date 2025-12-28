<?php

namespace Tests\Feature;

use App\Modules\Growth\Domain\Entities\RoutineKit;
use App\Modules\Growth\Domain\Entities\RoutineKitTask;
use App\Modules\Growth\Domain\Services\RoutineImportService;
use App\Modules\HabitPerformance\Application\Listeners\OnTaskCompleted;
use App\Modules\HabitPerformance\Domain\Repositories\GamificationProfileRepositoryInterface;
use App\Modules\Routine\Domain\Repositories\RoutineTaskRepositoryInterface;
use App\Modules\Routine\Domain\Services\TaskGeneratorService;
use App\Modules\Task\Domain\Entities\Task;
use App\Modules\Task\Domain\Events\TaskCompleted;
use App\Modules\Task\Domain\Repositories\TaskRepositoryInterface;
use App\Modules\Task\Domain\ValueObjects\TaskPriority;
use App\Modules\Routine\Domain\ValueObjects\DayOfWeek;
use App\Modules\Routine\Domain\ValueObjects\TimeRange;
use DateTimeImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Ramsey\Uuid\Uuid;
use Tests\TestCase;

class RoutineXpTest extends TestCase
{
    use RefreshDatabase;

    public function test_routine_task_has_xp_and_awards_it_on_completion()
    {
        // 1. Setup Data
        $userId = 1;
        \Illuminate\Support\Facades\DB::table('users')->insert([
            'id' => $userId,
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $kitId = Uuid::uuid4()->toString();
        
        // Mock Kit Task with XP = 50
        $kitTask = new RoutineKitTask(
            id: Uuid::uuid4()->toString(),
            kitId: $kitId,
            title: 'Test XP Task',
            description: 'XP Test',
            orderIndex: 0,
            dayOfWeek: DayOfWeek::today()->value,
            timeStart: '09:00',
            timeEnd: '10:00',
            priority: 'medium',
            xp: 50
        );

        // 2. Import Routine (Simulate Import Service)
        // We can use the service directly or just create the RoutineTask manually if too complex to mock full import
        // Create Parent Routine first (FK Requirement)
        $routineId = Uuid::uuid4();
        \Illuminate\Support\Facades\DB::table('routines')->insert([
            'id' => $routineId->toString(),
            'user_id' => $userId,
            'name' => 'Test Routine', // Assuming 'name' column exists
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        
        $routineTaskRepo = app(RoutineTaskRepositoryInterface::class);
        $routineTask = \App\Modules\Routine\Domain\Entities\RoutineTask::create(
            id: Uuid::uuid4(),
            routineId: $routineId,
            title: 'My Routine Task',
            description: 'Desc',
            dayOfWeek: DayOfWeek::today(),
            timeRange: TimeRange::create('09:00', '10:00'),
            priority: TaskPriority::MEDIUM,
            orderIndex: 0,
            xp: 50 
        );
        $routineTaskRepo->save($routineTask);

        // Verify RoutineTask in DB has XP
        $this->assertDatabaseHas('routine_tasks', [
            'id' => $routineTask->id()->toString(),
            'xp' => 50
        ]);

        // 3. Generate Task for Today
        $taskGenerator = app(TaskGeneratorService::class);
        $generatedCount = $taskGenerator->generateTasksForToday($userId);
        $this->assertEquals(1, $generatedCount);

        // Verify Generated Task in DB has XP
        $taskRepo = app(TaskRepositoryInterface::class);
        $tasks = $taskRepo->findByUserId($userId);
        $task = $tasks[0];
        
        $this->assertEquals(50, $task->xp());
        $this->assertDatabaseHas('tasks', [
            'id' => $task->id()->toString(),
            'xp' => 50
        ]);

        // 4. Complete Task and Verify XP Award
        $onTaskCompleted = app(OnTaskCompleted::class);
        $event = new TaskCompleted(
            taskId: $task->id(),
            userId: $userId,
            completedAt: new DateTimeImmutable()
        );

        $onTaskCompleted->handle($event);

        // Verify Gamification Profile
        $profileRepo = app(GamificationProfileRepositoryInterface::class);
        $profile = $profileRepo->findByUserId($userId);

        // Start with 0 XP, add 50 XP
        $this->assertEquals(50, $profile->xp());
    }
}
