import { cn } from '@/lib/utils';

export interface FinancialSummaryCardProps {
  label: string;
  amount: string | number;
  subtext?: string;
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'default';
  className?: string;
}

export default function FinancialSummaryCard({
  label,
  amount,
  subtext,
  variant = 'default',
  className
}: FinancialSummaryCardProps) {
  const formattedAmount = typeof amount === 'number' 
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
    : amount;

  let borderClass = 'border-border/80';
  let amountClass = 'text-foreground';

  if (variant === 'success') {
    borderClass = 'border-info/30 bg-info/[0.01]';
    amountClass = 'text-info';
  } else if (variant === 'danger') {
    borderClass = 'border-destructive/30 bg-destructive/[0.01]';
    amountClass = 'text-destructive';
  } else if (variant === 'warning') {
    borderClass = 'border-secondary/30 bg-secondary/[0.01]';
    amountClass = 'text-secondary-foreground';
  } else if (variant === 'info') {
    borderClass = 'border-primary/30 bg-primary/[0.01]';
    amountClass = 'text-primary';
  }

  return (
    <div
      className={cn(
        'bg-card border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between',
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
