import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ActionIconProps {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  tone?: 'default' | 'primary' | 'danger';
  disabled?: boolean;
}

const TONES = {
  default: 'text-muted-foreground hover:bg-muted hover:text-foreground',
  primary: 'text-info hover:bg-info/10',
  danger: 'text-destructive hover:bg-destructive/10'
} as const;

export default function ActionIcon({
  label, icon: Icon, onClick, tone = 'default', disabled
}: ActionIconProps) {
  return (
    <span className="group/action relative inline-flex">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={label}
        aria-label={label}
        className={cn(
          'cursor-pointer rounded-lg p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-40',
          TONES[tone]
        )}
      >
        <Icon className="h-4.5 w-4.5" />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute -top-8 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[11px] font-semibold text-background opacity-0 shadow-sm transition-opacity group-hover/action:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}
