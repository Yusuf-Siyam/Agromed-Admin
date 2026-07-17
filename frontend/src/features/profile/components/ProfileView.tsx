import { useState } from 'react';
import { User, ShieldCheck, Calendar, Info, Loader2, Check } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { useToast } from '@/components/shared/Toast';
import { cn } from '@/lib/utils';

export default function ProfileView() {
  const { success } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [adminName, setAdminName] = useState('Siyam Administrator');
  const [adminEmail, setAdminEmail] = useState('siyam.admin@agromed.connect');
  const [adminPhone, setAdminPhone] = useState('+880 1711-223344');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      success('Administrator Profile updated successfully');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader title="Administrator Profile" breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Admin Profile' }]} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column Profile info Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-border/80 rounded-xl p-6 shadow-sm flex flex-col items-center text-center space-y-4">
            
            {/* Avatar block */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-4xl font-extrabold uppercase shadow-inner">
                {adminName.substring(0, 2)}
              </div>
              <span className="absolute bottom-0 right-0 p-1.5 bg-info border border-card rounded-full text-card-foreground">
                <ShieldCheck className="h-4.5 w-4.5 text-card bg-info" />
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">{adminName}</h3>
              <span className="text-xs text-muted-foreground font-bold tracking-wider uppercase">Super Administrator</span>
            </div>

            <div className="w-full border-t border-border/60 my-2" />

            <div className="w-full text-xs font-semibold space-y-2.5 text-left">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Admin ID:</span>
                <span className="font-mono text-foreground font-bold">ADM-9018</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Assigned Region:</span>
                <span>Dhaka HQ, Bangladesh</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Access Clearance:</span>
                <span className="text-[10px] bg-primary/15 text-primary border border-primary/20 px-2 py-0.5 rounded font-bold uppercase">
                  Level 5 Max
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Member Since:</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  2025-01-10
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Right Columns form details and sessions log */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit Form */}
          <div className="bg-card border border-border/80 rounded-xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-foreground tracking-wider uppercase flex items-center gap-2 mb-4">
              <User className="h-4.5 w-4.5 text-primary" />
              Profile Details
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-foreground/80">Administrator Name</label>
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-3 py-2 text-xs border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-foreground/80">Logins Contact Email</label>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-3 py-2 text-xs border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[11px] font-bold text-foreground/80">Contact Phone Number</label>
                  <input
                    type="text"
                    required
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-3 py-2 text-xs border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Save Details
                </button>
              </div>
            </form>
          </div>

          {/* Active login sessions audit */}
          <div className="bg-card border border-border/80 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-foreground tracking-wider uppercase flex items-center gap-2">
              <Info className="h-4.5 w-4.5 text-primary" />
              Active Admin Sessions
            </h3>

            <div className="space-y-3.5 text-xs font-semibold">
              {[
                { ip: '103.25.244.18', client: 'Chrome 125.0 / Windows 11', time: 'Active Now (Current Session)', status: 'current' },
                { ip: '192.168.1.42', client: 'Safari iOS 17.4 / iPhone 15', time: 'Logged: 2026-07-17 04:12 PM', status: 'active' }
              ].map((sess, idx) => (
                <div key={idx} className="flex justify-between items-start border-b border-border/40 pb-3 last:border-b-0 last:pb-0">
                  <div className="space-y-0.5">
                    <p className="text-foreground">{sess.client}</p>
                    <span className="text-[10px] text-muted-foreground font-mono font-medium block">IP Address: {sess.ip}</span>
                  </div>
                  <div className="text-right space-y-1">
                    <span className={cn(
                      'text-[9px] px-1.5 py-0.5 rounded font-bold uppercase border',
                      sess.status === 'current'
                        ? 'bg-primary/10 border-primary/20 text-primary'
                        : 'bg-muted border-border text-muted-foreground'
                    )}>
                      {sess.status === 'current' ? 'Current Session' : 'Active'}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium block pt-0.5">{sess.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
