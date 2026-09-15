import { useEffect, useMemo, useState } from 'react';
import { Check, Info, Loader2, Lock, Palette, Settings, User } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { useToast } from '@/components/shared/Toast';
import { useApi, useApiAction } from '@/lib/useApi';
import {
  changePassword, getCommissionSettings, getCurrentUser, listFeatures,
  setFeature, updateCommissionSettings, updateProfile
} from '@/lib/superadmin-api';
import { cn } from '@/lib/utils';

type ActiveTab = 'general' | 'platform' | 'profile' | 'password' | 'theme';

const CONFIG_KEY = 'platform.configuration';

interface PlatformConfig {
  platformName: string;
  supportEmail: string;
  supportPhone: string;
  taxRatePercent: string;
  minPayoutMinor: string;
  maintenanceMode: boolean;
}

const EMPTY_CONFIG: PlatformConfig = {
  platformName: '', supportEmail: '', supportPhone: '',
  taxRatePercent: '', minPayoutMinor: '', maintenanceMode: false
};

const TABS: { id: ActiveTab; label: string; icon: typeof Settings }[] = [
  { id: 'general', label: 'General Info', icon: Info },
  { id: 'platform', label: 'Platform Controls', icon: Settings },
  { id: 'profile', label: 'Admin Profile', icon: User },
  { id: 'password', label: 'Security & Access', icon: Lock },
  { id: 'theme', label: 'Visual Themes', icon: Palette }
];

export default function SettingsView() {
  const { success, error } = useToast();
  const { run, busy } = useApiAction();

  const [activeTab, setActiveTab] = useState<ActiveTab>('general');

  const features = useApi((token) => listFeatures(token), []);
  const commission = useApi((token) => getCommissionSettings(token), []);
  const me = useApi((token) => getCurrentUser(token), []);

  const [config, setConfig] = useState<PlatformConfig>(EMPTY_CONFIG);
  const [rate, setRate] = useState('');
  const [rateNote, setRateNote] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(
    () => (document.documentElement.classList.contains('dark') ? 'dark' : 'light'));

  const storedConfig = useMemo(() => {
    const row = (features.data ?? []).find((f) => f.featureKey === CONFIG_KEY);
    if (!row?.configurationJson) return null;
    try { return JSON.parse(row.configurationJson) as Partial<PlatformConfig>; }
    catch { return null; }
  }, [features.data]);

  useEffect(() => {
    if (!storedConfig) return;

    setConfig({ ...EMPTY_CONFIG, ...storedConfig });
  }, [storedConfig]);

  useEffect(() => {
    if (!commission.data) return;

    setRate(String(commission.data.defaultRatePercent));
  }, [commission.data]);

  useEffect(() => {
    if (!me.data) return;

    setAdminName(me.data.fullName);
    setAdminEmail(me.data.email ?? '');
  }, [me.data]);

  async function saveConfig() {
    const ok = await run((token) => setFeature(token, CONFIG_KEY, !config.maintenanceMode, JSON.stringify(config)));
    if (ok) { success('Platform configuration saved.'); features.reload(); }
    else error('That configuration could not be saved.');
  }

  async function saveRate() {
    const value = Number(rate);
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      error('The commission rate is a percentage between 0 and 100.');
      return;
    }
    const ok = await run((token) => updateCommissionSettings(token, value, rateNote.trim() || undefined));
    if (ok) {
      success('A new commission rule set has been published.');
      setRateNote('');
      commission.reload();
    } else {
      error('The commission rate could not be changed.');
    }
  }

  async function saveProfile() {
    if (adminName.trim().length < 2) { error('Enter your name.'); return; }
    const ok = await run((token) => updateProfile(token, adminName.trim(), adminEmail.trim() || null));
    if (ok) { success('Profile updated.'); me.reload(); }
    else error('Your profile could not be updated.');
  }

  async function savePassword() {
    const errs: Record<string, string> = {};
    if (!currentPassword) errs.current = 'Enter your current password';
    if (newPassword.length < 8) errs.next = 'The new password must be at least 8 characters';
    if (newPassword !== confirmPassword) errs.confirm = 'The two passwords do not match';
    setPasswordErrors(errs);
    if (Object.keys(errs).length) return;

    const ok = await run((token) => changePassword(token, currentPassword, newPassword));
    if (ok) {
      success('Password changed.');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } else {
      error('Your current password was not accepted.');
    }
  }

  function applyTheme(mode: 'light' | 'dark') {
    setThemeMode(mode);
    document.documentElement.classList.toggle('dark', mode === 'dark');
    try { localStorage.setItem('agromed-admin-theme', mode); } catch { void 0; }
    success(`${mode === 'dark' ? 'Dark' : 'Light'} theme applied.`);
  }

  const field = 'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20';
  const label = 'block text-xs font-bold text-foreground/80 mb-1';

  return (
    <div className="space-y-6">
      <PageHeader title="System Settings" breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Settings' }]} />

      <div className="flex overflow-x-auto rounded-t-xl border-b border-border/60 bg-card shadow-sm">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex cursor-pointer items-center gap-2 whitespace-nowrap border-b-2 px-5 py-3.5 text-xs font-bold transition-all',
              activeTab === tab.id ? 'border-primary bg-muted/10 text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'general' && (
        <section className="space-y-4 rounded-xl border border-border/80 bg-card p-5 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-foreground">General application settings</h3>
            <p className="text-xs text-muted-foreground">
              Stored as configuration on the <code className="font-mono">{CONFIG_KEY}</code> feature flag.
            </p>
          </div>
          {features.loading ? <p className="text-sm text-muted-foreground">Loading…</p> : (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={label} htmlFor="platform-name">Portal title</label>
                <input id="platform-name" className={field} value={config.platformName}
                  onChange={(e) => setConfig({ ...config, platformName: e.target.value })} placeholder="AgroMedConnect" />
              </div>
              <div>
                <label className={label} htmlFor="support-email">Support email</label>
                <input id="support-email" type="email" className={field} value={config.supportEmail}
                  onChange={(e) => setConfig({ ...config, supportEmail: e.target.value })} placeholder="support@agromedconnect.com" />
              </div>
              <div>
                <label className={label} htmlFor="support-phone">Support hotline</label>
                <input id="support-phone" className={field} value={config.supportPhone}
                  onChange={(e) => setConfig({ ...config, supportPhone: e.target.value })} placeholder="+8809612445566" />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input type="checkbox" checked={config.maintenanceMode}
                    onChange={(e) => setConfig({ ...config, maintenanceMode: e.target.checked })} />
                  Maintenance mode
                </label>
              </div>
            </div>
          )}
          <button onClick={saveConfig} disabled={busy}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}Save configuration
          </button>
        </section>
      )}

      {activeTab === 'platform' && (
        <section className="space-y-4 rounded-xl border border-border/80 bg-card p-5 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-foreground">Commission</h3>
            <p className="text-xs text-muted-foreground">
              {commission.data
                ? `Rule set v${commission.data.versionNumber}, ${commission.data.status}.`
                : 'Loading the active rule set…'}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className={label} htmlFor="commission-rate">Default rate (%)</label>
              <input id="commission-rate" type="number" step="0.1" min="0" max="100" className={field}
                value={rate} onChange={(e) => setRate(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className={label} htmlFor="commission-note">Why it is changing</label>
              <input id="commission-note" className={field} value={rateNote}
                onChange={(e) => setRateNote(e.target.value)} placeholder="Seasonal adjustment for the Aman harvest" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={label} htmlFor="tax-rate">Tax rate (%)</label>
              <input id="tax-rate" className={field} value={config.taxRatePercent}
                onChange={(e) => setConfig({ ...config, taxRatePercent: e.target.value })} placeholder="5.0" />
            </div>
            <div>
              <label className={label} htmlFor="min-payout">Minimum payout (৳)</label>
              <input id="min-payout" className={field} value={config.minPayoutMinor}
                onChange={(e) => setConfig({ ...config, minPayoutMinor: e.target.value })} placeholder="250" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={saveRate} disabled={busy}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}Publish new rule set
            </button>
            <button onClick={saveConfig} disabled={busy}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground disabled:opacity-60">
              Save tax and payout settings
            </button>
          </div>
        </section>
      )}

      {activeTab === 'profile' && (
        <section className="space-y-4 rounded-xl border border-border/80 bg-card p-5 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-foreground">Your administrator account</h3>
            <p className="text-xs text-muted-foreground">
              {me.data ? `Signed in as ${me.data.fullName} · ${me.data.roles.join(', ')}` : 'Loading…'}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={label} htmlFor="admin-name">Name</label>
              <input id="admin-name" className={field} value={adminName} onChange={(e) => setAdminName(e.target.value)} />
            </div>
            <div>
              <label className={label} htmlFor="admin-email">Email</label>
              <input id="admin-email" type="email" className={field} value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
            </div>
            <div>
              <label className={label} htmlFor="admin-phone">Phone</label>
              {
}
              <input id="admin-phone" className={cn(field, 'opacity-60')} value={me.data?.phone ?? ''} readOnly />
              <p className="mt-1 text-[11px] text-muted-foreground">Your phone number is your sign-in identifier and cannot be changed here.</p>
            </div>
          </div>
          <button onClick={saveProfile} disabled={busy}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}Save profile
          </button>
        </section>
      )}

      {activeTab === 'password' && (
        <section className="space-y-4 rounded-xl border border-border/80 bg-card p-5 shadow-sm">
          <h3 className="text-sm font-bold text-foreground">Change your password</h3>
          <div className="grid gap-4 md:max-w-md">
            <div>
              <label className={label} htmlFor="current-password">Current password</label>
              <input id="current-password" type="password" autoComplete="current-password" className={field}
                value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              {passwordErrors.current && <p className="mt-1 text-xs text-destructive">{passwordErrors.current}</p>}
            </div>
            <div>
              <label className={label} htmlFor="new-password">New password</label>
              <input id="new-password" type="password" autoComplete="new-password" className={field}
                value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              {passwordErrors.next && <p className="mt-1 text-xs text-destructive">{passwordErrors.next}</p>}
            </div>
            <div>
              <label className={label} htmlFor="confirm-password">Confirm new password</label>
              <input id="confirm-password" type="password" autoComplete="new-password" className={field}
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              {passwordErrors.confirm && <p className="mt-1 text-xs text-destructive">{passwordErrors.confirm}</p>}
            </div>
          </div>
          <button onClick={savePassword} disabled={busy}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}Change password
          </button>
          <p className="text-xs text-muted-foreground">
            Changing your password signs out your other sessions.
          </p>
        </section>
      )}

      {activeTab === 'theme' && (
        <section className="space-y-4 rounded-xl border border-border/80 bg-card p-5 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-foreground">Appearance</h3>
            <p className="text-xs text-muted-foreground">
              A preference for this browser. It is not sent to the server, because it is not
              something the platform needs to know about you.
            </p>
          </div>
          <div className="flex gap-2">
            {(['light', 'dark'] as const).map((mode) => (
              <button key={mode} onClick={() => applyTheme(mode)}
                className={cn('cursor-pointer rounded-lg border px-4 py-2 text-sm font-semibold capitalize transition-colors',
                  themeMode === mode ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground hover:bg-muted')}>
                {mode}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
