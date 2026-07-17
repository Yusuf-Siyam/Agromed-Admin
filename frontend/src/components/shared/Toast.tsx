import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = 'success', duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const success = useCallback((message: string, duration?: number) => toast(message, 'success', duration), [toast]);
  const error = useCallback((message: string, duration?: number) => toast(message, 'error', duration), [toast]);
  const warning = useCallback((message: string, duration?: number) => toast(message, 'warning', duration), [toast]);
  const info = useCallback((message: string, duration?: number) => toast(message, 'info', duration), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Internal ToastContainer rendering portals
function ToastContainer({ toasts, removeToast }: { toasts: ToastItem[]; removeToast: (id: string) => void }) {
  return createPortal(
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2.5 w-full max-w-sm pointer-events-none p-4">
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} onClose={() => removeToast(t.id)} />
      ))}
    </div>,
    document.body
  );
}

// Single Toast card component
function ToastCard({ toast, onClose }: { toast: ToastItem; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, toast.duration || 3000);
    return () => clearTimeout(timer);
  }, [toast.duration, onClose]);

  let icon = <CheckCircle2 className="h-5 w-5 text-info" />;
  let borderClass = 'border-info/20';
  let bgClass = 'bg-card text-foreground';

  if (toast.type === 'error') {
    icon = <AlertCircle className="h-5 w-5 text-destructive" />;
    borderClass = 'border-destructive/20';
  } else if (toast.type === 'warning') {
    icon = <AlertTriangle className="h-5 w-5 text-secondary-foreground" />;
    borderClass = 'border-secondary/20';
  } else if (toast.type === 'info') {
    icon = <Info className="h-5 w-5 text-primary" />;
    borderClass = 'border-primary/20';
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border bg-card shadow-lg pointer-events-auto transform transition-all duration-300 animate-in slide-in-from-right-10 fade-in',
        borderClass,
        bgClass
      )}
      role="alert"
    >
      <div className="shrink-0 pt-0.5">{icon}</div>
      <div className="flex-1 text-sm font-medium text-foreground leading-relaxed pr-1">
        {toast.message}
      </div>
      <button
        onClick={onClose}
        className="shrink-0 p-0.5 text-muted-foreground/60 hover:text-foreground hover:bg-muted rounded-md transition-colors cursor-pointer"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
