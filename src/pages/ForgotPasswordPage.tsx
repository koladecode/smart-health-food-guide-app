import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Heart, Mail, ShieldCheck } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { Input } from '../components/Input';
import ThemeToggle from '../components/ThemeToggle';
import Alert from '../components/Alert';

export default function ForgotPasswordPage() {
  const { navigateTo } = useNavigation();
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setSuccess(false);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);

    try {
      const res = await requestPasswordReset(cleanEmail);
      setSuccess(true);
      setSuccessMessage(
        res.message ||
          `If an account exists with ${cleanEmail}, a password reset link has been sent to your inbox.`
      );
    } catch (err: any) {
      // Even on error, show user-friendly message
      setError(err.message || 'Failed to request password reset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-between bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden"
      id="forgot-password-page-root"
    >
      {/* Decorative ambient blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar with Back button and Theme Switcher */}
      <header
        className="px-4 py-4 md:px-8 flex justify-between items-center z-10"
        id="forgot-password-header"
      >
        <button
          id="forgot-password-back-btn"
          onClick={() => navigateTo('login')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-650 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </button>
        <ThemeToggle />
      </header>

      {/* Main card box container */}
      <main
        className="flex-1 flex items-center justify-center px-4 py-12 z-10"
        id="forgot-password-main"
      >
        <div className="w-full max-w-[440px]" id="forgot-password-card-wrapper">
          <Card
            className="shadow-md shadow-slate-100/50 dark:shadow-none bg-white dark:bg-slate-900/80 backdrop-blur-md border border-slate-100 dark:border-slate-800/80 rounded-3xl transition-all duration-300"
            id="forgot-password-card"
          >
            <CardContent className="p-6 md:p-8 flex flex-col gap-6">
              {/* Logo branding */}
              <div
                className="flex flex-col items-center text-center gap-4"
                id="forgot-password-branding"
              >
                <div
                  className="p-4 bg-emerald-50/80 dark:bg-emerald-950/45 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl text-emerald-600 dark:text-emerald-400 shadow-2xs"
                  id="forgot-password-badge"
                >
                  <Heart className="w-7 h-7 fill-emerald-500/10 dark:fill-emerald-400/10" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                    Reset Password
                  </h1>
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-550 mt-1 leading-normal max-w-[290px]">
                    Enter your registered email address and we'll send you a recovery link to reset your password.
                  </p>
                </div>
              </div>

              {/* Status Alerts */}
              {error && (
                <Alert
                  variant="error"
                  title="Request Error"
                  id="forgot-password-alert-error"
                  className="rounded-2xl border-rose-100/80 dark:border-rose-950/50 text-sm"
                >
                  {error}
                </Alert>
              )}

              {success ? (
                <div className="flex flex-col gap-4 text-center py-2" id="forgot-password-success-view">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-start gap-3 text-left">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                        Check Your Email
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {successMessage}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Didn't receive the email? Check your spam folder or try requesting again in a few minutes.
                  </p>

                  <div className="flex flex-col gap-2.5 mt-2">
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full font-bold py-3 shadow-md rounded-xl"
                      onClick={() => navigateTo('login')}
                      id="forgot-password-return-login-btn"
                    >
                      Return to Sign In
                    </Button>
                    <Button
                      variant="ghost"
                      size="md"
                      className="w-full font-semibold rounded-xl"
                      onClick={() => {
                        setSuccess(false);
                        setEmail('');
                      }}
                      id="forgot-password-retry-btn"
                    >
                      Request with another email
                    </Button>
                  </div>
                </div>
              ) : (
                /* Form */
                <form onSubmit={handleSubmit} className="flex flex-col gap-5" id="forgot-password-form">
                  <Input
                    label="Registered Email Address"
                    type="email"
                    id="forgot-password-email-input"
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    icon={<Mail className="w-4 h-4 text-slate-400" />}
                    required
                    disabled={loading}
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full mt-2 font-bold py-3.5 shadow-md shadow-emerald-500/10 dark:shadow-none rounded-xl"
                    isLoading={loading}
                    id="forgot-password-submit-btn"
                  >
                    Send Password Reset Link
                  </Button>
                </form>
              )}

              {/* Subtitle link back to Login */}
              {!success && (
                <p className="text-center text-sm text-slate-550 dark:text-slate-400 mt-2" id="forgot-password-footer-link">
                  Remember your password?{' '}
                  <button
                    id="forgot-password-link-login"
                    onClick={() => navigateTo('login')}
                    className="font-black text-emerald-600 dark:text-emerald-400 hover:underline hover:text-emerald-700 cursor-pointer"
                  >
                    Sign In
                  </button>
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer disclaimer */}
      <footer
        className="px-4 py-6 md:px-8 border-t border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400 z-10"
        id="forgot-password-footer"
      >
        <div className="flex items-center gap-1.5 max-w-md text-left" id="forgot-password-footer-disclaimer">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>Educational health metrics guide ONLY. Not suitable for diagnoses.</span>
        </div>
        <span>© 2026 Smart Health Guide</span>
      </footer>
    </div>
  );
}
