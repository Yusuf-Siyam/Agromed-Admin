import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export interface PercentageBadgeProps {
  value: number;
  type: 'commission' | 'growth' | 'contribution' | 'margin';
  className?: string;
}

export default function PercentageBadge({ value, type, className }: PercentageBadgeProps) {
  let badgeColor = 'bg-muted text-muted-foreground border-muted-foreground/20';
  let icon = null;

  if (type === 'growth') {
    const isPositive = value >= 0;
    badgeColor = isPositive 
      ? 'bg-info/10 text-info border-info/20' 
      : 'bg-destructive/10 text-destructive border-destructive/20';
    icon = isPositive 
      ? <ArrowUpRight className="h-3.5 w-3.5 inline mr-0.5 shrink-0" />
      : <ArrowDownRight className="h-3.5 w-3.5 inline mr-0.5 shrink-0" />;
  } else if (type === 'margin') {
    if (value >= 15) {
      badgeColor = 'bg-info/10 text-info border-info/20';
    } else if (value >= 5) {
      badgeColor = 'bg-secondary/10 text-secondary-foreground border-secondary/20';
    } else {
      badgeColor = 'bg-destructive/10 text-destructive border-destructive/20';
    }
  } else if (type === 'commission') {
    badgeColor = 'bg-primary/10 text-primary border-primary/20';
  } else if (type === 'contribution') {
    badgeColor = 'bg-accent/20 text-accent-foreground border-accent/30';
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded border text-xs font-bold font-mono transition-colors whitespace-nowrap',
        badgeColor,
        className
      )}
    >
      {icon}
      {type === 'growth' && value >= 0 ? `+${value.toFixed(1)}` : value.toFixed(1)}%
    </span>
  );
}
