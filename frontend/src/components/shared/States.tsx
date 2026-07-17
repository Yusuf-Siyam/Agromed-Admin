import { Loader2, AlertCircle, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- LOADING STATE ---
export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = 'Loading data...', className }: LoadingStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-12 text-center space-y-4', className)}>
      <Loader2 className="h-8 w-8 animate-spin text-info" />
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
    </div>
  );
}

// --- EMPTY STATE ---
export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title = 'No items found',
  description = 'There is no data to display here at the moment.',
  icon,
  action,
  className
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto space-y-4', className)}>
      <div className="p-3 bg-muted/50 text-muted-foreground rounded-full border border-border">
        {icon || <Inbox className="h-8 w-8 text-muted-foreground/80" />}
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}

// --- ERROR STATE ---
export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An error occurred while loading the data. Please try again.',
  onRetry,
  className
}: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto space-y-4', className)}>
      <div className="p-3 bg-destructive/10 text-destructive rounded-full border border-destructive/20">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-md transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
