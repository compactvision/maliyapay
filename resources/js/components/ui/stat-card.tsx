import { ReactNode } from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from "@/lib/utils";

// --- Importation des composants de base ---
import { Card, CardContent } from '@/components/ui/card'; // Assurez-vous que le chemin est correct

// --- Composant StatCard Amélioré ---

interface StatCardProps {
  title: string;
  value: string | number | ReactNode;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'income' | 'expense' | 'primary';
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
  className,
}: StatCardProps) {
  // Définition des icônes de tendance si non fournies
  const TrendIcon = trend?.isPositive ? TrendingUp : TrendingDown;

  return (
    <Card className={cn(
      // --- Style de base (transition et ombre au survol) ---
      "relative overflow-hidden transition-all duration-300 hover:shadow-lg dark:hover:shadow-xl",
      
      // --- Style Glassmorphism pour le mode sombre ---
      // Ces classes sont maintenant dans le composant Card, mais on peut les surcharger ou les compléter ici si besoin.
      // Pour cet exemple, on suppose que le composant Card de base contient déjà l'effet glassmorphism.
      
      // --- Variantes de style ---
      variant === 'primary' && "border-emerald-500 bg-emerald-500 text-white shadow-lg dark:shadow-emerald-500/25", 
      variant === 'income' && "border-l-4 border-l-green-500 dark:border-l-green-400",
      variant === 'expense' && "border-l-4 border-l-red-500 dark:border-l-red-400",
      
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <p className={cn(
              "text-sm font-medium leading-none",
              variant === 'primary' ? "dark:text-emerald-500" : "text-muted-foreground dark:text-muted-foreground/80"
            )}>
              {title}
            </p>
            <div className={cn(
              "text-3xl font-bold tracking-tight",
              variant === 'primary' && "dark:text-emerald-500"
            )}>
              {value}
            </div>
            {subtitle && (
              <p className={cn(
                "text-sm",
                variant === 'primary' ? "dark:text-emerald-500" : "text-muted-foreground dark:text-muted-foreground/70"
              )}>
                {subtitle}
              </p>
            )}
            {trend && (
              <div className="flex items-center gap-1">
                <TrendIcon className={cn(
                  "h-4 w-4",
                  trend.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                )} />
                <p className={cn(
                  "text-xs font-medium",
                  trend.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                )}>
                  {trend.isPositive ? '+' : ''}{trend.value}% vs mois dernier
                </p>
              </div>
            )}
          </div>
          {icon && (
            <div className={cn(
              "rounded-lg p-3",
              variant === 'primary' ? "bg-emerald-500/20 text-emerald-500" : "bg-muted/50 dark:bg-white/10 text-muted-foreground dark:text-white/80"
            )}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}