import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Loader2, Lock } from 'lucide-react';
import { useToast } from '@/components/shared/Toast';
import { resetPassword } from '@/lib/superadmin-api';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { success, error } = useToast();

  const carried = (location.state as { phone?: string } | null)?.phone ?? '';

  const [phone, setPhone] = useState(carried);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const next: Record<string, string> = {};
    if (!phone.trim()) next.phone = 'The mobile number the code was sent to is required';
    if (!/^\d{4,10}$/.test(code.trim())) next.code = 'Enter the code from the SMS';
    if (password.length < 8) next.password = 'Password must be at least 8 characters long';
    if (password !== confirmPassword) next.confirm = 'The two passwords do not match';
    setErrors(next);
    if (Object.keys(next).length) return;

    const normalised = phone.replace(/[\s-]/g, '');
    setIsLoading(true);
    try {
      await resetPassword(normalised.startsWith('+') ? normalised : `+${normalised}`, code.trim(), password);
      success('Password changed. Sign in with the new one.');
      navigate('/auth/login');
    } catch (err) {
      error(err instanceof Error ? err.message : 'That reset code is not valid.');
    } finally {
      setIsLoading(false);
    }
  };

  const field = 'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20';
  const label = 'text-[11px] font-bold text-foreground/80';

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-1 text-center">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Set a new password</h1>
        <p className="text-sm text-muted-foreground">Enter the code we sent by SMS and choose a new password.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className={label} htmlFor="reset-phone">Mobile number</label>
          <input id="reset-phone" type="tel" autoComplete="tel" value={phone}
            onChange={(e) => setPhone(e.target.value)} disabled={isLoading}
            placeholder="+8801711000001" className={field} />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
        </div>

        <div className="space-y-1">
          <label className={label} htmlFor="reset-code">Reset code</label>
          <input id="reset-code" inputMode="numeric" autoComplete="one-time-code" value={code}
            onChange={(e) => setCode(e.target.value)} disabled={isLoading}
            placeholder="123456" className={field} />
          {errors.code && <p className="text-xs text-destructive">{errors.code}</p>}
        </div>

        <div className="space-y-1">
          <label className={label} htmlFor="reset-password">New password</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input id="reset-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password"
              value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading}
              className={`${field} pl-9 pr-9`} />
            <button type="button" onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
        </div>

        <div className="space-y-1">
          <label className={label} htmlFor="reset-confirm">Confirm new password</label>
          <input id="reset-confirm" type={showPassword ? 'text' : 'password'} autoComplete="new-password"
            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading} className={field} />
          {errors.confirm && <p className="text-xs text-destructive">{errors.confirm}</p>}
        </div>

        <button type="submit" disabled={isLoading}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/95 disabled:opacity-60">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isLoading ? 'Saving…' : 'Set new password'}
        </button>
      </form>

      <Link to="/auth/login"
        className="flex items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to sign in
      </Link>
    </div>
  );
}
