import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useToast } from '@/components/shared/Toast';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { success } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');

  const validatePassword = (val: string) => {
    if (!val) {
      return 'Password is required';
    } else if (val.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return '';
  };

  const validateConfirmPassword = (val: string, pass: string) => {
    if (!val) {
      return 'Please confirm your new password';
    } else if (val !== pass) {
      return 'Passwords do not match';
    }
    return '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const pErr = validatePassword(password);
    const cErr = validateConfirmPassword(confirmPassword, password);

    setPasswordError(pErr);
    setConfirmError(cErr);

    if (pErr || cErr) {
      return;
    }

    setIsLoading(true);

    // Simulate Reset API
    setTimeout(() => {
      setIsLoading(false);
      success('Password reset successfully');
      navigate('/auth/login');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-1 text-center">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Reset Password</h1>
        <p className="text-sm text-muted-foreground">Please choose a secure new password for your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* New Password */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-xs font-semibold text-foreground/80">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground/80" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError('');
              }}
              placeholder="••••••••"
              disabled={isLoading}
              className={`w-full pl-10 pr-10 py-2.5 text-sm border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 transition-shadow ${
                passwordError
                  ? 'border-destructive focus:ring-destructive/20 focus:border-destructive'
                  : 'border-border focus:ring-primary/20 focus:border-primary'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
            >
              {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
            </button>
          </div>
          {passwordError && <p className="text-xs font-medium text-destructive">{passwordError}</p>}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="text-xs font-semibold text-foreground/80">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground/80" />
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (confirmError) setConfirmError('');
              }}
              placeholder="••••••••"
              disabled={isLoading}
              className={`w-full pl-10 pr-4 py-2.5 text-sm border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 transition-shadow ${
                confirmError
                  ? 'border-destructive focus:ring-destructive/20 focus:border-destructive'
                  : 'border-border focus:ring-primary/20 focus:border-primary'
              }`}
            />
          </div>
          {confirmError && <p className="text-xs font-medium text-destructive">{confirmError}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-60 transition-colors cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
              Resetting password...
            </>
          ) : (
            'Reset Password'
          )}
        </button>

        {/* Back link */}
        <div className="text-center pt-2">
          <Link
            to="/auth/login"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground hover:underline transition-colors"
          >
            Cancel and return to login
          </Link>
        </div>
      </form>
    </div>
  );
}
