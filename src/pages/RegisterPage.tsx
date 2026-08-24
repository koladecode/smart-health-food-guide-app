import React, { useState, useEffect } from 'react';
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Heart, Lock, Mail, ShieldCheck, User, Eye, EyeOff } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../context/AuthContext';
import { useHealthProfile } from '../context/HealthProfileContext';
import Button from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { Input, Select } from '../components/Input';
import ThemeToggle from '../components/ThemeToggle';
import Alert from '../components/Alert';
import { validateName, validateEmail } from '../utils/validation';

export default function RegisterPage() {
  const { navigateTo } = useNavigation();
  const { register, isAuthenticated, loading: authLoading } = useAuth();
  const { profile, loadingProfile, recsExist, isProfileSynced } = useHealthProfile();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [goal, setGoal] = useState('general');
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const goalOptions = [
    { value: 'general', label: 'General Health Awareness' },
    { value: 'weight-loss', label: 'Healthy Weight Management' },
    { value: 'heart', label: 'Cardiovascular Support (Low Sodium)' },
    { value: 'diabetic', label: 'Blood Glucose Regulation' },
    { value: 'allergy', label: 'Allergen Avoidance Guidance' },
  ];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setServerError('');

    const errors: { name?: string; email?: string; password?: string; confirmPassword?: string } = {};

    const nameVal = validateName(name);
    if (!nameVal.valid) {
      errors.name = nameVal.message || 'Please provide a valid name.';
    }

    const emailVal = validateEmail(email);
    if (!emailVal.valid) {
      errors.email = emailVal.message || 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Please define a secure password.';
    } else if (password.length < 6) {
      errors.password = 'Password must contain at least 6 characters.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please re-enter your password.';
    } else if (password && confirmPassword && password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setLoading(true);

    try {
      const res = await register(nameVal.trimmed, emailVal.trimmed, password);
      setSuccessMessage(res?.message || 'Registration successful!');
      setSuccess(true);
    } catch (err: any) {
      setServerError(err.message || 'Registration failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden" id="register-page-root">
      
      {/* Decorative ambient blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <header className="px-4 py-4 md:px-8 flex justify-between items-center z-10" id="register-header">
        <button
          id="register-back-btn"
          onClick={() => navigateTo('landing')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-650 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Landing</span>
        </button>
        <ThemeToggle />
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 z-10" id="register-main">
        <div className="w-full max-w-[540px]" id="register-card-wrapper">
          
          <Card className="shadow-md shadow-slate-100/50 dark:shadow-none bg-white dark:bg-slate-900/80 backdrop-blur-md border border-slate-100 dark:border-slate-800/80 rounded-3xl transition-all duration-300" id="register-form-card">
            <CardContent className="p-6 md:p-8 flex flex-col gap-6">
              
              {/* Logo branding */}
              <div className="flex flex-col items-center text-center gap-4" id="register-branding">
                <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/45 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl text-emerald-600 dark:text-emerald-400 shadow-2xs" id="register-logo-badge">
                  <Heart className="w-7 h-7 fill-emerald-500/10 dark:fill-emerald-400/10" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                    Create Health Account
                  </h1>
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-550 mt-1 leading-normal max-w-[340px] mx-auto">
                    Empower your nutrition and wellness lifestyle with scientific, tailored insights.
                  </p>
                </div>
              </div>

              {/* Global Error alert for unexpected server errors or registration failures */}
              {serverError && (
                <Alert variant="error" title="Registration Issue" id="register-alert-error" className="rounded-2xl border-rose-100/80 dark:border-rose-950/50 text-sm">
                  {serverError}
                </Alert>
              )}

              {success ? (
                <div className="flex flex-col items-center text-center gap-6 py-4" id="register-success-state">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-600 dark:text-emerald-400 shadow-2xs" id="register-success-icon">
                    <Mail className="w-10 h-10" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-bold text-slate-950 dark:text-white" id="register-success-title">
                      Registration Successful
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-300 max-w-sm leading-relaxed" id="register-success-message">
                      {successMessage || "Account created successfully. You can now sign in with your credentials."}
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full mt-2 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-500/10 dark:shadow-none"
                    onClick={() => navigateTo('login')}
                    id="register-return-login-btn"
                  >
                    <span>{successMessage.toLowerCase().includes('verify') ? 'Return to Login' : 'Proceed to Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <>
                  {/* Form fields */}
                  <form onSubmit={handleRegister} className="flex flex-col gap-5" id="register-form">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Your Name"
                        id="register-name-input"
                        placeholder="e.g. Alex Smith"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: undefined }));
                        }}
                        error={fieldErrors.name}
                        icon={<User className="w-4 h-4 text-slate-400" />}
                        maxLength={100}
                        required
                        disabled={loading}
                      />
                      <Input
                        label="Email Address"
                        type="email"
                        id="register-email-input"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: undefined }));
                        }}
                        error={fieldErrors.email}
                        icon={<Mail className="w-4 h-4 text-slate-400" />}
                        maxLength={254}
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        id="register-password-input"
                        placeholder="Min 6 characters"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: undefined }));
                        }}
                        error={fieldErrors.password}
                        icon={<Lock className="w-4 h-4 text-slate-400" />}
                        endIcon={
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                            tabIndex={-1}
                            aria-label={showPassword ? "Hide password" : "Show password"}
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
                      <div className="flex flex-col">
                        <Input
                          label="Confirm Password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          id="register-confirm-input"
                          placeholder="Re-enter password"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (fieldErrors.confirmPassword) setFieldErrors(prev => ({ ...prev, confirmPassword: undefined }));
                          }}
                          error={fieldErrors.confirmPassword}
                          icon={<Lock className="w-4 h-4 text-slate-400" />}
                          endIcon={
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                              tabIndex={-1}
                              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
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
                        {confirmPassword.length > 0 && !fieldErrors.confirmPassword && (
                          password === confirmPassword ? (
                            <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1.5 px-0.5" id="register-password-match-indicator">
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                              <span>Passwords match</span>
                            </p>
                          ) : (
                            <p className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 mt-1.5 px-0.5" id="register-password-mismatch-indicator">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>Passwords do not match</span>
                            </p>
                          )
                        )}
                      </div>
                    </div>

                    {/* Primary Health Goal drop-down (Theme-specific reusable select component) */}
                    <Select
                      label="Primary Health Goal Focus"
                      id="register-goal-select"
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      options={goalOptions}
                      disabled={loading}
                    />

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full mt-2 font-bold py-3.5 shadow-md shadow-emerald-500/10 dark:shadow-none rounded-xl flex items-center justify-center gap-2"
                      isLoading={loading}
                      id="register-submit-btn"
                    >
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </form>

                  {/* Redirect footer link */}
                  <p className="text-center text-sm text-slate-550 dark:text-slate-400 mt-1" id="register-footer-text">
                    Already registered?{' '}
                    <button
                      id="register-link-login"
                      onClick={() => navigateTo('login')}
                      className="font-black text-emerald-600 dark:text-emerald-400 hover:underline hover:text-emerald-700"
                    >
                      Sign in here
                    </button>
                  </p>
                </>
              )}

            </CardContent>
          </Card>

        </div>
      </main>

      {/* Footer bar */}
      <footer className="px-4 py-6 md:px-8 border-t border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400 z-10" id="register-footer">
        <div className="flex items-center gap-1.5 max-w-md text-left" id="register-footer-disclaimer">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>Certified biological data encryption frameworks. GDPR compliant.</span>
        </div>
        <span>© 2026 Smart Health Guide</span>
      </footer>

    </div>
  );
}
