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

  // 1. Explicit hash navigation takes top priority when present
  if (hash.startsWith('#/login')) return 'login';
  if (hash.startsWith('#/register')) return 'register';
  if (hash.startsWith('#/forgot-password')) return 'forgot-password';
  if (hash.startsWith('#/reset-password')) return 'reset-password';
  if (hash.startsWith('#/dashboard')) return 'dashboard';
  if (hash.startsWith('#/profile-form')) return 'profile-form';
  if (hash.startsWith('#/profile-summary')) return 'profile-summary';
  if (hash.startsWith('#/recommendations')) return 'recommendations';
  if (hash.startsWith('#/admin-users') || hash === '#/admin') return 'admin';
  if (hash.startsWith('#/admin-food')) return 'admin-food';
  if (hash.startsWith('#/admin-exercise') || hash.startsWith('#/admin-exercises')) return 'admin-exercise';
  if (hash.startsWith('#/admin-recommendations')) return 'admin-recommendations';
  if (hash.startsWith('#/admin-diseases') || hash.startsWith('#/admin-conditions')) return 'admin-diseases';
  if (hash === '#/' || hash === '#') return 'landing';

  // 2. Password recovery path or tokens in query/hash
  if (
    path === '/reset-password' ||
    path.startsWith('/reset-password') ||
    hash.includes('type=recovery') ||
    search.includes('type=recovery') ||
    hash.includes('access_token=') ||
    search.includes('code=')
  ) {
    return 'reset-password';
  }

  // 3. Pathname based navigation
  if (path === '/forgot-password' || path.startsWith('/forgot-password')) return 'forgot-password';
  if (path === '/login' || path.startsWith('/login')) return 'login';
  if (path === '/register' || path.startsWith('/register')) return 'register';
  if (path === '/dashboard' || path.startsWith('/dashboard')) return 'dashboard';
  if (path === '/profile-form' || path.startsWith('/profile-form')) return 'profile-form';
  if (path === '/profile-summary' || path.startsWith('/profile-summary')) return 'profile-summary';
  if (path === '/recommendations' || path.startsWith('/recommendations')) return 'recommendations';
  if (path === '/admin') return 'admin';
  if (path === '/admin-food') return 'admin-food';
  if (path === '/admin-exercise') return 'admin-exercise';
  if (path === '/admin-recommendations') return 'admin-recommendations';
  if (path === '/admin-diseases') return 'admin-diseases';
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
    const targetHash = page === 'landing' ? '#/' : `#/${page}`;
    // Reset pathname to root if currently on a sub-path like /reset-password
    if (window.location.pathname !== '/' && window.location.pathname !== '') {
      window.history.pushState(null, '', `/${targetHash}`);
    } else {
      window.location.hash = targetHash;
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
