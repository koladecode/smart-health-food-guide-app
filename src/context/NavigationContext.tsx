import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

export type Page = 'landing' | 'login' | 'register' | 'forgot-password' | 'reset-password' | 'dashboard' | 'profile-form' | 'profile-summary' | 'recommendations' | 'admin' | 'admin-users' | 'admin-food' | 'admin-exercise' | 'admin-recommendations' | 'admin-diseases';

interface NavigationContextType {
  currentPage: Page;
  navigateTo: (page: Page) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

function getPageFromLocation(): Page {
  const hash = window.location.hash || '';
  const path = window.location.pathname || '';
  const search = window.location.search || '';

  if (hash.startsWith('#/forgot-password') || path === '/forgot-password') return 'forgot-password';
  if (
    hash.startsWith('#/reset-password') ||
    path === '/reset-password' ||
    hash.includes('type=recovery') ||
    search.includes('type=recovery') ||
    hash.includes('access_token=') ||
    search.includes('code=')
  ) {
    return 'reset-password';
  }
  if (hash === '#/login' || path === '/login') return 'login';
  if (hash === '#/register' || path === '/register') return 'register';
  if (hash === '#/dashboard' || path === '/dashboard') return 'dashboard';
  if (hash === '#/profile-form' || path === '/profile-form') return 'profile-form';
  if (hash === '#/profile-summary' || path === '/profile-summary') return 'profile-summary';
  if (hash === '#/recommendations' || path === '/recommendations') return 'recommendations';
  if (hash === '#/admin' || hash === '#/admin-users' || path === '/admin') return 'admin';
  if (hash === '#/admin-food' || path === '/admin-food') return 'admin-food';
  if (hash === '#/admin-exercise' || hash === '#/admin-exercises' || path === '/admin-exercise') return 'admin-exercise';
  if (hash === '#/admin-recommendations' || path === '/admin-recommendations') return 'admin-recommendations';
  if (hash === '#/admin-diseases' || hash === '#/admin-conditions' || path === '/admin-diseases') return 'admin-diseases';
  return 'landing';
}

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [currentPage, setCurrentPage] = useState<Page>(() => getPageFromLocation());

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPage(getPageFromLocation());
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  const navigateTo = useCallback((page: Page) => {
    if (page === 'landing') {
      window.location.hash = '#/';
    } else {
      window.location.hash = `#/${page}`;
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const value = useMemo(() => ({ currentPage, navigateTo }), [currentPage, navigateTo]);

  return (
    <NavigationContext.Provider value={value} id="navigation-provider-wrapper">
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
