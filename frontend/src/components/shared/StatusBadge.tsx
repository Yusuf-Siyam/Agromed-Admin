import { cn } from '@/lib/utils';

export interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const normStatus = status.trim().toLowerCase();

  let colorClasses = 'bg-muted text-muted-foreground border-muted-foreground/20';

  // Green / Teal (Success / Info)
  if (['completed', 'active', 'delivered', 'paid', 'approved', 'verified', 'success'].includes(normStatus)) {
    colorClasses = 'bg-info/10 text-info border-info/20';
  } 
  // Orange / Yellow (Warning / Pending)
  else if (['pending', 'processing', 'warning', 'shipped', 'in_progress', 'scheduled'].includes(normStatus)) {
    colorClasses = 'bg-secondary/10 text-secondary-foreground border-secondary/20';
  } 
  // Red (Error / Rejected / Danger)
  else if (['failed', 'suspended', 'cancelled', 'rejected', 'inactive', 'danger', 'error'].includes(normStatus)) {
    colorClasses = 'bg-destructive/10 text-destructive border-destructive/20';
  }

  // Capitalize word
  const label = status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors',
        colorClasses,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {label}
    </span>
  );
}
