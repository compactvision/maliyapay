<?php

namespace Tests\Feature;

use App\Models\User;
use App\Modules\HabitPerformance\Domain\Services\HabitGoalNotificationService;
use App\Modules\HabitPerformance\Domain\Services\ProductivityAnalysisService;
use App\Modules\Task\Domain\Entities\Task;
use App\Modules\Task\Domain\Repositories\TaskRepositoryInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use DateTimeImmutable;

class HabitGoalNotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_goal_achievement_notification_sent_when_100_percent_complete()
    {
        $user = User::factory()->create([
            'receive_notifications' => true,
        ]);

        // Mock productivity service to return 100% completion
        $this->mock(ProductivityAnalysisService::class)
            ->shouldReceive('analyze')
            ->once()
            ->with($user->id)
            ->andReturn([
                'score' => 100,
                'completedCount' => 5,
                'totalToday' => 5,
                'advice' => ['Great job!'],
            ]);

        $service = app(HabitGoalNotificationService::class);
        $service->checkDailyGoalAchievement($user->id);

        // Assert notification was created
        $this->assertDatabaseHas('notifications', [
            'user_id' => $user->id,
            'title' => '🎯 Objectif du jour atteint !',
        ]);
    }

    public function test_evening_reminder_sent_when_goal_not_achieved()
    {
        $user = User::factory()->create([
            'receive_notifications' => true,
        ]);

        // Mock productivity service to return incomplete
        $this->mock(ProductivityAnalysisService::class)
            ->shouldReceive('analyze')
            ->once()
            ->with($user->id)
            ->andReturn([
                'score' => 60,
                'completedCount' => 3,
                'totalToday' => 5,
                'advice' => ['Keep going!'],
            ]);

        $service = app(HabitGoalNotificationService::class);
        $service->sendEveningReminderNotification($user->id);

        // Assert notification was created
        $this->assertDatabaseHas('notifications', [
            'user_id' => $user->id,
            'title' => '⏰ Il est presque 20H !',
        ]);
    }

    public function test_no_notification_sent_when_user_disabled_notifications()
    {
        $user = User::factory()->create([
            'receive_notifications' => false,
        ]);

        $service = app(HabitGoalNotificationService::class);
        $service->checkDailyGoalAchievement($user->id);

        // Assert no notification was created
        $this->assertDatabaseMissing('notifications', [
            'user_id' => $user->id,
        ]);
    }

    public function test_duplicate_notifications_not_sent_same_day()
    {
        $user = User::factory()->create([
            'receive_notifications' => true,
        ]);

        // Mock productivity service
        $this->mock(ProductivityAnalysisService::class)
            ->shouldReceive('analyze')
            ->twice()
            ->with($user->id)
            ->andReturn([
                'score' => 100,
                'completedCount' => 5,
                'totalToday' => 5,
                'advice' => ['Great job!'],
            ]);

        $service = app(HabitGoalNotificationService::class);
        
        // First call should create notification
        $service->checkDailyGoalAchievement($user->id);
        
        // Second call should not create duplicate
        $service->checkDailyGoalAchievement($user->id);

        // Assert only one notification exists
        $this->assertEquals(1, \DB::table('notifications')
            ->where('user_id', $user->id)
            ->count());
    }
}
