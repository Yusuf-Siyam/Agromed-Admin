import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Phone } from 'lucide-react';
import { useToast } from '@/components/shared/Toast';
import { forgotPassword } from '@/lib/superadmin-api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  const validatePhone = (val: string) => {
    if (!val.trim()) return 'Phone number is required';
    if (!/^\+?[1-9]\d{7,14}$/.test(val.replace(/[\s-]/g, ''))) {
      return 'Enter the number in international format, for example +8801711000001';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validatePhone(phone);
    setPhoneError(err);
    if (err) return;

    const normalised = phone.replace(/[\s-]/g, '');
    setIsLoading(true);
    try {
      await forgotPassword(normalised.startsWith('+') ? normalised : `+${normalised}`);

      success('If that number is registered, a reset code has been sent to it.');
      navigate('/auth/reset-password', { state: { phone: normalised } });
    } catch {
      error('Could not send a reset code just now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-1 text-center">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Forgot Password?</h1>
        <p className="text-sm text-muted-foreground">
          Enter the mobile number on your administrator account and we will send a reset code by SMS.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-foreground/80" htmlFor="recovery-phone">
            Mobile number
          </label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="recovery-phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isLoading}
              placeholder="+8801711000001"
              className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          {phoneError && <p className="text-xs text-destructive">{phoneError}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/95 disabled:opacity-60"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isLoading ? 'Sending…' : 'Send reset code'}
        </button>
      </form>

      <Link
        to="/auth/login"
        className="flex items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to sign in
      </Link>
    </div>
  );
}
