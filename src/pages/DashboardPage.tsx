import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Apple,
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  TrendingDown,
  History,
  User,
  X,
  Droplet,
  Flame,
  Dumbbell,
  Utensils,
  Plus,
  Minus
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { useHealthProfile } from '../context/HealthProfileContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/Card';
import Alert from '../components/Alert';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import { Input, Select, Textarea } from '../components/Input';
import ThemeToggle from '../components/ThemeToggle';

type ActiveTab = 'overview' | 'nutrition' | 'fitness' | 'medications';

interface HistoryEntry {
  date: string;
  waterIntake: number;
  waterTarget: number;
  exerciseProgress: number;
  exerciseTarget: number;
  mealsCompleted: number;
  mealsTarget: number;
  wellnessScore: number;
}

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getPrepopulatedHistory = (): HistoryEntry[] => {
  const history = [];
  const today = new Date();
  
  // We'll pre-populate 6 preceding days (day -6 to day -1)
  for (let i = 6; i >= 1; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    
    // Vary progress realistically to show nice trends
    let water, exercise, meals;
    if (i === 6) { water = 1800; exercise = 15; meals = 2; }
    else if (i === 5) { water = 1500; exercise = 20; meals = 1; }
    else if (i === 4) { water = 2500; exercise = 45; meals = 3; }
    else if (i === 3) { water = 2000; exercise = 10; meals = 2; }
    else if (i === 2) { water = 2250; exercise = 30; meals = 3; }
    else { water = 2600; exercise = 40; meals = 2; } // yesterday

    const wT = 2500;
    const eT = 30;
    const mT = 3;

    const wPct = Math.min(100, Math.round((water / wT) * 100));
    const ePct = Math.min(100, Math.round((exercise / eT) * 100));
    const mPct = Math.min(100, Math.round((meals / mT) * 100));
    const score = Math.round((wPct * 0.3) + (ePct * 0.4) + (mPct * 0.3));

    history.push({
      date: dateStr,
      waterIntake: water,
      waterTarget: wT,
      exerciseProgress: exercise,
      exerciseTarget: eT,
      mealsCompleted: meals,
      mealsTarget: mT,
      wellnessScore: score
    });
  }
  return history;
};

const formatHistoryDate = (dateStr: string) => {
  const todayStr = getTodayDateString();
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
  
  if (dateStr === todayStr) {
    return 'Today';
  }
  if (dateStr === yesterdayStr) {
    return 'Yesterday';
  }
  
  try {
    const parts = dateStr.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
  } catch (e) {
    return dateStr;
  }
};

export default function DashboardPage() {
  const { navigateTo } = useNavigation();
  const { profile, loadingProfile, isProfileFetched, isProfileSynced } = useHealthProfile();
  const { user, logout, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New workout modal state inputs
  const [workoutName, setWorkoutName] = useState('');
  const [workoutDuration, setWorkoutDuration] = useState('30');
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [isSavingWorkout, setIsSavingWorkout] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Allergen warning interaction states
  const [selectedAllergen, setSelectedAllergen] = useState('none');
  const [hasAllergyAlert, setHasAllergyAlert] = useState(false);

  // Daily Tracking States
  const WATER_KEY = 'health_tracker_water';
  const WATER_TARGET_KEY = 'health_tracker_water_target';
  const EXERCISE_KEY = 'health_tracker_exercise';
  const EXERCISE_TARGET_KEY = 'health_tracker_exercise_target';
  const MEAL_BREAKFAST_KEY = 'health_tracker_meal_breakfast';
  const MEAL_LUNCH_KEY = 'health_tracker_meal_lunch';
  const MEAL_DINNER_KEY = 'health_tracker_meal_dinner';

  const [waterIntake, setWaterIntake] = useState(() => {
    const saved = localStorage.getItem(WATER_KEY);
    return saved ? parseInt(saved, 10) : 1000;
  });
  const [waterTarget, setWaterTarget] = useState(() => {
    const saved = localStorage.getItem(WATER_TARGET_KEY);
    return saved ? parseInt(saved, 10) : 2500;
  });

  const [exerciseProgress, setExerciseProgress] = useState(() => {
    const saved = localStorage.getItem(EXERCISE_KEY);
    return saved ? parseInt(saved, 10) : 15;
  });
  const [exerciseTarget, setExerciseTarget] = useState(() => {
    const saved = localStorage.getItem(EXERCISE_TARGET_KEY);
    return saved ? parseInt(saved, 10) : 30;
  });

  const [mealBreakfast, setMealBreakfast] = useState(() => {
    return localStorage.getItem(MEAL_BREAKFAST_KEY) === 'true';
  });
  const [mealLunch, setMealLunch] = useState(() => {
    return localStorage.getItem(MEAL_LUNCH_KEY) === 'true';
  });
  const [mealDinner, setMealDinner] = useState(() => {
    return localStorage.getItem(MEAL_DINNER_KEY) === 'true';
  });

  // Effects to synchronize tracker state to localStorage
  React.useEffect(() => {
    localStorage.setItem(WATER_KEY, waterIntake.toString());
  }, [waterIntake]);

  React.useEffect(() => {
    localStorage.setItem(WATER_TARGET_KEY, waterTarget.toString());
  }, [waterTarget]);

  React.useEffect(() => {
    localStorage.setItem(EXERCISE_KEY, exerciseProgress.toString());
  }, [exerciseProgress]);

  React.useEffect(() => {
    localStorage.setItem(EXERCISE_TARGET_KEY, exerciseTarget.toString());
  }, [exerciseTarget]);

  React.useEffect(() => {
    localStorage.setItem(MEAL_BREAKFAST_KEY, mealBreakfast.toString());
  }, [mealBreakfast]);

  React.useEffect(() => {
    localStorage.setItem(MEAL_LUNCH_KEY, mealLunch.toString());
  }, [mealLunch]);

  React.useEffect(() => {
    localStorage.setItem(MEAL_DINNER_KEY, mealDinner.toString());
  }, [mealDinner]);

  // Daily Progress History State
  const HISTORY_KEY = 'health_tracker_history';
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
    return getPrepopulatedHistory();
  });

  // Effect to dynamically sync today's changes into the 7-day history list
  React.useEffect(() => {
    const todayStr = getTodayDateString();
    
    const waterPercent = Math.min(100, Math.round((waterIntake / waterTarget) * 100));
    const exercisePercent = Math.min(100, Math.round((exerciseProgress / exerciseTarget) * 100));
    const mealsCompleted = (mealBreakfast ? 1 : 0) + (mealLunch ? 1 : 0) + (mealDinner ? 1 : 0);
    const mealsTarget = 3;
    const mealsPercent = Math.min(100, Math.round((mealsCompleted / mealsTarget) * 100));
    const dailyWellnessScore = Math.round((waterPercent * 0.3) + (exercisePercent * 0.4) + (mealsPercent * 0.3));

    setHistory((prevHistory) => {
      const existingIdx = prevHistory.findIndex(entry => entry.date === todayStr);
      
      const newEntry: HistoryEntry = {
        date: todayStr,
        waterIntake,
        waterTarget,
        exerciseProgress,
        exerciseTarget,
        mealsCompleted,
        mealsTarget,
        wellnessScore: dailyWellnessScore
      };

      let updated = [...prevHistory];
      if (existingIdx >= 0) {
        updated[existingIdx] = newEntry;
      } else {
        updated.push(newEntry);
      }

      // Sort chronologically
      updated.sort((a, b) => a.date.localeCompare(b.date));

      // Keep last 14 days maximum to cover the sliding 7-day history perfectly
      if (updated.length > 14) {
        updated = updated.slice(updated.length - 14);
      }

      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [waterIntake, waterTarget, exerciseProgress, exerciseTarget, mealBreakfast, mealLunch, mealDinner]);

  // Redirect to profile-form if profile doesn't exist
  React.useEffect(() => {
    if (isProfileSynced && !loading && !profile) {
      navigateTo('profile-form');
    }
  }, [profile, isProfileSynced, loading, navigateTo]);

  const userBio = {
    name: profile ? profile.fullName : (user?.email?.split('@')[0] || "User"),
    age: profile ? `${profile.age} yrs` : "",
    weight: profile ? `${profile.weight} kg` : "",
    height: profile ? `${profile.height} cm` : "",
    goal: profile ? profile.healthGoal : "",
    activity: profile ? profile.activityLevel : ""
  };

  const menuItems = [
    { id: 'overview', label: 'Health Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'nutrition', label: 'Nutrition & Meals', icon: <Apple className="w-5 h-5" /> },
    { id: 'fitness', label: 'Fitness & Motion', icon: <Activity className="w-5 h-5" /> },
    { id: 'medications', label: 'Medications Safe Guard', icon: <ShieldAlert className="w-5 h-5" /> },
  ];

  const handleCreateWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingWorkout(true);
    setTimeout(() => {
      setIsSavingWorkout(false);
      setIsModalOpen(false);
      
      const duration = parseInt(workoutDuration, 10) || 0;
      setExerciseProgress((prev) => prev + duration);

      // Reset
      setWorkoutName('');
      setWorkoutDuration('30');
      setWorkoutNotes('');
      setToastMessage(`Success! Added ${duration} minutes to today's active progress tracker.`);
      setTimeout(() => setToastMessage(null), 4000);
    }, 1200);
  };

  const getAllergenWarningContent = () => {
    switch (selectedAllergen) {
      case 'peanuts':
        return {
          title: "Critical Allergen Alert: Peanuts Detected",
          text: "Avoid all nut butter, peanut flour, and verify packaging labels for 'manufactured in a facility with nuts' disclosures.",
          variant: 'error' as const
        };
      case 'gluten':
        return {
          title: "Dietary Exclusion Alert: Gluten Detected",
          text: "Exclude barley, rye, spelt, and standard wheat flours. Safe alternatives include quinoa, brown rice, and buckwheat.",
          variant: 'warning' as const
        };
      case 'dairy':
        return {
          title: "Intolerance Notice: Lactose & Whey",
          text: "Replace animal cream, cheese, and milk. Opt for calcium-fortified almond, oat, or soy derivatives.",
          variant: 'info' as const
        };
      default:
        return null;
    }
  };

  const allergenInfo = getAllergenWarningContent();

  if (loading || !isProfileSynced) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300" id="dashboard-loading">
        <header className="px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950" id="loading-header">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-emerald-600 rounded-lg text-white">
              <Heart className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Smart Health Guide
            </span>
          </div>
          <ThemeToggle />
        </header>

        <main className="flex-1 flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950" id="loading-main">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" id="loading-spinner" />
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading your health dashboard...</p>
          </div>
        </main>

        <footer className="py-6 border-t border-slate-100 dark:border-slate-900 text-center text-xs text-slate-400 bg-white dark:bg-slate-950" id="loading-footer">
          © 2026 Smart Health Guide
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 flex flex-col md:flex-row" id="dashboard-root">
      
      {/* Sidebar - Left Drawer */}
      <aside
        id="dashboard-sidebar"
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col justify-between transform transition-transform duration-300 md:translate-x-0 md:static md:h-screen ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col gap-6 p-6" id="sidebar-top-section">
          {/* Sidebar Brand Logo */}
          <div className="flex items-center justify-between" id="sidebar-header">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigateTo('landing')}>
              <div className="p-1.5 bg-emerald-600 rounded-lg text-white">
                <Heart className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Smart Health Guide
              </span>
            </div>
            <button
              id="sidebar-close-btn"
              onClick={() => setSidebarOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User quick profile snippet */}
          <div 
            className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition-all duration-200" 
            id="sidebar-profile-card"
            onClick={() => navigateTo(profile ? 'profile-summary' : 'profile-form')}
          >
            <div className="w-10 h-10 rounded-full bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-extrabold text-sm">
              {profile ? profile.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'US'}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{userBio.name}</h4>
              <p className="text-2xs text-slate-400 dark:text-slate-500 font-medium truncate">{userBio.goal}</p>
            </div>
          </div>

          {/* Menu Items links */}
          <nav className="flex flex-col gap-1.5" id="sidebar-navigation">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`sidebar-nav-${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id as ActiveTab);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 text-left ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Logout Actions */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-4" id="sidebar-bottom-section">
          <ThemeToggle />
          <button
            id="sidebar-logout-btn"
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/15 rounded-xl font-semibold text-sm transition-colors text-left"
          >
            <LogOut className="w-5 h-5" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Backdrop overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          id="sidebar-overlay"
          className="fixed inset-0 bg-slate-950/30 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen" id="dashboard-main">
        
        {/* Top bar header */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between md:justify-end gap-4" id="dashboard-header">
          <button
            id="dashboard-sidebar-toggle"
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl md:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-85 transition-opacity" 
            id="header-user-status"
            onClick={() => navigateTo(profile ? 'profile-summary' : 'profile-form')}
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Active Account</p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{userBio.name}</p>
            </div>
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 rounded-xl" id="header-bell-badge">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </header>

        {/* Core Dashboard Body Panel */}
        <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto flex flex-col gap-6" id="dashboard-body">
          
          {/* MANDATORY Medical Disclaimer Alert Container */}
          <Alert variant="disclaimer" title="Educational Nutrition Disclaimer" id="dashboard-disclaimer-alert">
            Based on the information you provided, these recommendations are for educational purposes only and are not medical advice. Always consult a qualified healthcare professional before making health-related decisions.
          </Alert>

          {/* TAB 1: Health Overview Panel */}
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-6" id="tab-overview-content">
              
              {/* Health Profile Completion Callout */}
              {!isProfileFetched || loadingProfile ? (
                <div className="p-5 rounded-2xl bg-slate-100/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 animate-pulse text-left flex items-center justify-between" id="dashboard-profile-loading">
                  <div className="flex gap-3 items-center">
                    <div className="w-5 h-5 bg-slate-200 dark:bg-slate-800 rounded-full" />
                    <div className="flex flex-col gap-1.5">
                      <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
                      <div className="h-3 w-64 bg-slate-200 dark:bg-slate-800 rounded" />
                    </div>
                  </div>
                </div>
              ) : !profile ? (
                <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/15 border border-amber-200/50 dark:border-amber-900/30 text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" id="dashboard-profile-setup-cta">
                  <div className="flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-950 dark:text-white">Complete Your Health Profile</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Define your biological parameters and chronic alerts to unlock customized meal blueprints and safe ingredient radars.</p>
                    </div>
                  </div>
                  <Button variant="primary" size="sm" onClick={() => navigateTo('profile-form')} id="setup-profile-cta-btn" className="bg-amber-600 hover:bg-amber-700 font-bold whitespace-nowrap">
                    Complete Profile
                  </Button>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" id="dashboard-profile-active-cta">
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-950 dark:text-white font-extrabold">Health Profile Fully Active</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Your biological indexes and micro-nutrients are synchronized. Access custom recommendations or revise your entries.</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => navigateTo('profile-summary')} id="active-profile-summary-btn" className="font-bold whitespace-nowrap">
                      View Summary
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigateTo('recommendations')} id="active-profile-recs-btn" className="font-bold whitespace-nowrap">
                      Recommendations
                    </Button>
                  </div>
                </div>
              )}

              {/* Top Banner Widget */}
              <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg shadow-emerald-600/10" id="overview-welcome-banner">
                <div className="flex flex-col gap-2 max-w-xl text-left">
                  <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider w-fit">
                    Interactive Preview Foundation
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                    Hello, {userBio.name}!
                  </h2>
                  <p className="text-sm sm:text-base text-emerald-50/90 leading-relaxed">
                    Welcome to the foundational workspace. Explore the simulated panels of the Smart Health Guide and try out the allergen warning radar below.
                  </p>
                </div>
                <Button variant="secondary" className="bg-white text-emerald-700 hover:bg-slate-50 whitespace-nowrap font-bold" onClick={() => setIsModalOpen(true)} id="overview-add-workout-btn">
                  Log Exercise
                </Button>
              </div>

              {/* Daily Health Tracking Center */}
              {(() => {
                const waterPercent = Math.min(100, Math.round((waterIntake / waterTarget) * 100));
                const exercisePercent = Math.min(100, Math.round((exerciseProgress / exerciseTarget) * 100));
                const mealsCompleted = (mealBreakfast ? 1 : 0) + (mealLunch ? 1 : 0) + (mealDinner ? 1 : 0);
                const mealsTarget = 3;
                const mealsPercent = Math.min(100, Math.round((mealsCompleted / mealsTarget) * 100));
                const dailyWellnessScore = Math.round((waterPercent * 0.3) + (exercisePercent * 0.4) + (mealsPercent * 0.3));

                return (
                  <div className="flex flex-col gap-4 text-left" id="daily-health-tracking-center">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div>
                        <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                          <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          Daily Health Tracking Center
                        </h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
                          Live interactive tracking of your hydration, activity, and dietary milestones.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-3xs font-extrabold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20">
                          Local Sync Active
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="trackers-cards-container">
                      
                      {/* Card 1: Water Intake */}
                      <Card id="tracker-card-water" className="border-slate-100 dark:border-slate-800 hover:shadow-md transition-all duration-300">
                        <CardContent className="p-5 flex flex-col justify-between h-full gap-4 text-left">
                          <div className="flex items-start justify-between">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-3xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Hydration</span>
                              <span className="text-sm font-bold text-slate-900 dark:text-white">Daily Water Intake</span>
                              <span className="text-2xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                                {waterIntake} / {waterTarget} ml
                              </span>
                            </div>
                            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-2xl">
                              <Droplet className="w-5 h-5" />
                            </div>
                          </div>

                          {/* Circular Progress Gauge */}
                          <div className="flex items-center gap-4 py-1">
                            <div className="relative w-14 h-14 flex items-center justify-center flex-shrink-0">
                              <svg className="w-full h-full transform -rotate-90">
                                <circle
                                  cx="28"
                                  cy="28"
                                  r="22"
                                  className="stroke-slate-100 dark:stroke-slate-800"
                                  strokeWidth="4"
                                  fill="transparent"
                                />
                                <circle
                                  cx="28"
                                  cy="28"
                                  r="22"
                                  className="stroke-blue-500 transition-all duration-300"
                                  strokeWidth="4"
                                  fill="transparent"
                                  strokeDasharray={2 * Math.PI * 22}
                                  strokeDashoffset={2 * Math.PI * 22 - (waterPercent / 100) * 2 * Math.PI * 22}
                                  strokeLinecap="round"
                                />
                              </svg>
                              <span className="absolute text-3xs font-black text-blue-600 dark:text-blue-400">{waterPercent}%</span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-2xs font-extrabold text-slate-800 dark:text-slate-200">
                                {waterPercent >= 100 ? 'Target Reached! 💧' : 'Stay Hydrated'}
                              </span>
                              <button
                                type="button"
                                className="text-3xs text-blue-600 dark:text-blue-400 hover:underline text-left font-bold"
                                onClick={() => {
                                  const targets = [2000, 2500, 3000, 3500, 4000];
                                  const nextIdx = (targets.indexOf(waterTarget) + 1) % targets.length;
                                  setWaterTarget(targets[nextIdx]);
                                }}
                              >
                                Adjust Target ({waterTarget}ml)
                              </button>
                            </div>
                          </div>

                          {/* Interactive Controls */}
                          <div className="flex items-center gap-1.5 mt-1">
                            <button
                              onClick={() => setWaterIntake(prev => Math.max(0, prev - 250))}
                              className="flex-1 flex items-center justify-center p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-black text-xs cursor-pointer"
                              title="Subtract 250ml"
                            >
                              <Minus className="w-3 h-3 mr-0.5" /> 250
                            </button>
                            <button
                              onClick={() => setWaterIntake(prev => prev + 250)}
                              className="flex-1 flex items-center justify-center p-2 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all font-black text-xs cursor-pointer"
                              title="Add 250ml"
                            >
                              <Plus className="w-3 h-3 mr-0.5" /> 250
                            </button>
                            <button
                              onClick={() => setWaterIntake(prev => prev + 500)}
                              className="flex-1 flex items-center justify-center p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all font-black text-xs cursor-pointer"
                              title="Add 500ml"
                            >
                              <Plus className="w-3 h-3 mr-0.5" /> 500
                            </button>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Card 2: Exercise Progress */}
                      <Card id="tracker-card-exercise" className="border-slate-100 dark:border-slate-800 hover:shadow-md transition-all duration-300">
                        <CardContent className="p-5 flex flex-col justify-between h-full gap-4 text-left">
                          <div className="flex items-start justify-between">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-3xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Fitness</span>
                              <span className="text-sm font-bold text-slate-900 dark:text-white">Exercise Progress</span>
                              <span className="text-2xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                                {exerciseProgress} / {exerciseTarget} mins
                              </span>
                            </div>
                            <div className="p-2.5 bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 rounded-2xl">
                              <Flame className="w-5 h-5" />
                            </div>
                          </div>

                          {/* Circular Progress Gauge */}
                          <div className="flex items-center gap-4 py-1">
                            <div className="relative w-14 h-14 flex items-center justify-center flex-shrink-0">
                              <svg className="w-full h-full transform -rotate-90">
                                <circle
                                  cx="28"
                                  cy="28"
                                  r="22"
                                  className="stroke-slate-100 dark:stroke-slate-800"
                                  strokeWidth="4"
                                  fill="transparent"
                                />
                                <circle
                                  cx="28"
                                  cy="28"
                                  r="22"
                                  className="stroke-orange-500 transition-all duration-300"
                                  strokeWidth="4"
                                  fill="transparent"
                                  strokeDasharray={2 * Math.PI * 22}
                                  strokeDashoffset={2 * Math.PI * 22 - (exercisePercent / 100) * 2 * Math.PI * 22}
                                  strokeLinecap="round"
                                />
                              </svg>
                              <span className="absolute text-3xs font-black text-orange-600 dark:text-orange-400">{exercisePercent}%</span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-2xs font-extrabold text-slate-800 dark:text-slate-200">
                                {exercisePercent >= 100 ? 'Goal Completed! 🔥' : 'Keep Moving'}
                              </span>
                              <button
                                type="button"
                                className="text-3xs text-orange-600 dark:text-orange-400 hover:underline text-left font-bold"
                                onClick={() => {
                                  const targets = [15, 30, 45, 60, 90];
                                  const nextIdx = (targets.indexOf(exerciseTarget) + 1) % targets.length;
                                  setExerciseTarget(targets[nextIdx]);
                                }}
                              >
                                Adjust Target ({exerciseTarget}m)
                              </button>
                            </div>
                          </div>

                          {/* Interactive Controls */}
                          <div className="flex items-center gap-1.5 mt-1">
                            <button
                              onClick={() => setExerciseProgress(prev => Math.max(0, prev - 10))}
                              className="flex-1 flex items-center justify-center p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-black text-xs cursor-pointer"
                              title="Subtract 10 mins"
                            >
                              <Minus className="w-3 h-3 mr-0.5" /> 10m
                            </button>
                            <button
                              onClick={() => setExerciseProgress(prev => prev + 10)}
                              className="flex-1 flex items-center justify-center p-2 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-100/50 dark:border-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-all font-black text-xs cursor-pointer"
                              title="Add 10 mins"
                            >
                              <Plus className="w-3 h-3 mr-0.5" /> 10m
                            </button>
                            <button
                              onClick={() => setIsModalOpen(true)}
                              className="flex-1 flex items-center justify-center p-2 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-all font-black text-xs cursor-pointer whitespace-nowrap"
                              title="Record detailed session"
                            >
                              <Dumbbell className="w-3 h-3 mr-0.5" /> Log
                            </button>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Card 3: Healthy Meals Completed */}
                      <Card id="tracker-card-meals" className="border-slate-100 dark:border-slate-800 hover:shadow-md transition-all duration-300">
                        <CardContent className="p-5 flex flex-col justify-between h-full gap-4 text-left">
                          <div className="flex items-start justify-between">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-3xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Diet & Nutrition</span>
                              <span className="text-sm font-bold text-slate-900 dark:text-white">Meals Completed</span>
                              <span className="text-2xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                                {mealsCompleted} / {mealsTarget} Healthy Meals
                              </span>
                            </div>
                            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                              <Utensils className="w-5 h-5" />
                            </div>
                          </div>

                          {/* Circular Progress Gauge */}
                          <div className="flex items-center gap-4 py-1">
                            <div className="relative w-14 h-14 flex items-center justify-center flex-shrink-0">
                              <svg className="w-full h-full transform -rotate-90">
                                <circle
                                  cx="28"
                                  cy="28"
                                  r="22"
                                  className="stroke-slate-100 dark:stroke-slate-800"
                                  strokeWidth="4"
                                  fill="transparent"
                                />
                                <circle
                                  cx="28"
                                  cy="28"
                                  r="22"
                                  className="stroke-emerald-500 transition-all duration-300"
                                  strokeWidth="4"
                                  fill="transparent"
                                  strokeDasharray={2 * Math.PI * 22}
                                  strokeDashoffset={2 * Math.PI * 22 - (mealsPercent / 100) * 2 * Math.PI * 22}
                                  strokeLinecap="round"
                                />
                              </svg>
                              <span className="absolute text-3xs font-black text-emerald-600 dark:text-emerald-400">{mealsCompleted}/3</span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-2xs font-extrabold text-slate-800 dark:text-slate-200">
                                {mealsPercent >= 100 ? 'All Meals Healthy! 🍏' : 'Track Healthy Plates'}
                              </span>
                              <button
                                type="button"
                                className="text-3xs text-emerald-600 dark:text-emerald-400 hover:underline text-left font-bold"
                                onClick={() => {
                                  setActiveTab('nutrition');
                                }}
                              >
                                Explore Safe Foods
                              </button>
                            </div>
                          </div>

                          {/* Interactive Controls - Toggles */}
                          <div className="flex items-center gap-1.5 mt-1">
                            <button
                              onClick={() => setMealBreakfast(!mealBreakfast)}
                              className={`flex-1 p-2 rounded-xl text-3xs font-extrabold border transition-all cursor-pointer ${
                                mealBreakfast
                                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                                  : 'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                            >
                              Breakfast
                            </button>
                            <button
                              onClick={() => setMealLunch(!mealLunch)}
                              className={`flex-1 p-2 rounded-xl text-3xs font-extrabold border transition-all cursor-pointer ${
                                mealLunch
                                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                                  : 'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                            >
                              Lunch
                            </button>
                            <button
                              onClick={() => setMealDinner(!mealDinner)}
                              className={`flex-1 p-2 rounded-xl text-3xs font-extrabold border transition-all cursor-pointer ${
                                mealDinner
                                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                                  : 'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                            >
                              Dinner
                            </button>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Card 4: Daily Wellness Score */}
                      <Card id="tracker-card-wellness" className="border-slate-100 dark:border-slate-800 bg-gradient-to-br from-emerald-500/5 to-teal-500/10 dark:from-emerald-950/10 dark:to-teal-950/20 shadow-xs">
                        <CardContent className="p-5 flex flex-col justify-between h-full gap-3 text-left">
                          <div className="flex items-start justify-between">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-3xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Scorecard</span>
                              <span className="text-sm font-bold text-slate-900 dark:text-white">Wellness Score</span>
                              <span className="text-2xs text-emerald-600 dark:text-emerald-400 font-extrabold mt-0.5">
                                {dailyWellnessScore === 100 ? 'Perfect Day! 🏆' : 'Active Progress'}
                              </span>
                            </div>
                            <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                              <Sparkles className="w-5 h-5" />
                            </div>
                          </div>

                          {/* Large Circular Gauge Dial */}
                          <div className="flex items-center gap-4 py-0.5">
                            <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                              <svg className="w-full h-full transform -rotate-90">
                                <circle
                                  cx="32"
                                  cy="32"
                                  r="26"
                                  className="stroke-slate-100 dark:stroke-slate-800"
                                  strokeWidth="5"
                                  fill="transparent"
                                />
                                <circle
                                  cx="32"
                                  cy="32"
                                  r="26"
                                  className="stroke-emerald-600 dark:stroke-emerald-400 transition-all duration-300"
                                  strokeWidth="5"
                                  fill="transparent"
                                  strokeDasharray={2 * Math.PI * 26}
                                  strokeDashoffset={2 * Math.PI * 26 - (dailyWellnessScore / 100) * 2 * Math.PI * 26}
                                  strokeLinecap="round"
                                />
                              </svg>
                              <span className="absolute text-xs font-black text-emerald-700 dark:text-emerald-300">{dailyWellnessScore}</span>
                            </div>
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span className="text-3xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-black">Dynamic Status</span>
                              <p className="text-2xs font-semibold text-slate-600 dark:text-slate-300 leading-snug truncate">
                                {dailyWellnessScore === 0 && "Ready to start?"}
                                {dailyWellnessScore > 0 && dailyWellnessScore < 40 && "Starting strong! 🚀"}
                                {dailyWellnessScore >= 40 && dailyWellnessScore < 70 && "Steady progress! 👍"}
                                {dailyWellnessScore >= 70 && dailyWellnessScore < 100 && "Almost peak day! 💪"}
                                {dailyWellnessScore === 100 && "Perfect wellness day! 🎉"}
                              </p>
                            </div>
                          </div>

                          <div className="text-3xs text-slate-400 dark:text-slate-500 font-semibold leading-normal">
                            Weighted based on Daily Targets: Hydration (30%), Fitness (40%), and Nutrition (30%).
                          </div>
                        </CardContent>
                      </Card>

                    </div>
                  </div>
                );
              })()}

              {/* Daily Progress History Section */}
              {(() => {
                const displayHistory = [...history].reverse().slice(0, 7);

                return (
                  <div className="flex flex-col gap-4 text-left mt-2" id="daily-progress-history-section">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div>
                        <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                          <History className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          Wellness Progress History (Last 7 Days)
                        </h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
                          Historical daily logs of your wellness performance, metrics, and trends.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-3xs font-extrabold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                          Interactive History
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3" id="history-cards-container">
                      {displayHistory.map((entry) => {
                        const originalIdx = history.findIndex(h => h.date === entry.date);
                        
                        // Calculate trend relative to previous day
                        let trend: 'improving' | 'stable' | 'declining' = 'stable';
                        if (originalIdx > 0) {
                          const currentScore = history[originalIdx].wellnessScore;
                          const previousScore = history[originalIdx - 1].wellnessScore;
                          if (currentScore > previousScore) trend = 'improving';
                          else if (currentScore < previousScore) trend = 'declining';
                        }

                        return (
                          <Card key={entry.date} id={`history-card-${entry.date}`} className="border-slate-100 dark:border-slate-800 hover:shadow-xs transition-all duration-300 flex flex-col justify-between">
                            <div className="p-3.5 flex flex-col gap-2.5 h-full text-left">
                              {/* Card Header: Date & Trend */}
                              <div className="flex flex-col gap-1">
                                <span className="text-2xs font-extrabold text-slate-950 dark:text-white truncate">
                                  {formatHistoryDate(entry.date)}
                                </span>
                                
                                {/* Trend Indicator Badge */}
                                {trend === 'improving' && (
                                  <span className="inline-flex items-center gap-0.5 text-4xs font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-md border border-emerald-500/10 w-fit">
                                    <TrendingUp className="w-2.5 h-2.5" /> Improving
                                  </span>
                                )}
                                {trend === 'stable' && (
                                  <span className="inline-flex items-center gap-0.5 text-4xs font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 w-fit">
                                    <Minus className="w-2.5 h-2.5" /> Stable
                                  </span>
                                )}
                                {trend === 'declining' && (
                                  <span className="inline-flex items-center gap-0.5 text-4xs font-black uppercase bg-orange-500/10 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded-md border border-orange-500/15 w-fit">
                                    <TrendingDown className="w-2.5 h-2.5" /> Declining
                                  </span>
                                )}
                              </div>

                              {/* Wellness Score Badge / Circle */}
                              <div className="flex items-center gap-2 py-1 border-t border-b border-slate-50 dark:border-slate-900/40 my-0.5">
                                <div className="text-xl font-black text-slate-900 dark:text-white">
                                  {entry.wellnessScore}
                                </div>
                                <div className="flex flex-col leading-none">
                                  <span className="text-4xs text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Score</span>
                                  <span className="text-3xs font-semibold text-slate-500 dark:text-slate-400">
                                    {entry.wellnessScore >= 80 ? 'Excellent' : entry.wellnessScore >= 50 ? 'Good' : 'Incomplete'}
                                  </span>
                                </div>
                              </div>

                              {/* Daily Metrics breakdown */}
                              <div className="flex flex-col gap-1.5 text-3xs text-slate-500 dark:text-slate-400 font-semibold mt-auto">
                                {/* Water */}
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1">
                                    <Droplet className="w-3.5 h-3.5 text-blue-500" />
                                    <span>Hydration</span>
                                  </span>
                                  <span className="font-bold text-slate-800 dark:text-slate-200">
                                    {Math.round(entry.waterIntake / 100) / 10}L
                                  </span>
                                </div>
                                
                                {/* Exercise */}
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1">
                                    <Flame className="w-3.5 h-3.5 text-orange-500" />
                                    <span>Fitness</span>
                                  </span>
                                  <span className="font-bold text-slate-800 dark:text-slate-200">
                                    {entry.exerciseProgress}m
                                  </span>
                                </div>

                                {/* Meals */}
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1">
                                    <Utensils className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>Nutrition</span>
                                  </span>
                                  <span className="font-bold text-slate-800 dark:text-slate-200">
                                    {entry.mealsCompleted}/{entry.mealsTarget}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Weekly Health Insights Section */}
              {(() => {
                const last7Days = history.slice(-7);
                if (last7Days.length === 0) return null;

                // Calculate averages and percentages
                const totalWater = last7Days.reduce((acc, curr) => acc + curr.waterIntake, 0);
                const totalWaterTarget = last7Days.reduce((acc, curr) => acc + curr.waterTarget, 0);
                const avgWater = Math.round(totalWater / last7Days.length);
                const waterMetDays = last7Days.filter(curr => curr.waterIntake >= curr.waterTarget).length;
                const waterPercentage = totalWaterTarget > 0 ? Math.round((totalWater / totalWaterTarget) * 100) : 0;

                const totalExercise = last7Days.reduce((acc, curr) => acc + curr.exerciseProgress, 0);
                const totalExerciseTarget = last7Days.reduce((acc, curr) => acc + curr.exerciseTarget, 0);
                const avgExercise = Math.round(totalExercise / last7Days.length);
                const exerciseMetDays = last7Days.filter(curr => curr.exerciseProgress >= curr.exerciseTarget).length;
                const activeDays = last7Days.filter(curr => curr.exerciseProgress > 0).length;
                const exercisePercentage = totalExerciseTarget > 0 ? Math.round((totalExercise / totalExerciseTarget) * 100) : 0;

                const totalMeals = last7Days.reduce((acc, curr) => acc + curr.mealsCompleted, 0);
                const totalMealsTarget = last7Days.reduce((acc, curr) => acc + curr.mealsTarget, 0);
                const avgMeals = Math.round((totalMeals / last7Days.length) * 10) / 10;
                const mealsMetDays = last7Days.filter(curr => curr.mealsCompleted >= curr.mealsTarget).length;
                const mealsPercentage = totalMealsTarget > 0 ? Math.round((totalMeals / totalMealsTarget) * 100) : 0;

                const avgWellnessScore = Math.round(last7Days.reduce((acc, curr) => acc + curr.wellnessScore, 0) / last7Days.length);
                const maxWellnessScore = Math.max(...last7Days.map(d => d.wellnessScore));

                // Determine weakest area
                const areas = [
                  { name: 'Hydration', pct: waterPercentage },
                  { name: 'Fitness', pct: exercisePercentage },
                  { name: 'Nutrition', pct: mealsPercentage }
                ];
                areas.sort((a, b) => a.pct - b.pct);
                const weakestArea = areas[0];

                // Dynamic Achievements list
                const achievements: string[] = [];
                if (waterMetDays >= 4) {
                  achievements.push(`Met your daily water intake target on ${waterMetDays} out of 7 days.`);
                } else if (waterPercentage >= 80) {
                  achievements.push(`Averaged ${waterPercentage}% of your target weekly water goals.`);
                }

                if (activeDays >= 5) {
                  achievements.push(`Logged physical activity on ${activeDays} days this week, keeping energy high.`);
                } else if (exerciseMetDays >= 3) {
                  achievements.push(`Completed your target fitness time on ${exerciseMetDays} days this week.`);
                }

                if (mealsMetDays >= 4) {
                  achievements.push(`Hit your meal nutrition target on ${mealsMetDays} days this week.`);
                } else if (avgMeals >= 2) {
                  achievements.push(`Averaged ${avgMeals} healthy, balanced meals per day over the week.`);
                }

                if (maxWellnessScore >= 85) {
                  achievements.push(`Reached an exceptional peak wellness score of ${maxWellnessScore}%!`);
                }

                if (achievements.length < 2) {
                  achievements.push("Regularly tracked your metrics to build a reliable health baseline.");
                  achievements.push(`Achieved an average weekly wellness score of ${avgWellnessScore}%.`);
                }

                // Dynamic Consistency message
                let consistencyMessage = "";
                let consistencySubtitle = "";
                if (avgWellnessScore >= 80) {
                  consistencyMessage = "Excellent Habits";
                  consistencySubtitle = "Your wellness scores reflect highly consistent discipline. Keeping this pace maximizes metabolic and cognitive vitality.";
                } else if (avgWellnessScore >= 50) {
                  consistencyMessage = "Consistent Effort";
                  consistencySubtitle = "You have established a solid baseline of weekly habits. Focus on small step-ups to solidify daily health loops.";
                } else {
                  consistencyMessage = "Building Momentum";
                  consistencySubtitle = "You are laying vital groundwork. Choose one tracker to focus on this week and watch your scores rise.";
                }

                // Dynamic Areas for Improvement
                const improvements: string[] = [];
                if (waterMetDays < 5) {
                  improvements.push(`Hydration: Missed daily water targets on ${7 - waterMetDays} days.`);
                }
                if (exerciseMetDays < 4) {
                  improvements.push(`Fitness: Exercise goals were incomplete on ${7 - exerciseMetDays} days.`);
                }
                if (mealsMetDays < 5) {
                  improvements.push(`Nutrition: Less than 3 healthy meals logged on ${7 - mealsMetDays} days.`);
                }

                if (improvements.length === 0) {
                  improvements.push("No major gaps! Outstanding discipline across all tracked metrics.");
                }

                // Dynamic health tip based on weakest area
                let tipTitle = "General Wellness";
                let tipBody = "Even minor gains in hydration, activity, and diet multiply your cumulative vitality. Small, steady increments lead to lasting lifestyle gains.";

                if (weakestArea) {
                  if (weakestArea.name === 'Hydration') {
                    tipTitle = "Optimize Hydration";
                    tipBody = "Place a clear flask of water at your desk or bedside. Hydrating immediately upon waking up kickstarts cellular metabolism and clarity.";
                  } else if (weakestArea.name === 'Fitness') {
                    tipTitle = "Boost Daily Activity";
                    tipBody = "If dedicated sessions feel heavy, try micro-bursts of movement: standing stretches, a 10-minute walk after meals, or taking stairs.";
                  } else if (weakestArea.name === 'Nutrition') {
                    tipTitle = "Nourish Intentionally";
                    tipBody = "Pre-stage easy, safe whole snacks (washed berries, raw almonds). Planning key meals prevents blood sugar dips and impulse eating.";
                  }
                }

                return (
                  <div className="flex flex-col gap-4 text-left mt-2" id="weekly-health-insights-section">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div>
                        <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                          <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          Weekly Health Insights & Recommendations
                        </h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
                          Data-driven feedback, habit consistency analysis, and targeted suggestions based on the last 7 days.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-3xs font-extrabold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20">
                          Weekly Report
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="insights-cards-container">
                      
                      {/* Card 1: Achievements */}
                      <Card className="border-slate-100 dark:border-slate-800">
                        <CardContent className="p-5 flex flex-col gap-4 h-full text-left">
                          <div className="flex items-start justify-between">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-3xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Success Milestones</span>
                              <span className="text-sm font-bold text-slate-900 dark:text-white">Weekly Achievements</span>
                            </div>
                            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                              <Award className="w-5 h-5" />
                            </div>
                          </div>

                          <div className="flex flex-col gap-2.5 flex-1">
                            {achievements.map((ach, idx) => (
                              <div key={idx} className="flex gap-2 items-start">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                <span className="text-2xs text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
                                  {ach}
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Card 2: Habit Consistency */}
                      <Card className="border-slate-100 dark:border-slate-800">
                        <CardContent className="p-5 flex flex-col gap-4 h-full text-left">
                          <div className="flex items-start justify-between">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-3xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Habit Quality</span>
                              <span className="text-sm font-bold text-slate-900 dark:text-white">Consistency Matrix</span>
                            </div>
                            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-2xl">
                              <Activity className="w-5 h-5" />
                            </div>
                          </div>

                          <div className="flex flex-col gap-3 flex-1">
                            <div className="flex items-center gap-3">
                              <div className="px-3 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl font-black text-sm">
                                {avgWellnessScore}%
                              </div>
                              <div className="flex flex-col leading-tight">
                                <span className="text-2xs font-extrabold text-slate-800 dark:text-slate-200">{consistencyMessage}</span>
                                <span className="text-3xs text-slate-400 dark:text-slate-500">Avg Wellness Score</span>
                              </div>
                            </div>
                            <p className="text-2xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                              {consistencySubtitle}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Card 3: Areas for Improvement */}
                      <Card className="border-slate-100 dark:border-slate-800">
                        <CardContent className="p-5 flex flex-col gap-4 h-full text-left">
                          <div className="flex items-start justify-between">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-3xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Optimization</span>
                              <span className="text-sm font-bold text-slate-900 dark:text-white">Opportunity Gaps</span>
                            </div>
                            <div className="p-2.5 bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 rounded-2xl">
                              <AlertTriangle className="w-5 h-5" />
                            </div>
                          </div>

                          <div className="flex flex-col gap-2.5 flex-1 justify-center">
                            {improvements.map((imp, idx) => (
                              <div key={idx} className="flex gap-2 items-start">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                                <span className="text-2xs text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
                                  {imp}
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Card 4: Actionable Tip */}
                      <Card className="border-slate-100 dark:border-slate-800 bg-gradient-to-br from-indigo-500/5 to-purple-500/10 dark:from-indigo-950/10 dark:to-purple-950/20">
                        <CardContent className="p-5 flex flex-col gap-4 h-full text-left">
                          <div className="flex items-start justify-between">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-3xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Habit Builder</span>
                              <span className="text-sm font-bold text-slate-900 dark:text-white">Daily Wellness Tip</span>
                            </div>
                            <div className="p-2.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                              <Sparkles className="w-5 h-5" />
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5 flex-1">
                            <span className="text-2xs font-extrabold text-indigo-700 dark:text-indigo-300">
                              {tipTitle}
                            </span>
                            <p className="text-2xs text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
                              {tipBody}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                    </div>
                  </div>
                );
              })()}

              {/* Bio Grid Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="overview-bio-grid">
                
                <Card id="bio-card-weight">
                  <CardContent className="p-5 flex flex-col gap-1 text-left">
                    <span className="text-2xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Body Mass</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white mt-1">{userBio.weight}</span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1 font-medium">
                      <TrendingUp className="w-3.5 h-3.5" /> Stable Trend
                    </span>
                  </CardContent>
                </Card>

                <Card id="bio-card-height">
                  <CardContent className="p-5 flex flex-col gap-1 text-left">
                    <span className="text-2xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Physical Stature</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white mt-1">{userBio.height}</span>
                    <span className="text-xs text-slate-400 mt-1">Normal limits</span>
                  </CardContent>
                </Card>

                <Card id="bio-card-activity">
                  <CardContent className="p-5 flex flex-col gap-1 text-left">
                    <span className="text-2xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Metabolic Activity</span>
                    <span className="text-base font-bold text-slate-900 dark:text-white mt-1 truncate">{userBio.activity}</span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1 font-medium">
                      <CheckCircle className="w-3.5 h-3.5" /> Normal range
                    </span>
                  </CardContent>
                </Card>

                <Card id="bio-card-goal">
                  <CardContent className="p-5 flex flex-col gap-1 text-left">
                    <span className="text-2xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Onboarding Goal</span>
                    <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1 truncate">{userBio.goal}</span>
                    <span className="text-xs text-slate-400 mt-1">Educational focus</span>
                  </CardContent>
                </Card>

              </div>

              {/* Middle Section - Allergen Warning Simulator */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="overview-mid-row">
                
                <Card className="lg:col-span-7 flex flex-col justify-between" id="allergen-simulator-card">
                  <CardHeader>
                    <CardTitle>Interactive Food Allergen Warning Radar</CardTitle>
                    <CardDescription>Select an allergen biological flag below to preview the instant alert guidelines framework in action.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-5">
                    
                    <Select
                      label="Select Profile Allergen Flag"
                      id="allergen-selector"
                      value={selectedAllergen}
                      onChange={(e) => setSelectedAllergen(e.target.value)}
                      options={[
                        { value: 'none', label: 'None (Default Balanced Dietary)' },
                        { value: 'peanuts', label: 'Peanuts Allergy (Severe Anaphylactic Warning)' },
                        { value: 'gluten', label: 'Gluten Intolerance (Celiac Safe)' },
                        { value: 'dairy', label: 'Dairy Intolerance (Lactose Free)' },
                      ]}
                    />

                    {allergenInfo && (
                      <Alert variant={allergenInfo.variant} title={allergenInfo.title} id="simulator-output-alert">
                        {allergenInfo.text}
                      </Alert>
                    )}

                    {!allergenInfo && (
                      <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800/80 text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2" id="simulator-empty-notif">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span>No allergy profile alerts currently triggered. Defaulting to general nutrition listings.</span>
                      </div>
                    )}

                  </CardContent>
                </Card>

                <Card className="lg:col-span-5 flex flex-col justify-between" id="educational-links-card">
                  <CardHeader>
                    <CardTitle>Scientific Resources</CardTitle>
                    <CardDescription>Trusted educational organizations and dietary research data portals.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    
                    <div className="flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-xl cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-all" id="edu-link-1">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 rounded-xl">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">World Health Organization</h4>
                          <p className="text-xs text-slate-400">Public diet & lifestyle reviews</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>

                    <div className="flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-xl cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-all" id="edu-link-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 rounded-xl">
                          <ClipboardList className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Harvard Nutrition Source</h4>
                          <p className="text-xs text-slate-400">Comprehensive ingredient research</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>

                  </CardContent>
                </Card>

              </div>

            </div>
          )}

          {/* TAB 2: Nutrition & Meals */}
          {activeTab === 'nutrition' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="tab-nutrition-content">
              
              <Card id="nutrition-safe-foods">
                <CardHeader className="bg-emerald-50/20 dark:bg-emerald-950/5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-lg">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <CardTitle>Highly Recommended Food Groups</CardTitle>
                  </div>
                  <CardDescription>Foods scientifically indicated to support blood glucose and energy stabilization.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 flex flex-col gap-4">
                  <div className="flex flex-col gap-3">
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Spinach & Leafy Greens</h4>
                      <p className="text-xs text-slate-400 mt-1">Rich in magnesium, vitamins, and minerals that promote fiber synthesis and insulin regulation.</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Avocados & Omega-3 Fats</h4>
                      <p className="text-xs text-slate-400 mt-1">Healthy fats that slow digestive rate and minimize blood sugar spikes following meals.</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Organic Wild-Caught Salmon</h4>
                      <p className="text-xs text-slate-400 mt-1">Premium amino acid matrix to support physical muscular health and lean metabolism.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card id="nutrition-avoid-foods">
                <CardHeader className="bg-rose-50/20 dark:bg-rose-950/5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 rounded-lg">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <CardTitle>Food Groups to Avoid</CardTitle>
                  </div>
                  <CardDescription>Foods that may pose high glycemic loads or conflicting allergen impacts.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 flex flex-col gap-4">
                  <div className="flex flex-col gap-3">
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Refined Syrups & Soda</h4>
                      <p className="text-xs text-slate-400 mt-1">High fructose corn syrup causes immediate pancreatic fatigue and insulin resistance.</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Processed Canned Soup</h4>
                      <p className="text-xs text-slate-400 mt-1">Contains massive chemical sodium concentrations that strain blood pressure homeostasis.</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">White Flour Bagels</h4>
                      <p className="text-xs text-slate-400 mt-1">Devoid of biological wheat germ fiber, resulting in rapid starch digestion and glucose surges.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          )}

          {/* TAB 3: Fitness & Motion */}
          {activeTab === 'fitness' && (
            <div className="flex flex-col gap-6 animate-fade-in" id="tab-fitness-content">
              {/* Highlight our EmptyState component beautifully */}
              <EmptyState
                title="No Custom Workout Logs Recorded"
                description="Your activity log is currently clear. Record a physical workout session using our modal form to build your metrics tracker."
                actionLabel="Record Active Session"
                onAction={() => setIsModalOpen(true)}
                id="fitness-empty-state"
              />
            </div>
          )}

          {/* TAB 4: Medication Alert */}
          {activeTab === 'medications' && (
            <div className="flex flex-col gap-6" id="tab-medications-content">
              <EmptyState
                title="Prescription Timing Safety Radar"
                description="Medication-to-food chemical reaction analysis is currently locked. This feature is slated for the secondary deployment release."
                actionLabel="Review Onboarding Goal"
                onAction={() => setActiveTab('overview')}
                id="medications-empty-state"
              />
            </div>
          )}

        </div>
      </main>

      {/* Reusable Form inside custom Modal Component */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Fitness Activity Session"
        id="add-workout-modal"
        footer={
          <div className="flex gap-3">
            <Button variant="outline" size="md" onClick={() => setIsModalOpen(false)} id="modal-cancel-btn">
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleCreateWorkout} isLoading={isSavingWorkout} id="modal-save-btn">
              Save Activity
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateWorkout} className="flex flex-col gap-4 text-left" id="modal-workout-form">
          <Input
            label="Workout Exercise Type"
            id="modal-workout-name"
            placeholder="e.g. Cardiovascular Jogging, Yoga, Weight Lifting"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            required
          />

          <Select
            label="Planned Session Duration"
            id="modal-workout-duration"
            value={workoutDuration}
            onChange={(e) => setWorkoutDuration(e.target.value)}
            options={[
              { value: '15', label: '15 Minutes (Short/Active)' },
              { value: '30', label: '30 Minutes (Recommended Daily)' },
              { value: '45', label: '45 Minutes (Strength Intensity)' },
              { value: '60', label: '60 Minutes (High Metabolism)' },
            ]}
          />

          <Textarea
            label="Physical Wellness Feeling & Notes (Optional)"
            id="modal-workout-notes"
            placeholder="Record hydration level, target heart rate, or pain warnings."
            value={workoutNotes}
            onChange={(e) => setWorkoutNotes(e.target.value)}
          />
        </form>
      </Modal>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div 
          className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-5 py-3 rounded-2xl shadow-xl border border-slate-800 dark:border-slate-100 flex items-center gap-3 transition-all duration-300 transform translate-y-0 animate-fade-in font-semibold text-xs cursor-pointer hover:scale-[1.02]"
          onClick={() => setToastMessage(null)}
          id="toast-notification"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <span>{toastMessage}</span>
          <button className="text-slate-400 hover:text-slate-200 dark:text-slate-500 dark:hover:text-slate-700 font-extrabold text-sm ml-2">×</button>
        </div>
      )}

    </div>
  );
}
