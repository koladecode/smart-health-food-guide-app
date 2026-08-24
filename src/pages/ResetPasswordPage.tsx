import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, Lock, Eye, EyeOff, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { Input } from '../components/Input';
import ThemeToggle from '../components/ThemeToggle';
import Alert from '../components/Alert';

/**
 * Robust utility to parse authorization and recovery parameters from URL hash & search
 */
function parseUrlRecoveryParams() {
  const hash = window.location.hash || '';
  const search = window.location.search || '';
  const params = new URLSearchParams();

  const parseString = (raw: string) => {
    if (!raw) return;
    const clean = raw.replace(/^[#?]/, '').replace(/^#\//, '').replace(/^\//, '');
    clean.split('&').forEach((part) => {
      const idx = part.indexOf('=');
      if (idx !== -1) {
        const key = decodeURIComponent(part.substring(0, idx));
        const val = decodeURIComponent(part.substring(idx + 1));
        params.set(key, val);
      }
    });
  };

  parseString(search);
  if (hash) {
    hash.split(/#|\?/).forEach((part) => parseString(part));
  }

  return {
    accessToken: params.get('access_token'),
    refreshToken: params.get('refresh_token'),
    code: params.get('code'),
    type: params.get('type'),
    error: params.get('error'),
    errorCode: params.get('error_code'),
    errorDescription: params.get('error_description'),
  };
}

export default function ResetPasswordPage() {
  const { navigateTo } = useNavigation();
  const { resetPassword } = useAuth();

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [hasValidSession, setHasValidSession] = useState<boolean>(false);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Parse recovery tokens on mount
  useEffect(() => {
    const parsed = parseUrlRecoveryParams();

    if (parsed.error || parsed.errorCode || parsed.errorDescription) {
      const desc = parsed.errorDescription
        ? parsed.errorDescription.replace(/\+/g, ' ')
        : 'The password recovery link is invalid or has expired.';
      setUrlError(desc);
      setHasValidSession(false);
      return;
    }

    if (parsed.accessToken || parsed.code || parsed.refreshToken) {
      setAccessToken(parsed.accessToken);
      setRefreshToken(parsed.refreshToken);
      setCode(parsed.code);
      setHasValidSession(true);
      setUrlError(null);
    } else {
      setUrlError('No active password recovery session found. Please request a new password reset link.');
      setHasValidSession(false);
    }
  }, []);

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');

    if (!password) {
      setError('Please enter a new password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please ensure both fields match exactly.');
      return;
    }

    if (!accessToken && !code && !refreshToken) {
      setError('Missing recovery session credentials. Please request a new password reset link.');
      return;
    }

    setLoading(true);

    try {
      await resetPassword({
        accessToken: accessToken || undefined,
        code: code || undefined,
        refreshToken: refreshToken || undefined,
        password,
      });

      setSuccess(true);
      
      // Clear sensitive form state
      setPassword('');
      setConfirmPassword('');

      // Automatically navigate to login after brief delay
      setTimeout(() => {
        navigateTo('login');
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Failed to update password. Please try requesting a new password reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-between bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden"
      id="reset-password-page-root"
    >
      {/* Decorative ambient blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <header
        className="px-4 py-4 md:px-8 flex justify-between items-center z-10"
        id="reset-password-header"
      >
        <button
          id="reset-password-back-btn"
          onClick={() => navigateTo('login')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-650 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </button>
        <ThemeToggle />
      </header>

      {/* Main Container */}
      <main
        className="flex-1 flex items-center justify-center px-4 py-12 z-10"
        id="reset-password-main"
      >
        <div className="w-full max-w-[440px]" id="reset-password-card-wrapper">
          <Card
            className="shadow-md shadow-slate-100/50 dark:shadow-none bg-white dark:bg-slate-900/80 backdrop-blur-md border border-slate-100 dark:border-slate-800/80 rounded-3xl transition-all duration-300"
            id="reset-password-card"
          >
            <CardContent className="p-6 md:p-8 flex flex-col gap-6">
              {/* Logo branding */}
              <div
                className="flex flex-col items-center text-center gap-4"
                id="reset-password-branding"
              >
                <div
                  className="p-4 bg-emerald-50/80 dark:bg-emerald-950/45 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl text-emerald-600 dark:text-emerald-400 shadow-2xs"
                  id="reset-password-badge"
                >
                  <Lock className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                    Set New Password
                  </h1>
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-550 mt-1 leading-normal max-w-[290px]">
                    Choose a strong, secure password to access your metabolic health profile.
                  </p>
                </div>
              </div>

              {/* Status Alerts */}
              {error && (
                <Alert
                  variant="error"
                  title="Password Reset Error"
                  id="reset-password-alert-error"
                  className="rounded-2xl border-rose-100/80 dark:border-rose-950/50 text-sm"
                >
                  {error}
                </Alert>
              )}

              {/* Success View */}
              {success ? (
                <div className="flex flex-col gap-5 text-center py-2" id="reset-password-success-view">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-left">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                        Password Updated!
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        Your password has been reset successfully. Redirecting you to login...
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full font-bold py-3.5 shadow-md rounded-xl"
                    onClick={() => navigateTo('login')}
                    id="reset-password-go-login-btn"
                  >
                    Proceed to Sign In
                  </Button>
                </div>
              ) : !hasValidSession ? (
                /* Invalid / Expired Link View */
                <div className="flex flex-col gap-5 text-center py-2" id="reset-password-invalid-view">
                  <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-start gap-3 text-left">
                    <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-rose-800 dark:text-rose-300">
                        Invalid or Expired Link
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {urlError || 'This password reset link is invalid or has expired.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full font-bold py-3 shadow-md rounded-xl"
                      onClick={() => navigateTo('forgot-password')}
                      id="reset-password-request-new-btn"
                      icon={<RefreshCw className="w-4 h-4 mr-1" />}
                    >
                      Request New Reset Link
                    </Button>
                    <Button
                      variant="ghost"
                      size="md"
                      className="w-full font-semibold rounded-xl"
                      onClick={() => navigateTo('login')}
                      id="reset-password-return-login-link"
                    >
                      Return to Sign In
                    </Button>
                  </div>
                </div>
              ) : (
                /* Password Reset Form */
                <form onSubmit={handleResetSubmit} className="flex flex-col gap-5" id="reset-password-form">
                  <div className="flex flex-col gap-1.5" id="new-password-wrapper">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      New Password
                    </label>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      id="reset-new-password-input"
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      icon={<Lock className="w-4 h-4 text-slate-400" />}
                      endIcon={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      }
                      autoCapitalize="none"
                      autoComplete="new-password"
                      autoCorrect="off"
                      spellCheck={false}
                      maxLength={128}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5" id="confirm-password-wrapper">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Confirm New Password
                    </label>
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="reset-confirm-password-input"
                      placeholder="Repeat new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      icon={<Lock className="w-4 h-4 text-slate-400" />}
                      endIcon={
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      }
                      autoCapitalize="none"
                      autoComplete="new-password"
                      autoCorrect="off"
                      spellCheck={false}
                      maxLength={128}
                      required
                      disabled={loading}
                    />
                  </div>

                  {/* Password requirements indicators */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl flex flex-col gap-1 text-2xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          password.length >= 6 ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                      />
                      <span className={password.length >= 6 ? 'text-emerald-700 dark:text-emerald-400 font-bold' : ''}>
                        At least 6 characters
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          confirmPassword && password === confirmPassword
                            ? 'bg-emerald-500'
                            : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                      />
                      <span
                        className={
                          confirmPassword && password === confirmPassword
                            ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                            : ''
                        }
                      >
                        Passwords match
                      </span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full mt-1 font-bold py-3.5 shadow-md shadow-emerald-500/10 dark:shadow-none rounded-xl"
                    isLoading={loading}
                    id="reset-password-submit-btn"
                  >
                    Update Password
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer disclaimer */}
      <footer
        className="px-4 py-6 md:px-8 border-t border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400 z-10"
        id="reset-password-footer"
      >
        <div className="flex items-center gap-1.5 max-w-md text-left" id="reset-password-footer-disclaimer">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>Educational health metrics guide ONLY. Not suitable for diagnoses.</span>
        </div>
        <span>© 2026 Smart Health Guide</span>
      </footer>
    </div>
  );
}
