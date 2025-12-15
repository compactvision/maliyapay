<?php

namespace Tests\Feature;

use App\Models\User;
use App\Modules\HabitPerformance\Application\Commands\GenerateDailyTaskPerformanceCommand;
use App\Modules\HabitPerformance\Application\Commands\GenerateDailyTaskPerformanceCommandHandler;
use App\Modules\HabitPerformance\Domain\Entities\HabitInsight;
use App\Modules\HabitPerformance\Domain\Entities\PerformanceMetric;
use App\Modules\HabitPerformance\Domain\ValueObjects\InsightType;
use App\Modules\Task\Domain\Events\TaskCompleted;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Ramsey\Uuid\Uuid;
use Tests\TestCase;
use DateTimeImmutable;

class HabitPerformanceTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_access_habit_performance_page()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('habit-performance.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('HabitPerformance/Index')
        );
    }

    public function test_task_completion_listener_logic()
    {
        $user = User::factory()->create();
        
        // Directly test Listener Logic to bypass Event Bus for troubleshooting
        $listener = app(\App\Modules\HabitPerformance\Application\Listeners\OnTaskCompleted::class);
        
        $taskId = Uuid::uuid4();
        $event = new TaskCompleted(
            $taskId,
            $user->id,
            new DateTimeImmutable('today')
        );

        $listener->handle($event);

        $this->assertDatabaseHas('performance_metrics', [
            'source' => InsightType::TASK->value,
            'achieved' => 1.0,
        ]);
    }

    public function test_task_completion_event_wiring()
    {
         $user = User::factory()->create();
         
         // Ensure Provider is loaded
         $this->assertTrue(count(app()->getProviders(\App\Modules\HabitPerformance\HabitPerformanceServiceProvider::class)) > 0, 'Provider not loaded');

         $taskId = Uuid::uuid4();
         \App\Modules\Task\Domain\Events\TaskCompleted::dispatch(
             $taskId,
             $user->id,
             new DateTimeImmutable('today')
         );
 
         $this->assertDatabaseHas('performance_metrics', [
             'source' => InsightType::TASK->value,
             'achieved' => 1.0,
         ]);
    }

    public function test_daily_performance_generation()
    {
        $user = User::factory()->create();

        // 1. Create a metric manually or via event
        $metric = PerformanceMetric::track(
            Uuid::uuid4(),
            InsightType::TASK,
            new DateTimeImmutable('today'),
            3.0, // 3 tasks done
            3.0
        );
        
        app(\App\Modules\HabitPerformance\Domain\Repositories\PerformanceMetricRepositoryInterface::class)->save($metric);

        // 2. Run command
        $command = new GenerateDailyTaskPerformanceCommand($user->id);
        $handler = app(GenerateDailyTaskPerformanceCommandHandler::class);
        $handler->handle($command);

        // 3. Assert Insight Created
        $this->assertDatabaseHas('habit_insights', [
            'type' => InsightType::TASK->value,
            'score' => 100,
        ]);
    }
}
