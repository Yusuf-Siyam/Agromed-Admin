import { useEffect, useRef, useState } from 'react';
import { User, ShieldCheck, Camera, Loader2, Check } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { useToast } from '@/components/shared/Toast';
import { useApi, useApiAction } from '@/lib/useApi';
import { useSuperAdminSession } from '@/features/auth/SuperAdminSession';
import { avatarUrl, getCurrentUser, updateProfile, uploadAvatar } from '@/lib/superadmin-api';
import PlatformTeam from './PlatformTeam';

export default function ProfileView() {
  const { success, error } = useToast();
  const { run, busy } = useApiAction();
  const { accessToken } = useSuperAdminSession();

  const pickFile = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const [avatarVersion, setAvatarVersion] = useState(0);

  const me = useApi((token) => getCurrentUser(token), []);
  const isLoading = me.loading || busy;

  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');

  useEffect(() => {
    if (!me.data) return;

    setAdminName(me.data.fullName);
    setAdminEmail(me.data.email ?? '');
    setAdminPhone(me.data.phone ?? '');
  }, [me.data]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminName.trim().length < 2) {
      error('Enter your name.');
      return;
    }
    const ok = await run((token) => updateProfile(token, adminName.trim(), adminEmail.trim() || null));
    if (ok) {
      success('Profile updated.');
      me.reload();
    } else {
      error('Your profile could not be updated.');
    }
  };

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !accessToken) return;

    setUploading(true);
    try {
      await uploadAvatar(accessToken, file);
      setAvatarVersion((v) => v + 1);
      success('Profile picture updated.');
    } catch (err) {
      error(err instanceof Error ? err.message : 'That picture could not be uploaded.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      { }
      <PageHeader title="Administrator Profile" breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Admin Profile' }]} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        { }
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-border/80 rounded-xl p-6 shadow-sm flex flex-col items-center text-center space-y-4">

            { }
            <div className="relative">
              {me.data ? (
                <img
                  key={avatarVersion}
                  src={`${avatarUrl(me.data.id)}?v=${avatarVersion}`}
                  alt=""
                  className="h-24 w-24 rounded-full border border-primary/20 bg-primary/10 object-cover shadow-inner"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden'; }}
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-4xl font-extrabold uppercase text-primary shadow-inner">
                  {adminName.substring(0, 2)}
                </div>
              )}
              <span className="absolute bottom-0 right-0 rounded-full border border-card bg-info p-1.5 text-card-foreground">
                <ShieldCheck className="h-4.5 w-4.5 bg-info text-card" />
              </span>
            </div>

            <input
              ref={pickFile}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleAvatar}
            />
            <button
              type="button"
              onClick={() => pickFile.current?.click()}
              disabled={uploading}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[11px] font-bold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            >
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
              {uploading ? 'Uploading…' : 'Change picture'}
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">{adminName}</h3>
              <span className="text-xs text-muted-foreground font-bold tracking-wider uppercase">Super Administrator</span>
            </div>

            <div className="w-full border-t border-border/60 my-2" />

            <div className="w-full text-xs font-semibold space-y-2.5 text-left">
              {

}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">User ID:</span>
                <span className="font-mono text-[10px] font-bold text-foreground">
                  {me.data ? me.data.id.slice(0, 8) : '—'}
                </span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-muted-foreground">Roles:</span>
                <span className="flex flex-wrap justify-end gap-1">
                  {(me.data?.roles ?? []).map((r) => (
                    <span key={r} className="rounded border border-primary/20 bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                      {r.replace(/_/g, ' ')}
                    </span>
                  ))}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Sign-in email:</span>
                <span className="text-foreground">{me.data?.email ?? '—'}</span>
              </div>
            </div>

          </div>
        </div>

        { }
        <div className="lg:col-span-2 space-y-6">
          { }
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
                  <label className="text-[11px] font-bold text-foreground/80">Contact email</label>
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
                  {

}
                  <input
                    type="text"
                    readOnly
                    value={adminPhone}
                    className="w-full px-3 py-2 text-xs border border-border bg-muted/40 text-muted-foreground rounded-lg focus:outline-none"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Your phone number is your sign-in identifier and cannot be changed here.
                  </p>
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

          <PlatformTeam />
        </div>

      </div>
    </div>
  );
}
