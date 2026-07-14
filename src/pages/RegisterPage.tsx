import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Heart, Lock, Mail, ShieldCheck, User } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../context/AuthContext';
import { useHealthProfile } from '../context/HealthProfileContext';
import Button from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { Input, Select } from '../components/Input';
import ThemeToggle from '../components/ThemeToggle';
import Alert from '../components/Alert';

export default function RegisterPage() {
  const { navigateTo } = useNavigation();
  const { register, isAuthenticated, loading: authLoading } = useAuth();
  const { profile, loadingProfile } = useHealthProfile();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [goal, setGoal] = useState('general');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !authLoading && !loadingProfile) {
      if (profile) {
        navigateTo('dashboard');
      } else {
        navigateTo('profile-form');
      }
    }
  }, [isAuthenticated, authLoading, profile, loadingProfile, navigateTo]);

  const goalOptions = [
    { value: 'general', label: 'General Health Awareness' },
    { value: 'weight-loss', label: 'Healthy Weight Management' },
    { value: 'heart', label: 'Cardiovascular Support (Low Sodium)' },
    { value: 'diabetic', label: 'Blood Glucose Regulation' },
    { value: 'allergy', label: 'Allergen Avoidance Guidance' },
  ];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name) {
      setError('Please tell us your name.');
      return;
    }
    if (!email) {
      setError('Please enter your email.');
      return;
    }
    if (!password) {
      setError('Please define a secure password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await register(email, password);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300" id="register-page-root">
      
      {/* Header bar */}
      <header className="px-4 py-4 md:px-8 flex justify-between items-center" id="register-header">
        <button
          id="register-back-btn"
          onClick={() => navigateTo('landing')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Landing</span>
        </button>
        <ThemeToggle />
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8" id="register-main">
        <div className="w-full max-w-lg" id="register-card-wrapper">
          
          <Card className="shadow-xl shadow-slate-100 dark:shadow-none bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl" id="register-form-card">
            <CardContent className="p-8 md:p-10 flex flex-col gap-6">
              
              {/* Logo branding */}
              <div className="flex flex-col items-center text-center gap-2" id="register-branding">
                <div className="p-2.5 bg-emerald-600 rounded-2xl text-white shadow-md shadow-emerald-600/10" id="register-logo-badge">
                  <Heart className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                    Create Health Account
                  </h1>
                  <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Empower your nutrition and wellness lifestyle with scientific insights.
                  </p>
                </div>
              </div>

              {/* Error/Success alerts */}
              {error && (
                <Alert variant="error" title="Registration Issue" id="register-alert-error">
                  {error}
                </Alert>
              )}

              {success && (
                <Alert variant="success" title="Account Provisioned" id="register-alert-success">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span>Launching personalized wellness dashboard...</span>
                  </div>
                </Alert>
              )}

              {/* Form fields */}
              <form onSubmit={handleRegister} className="flex flex-col gap-4" id="register-form">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Your Name"
                    id="register-name-input"
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    icon={<User className="w-4 h-4" />}
                    required
                    disabled={loading || success}
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    id="register-email-input"
                    placeholder="jane@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    icon={<Mail className="w-4 h-4" />}
                    required
                    disabled={loading || success}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Password"
                    type="password"
                    id="register-password-input"
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    icon={<Lock className="w-4 h-4" />}
                    required
                    disabled={loading || success}
                  />
                  <Input
                    label="Confirm Password"
                    type="password"
                    id="register-confirm-input"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    icon={<Lock className="w-4 h-4" />}
                    required
                    disabled={loading || success}
                  />
                </div>

                {/* Primary Health Goal drop-down (Theme-specific reusable select component) */}
                <Select
                  label="Primary Health Goal Focus"
                  id="register-goal-select"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  options={goalOptions}
                  disabled={loading || success}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full mt-2"
                  isLoading={loading}
                  id="register-submit-btn"
                >
                  Create Account <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </form>

              {/* Redirect footer link */}
              <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-1" id="register-footer-text">
                Already registered?{' '}
                <button
                  id="register-link-login"
                  onClick={() => navigateTo('login')}
                  className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline hover:text-emerald-700"
                >
                  Sign in here
                </button>
              </p>

            </CardContent>
          </Card>

        </div>
      </main>

      {/* Footer bar */}
      <footer className="px-4 py-6 md:px-8 border-t border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400" id="register-footer">
        <div className="flex items-center gap-1.5 max-w-md text-left" id="register-footer-disclaimer">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>Certified biological data encryption frameworks. GDPR compliant.</span>
        </div>
        <span>© 2026 Smart Health Guide</span>
      </footer>

    </div>
  );
}
