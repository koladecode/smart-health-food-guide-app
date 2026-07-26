import React from 'react';
import { Heart, LogOut, ArrowLeft } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import AdminFoodManagement from '../components/AdminFoodManagement';
import Button from '../components/Button';

export default function AdminFoodPage() {
  const { navigateTo } = useNavigation();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 flex flex-col" id="admin-food-page-root">
      {/* Page Navigation Topbar */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-6 py-4 flex items-center justify-between transition-all duration-300" id="admin-food-page-header">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigateTo('dashboard')}
            id="admin-food-back-to-dashboard-btn"
          >
            Dashboard
          </Button>

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigateTo('landing')}>
            <div className="p-1.5 bg-emerald-600 rounded-lg text-white">
              <Heart className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent hidden sm:inline">
              Smart Health Guide
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user && (
            <button
              onClick={logout}
              className="p-2 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
              id="admin-food-header-logout-btn"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8" id="admin-food-page-main">
        <AdminFoodManagement />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 py-6 px-6 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
        <p>© 2026 Smart Health Guide System Administration. All privileges reserved.</p>
      </footer>
    </div>
  );
}
