import { useState } from 'react';
import { Settings, Lock, Palette, Info, Check, Loader2 } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { useToast } from '@/components/shared/Toast';
import { cn } from '@/lib/utils';

type ActiveTab = 'general' | 'platform' | 'password' | 'theme';

export default function SettingsView() {
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<ActiveTab>('general');
  const [isLoading, setIsLoading] = useState(false);

  // Form states - General
  const [platformName, setPlatformName] = useState('AgroMED Connect');
  const [supportEmail, setSupportEmail] = useState('support@agromed.connect');
  const [supportPhone, setSupportPhone] = useState('+880 9612-445566');

  // Form states - Platform
  const [commissionRate, setCommissionRate] = useState('8.5');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [minPayoutAmount, setMinPayoutAmount] = useState('100.00');

  // Form states - Change Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  // Form states - Theme
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      success('General application settings updated successfully');
    }, 1000);
  };

  const handleSavePlatform = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedRate = parseFloat(commissionRate);
    if (isNaN(parsedRate) || parsedRate < 0 || parsedRate > 100) {
      error('Commission rate percentage must be between 0 and 100');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      success('Platform system configuration updated');
    }, 1000);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (!currentPassword) errs.currentPassword = 'Current password is required';
    if (newPassword.length < 6) {
      errs.newPassword = 'New password must be at least 6 characters long';
    }
    if (newPassword !== confirmPassword) {
      errs.confirmPassword = 'New password confirmation does not match';
    }

    if (Object.keys(errs).length > 0) {
      setPasswordErrors(errs);
      error('Please check password validation requirements');
      return;
    }

    setPasswordErrors({});
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      success('Administrator password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 1200);
  };

  const handleSaveTheme = () => {
    success(`Theme mode updated to ${themeMode.toUpperCase()}`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader title="System Settings Center" breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Settings' }]} />

      {/* Main layout container: Tab navigation sidebar + Tab content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Left Side: Sidebar controls */}
        <div className="md:col-span-1 space-y-2">
          {[
            { id: 'general' as const, label: 'General Info', icon: Info },
            { id: 'platform' as const, label: 'Platform Controls', icon: Settings },
            { id: 'password' as const, label: 'Security & Access', icon: Lock },
            { id: 'theme' as const, label: 'Visual Themes', icon: Palette }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setPasswordErrors({});
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-sm',
                  isSelected
                    ? 'border-primary bg-muted/10 text-primary'
                    : 'border-border/60 bg-card hover:bg-muted/40 text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right Side: Tab content container */}
        <div className="md:col-span-3">
          <div className="bg-card border border-border/80 rounded-xl p-6 shadow-sm min-h-[300px]">
            
            {/* General Settings */}
            {activeTab === 'general' && (
              <form onSubmit={handleSaveGeneral} className="space-y-5 animate-in fade-in duration-200">
                <div className="border-b border-border/60 pb-3">
                  <h3 className="text-base font-bold text-foreground">General Application Settings</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Configure platform titles and customer helpdesk contacts.</p>
                </div>

                <div className="grid grid-cols-1 gap-4 max-w-xl">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-foreground/80">Application / Portal Title</label>
                    <input
                      type="text"
                      required
                      value={platformName}
                      onChange={(e) => setPlatformName(e.target.value)}
                      disabled={isLoading}
                      className="w-full px-3 py-2 text-xs border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-foreground/80">Support Hotline Email</label>
                    <input
                      type="email"
                      required
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      disabled={isLoading}
                      className="w-full px-3 py-2 text-xs border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-foreground/80">Helpdesk Support Number</label>
                    <input
                      type="text"
                      required
                      value={supportPhone}
                      onChange={(e) => setSupportPhone(e.target.value)}
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
                    Save Configuration
                  </button>
                </div>
              </form>
            )}

            {/* Platform Controls */}
            {activeTab === 'platform' && (
              <form onSubmit={handleSavePlatform} className="space-y-5 animate-in fade-in duration-200">
                <div className="border-b border-border/60 pb-3">
                  <h3 className="text-base font-bold text-foreground">Platform Fee & Payout Controls</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Define business transaction commission rates and system parameters.</p>
                </div>

                <div className="grid grid-cols-1 gap-4 max-w-xl">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-foreground/80">Transaction Commission Rate (%)</label>
                    <input
                      type="text"
                      required
                      value={commissionRate}
                      onChange={(e) => setCommissionRate(e.target.value)}
                      disabled={isLoading}
                      placeholder="8.5"
                      className="w-full px-3 py-2 text-xs border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-foreground/80">Minimum Farmer Payout Balance ($)</label>
                    <input
                      type="text"
                      required
                      value={minPayoutAmount}
                      onChange={(e) => setMinPayoutAmount(e.target.value)}
                      disabled={isLoading}
                      className="w-full px-3 py-2 text-xs border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3.5 border border-border/80 rounded-xl bg-muted/20">
                    <div className="space-y-0.5 max-w-[80%]">
                      <span className="text-xs font-bold text-foreground">Maintenance System Mode</span>
                      <p className="text-[10px] text-muted-foreground leading-normal">
                        Locks the farmer and buyer portals temporarily for server maintenance. Admin operations remain active.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={maintenanceMode}
                        onChange={(e) => setMaintenanceMode(e.target.checked)}
                        disabled={isLoading}
                        className="sr-only peer text-primary focus:ring-primary"
                      />
                      <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                    </label>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Save Parameters
                  </button>
                </div>
              </form>
            )}

            {/* Change Password Form */}
            {activeTab === 'password' && (
              <form onSubmit={handleSavePassword} className="space-y-5 animate-in fade-in duration-200">
                <div className="border-b border-border/60 pb-3">
                  <h3 className="text-base font-bold text-foreground">Security Settings</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Ensure your administrator access remains secure.</p>
                </div>

                <div className="grid grid-cols-1 gap-4 max-w-xl">
                  {/* Current Password */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-foreground/80">Current Administrator Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => {
                        setCurrentPassword(e.target.value);
                        if (passwordErrors.currentPassword) setPasswordErrors({ ...passwordErrors, currentPassword: '' });
                      }}
                      disabled={isLoading}
                      className={cn(
                        'w-full px-3 py-2 text-xs border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 transition-shadow',
                        passwordErrors.currentPassword ? 'border-destructive focus:ring-destructive/20' : 'border-border focus:ring-primary/20'
                      )}
                    />
                    {passwordErrors.currentPassword && <p className="text-[10px] text-destructive font-medium">{passwordErrors.currentPassword}</p>}
                  </div>

                  {/* New Password */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-foreground/80">New Secure Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (passwordErrors.newPassword) setPasswordErrors({ ...passwordErrors, newPassword: '' });
                      }}
                      disabled={isLoading}
                      className={cn(
                        'w-full px-3 py-2 text-xs border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 transition-shadow',
                        passwordErrors.newPassword ? 'border-destructive focus:ring-destructive/20' : 'border-border focus:ring-primary/20'
                      )}
                    />
                    {passwordErrors.newPassword && <p className="text-[10px] text-destructive font-medium">{passwordErrors.newPassword}</p>}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-foreground/80">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (passwordErrors.confirmPassword) setPasswordErrors({ ...passwordErrors, confirmPassword: '' });
                      }}
                      disabled={isLoading}
                      className={cn(
                        'w-full px-3 py-2 text-xs border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 transition-shadow',
                        passwordErrors.confirmPassword ? 'border-destructive focus:ring-destructive/20' : 'border-border focus:ring-primary/20'
                      )}
                    />
                    {passwordErrors.confirmPassword && <p className="text-[10px] text-destructive font-medium">{passwordErrors.confirmPassword}</p>}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Update Password
                  </button>
                </div>
              </form>
            )}

            {/* Visual Theme Selection */}
            {activeTab === 'theme' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="border-b border-border/60 pb-3">
                  <h3 className="text-base font-bold text-foreground">Visual Theme Configuration</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Toggle application appearance parameters.</p>
                </div>

                <div className="grid grid-cols-2 gap-4 max-w-xl">
                  {/* Light */}
                  <button
                    onClick={() => setThemeMode('light')}
                    className={cn(
                      'p-5 border rounded-xl flex flex-col items-center gap-3 text-xs font-bold shadow-sm transition-all cursor-pointer',
                      themeMode === 'light'
                        ? 'border-primary bg-muted/10 text-primary'
                        : 'border-border/60 bg-card hover:bg-muted/30 text-muted-foreground'
                    )}
                  >
                    <span className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 block" />
                    Portal Light Mode
                  </button>

                  {/* Dark */}
                  <button
                    onClick={() => setThemeMode('dark')}
                    className={cn(
                      'p-5 border rounded-xl flex flex-col items-center gap-3 text-xs font-bold shadow-sm transition-all cursor-pointer',
                      themeMode === 'dark'
                        ? 'border-primary bg-muted/10 text-primary'
                        : 'border-border/60 bg-card hover:bg-muted/30 text-muted-foreground'
                    )}
                  >
                    <span className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 block" />
                    Portal Dark Mode
                  </button>
                </div>

                <div className="flex justify-end pt-4 border-t border-border/60">
                  <button
                    onClick={handleSaveTheme}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    <Check className="h-4 w-4" />
                    Apply Theme
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
