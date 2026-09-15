import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Loader2 } from 'lucide-react';
import { useToast } from '@/components/shared/Toast';
import { useSuperAdminSession } from '@/features/auth/SuperAdminSession';

export default function Login() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const { login } = useSuperAdminSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateEmail = (val: string) => val.trim() ? '' : 'Email address or mobile number is required';

  const validatePassword = (val: string) => {
    if (!val) {
      return 'Password is required';
    } else if (val.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const eErr = validateEmail(email);
    const pErr = validatePassword(password);

    setEmailError(eErr);
    setPasswordError(pErr);

    if (eErr || pErr) {
      error('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
      setIsLoading(false);
      success('Signed in to the SuperAdmin console');
      navigate('/dashboard');
    } catch (err) {
      setIsLoading(false);
      error(err instanceof Error ? err.message : 'Unable to sign in.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-1 text-center">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Sign in to your AgroMedConnect administrative dashboard</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        { }
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-semibold text-foreground/80">
            Email address or mobile number
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground/80" />
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError('');
              }}
              placeholder="superadmin@agromed.com"
              disabled={isLoading}
              className={`w-full pl-10 pr-4 py-2.5 text-sm border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 transition-shadow ${
                emailError
                  ? 'border-destructive focus:ring-destructive/20 focus:border-destructive'
                  : 'border-border focus:ring-primary/20 focus:border-primary'
              }`}
            />
          </div>
          {emailError && <p className="text-xs font-medium text-destructive">{emailError}</p>}
        </div>

        { }
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-xs font-semibold text-foreground/80">
            Password
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

        { }
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-60 transition-colors cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>
    </div>
  );
}
