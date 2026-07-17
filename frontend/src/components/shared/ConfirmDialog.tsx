import { createPortal } from 'react-dom';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
}

export default function ConfirmDialog({
  isOpen,
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary'
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  // Variant setups
  let icon = <Info className="h-6 w-6 text-primary" />;
  let iconBg = 'bg-primary/10';
  let confirmBtnClass = 'bg-primary hover:bg-primary/90 text-primary-foreground';

  if (variant === 'danger') {
    icon = <AlertCircle className="h-6 w-6 text-destructive" />;
    iconBg = 'bg-destructive/10';
    confirmBtnClass = 'bg-destructive hover:bg-destructive/90 text-destructive-foreground';
  } else if (variant === 'warning') {
    icon = <AlertTriangle className="h-6 w-6 text-secondary-foreground" />;
    iconBg = 'bg-secondary/10';
    confirmBtnClass = 'bg-secondary hover:bg-secondary/90 text-secondary-foreground';
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200"
        onClick={onCancel}
      />

      {/* Dialog Body */}
      <div
        className="bg-card border border-border/80 w-full max-w-md rounded-xl p-6 shadow-xl relative z-10 transform transition-all duration-200 scale-100 animate-in fade-in zoom-in-95"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex gap-4">
          <div className={cn('p-2 rounded-full self-start flex items-center justify-center shrink-0', iconBg)}>
            {icon}
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-foreground leading-none">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-border bg-card hover:bg-muted text-foreground text-sm font-semibold rounded-lg transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              'px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer',
              confirmBtnClass
            )}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
