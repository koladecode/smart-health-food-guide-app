/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { lazy, Suspense } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { HealthProfileProvider } from './context/HealthProfileContext';
import { AuthProvider, useAuth } from './context/AuthContext';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProfileFormPage = lazy(() => import('./pages/ProfileFormPage'));
const ProfileSummaryPage = lazy(() => import('./pages/ProfileSummaryPage'));
const RecommendationsPage = lazy(() => import('./pages/RecommendationsPage'));
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage'));
const AdminFoodPage = lazy(() => import('./pages/AdminFoodPage'));
const AdminExercisePage = lazy(() => import('./pages/AdminExercisePage'));
const AdminRecommendationsPage = lazy(() => import('./pages/AdminRecommendationsPage'));
const AdminDiseasesPage = lazy(() => import('./pages/AdminDiseasesPage'));

function PageLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md space-y-4 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/2 mx-auto"></div>
        <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
        <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-lg w-3/4 mx-auto"></div>
      </div>
    </div>
  );
}

function Forbidden403Page() {
  const { navigateTo } = useNavigation();
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center" id="forbidden-403-page-root">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl flex flex-col items-center gap-5 text-center">
        <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200/60 dark:border-rose-900/50 rounded-2xl text-rose-600 dark:text-rose-400">
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-3xs font-extrabold uppercase tracking-widest text-rose-600 dark:text-rose-400">HTTP 403 Forbidden</span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Access Denied</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            You do not have administrative privileges to access this page.
          </p>
        </div>
        <button
          onClick={() => navigateTo('dashboard')}
          id="forbidden-403-return-btn"
          className="w-full mt-2 font-bold py-3 px-4 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white transition-colors text-sm"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}

function AppContent() {
  const { currentPage, navigateTo } = useNavigation();
  const { isAuthenticated, user, loading } = useAuth();

  const adminPages = ['admin', 'admin-users', 'admin-food', 'admin-exercise', 'admin-recommendations', 'admin-diseases'];

  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      const privatePages = ['profile-form', 'profile-summary', 'recommendations', 'dashboard', ...adminPages];
      if (privatePages.includes(currentPage)) {
        navigateTo('landing');
      }
    }
  }, [isAuthenticated, loading, currentPage, navigateTo]);

  // Strict rendering check to prevent flashes of private screens
  const isPrivatePage = ['profile-form', 'profile-summary', 'recommendations', 'dashboard', ...adminPages].includes(currentPage);
  if (!loading && !isAuthenticated && isPrivatePage) {
    return (
      <Suspense fallback={<PageLoadingSkeleton />}>
        <LandingPage />
      </Suspense>
    );
  }

  // HTTP 403 Access Denied check for non-admin users attempting to view admin pages
  if (!loading && isAuthenticated && user?.role !== 'admin' && adminPages.includes(currentPage)) {
    return <Forbidden403Page />;
  }

  return (
    <Suspense fallback={<PageLoadingSkeleton />}>
      {(() => {
        switch (currentPage) {
          case 'login':
            return <LoginPage />;
          case 'register':
            return <RegisterPage />;
          case 'forgot-password':
            return <ForgotPasswordPage />;
          case 'reset-password':
            return <ResetPasswordPage />;
          case 'profile-form':
            return <ProfileFormPage />;
          case 'profile-summary':
            return <ProfileSummaryPage />;
          case 'recommendations':
            return <RecommendationsPage />;
          case 'dashboard':
            return <DashboardPage />;
          case 'admin':
          case 'admin-users':
            return <AdminUsersPage />;
          case 'admin-food':
            return <AdminFoodPage />;
          case 'admin-exercise':
            return <AdminExercisePage />;
          case 'admin-recommendations':
            return <AdminRecommendationsPage />;
          case 'admin-diseases':
            return <AdminDiseasesPage />;
          case 'landing':
          default:
            return <LandingPage />;
        }
      })()}
    </Suspense>
  );
}

import { InstallPWA } from './components/InstallPWA';

export default function App() {
  return (
    <ThemeProvider>
      <NavigationProvider>
        <AuthProvider>
          <HealthProfileProvider>
            <AppContent />
            <InstallPWA />
          </HealthProfileProvider>
        </AuthProvider>
      </NavigationProvider>
    </ThemeProvider>
  );
}

