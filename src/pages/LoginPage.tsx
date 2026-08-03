import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, Heart, Lock, Mail, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../context/AuthContext';
import { useHealthProfile } from '../context/HealthProfileContext';
import Button from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { Input } from '../components/Input';
import ThemeToggle from '../components/ThemeToggle';
import Alert from '../components/Alert';

export default function LoginPage() {
  const { navigateTo } = useNavigation();
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const { profile, loadingProfile, recsExist, isProfileSynced } = useHealthProfile();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !authLoading && isProfileSynced) {
      if (profile) {
        if (recsExist === null) {
          return; // Wait for recommendations existence check to complete
        }
        if (recsExist) {
          navigateTo('dashboard');
        } else {
          navigateTo('profile-summary');
        }
      } else {
        navigateTo('profile-form');
      }
    }
  }, [isAuthenticated, authLoading, profile, isProfileSynced, recsExist, navigateTo]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Incorrect email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden" id="login-page-root">
      
      {/* Decorative ambient blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar with Back button and Theme Switcher */}
      <header className="px-4 py-4 md:px-8 flex justify-between items-center z-10" id="login-header">
        <button
          id="login-back-btn"
          onClick={() => navigateTo('landing')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-650 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Landing</span>
        </button>
        <ThemeToggle />
      </header>

      {/* Main card box container */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 z-10" id="login-main">
        <div className="w-full max-w-[440px]" id="login-card-wrapper">
          
          <Card className="shadow-md shadow-slate-100/50 dark:shadow-none bg-white dark:bg-slate-900/80 backdrop-blur-md border border-slate-100 dark:border-slate-800/80 rounded-3xl transition-all duration-300" id="login-form-card">
            <CardContent className="p-6 md:p-8 flex flex-col gap-6">
              
              {/* Logo branding */}
              <div className="flex flex-col items-center text-center gap-4" id="login-branding">
                <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/45 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl text-emerald-600 dark:text-emerald-400 shadow-2xs" id="login-logo-badge">
                  <Heart className="w-7 h-7 fill-emerald-500/10 dark:fill-emerald-400/10" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                    Welcome Back
                  </h1>
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-550 mt-1 leading-normal max-w-[280px]">
                    Sign in to access your custom metabolic & health insights.
                  </p>
                </div>
              </div>

              {/* Status Alert logs */}
              {error && (
                <Alert variant="error" title="Sign In Error" id="login-alert-error" className="rounded-2xl border-rose-100/80 dark:border-rose-950/50 text-sm">
                  {error}
                </Alert>
              )}

              {success && (
                <Alert variant="success" title="Access Granted" id="login-alert-success" className="rounded-2xl border-emerald-100/80 dark:border-emerald-950/50 text-sm">
                  Preparing your personalized recommendations...
                </Alert>
              )}

              {/* Input Forms */}
              <form onSubmit={handleLogin} className="flex flex-col gap-5" id="login-form">
                <Input
                  label="Email Address"
                  type="email"
                  id="login-email-input"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail className="w-4 h-4 text-slate-400" />}
                  required
                  disabled={loading || success}
                />

                <div className="flex flex-col gap-1.5" id="login-password-wrapper">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <a href="#" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                      Forgot Password?
                    </a>
                  </div>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    id="login-password-input"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    icon={<Lock className="w-4 h-4 text-slate-400" />}
                    endIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                    required
                    disabled={loading || success}
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full mt-2 font-bold py-3.5 shadow-md shadow-emerald-500/10 dark:shadow-none rounded-xl"
                  isLoading={loading}
                  id="login-submit-btn"
                >
                  Sign In with Email
                </Button>
              </form>

              {/* Divider */}
              <div className="relative flex py-2 items-center" id="login-divider">
                <div className="flex-grow border-t border-slate-100 dark:border-slate-800/80"></div>
                <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                  Or Connect With
                </span>
                <div className="flex-grow border-t border-slate-100 dark:border-slate-800/80"></div>
              </div>

              {/* Social login option */}
              <Button
                variant="outline"
                size="md"
                className="w-full font-semibold flex items-center justify-center gap-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl"
                onClick={() => {
                  setLoading(true);
                  setTimeout(() => {
                    setLoading(false);
                    navigateTo('dashboard');
                  }, 1200);
                }}
                disabled={loading || success}
                id="login-google-btn"
                icon={
                  <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                }
              >
                Continue with Google
              </Button>

              {/* Subtitle link to Register */}
              <p className="text-center text-sm text-slate-550 dark:text-slate-400 mt-2" id="login-footer-text">
                Don't have an account?{' '}
                <button
                  id="login-link-register"
                  onClick={() => navigateTo('register')}
                  className="font-black text-emerald-600 dark:text-emerald-400 hover:underline hover:text-emerald-700"
                >
                  Create free account
                </button>
              </p>

            </CardContent>
          </Card>

        </div>
      </main>

      {/* Basic Footer disclaimer */}
      <footer className="px-4 py-6 md:px-8 border-t border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400 z-10" id="login-footer">
        <div className="flex items-center gap-1.5 max-w-md text-left" id="login-footer-disclaimer">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>Educational health metrics guide ONLY. Not suitable for diagnoses.</span>
        </div>
        <span>© 2026 Smart Health Guide</span>
      </footer>

    </div>
  );
}
