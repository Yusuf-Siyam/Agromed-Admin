import { useState } from 'react';
import { Bell, History, Loader2, Send, Users } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import StatCard from '@/components/shared/StatCard';
import { useToast } from '@/components/shared/Toast';
import { useApi, useApiAction } from '@/lib/useApi';
import { formatDate, listBroadcasts, sendBroadcast } from '@/lib/superadmin-api';
import type { Broadcast } from '@/lib/superadmin-api';

export default function NotificationCenter() {
  const { success, error: toastError } = useToast();
  const { run, busy } = useApiAction();

  const [audience, setAudience] = useState<'all' | 'buyers' | 'sellers'>('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const broadcasts = useApi((token) => listBroadcasts(token, 50), []);
  const sent = broadcasts.data ?? [];

  const columns: Column<Broadcast>[] = [
    {
      key: 'title',
      label: 'Broadcast',
      render: (row) => (
        <div className="flex max-w-lg flex-col">
          <span className="font-bold text-foreground">{row.title}</span>
          <span className="truncate text-xs text-muted-foreground">{row.body}</span>
        </div>
      )
    },
    { key: 'recipientCount', label: 'Recipients', align: 'center' },
    {
      key: 'deliveredCount',
      label: 'Delivered',
      align: 'center',
      render: (row) => (
        <span className={row.deliveredCount < row.recipientCount ? 'text-muted-foreground' : 'font-semibold text-success'}>
          {row.deliveredCount} / {row.recipientCount}
        </span>
      )
    },
    { key: 'createdAt', label: 'Sent', render: (row) => formatDate(row.createdAt) }
  ];

  async function dispatch(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toastError('A broadcast needs a title and a message.');
      return;
    }

    const ok = await run((token) => sendBroadcast(token, title.trim(), message.trim(), audience));
    if (ok) {
      success('Broadcast dispatched.');
      setTitle('');
      setMessage('');
      broadcasts.reload();
    } else {
      toastError('That broadcast could not be sent.');
    }
  }

  const totalRecipients = sent.reduce((t, b) => t + b.recipientCount, 0);
  const totalDelivered = sent.reduce((t, b) => t + b.deliveredCount, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Notification Centre" breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Notifications' }]} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Broadcasts sent" value={sent.length} icon={History} />
        <StatCard title="Recipients reached" value={totalRecipients.toLocaleString()} icon={Users} />
        <StatCard title="Delivered" value={totalDelivered.toLocaleString()} icon={Bell} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <div className="space-y-4 rounded-xl border border-border/80 bg-card p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
              <Bell className="h-4.5 w-4.5 text-primary" />
              Dispatch broadcast
            </h3>

            <form onSubmit={dispatch} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground/80" htmlFor="broadcast-audience">Audience</label>
                <select
                  id="broadcast-audience"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value as 'all' | 'buyers' | 'sellers')}
                  disabled={busy}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">Everyone on the platform</option>
                  <option value="buyers">Farmers and buying organisations</option>
                  <option value="sellers">Manufacturers and importers</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground/80" htmlFor="broadcast-title">Title</label>
                <input
                  id="broadcast-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={200}
                  disabled={busy}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Brown planthopper warning — Rajshahi"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground/80" htmlFor="broadcast-body">Message</label>
                <textarea
                  id="broadcast-body"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  maxLength={2000}
                  disabled={busy}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="What has happened, what to look for, and what to do about it."
                />
                <p className="text-[11px] text-muted-foreground">{message.length} / 2000</p>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/95 disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {busy ? 'Sending…' : 'Send broadcast'}
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-3 lg:col-span-2">
          <h3 className="px-1 text-base font-bold text-foreground">Broadcast history</h3>
          <DataTable
            columns={columns}
            data={sent}
            isLoading={broadcasts.loading}
            error={broadcasts.error}
            onRetry={broadcasts.reload}
          />
        </div>
      </div>
    </div>
  );
}
