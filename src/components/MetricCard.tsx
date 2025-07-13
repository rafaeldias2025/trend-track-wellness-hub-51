import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: number;
  unit: string;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  icon: LucideIcon;
  className?: string;
}

export const MetricCard = ({ 
  title, 
  value, 
  unit, 
  change, 
  trend, 
  icon: Icon, 
  className 
}: MetricCardProps) => {
  const isPositiveTrend = trend === 'up';
  const isNegativeTrend = trend === 'down';
  
  return (
    <Card className={cn("metric-card animate-fade-in hover:animate-scale-in", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          {change && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
              isPositiveTrend && "text-success-green bg-success-green/10",
              isNegativeTrend && "text-primary bg-primary/10"
            )}>
              {isPositiveTrend && <TrendingUp className="h-3 w-3" />}
              {isNegativeTrend && <TrendingDown className="h-3 w-3" />}
              {Math.abs(change)}{unit}
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <div className="flex items-baseline gap-1">
            <span className="metric-value text-foreground">{value}</span>
            <span className="text-sm text-muted-foreground font-medium">{unit}</span>
          </div>
          <p className="metric-label">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
};