/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { HealthProfileProvider } from './context/HealthProfileContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfileFormPage from './pages/ProfileFormPage';
import ProfileSummaryPage from './pages/ProfileSummaryPage';
import RecommendationsPage from './pages/RecommendationsPage';

function AppContent() {
  const { currentPage, navigateTo } = useNavigation();
  const { isAuthenticated, loading } = useAuth();

  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      const privatePages = ['profile-form', 'profile-summary', 'recommendations', 'dashboard'];
      if (privatePages.includes(currentPage)) {
        navigateTo('landing');
      }
    }
  }, [isAuthenticated, loading, currentPage, navigateTo]);

  // Strict rendering check to prevent flashes of private screens
  const isPrivatePage = ['profile-form', 'profile-summary', 'recommendations', 'dashboard'].includes(currentPage);
  if (!loading && !isAuthenticated && isPrivatePage) {
    return <LandingPage />;
  }

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
    case 'landing':
    default:
      return <LandingPage />;
  }
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

