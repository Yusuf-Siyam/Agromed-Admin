import { cn } from '@/lib/utils';

export interface FinancialSummaryCardProps {
  label: string;
  amount: string | number;
  currency?: string;
  subtext?: string;
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'default';
  className?: string;
}

export default function FinancialSummaryCard({
  label,
  amount,
  currency = 'USD',
  subtext,
  variant = 'default',
  className
}: FinancialSummaryCardProps) {
  const formattedAmount = typeof amount === 'number'
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
    : amount;

  let borderClass = 'border-border/80';
  let amountClass = 'text-foreground';

  if (variant === 'success') {
    borderClass = 'border-info/35';
    amountClass = 'text-primary';
  } else if (variant === 'danger') {
    borderClass = 'border-destructive/35';
    amountClass = 'text-destructive';
  } else if (variant === 'warning') {
    borderClass = 'border-secondary/35';
    amountClass = 'text-primary';
  } else if (variant === 'info') {
    borderClass = 'border-primary/35';
    amountClass = 'text-primary';
  }

  return (
    <div
      className={cn(
        'dashboard-card border p-5 min-h-32 transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between',
        variant !== 'default' && `metric-card-${variant}`,
        borderClass,
        className
      )}
    >
      <div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
        <h3 className={cn('text-2xl font-black mt-2 tracking-tight', amountClass)}>
          {formattedAmount}
        </h3>
      </div>
      {subtext && (
        <p className="text-xs text-muted-foreground mt-2 font-medium">
          {subtext}
        </p>
      )}
    </div>
  );
}
