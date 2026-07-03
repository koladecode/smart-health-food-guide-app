/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { HealthProfileProvider } from './context/HealthProfileContext';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfileFormPage from './pages/ProfileFormPage';
import ProfileSummaryPage from './pages/ProfileSummaryPage';
import RecommendationsPage from './pages/RecommendationsPage';

function AppContent() {
  const { currentPage } = useNavigation();

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

