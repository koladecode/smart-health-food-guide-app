import React, { createContext, useContext, useEffect, useState } from 'react';

export type Page = 'landing' | 'login' | 'register' | 'dashboard' | 'profile-form' | 'profile-summary' | 'recommendations' | 'admin' | 'admin-users' | 'admin-food' | 'admin-exercise' | 'admin-recommendations' | 'admin-diseases';

interface NavigationContextType {
  currentPage: Page;
  navigateTo: (page: Page) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    const hash = window.location.hash;
    if (hash === '#/login') return 'login';
    if (hash === '#/register') return 'register';
    if (hash === '#/dashboard') return 'dashboard';
    if (hash === '#/profile-form') return 'profile-form';
    if (hash === '#/profile-summary') return 'profile-summary';
    if (hash === '#/recommendations') return 'recommendations';
    if (hash === '#/admin' || hash === '#/admin-users') return 'admin';
    if (hash === '#/admin-food') return 'admin-food';
    if (hash === '#/admin-exercise' || hash === '#/admin-exercises') return 'admin-exercise';
    if (hash === '#/admin-recommendations') return 'admin-recommendations';
    if (hash === '#/admin-diseases' || hash === '#/admin-conditions') return 'admin-diseases';
    return 'landing';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#/login') {
        setCurrentPage('login');
      } else if (hash === '#/register') {
        setCurrentPage('register');
      } else if (hash === '#/dashboard') {
        setCurrentPage('dashboard');
      } else if (hash === '#/profile-form') {
        setCurrentPage('profile-form');
      } else if (hash === '#/profile-summary') {
        setCurrentPage('profile-summary');
      } else if (hash === '#/recommendations') {
        setCurrentPage('recommendations');
      } else if (hash === '#/admin' || hash === '#/admin-users') {
        setCurrentPage('admin');
      } else if (hash === '#/admin-food') {
        setCurrentPage('admin-food');
      } else if (hash === '#/admin-exercise' || hash === '#/admin-exercises') {
        setCurrentPage('admin-exercise');
      } else if (hash === '#/admin-recommendations') {
        setCurrentPage('admin-recommendations');
      } else if (hash === '#/admin-diseases' || hash === '#/admin-conditions') {
        setCurrentPage('admin-diseases');
      } else {
        setCurrentPage('landing');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (page: Page) => {
    if (page === 'landing') {
      window.location.hash = '#/';
    } else {
      window.location.hash = `#/${page}`;
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <NavigationContext.Provider value={{ currentPage, navigateTo }} id="navigation-provider-wrapper">
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
