import { useState } from 'react';
import { Send, Bell, History, AlertTriangle, AlertCircle, Info, Loader2 } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import { useToast } from '@/components/shared/Toast';
import { mockBroadcasts, mockSystemAlerts } from '@/mock-data/notifications';
import type { BroadcastNotification, SystemAlert } from '@/mock-data/notifications';
import { cn } from '@/lib/utils';

export default function NotificationCenter() {
  const { success, error } = useToast();

  const [broadcasts, setBroadcasts] = useState<BroadcastNotification[]>(mockBroadcasts);
  const [alerts, setAlerts] = useState<SystemAlert[]>(mockSystemAlerts);

  // Form states
  const [targetAudience, setTargetAudience] = useState<'all' | 'farmers' | 'buyers' | 'companies'>('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const broadcastColumns: Column<BroadcastNotification>[] = [
    { key: 'id', label: 'ID' },
    {
      key: 'title',
      label: 'Notification Title',
      render: (row) => <span className="font-bold text-foreground">{row.title}</span>
    },
    {
      key: 'targetAudience',
      label: 'Audience Target',
      render: (row) => (
        <span className="text-[10px] px-2 py-0.5 border border-border bg-muted text-foreground/80 font-bold uppercase rounded-md">
          {row.targetAudience}
        </span>
      )
    },
    {
      key: 'message',
      label: 'Broadcast Message Details',
      render: (row) => <p className="text-xs text-muted-foreground line-clamp-1 max-w-sm">{row.message}</p>
    },
    { key: 'date', label: 'Broadcast Date' }
  ];

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      error('Notification title is required');
      return;
    }
    if (!message.trim()) {
      error('Broadcast message cannot be empty');
      return;
    }

    setIsLoading(true);

    // Simulate API broadcast dispatch
    setTimeout(() => {
      setIsLoading(false);
      
      const newBroadcast: BroadcastNotification = {
        id: `NOT-${broadcasts.length + 101}`,
        targetAudience,
        title,
        message,
        date: new Date().toISOString().split('T')[0]
      };

      setBroadcasts((prev) => [newBroadcast, ...prev]);
      success('Broadcast Notification dispatched successfully');
      
      // Reset form
      setTitle('');
      setMessage('');
    }, 1200);
  };

  const getAlertIcon = (severity: 'info' | 'warning' | 'danger') => {
    switch (severity) {
      case 'danger':
        return <AlertCircle className="h-4.5 w-4.5 text-destructive shrink-0" />;
      case 'warning':
        return <AlertTriangle className="h-4.5 w-4.5 text-secondary-foreground shrink-0" />;
      case 'info':
        return <Info className="h-4.5 w-4.5 text-info shrink-0" />;
    }
  };

  const handleDismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    success('Alert dismissed');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader title="Notification & System Alerts Center" breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Notifications' }]} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns: Send notification form */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-foreground tracking-wider uppercase flex items-center gap-2">
              <Bell className="h-4.5 w-4.5 text-primary" />
              Dispatch Broadcast
            </h3>

            <form onSubmit={handleSendNotification} className="space-y-4">
              
              {/* Audience Target */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground/80">Target Segment</label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as any)}
                  disabled={isLoading}
                  className="w-full px-3 py-2 text-xs border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All Platform Users</option>
                  <option value="farmers">Farmers Only</option>
                  <option value="buyers">Corporate Buyers Only</option>
                  <option value="companies">Agro Company Partners</option>
                </select>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground/80">Notification Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isLoading}
                  placeholder="e.g. Schedule Maintenance"
                  className="w-full px-3 py-2 text-xs border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Message */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground/80">Message Body</label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isLoading}
                  placeholder="Write the message text here..."
                  className="w-full px-3 py-2 text-xs border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    Broadcasting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Broadcast Notification
                  </>
                )}
              </button>

            </form>
          </div>

        </div>

        {/* Right Columns: System Alerts logs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-foreground tracking-wider uppercase">Active Platform System Diagnostics</h3>
            
            {alerts.length === 0 ? (
              <div className="p-6 text-center text-xs font-medium text-muted-foreground bg-muted/20 border border-dashed border-border rounded-lg">
                No active system alerts. All nodes running healthy.
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={cn(
                      'flex items-start justify-between p-3.5 border rounded-xl gap-3 shadow-sm transition-all',
                      alert.severity === 'danger'
                        ? 'border-destructive/35 bg-destructive/[0.01]'
                        : alert.severity === 'warning'
                        ? 'border-secondary/35 bg-secondary/[0.01]'
                        : 'border-info/35 bg-info/[0.01]'
                    )}
                  >
                    <div className="flex gap-2.5 items-start">
                      {getAlertIcon(alert.severity)}
                      <div className="space-y-1 text-xs font-medium">
                        <span className="text-[10px] text-muted-foreground font-bold">{alert.timestamp}</span>
                        <p className="text-foreground leading-normal">{alert.message}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDismissAlert(alert.id)}
                      className="px-2 py-1 border border-border hover:bg-muted text-foreground text-[10px] font-bold rounded transition-colors cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Broadcast History table list */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-foreground px-1 flex items-center gap-1.5">
          <History className="h-4.5 w-4.5 text-muted-foreground" />
          Historical Broadcast Log
        </h3>
        <DataTable columns={broadcastColumns} data={broadcasts} />
      </div>

    </div>
  );
}
