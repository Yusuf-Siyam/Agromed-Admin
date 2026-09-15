import { useCallback, useEffect, useState } from 'react';
import { Loader2, UserPlus } from 'lucide-react';
import { useToast } from '@/components/shared/Toast';
import { useSuperAdminSession } from '@/features/auth/SuperAdminSession';
import {
  PLATFORM_ROLES, avatarUrl, formatDate, invitePlatformMember,
  listPlatformMembers, setPlatformRole
} from '@/lib/superadmin-api';
import type { PlatformMember } from '@/lib/superadmin-api';

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super administrator',
  platform_ops: 'Operations',
  platform_support: 'Support'
};

export default function PlatformTeam() {
  const { accessToken } = useSuperAdminSession();
  const { success, error } = useToast();

  const [members, setMembers] = useState<PlatformMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [roleCode, setRoleCode] = useState<string>('platform_support');
  const [issued, setIssued] = useState<{ token: string; expiresAt: string } | null>(null);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try { setMembers(await listPlatformMembers(accessToken)); }
    catch { error('The platform team could not be loaded.'); }
    finally { setLoading(false); }
  }, [accessToken, error]);

  useEffect(() => { void load(); }, [load]);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    if (!accessToken) return;
    const who = identifier.trim();
    if (!who) { error('Enter the new employee’s phone number or email.'); return; }

    setBusy(true);
    try {
      const result = await invitePlatformMember(accessToken, roleCode, who);
      setIssued({ token: result.token, expiresAt: result.expiresAt });
      setIdentifier('');
      success('Invitation issued.');
      await load();
    } catch {
      error('That invitation could not be issued.');
    } finally {
      setBusy(false);
    }
  }

  async function changeRole(member: PlatformMember, next: string) {
    if (!accessToken || next === member.roleCode) return;
    setBusy(true);
    try {
      await setPlatformRole(accessToken, member.membershipId, next);
      success(`${member.fullName} is now ${ROLE_LABELS[next] ?? next}.`);
      await load();
    } catch {
      error(`${member.fullName}’s role could not be changed.`);
    } finally {
      setBusy(false);
    }
  }

  const field = 'w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20';

  return (
    <div className="space-y-4 rounded-xl border border-border/80 bg-card p-6 shadow-sm">
      <div>
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
          <UserPlus className="h-4.5 w-4.5 text-primary" />
          Platform team ({members.length})
        </h3>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Employee accounts on the platform organisation, and what each one is allowed to do.
        </p>
      </div>

      <form onSubmit={invite} className="grid gap-3 sm:grid-cols-[2fr_1fr_auto]">
        <input
          className={field}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="+8801711000001 or name@agromedconnect.com"
          aria-label="New employee phone number or email"
        />
        <select className={field} value={roleCode} onChange={(e) => setRoleCode(e.target.value)} aria-label="Role">
          {PLATFORM_ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r] ?? r}</option>)}
        </select>
        <button
          type="submit"
          disabled={busy}
          className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          Invite
        </button>
      </form>

      {issued && (
        <div className="space-y-1 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <p className="text-xs font-bold text-foreground">Invitation token — shown once</p>
          <p className="break-all font-mono text-[11px] text-foreground">{issued.token}</p>
          <p className="text-[11px] text-muted-foreground">
            Give this to the new employee to redeem. It expires {formatDate(issued.expiresAt)}.
          </p>
        </div>
      )}

      {loading ? (
        <p className="py-6 text-center text-sm text-muted-foreground">Loading the team…</p>
      ) : members.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">No platform staff accounts yet.</p>
      ) : (
        <ul className="divide-y divide-border">
          {members.map((m) => (
            <li key={m.membershipId} className="flex flex-wrap items-center gap-3 py-3">
              {m.hasAvatar ? (
                <img src={avatarUrl(m.userId)} alt="" className="h-9 w-9 shrink-0 rounded-full border border-border object-cover" />
              ) : (
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-xs font-bold uppercase text-primary">
                  {m.fullName.slice(0, 2)}
                </span>
              )}
              <div className="min-w-40 flex-1">
                <p className="text-sm font-semibold text-foreground">{m.fullName}</p>
                <p className="text-[11px] text-muted-foreground">
                  {m.email ?? m.phoneE164 ?? '—'}
                  {' · '}
                  {m.lastLoginAt ? `last signed in ${formatDate(m.lastLoginAt)}` : 'never signed in'}
                </p>
              </div>
              <select
                className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground"
                value={m.roleCode}
                disabled={busy}
                onChange={(e) => void changeRole(m, e.target.value)}
                aria-label={`Role for ${m.fullName}`}
              >
                {PLATFORM_ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r] ?? r}</option>)}
                {
}
                {!PLATFORM_ROLES.includes(m.roleCode as typeof PLATFORM_ROLES[number]) && (
                  <option value={m.roleCode}>{m.roleCode.replace(/_/g, ' ')}</option>
                )}
              </select>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
