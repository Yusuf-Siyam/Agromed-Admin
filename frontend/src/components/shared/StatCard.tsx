import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  className?: string;
}

export default function StatCard({ title, value, icon: Icon, trend, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-card text-card-foreground border border-border/80 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between',
        className
      )}
    >
      <div className="flex items-center justify-between pb-2">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <div className="p-2 bg-primary/5 text-primary rounded-lg border border-primary/10">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-2">
        <h3 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {value}
        </h3>
        
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <span
              className={cn(
                'inline-flex items-center gap-0.5 text-xs font-semibold rounded-md px-1.5 py-0.5 border',
                trend.isPositive
                  ? 'bg-info/10 text-info border-info/20'
                  : 'bg-destructive/10 text-destructive border-destructive/20'
              )}
            >
              {trend.isPositive ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}
              {trend.value}%
            </span>
            <span className="text-xs text-muted-foreground">
              {trend.label}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
