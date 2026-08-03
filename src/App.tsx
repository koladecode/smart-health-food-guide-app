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

function AppContent() {
  const { currentPage, navigateTo } = useNavigation();
  const { isAuthenticated, user, loading } = useAuth();

  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      const privatePages = ['profile-form', 'profile-summary', 'recommendations', 'dashboard', 'admin', 'admin-users', 'admin-food', 'admin-exercise', 'admin-recommendations', 'admin-diseases'];
      if (privatePages.includes(currentPage)) {
        navigateTo('landing');
      }
    } else if (!loading && isAuthenticated && user?.role !== 'admin') {
      const adminPages = ['admin', 'admin-users', 'admin-food', 'admin-exercise', 'admin-recommendations', 'admin-diseases'];
      if (adminPages.includes(currentPage)) {
        navigateTo('dashboard');
      }
    }
  }, [isAuthenticated, user?.role, loading, currentPage, navigateTo]);

  // Strict rendering check to prevent flashes of private screens
  const isPrivatePage = ['profile-form', 'profile-summary', 'recommendations', 'dashboard', 'admin', 'admin-users', 'admin-food', 'admin-exercise', 'admin-recommendations', 'admin-diseases'].includes(currentPage);
  if (!loading && !isAuthenticated && isPrivatePage) {
    return (
      <Suspense fallback={<PageLoadingSkeleton />}>
        <LandingPage />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<PageLoadingSkeleton />}>
      {(() => {
        switch (currentPage) {
          case 'login':
            return <LoginPage />;
          case 'register':
            return <RegisterPage />;
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

export default function App() {
  return (
    <ThemeProvider>
      <NavigationProvider>
        <AuthProvider>
          <HealthProfileProvider>
            <AppContent />
          </HealthProfileProvider>
        </AuthProvider>
      </NavigationProvider>
    </ThemeProvider>
  );
}

