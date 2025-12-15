<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Presentation\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HabitPerformance\Application\Queries\GetPerformanceDashboardQuery;
use App\Modules\HabitPerformance\Application\Queries\GetPerformanceDashboardQueryHandler;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

use App\Modules\HabitPerformance\Application\Commands\ClaimDailyBonusCommand;
use App\Modules\HabitPerformance\Application\Commands\ClaimDailyBonusCommandHandler;
use App\Modules\HabitPerformance\Application\Commands\PurchaseRewardCommand;
use App\Modules\HabitPerformance\Application\Commands\PurchaseRewardCommandHandler;
use App\Modules\HabitPerformance\Application\Commands\GenerateDailyTaskPerformanceCommand;
use App\Modules\HabitPerformance\Application\Commands\GenerateDailyTaskPerformanceCommandHandler;
use App\Modules\HabitPerformance\Application\Commands\GenerateMonthlyFinancePerformanceCommand;
use App\Modules\HabitPerformance\Application\Commands\GenerateMonthlyFinancePerformanceCommandHandler;
use Illuminate\Http\RedirectResponse;

class HabitPerformanceController extends Controller
{
    public function __construct(
        private GetPerformanceDashboardQueryHandler $queryHandler,
        private ClaimDailyBonusCommandHandler $claimBonusHandler,
        private PurchaseRewardCommandHandler $purchaseRewardHandler,
        private GenerateDailyTaskPerformanceCommandHandler $generateTaskPerfHandler,
        private GenerateMonthlyFinancePerformanceCommandHandler $generateFinancePerfHandler
    ) {
    }

    public function index(Request $request): Response
    {
        $userId = (int) $request->user()->id;

        // Trigger real-time analysis
        $this->generateTaskPerfHandler->handle(new GenerateDailyTaskPerformanceCommand($userId));
        $this->generateFinancePerfHandler->handle(new GenerateMonthlyFinancePerformanceCommand($userId));

        // Fetch fresh data
        $query = new GetPerformanceDashboardQuery($userId);
        $data = $this->queryHandler->handle($query);

        return Inertia::render('HabitPerformance/Index', [
            'performanceData' => $data
        ]);
    }

    public function claimBonus(Request $request): RedirectResponse
    {
        $command = new ClaimDailyBonusCommand((int) $request->user()->id);
        try {
            $this->claimBonusHandler->handle($command);
            return back()->with('success', 'Bonus quotidien réclamé !');
        } catch (\DomainException $e) {
             return back()->with('error', $e->getMessage());
        }
    }

    public function purchaseReward(Request $request): RedirectResponse
    {
        $request->validate([
            'reward_id' => 'required|integer',
            'cost' => 'required|integer',
        ]);

        $command = new PurchaseRewardCommand(
            (int) $request->user()->id,
            (int) $request->input('reward_id'),
            (int) $request->input('cost')
        );

        try {
            $this->purchaseRewardHandler->handle($command);
            return back()->with('success', 'Récompense achetée !');
        } catch (\DomainException $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
