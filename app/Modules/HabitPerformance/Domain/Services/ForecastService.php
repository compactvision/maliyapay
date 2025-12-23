<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Domain\Services;

use App\Modules\HabitPerformance\Domain\Entities\FinancialForecast;
use App\Modules\Transaction\Domain\Repositories\TransactionRepositoryInterface;
use App\Modules\Account\Domain\Repositories\AccountRepositoryInterface;
use App\Modules\Transaction\Domain\ValueObjects\TransactionType;
use App\Models\User;
use DateTimeImmutable;
use Ramsey\Uuid\Uuid;

/**
 * ForecastService - Service de prédiction financière multi-devises
 * 
 * Calcule les projections de fin de mois basées sur les habitudes de dépenses par devise.
 */
class ForecastService
{
    public function __construct(
        private TransactionRepositoryInterface $transactionRepository,
        private AccountRepositoryInterface $accountRepository
    ) {
    }

    /**
     * Génère les prévisions financières pour le mois en cours, une par devise active.
     * 
     * @return FinancialForecast[]
     */
    public function generateMonthlyForecast(User $user): array
    {
        $userId = (string) $user->id;
        $today = new DateTimeImmutable();
        
        // 1. Définir la période du mois
        $startOfMonth = $today->modify('first day of this month')->setTime(0, 0);
        $endOfMonth = $today->modify('last day of this month')->setTime(23, 59, 59);
        
        // 2. Récupérer toutes les données
        $transactions = $this->transactionRepository->findByUserAndPeriod(
            $userId,
            $startOfMonth,
            $endOfMonth
        );
        $accounts = $this->accountRepository->findAllByUser($userId);

        // 3. Grouper par devise
        $dataByCurrency = [];

        // Traiter les transactions
        foreach ($transactions as $transaction) {
            $currency = $transaction->currency();
            if (!isset($dataByCurrency[$currency])) {
                $dataByCurrency[$currency] = ['transactions' => [], 'balance' => 0.0];
            }
            $dataByCurrency[$currency]['transactions'][] = $transaction;
        }

        // Traiter les soldes des comptes
        foreach ($accounts as $account) {
            foreach ($account->balances() as $balance) {
                $currency = $balance->currencyCode();
                if (!isset($dataByCurrency[$currency])) {
                    $dataByCurrency[$currency] = ['transactions' => [], 'balance' => 0.0];
                }
                $dataByCurrency[$currency]['balance'] += $balance->amount();
            }
        }

        // 4. Générer les forecasts pour chaque devise
        $forecasts = [];
        $daysRemaining = (int) $today->diff($endOfMonth)->days;

        foreach ($dataByCurrency as $currency => $data) {
            // Ignorer si aucune activité (pas de balance et pas de tx)
            // Mais on peut avoir balance 0 et dépenses, ou balance positive et 0 dépenses
            if (empty($data['transactions']) && $data['balance'] == 0) {
                continue;
            }

            $forecasts[] = $this->generateForecastForCurrency(
                $user,
                $currency,
                $data['balance'],
                $data['transactions'],
                $today,
                $daysRemaining
            );
        }

        return $forecasts;
    }

    private function generateForecastForCurrency(
        User $user,
        string $currency,
        float $currentBalance,
        array $transactions,
        DateTimeImmutable $today,
        int $daysRemaining
    ): FinancialForecast {
        
        $avgDailySpending = $this->calculateAverageDailySpending($transactions, $today);
        
        $projectedEndBalance = $this->projectEndOfMonthBalance(
            $currentBalance,
            $avgDailySpending,
            $daysRemaining
        );

        $zeroBalanceDate = null;
        if ($projectedEndBalance < 0) {
            $zeroBalanceDate = $this->estimateZeroBalanceDate($currentBalance, $avgDailySpending, $today);
        }

        $status = $this->determineStatus($currentBalance, $projectedEndBalance);

        $recommendations = $this->generateRecommendations(
            $currentBalance,
            $avgDailySpending,
            $projectedEndBalance,
            $daysRemaining,
            $status,
            $currency
        );

        return FinancialForecast::create(
            Uuid::uuid4(),
            (int) $user->id,
            $currency,
            $currentBalance,
            $avgDailySpending,
            $projectedEndBalance,
            $zeroBalanceDate,
            $status,
            $recommendations
        );
    }

    public function calculateAverageDailySpending(array $transactions, DateTimeImmutable $today): float
    {
        $totalSpending = 0.0;
        $startOfMonth = $today->modify('first day of this month');
        $daysElapsed = max(1, (int) $startOfMonth->diff($today)->days + 1);

        foreach ($transactions as $transaction) {
            if ($transaction->type() === TransactionType::EXPENSE) {
                $totalSpending += $transaction->amount();
            }
        }

        return $totalSpending / $daysElapsed;
    }

    public function projectEndOfMonthBalance(
        float $currentBalance,
        float $avgDailySpending,
        int $daysRemaining
    ): float {
        return $currentBalance - ($avgDailySpending * $daysRemaining);
    }

    public function estimateZeroBalanceDate(
        float $currentBalance,
        float $avgDailySpending,
        DateTimeImmutable $today
    ): ?DateTimeImmutable {
        if ($avgDailySpending <= 0 || $currentBalance <= 0) {
            return null;
        }

        $daysUntilZero = (int) ceil($currentBalance / $avgDailySpending);
        
        return $today->modify("+{$daysUntilZero} days");
    }

    private function determineStatus(float $currentBalance, float $projectedEndBalance): string
    {
        if ($projectedEndBalance < 0) {
            return 'critical';
        }

        if ($currentBalance > 0) {
            $changePercentage = (($projectedEndBalance - $currentBalance) / $currentBalance) * 100;
            
            if ($changePercentage < -80) {
                return 'critical';
            }
            
            if ($changePercentage < -50) {
                return 'warning';
            }
            
            if ($changePercentage > 20) {
                return 'positive';
            }
        } elseif ($currentBalance == 0 && $projectedEndBalance == 0) {
            return 'neutral';
        }

        return 'neutral';
    }

    public function generateRecommendations(
        float $currentBalance,
        float $avgDailySpending,
        float $projectedEndBalance,
        int $daysRemaining,
        string $status,
        string $currency
    ): array {
        $recommendations = [];
        $symbol = $currency; // Ou utiliser un mapper si on veut des symboles (€, $)

        switch ($status) {
            case 'critical':
                if ($projectedEndBalance < 0) {
                    $deficit = abs($projectedEndBalance);
                    $recommendations[] = "🚨 Alerte critique : Vous risquez un déficit de " . number_format($deficit, 2) . " $symbol en fin de mois.";
                    
                    if ($daysRemaining > 0) {
                        $targetDailySpending = max(0, $currentBalance / $daysRemaining);
                        $reduction = $avgDailySpending - $targetDailySpending;
                        if ($reduction > 0) {
                             $recommendations[] = "💡 Réduisez vos dépenses de " . number_format($reduction, 2) . " $symbol/jour.";
                        }
                    }
                }
                $recommendations[] = "⚠️ Priorisez uniquement les dépenses essentielles.";
                break;

            case 'warning':
                $recommendations[] = "⚠️ Attention : Votre solde diminue rapidement.";
                if ($daysRemaining > 0 && $avgDailySpending > 0) {
                    $targetDailySpending = ($currentBalance * 0.2) / $daysRemaining; // Garder 20%
                    if ($avgDailySpending > $targetDailySpending) {
                        $recommendations[] = "🎯 Objectif : Limitez les dépenses à " . number_format($targetDailySpending, 2) . " $symbol/jour.";
                    }
                }
                break;

            case 'positive':
                $surplus = $projectedEndBalance - $currentBalance;
                $recommendations[] = "🌟 Excellent ! Hausse prévue de " . number_format($surplus, 2) . " $symbol.";
                $recommendations[] = "💰 Idéal pour épargner dans cette devise.";
                break;

            case 'neutral':
                $recommendations[] = "ℹ️ Gestion stable.";
                break;
        }

        if ($avgDailySpending > 0) {
            $recommendations[] = "📊 Moyenne : " . number_format($avgDailySpending, 2) . " $symbol/jour.";
        }

        return $recommendations;
    }

    public function needsNewForecast(?FinancialForecast $lastForecast): bool
    {
        if ($lastForecast === null) {
            return true;
        }

        $now = new DateTimeImmutable();
        $hoursSinceLastForecast = $now->diff($lastForecast->generatedAt())->h + 
                                  ($now->diff($lastForecast->generatedAt())->days * 24);

        return $hoursSinceLastForecast >= 24;
    }
}
