import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/components/shared/Toast';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { success } = useToast();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (val: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!val) {
      return 'Email address is required';
    } else if (!emailRegex.test(val)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const eErr = validateEmail(email);
    setEmailError(eErr);

    if (eErr) {
      return;
    }

    setIsLoading(true);

    // Simulate Reset Request API
    setTimeout(() => {
      setIsLoading(false);
      success('Password reset link sent to your email');
      navigate('/auth/login');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-1 text-center">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Forgot Password?</h1>
        <p className="text-sm text-muted-foreground">
          Enter your administrative email, and we will send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-semibold text-foreground/80">
            Email Address
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
              placeholder="admin@agromed.com"
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

        {/* Action Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-60 transition-colors cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
              Sending Link...
            </>
          ) : (
            'Send Reset Link'
          )}
        </button>

        {/* Back link */}
        <div className="text-center pt-2">
          <Link
            to="/auth/login"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:underline transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to login page
          </Link>
        </div>
      </form>
    </div>
  );
}
