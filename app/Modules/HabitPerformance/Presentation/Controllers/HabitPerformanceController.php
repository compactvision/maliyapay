<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Presentation\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\HabitPerformance\Application\Queries\GetPerformanceDashboardQuery;
use App\Modules\HabitPerformance\Application\Queries\GetPerformanceDashboardQueryHandler;
use App\Modules\HabitPerformance\Application\Queries\GetFinancialForecastQuery;
use App\Modules\HabitPerformance\Application\Queries\GetFinancialForecastQueryHandler;
use App\Modules\HabitPerformance\Application\Queries\GetPerformanceHistoryQuery;
use App\Modules\HabitPerformance\Application\Queries\GetPerformanceHistoryQueryHandler;
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
use App\Modules\HabitPerformance\Application\Commands\GenerateForecastCommand;
use App\Modules\HabitPerformance\Application\Commands\GenerateForecastCommandHandler;
use Illuminate\Http\RedirectResponse;

class HabitPerformanceController extends Controller
{
    public function __construct(
        private GetPerformanceDashboardQueryHandler $queryHandler,
        private GetFinancialForecastQueryHandler $forecastQueryHandler,
        private GetPerformanceHistoryQueryHandler $historyQueryHandler,
        private ClaimDailyBonusCommandHandler $claimBonusHandler,
        private PurchaseRewardCommandHandler $purchaseRewardHandler,
        private GenerateDailyTaskPerformanceCommandHandler $generateTaskPerfHandler,
        private GenerateMonthlyFinancePerformanceCommandHandler $generateFinancePerfHandler,
        private GenerateForecastCommandHandler $generateForecastHandler
    ) {
    }

    public function index(Request $request): Response
    {
        $userId = (int) $request->user()->id;

        // Trigger real-time analysis
        $this->generateTaskPerfHandler->handle(new GenerateDailyTaskPerformanceCommand($userId));
        $this->generateFinancePerfHandler->handle(new GenerateMonthlyFinancePerformanceCommand($userId));
        $this->generateForecastHandler->handle(new GenerateForecastCommand($userId));

        // Fetch fresh data
        $query = new GetPerformanceDashboardQuery($userId);
        $data = $this->queryHandler->handle($query);

        // Fetch forecast data (returns array of forecasts)
        $forecastQuery = new GetFinancialForecastQuery($userId);
        $forecasts = $this->forecastQueryHandler->handle($forecastQuery);

        // Fetch performance history (last 30 days)
        $historyQuery = new GetPerformanceHistoryQuery($userId, 30);
        $history = $this->historyQueryHandler->handle($historyQuery);

        return Inertia::render('HabitPerformance/Index', [
            'performanceData' => $data,
            'forecasts' => $forecasts, // Changed from 'forecast' to 'forecasts'
            'history' => $history,
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
