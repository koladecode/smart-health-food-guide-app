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
  Minus,
  Target,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Coffee,
  Bed,
  Clock
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { useHealthProfile } from '../context/HealthProfileContext';
import { useAuth } from '../context/AuthContext';
import { generateRecommendations } from '../utils/recommendationEngine';
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

  // Local states for goal tracker adjustments
  const [goalStartWeight, setGoalStartWeight] = useState<number>(() => {
    const saved = localStorage.getItem('health_goal_weight_start');
    if (saved) return parseFloat(saved);
    return profile?.weight ? Number(profile.weight) : 80;
  });
  const [goalCurrentWeight, setGoalCurrentWeight] = useState<number>(() => {
    const saved = localStorage.getItem('health_goal_weight_current');
    if (saved) return parseFloat(saved);
    return profile?.weight ? Number(profile.weight) : 80;
  });
  const [goalTargetWeight, setGoalTargetWeight] = useState<number>(() => {
    const saved = localStorage.getItem('health_goal_weight_target');
    if (saved) return parseFloat(saved);
    const w = profile?.weight ? Number(profile.weight) : 80;
    const g = profile?.healthGoal || 'Improve Overall Health';
    if (g === 'Weight Gain' || g === 'Gain Weight') return w + 5;
    return w - 5;
  });

  const [goalTargetExercise, setGoalTargetExercise] = useState<number>(() => {
    const saved = localStorage.getItem('health_goal_exercise_target');
    return saved ? parseInt(saved, 10) : 150;
  });

  const [goalTargetWellness, setGoalTargetWellness] = useState<number>(() => {
    const saved = localStorage.getItem('health_goal_wellness_target');
    return saved ? parseInt(saved, 10) : 85;
  });

  const [goalTargetMeals, setGoalTargetMeals] = useState<number>(() => {
    const saved = localStorage.getItem('health_goal_meals_target');
    return saved ? parseInt(saved, 10) : 18;
  });

  // Keep goal weights in sync with profile updates
  React.useEffect(() => {
    if (profile && profile.weight) {
      const w = Number(profile.weight);
      if (!localStorage.getItem('health_goal_weight_start')) {
        setGoalStartWeight(w);
      }
      if (!localStorage.getItem('health_goal_weight_current')) {
        setGoalCurrentWeight(w);
      }
      if (!localStorage.getItem('health_goal_weight_target')) {
        const g = profile.healthGoal;
        if (g === 'Weight Gain' || g === 'Gain Weight') {
          setGoalTargetWeight(w + 5);
        } else {
          setGoalTargetWeight(w - 5);
        }
      }
    }
  }, [profile]);

  // Persist goal changes to local storage
  React.useEffect(() => {
    localStorage.setItem('health_goal_weight_start', goalStartWeight.toString());
  }, [goalStartWeight]);

  React.useEffect(() => {
    localStorage.setItem('health_goal_weight_current', goalCurrentWeight.toString());
  }, [goalCurrentWeight]);

  React.useEffect(() => {
    localStorage.setItem('health_goal_weight_target', goalTargetWeight.toString());
  }, [goalTargetWeight]);

  React.useEffect(() => {
    localStorage.setItem('health_goal_exercise_target', goalTargetExercise.toString());
  }, [goalTargetExercise]);

  React.useEffect(() => {
    localStorage.setItem('health_goal_wellness_target', goalTargetWellness.toString());
  }, [goalTargetWellness]);

  React.useEffect(() => {
    localStorage.setItem('health_goal_meals_target', goalTargetMeals.toString());
  }, [goalTargetMeals]);

  // Daily Plan Completion States
  const [planCompletedMorning, setPlanCompletedMorning] = useState(() => {
    return localStorage.getItem('health_plan_completed_morning') === 'true';
  });
  const [planCompletedAfternoon, setPlanCompletedAfternoon] = useState(() => {
    return localStorage.getItem('health_plan_completed_afternoon') === 'true';
  });
  const [planCompletedEvening, setPlanCompletedEvening] = useState(() => {
    return localStorage.getItem('health_plan_completed_evening') === 'true';
  });
  const [planCompletedNight, setPlanCompletedNight] = useState(() => {
    return localStorage.getItem('health_plan_completed_night') === 'true';
  });

  React.useEffect(() => {
    localStorage.setItem('health_plan_completed_morning', planCompletedMorning.toString());
  }, [planCompletedMorning]);

  React.useEffect(() => {
    localStorage.setItem('health_plan_completed_afternoon', planCompletedAfternoon.toString());
  }, [planCompletedAfternoon]);

  React.useEffect(() => {
    localStorage.setItem('health_plan_completed_evening', planCompletedEvening.toString());
  }, [planCompletedEvening]);

  React.useEffect(() => {
    localStorage.setItem('health_plan_completed_night', planCompletedNight.toString());
  }, [planCompletedNight]);

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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in" id="tab-overview-content">
              
              {/* LEFT COLUMN: Main Dashboard Workspace (8 cols) */}
              <div className="lg:col-span-8 flex flex-col gap-8 animate-fade-in" id="overview-main-feed">
              
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
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Define parameters to unlock personalized meal recommendations and allergy warnings.</p>
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
                      <h4 className="text-sm font-bold text-slate-950 dark:text-white font-extrabold">Health Profile Active</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Your biological parameters are synchronized. Access customized suggestions or revise your inputs.</p>
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
                    Active Health Hub
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                    Hello, {userBio.name}!
                  </h2>
                  <p className="text-sm sm:text-base text-emerald-50/90 leading-relaxed">
                    Track and optimize your daily health performance. View dynamic parameters, log exercise, and monitor nutrition targets.
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
                  <div className="flex flex-col gap-5 text-left animate-fade-in" id="daily-health-tracking-center">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/60 pb-3.5 mb-2">
                      <div>
                        <h3 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                          <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          Daily Health Tracking Center
                        </h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                          Monitor daily wellness milestones in real-time.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-3xs font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20 tracking-wider">
                          Local Sync Active
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="trackers-cards-container">
                      
                      {/* Card 1: Water Intake */}
                      <Card id="tracker-card-water" className="border-slate-100 dark:border-slate-800/80 hover:shadow-md transition-all duration-300">
                        <CardContent className="p-6 flex flex-col justify-between h-full gap-5 text-left">
                          <div className="flex items-start justify-between">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-3xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-extrabold">Hydration</span>
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
                                  className="stroke-slate-100 dark:stroke-slate-800/80"
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
                              <span className="absolute text-3xs font-extrabold text-blue-600 dark:text-blue-400">{waterPercent}%</span>
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
                              className="flex-1 flex items-center justify-center p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-bold text-xs cursor-pointer"
                              title="Subtract 250ml"
                            >
                              <Minus className="w-3 h-3 mr-0.5" /> 250
                            </button>
                            <button
                              onClick={() => setWaterIntake(prev => prev + 250)}
                              className="flex-1 flex items-center justify-center p-2 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all font-bold text-xs cursor-pointer"
                              title="Add 250ml"
                            >
                              <Plus className="w-3 h-3 mr-0.5" /> 250
                            </button>
                            <button
                              onClick={() => setWaterIntake(prev => prev + 500)}
                              className="flex-1 flex items-center justify-center p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all font-bold text-xs cursor-pointer"
                              title="Add 500ml"
                            >
                              <Plus className="w-3 h-3 mr-0.5" /> 500
                            </button>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Card 2: Exercise Progress */}
                      <Card id="tracker-card-exercise" className="border-slate-100 dark:border-slate-800/80 hover:shadow-md transition-all duration-300">
                        <CardContent className="p-6 flex flex-col justify-between h-full gap-5 text-left">
                          <div className="flex items-start justify-between">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-3xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-extrabold">Fitness</span>
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
                                  className="stroke-slate-100 dark:stroke-slate-800/80"
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
                              <span className="absolute text-3xs font-extrabold text-orange-600 dark:text-orange-400">{exercisePercent}%</span>
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
                              className="flex-1 flex items-center justify-center p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-bold text-xs cursor-pointer"
                              title="Subtract 10 mins"
                            >
                              <Minus className="w-3 h-3 mr-0.5" /> 10m
                            </button>
                            <button
                              onClick={() => setExerciseProgress(prev => prev + 10)}
                              className="flex-1 flex items-center justify-center p-2 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-100/50 dark:border-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-all font-bold text-xs cursor-pointer"
                              title="Add 10 mins"
                            >
                              <Plus className="w-3 h-3 mr-0.5" /> 10m
                            </button>
                            <button
                              onClick={() => setIsModalOpen(true)}
                              className="flex-1 flex items-center justify-center p-2 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-all font-bold text-xs cursor-pointer whitespace-nowrap"
                              title="Record detailed session"
                            >
                              <Dumbbell className="w-3 h-3 mr-0.5" /> Log
                            </button>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Card 3: Healthy Meals Completed */}
                      <Card id="tracker-card-meals" className="border-slate-100 dark:border-slate-800/80 hover:shadow-md transition-all duration-300">
                        <CardContent className="p-6 flex flex-col justify-between h-full gap-5 text-left">
                          <div className="flex items-start justify-between">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-3xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-extrabold">Diet & Nutrition</span>
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
                                  className="stroke-slate-100 dark:stroke-slate-800/80"
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
                              <span className="absolute text-3xs font-extrabold text-emerald-600 dark:text-emerald-400">{mealsCompleted}/3</span>
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
                      <Card id="tracker-card-wellness" className="border-slate-100 dark:border-slate-800/80 bg-gradient-to-br from-emerald-500/5 to-teal-500/10 dark:from-emerald-950/10 dark:to-teal-950/20 shadow-xs">
                        <CardContent className="p-6 flex flex-col justify-between h-full gap-4 text-left">
                          <div className="flex items-start justify-between">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-3xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-extrabold">Scorecard</span>
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
                                  className="stroke-slate-100 dark:stroke-slate-800/80"
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

                          <div className="text-3xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider leading-normal">
                            Weights: Hydration (30%) • Fitness (40%) • Nutrition (30%)
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
                  <div className="flex flex-col gap-4 text-left mt-4" id="daily-progress-history-section">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/60 pb-3.5 mb-2">
                      <div>
                        <h3 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                          <History className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          Wellness Progress History (Last 7 Days)
                        </h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                          Historical daily logs of your wellness performance, metrics, and trends.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-3xs font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700/80 tracking-wider">
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
                  <div className="flex flex-col gap-4 text-left mt-4" id="weekly-health-insights-section">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/60 pb-3.5 mb-2">
                      <div>
                        <h3 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                          <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          Weekly Health Insights & Recommendations
                        </h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                          Data-driven feedback, habit consistency analysis, and targeted suggestions based on the last 7 days.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-3xs font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20 tracking-wider">
                          Weekly Report
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="insights-cards-container">
                      
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

              {/* Health Goals & Progress Section */}
              {(() => {
                const last7Days = history.slice(-7);
                const avgWellnessScore = last7Days.length > 0 
                  ? Math.round(last7Days.reduce((acc, curr) => acc + curr.wellnessScore, 0) / last7Days.length) 
                  : 0;

                const currentWeeklyExercise = last7Days.reduce((acc, curr) => acc + curr.exerciseProgress, 0);
                const currentWeeklyMeals = last7Days.reduce((acc, curr) => acc + curr.mealsCompleted, 0);

                const rawGoal = profile?.healthGoal || 'Improve Overall Health';
                const isWeightLoss = rawGoal === 'Weight Loss' || rawGoal === 'Lose Weight';
                const isWeightGain = rawGoal === 'Weight Gain' || rawGoal === 'Gain Weight';
                const isMuscleGain = rawGoal === 'Muscle Gain';
                const isBloodSugar = rawGoal === 'Blood Sugar Control';
                const isHeartHealth = rawGoal === 'Heart Health';
                const isImproveHealth = rawGoal === 'Improve Overall Health' || rawGoal === 'Maintain Weight';

                let progressPct = 0;
                let goalTitle = rawGoal;
                let statusLabel = '';
                let statusValue = '';
                let targetValue = '';
                let progressDescription = '';
                let progressDetails = '';
                let milestones: string[] = [];

                if (isWeightLoss) {
                  const totalDiff = goalStartWeight - goalTargetWeight;
                  const currentDiff = goalStartWeight - goalCurrentWeight;
                  if (totalDiff > 0) {
                    progressPct = Math.max(0, Math.min(100, Math.round((currentDiff / totalDiff) * 100)));
                  } else {
                    progressPct = 0;
                  }
                  statusLabel = 'Current Weight';
                  statusValue = `${goalCurrentWeight.toFixed(1)} kg`;
                  targetValue = `${goalTargetWeight.toFixed(1)} kg`;
                  progressDescription = '0.5 kg - 1.0 kg per week of safe caloric restriction';
                  progressDetails = `Starting: ${goalStartWeight.toFixed(1)} kg. Progress: ${(goalStartWeight - goalCurrentWeight).toFixed(1)} kg lost of ${totalDiff.toFixed(1)} kg goal.`;
                  milestones = [
                    'First Step (20% met): Activate metabolic fat-burning pathways',
                    'Halfway (50% met): Significant cardiorespiratory efficiency lift',
                    'Optimized (100% met): Target goal weight achieved!'
                  ];
                } else if (isWeightGain) {
                  const totalDiff = goalTargetWeight - goalStartWeight;
                  const currentDiff = goalCurrentWeight - goalStartWeight;
                  if (totalDiff > 0) {
                    progressPct = Math.max(0, Math.min(100, Math.round((currentDiff / totalDiff) * 100)));
                  } else {
                    progressPct = 0;
                  }
                  statusLabel = 'Current Weight';
                  statusValue = `${goalCurrentWeight.toFixed(1)} kg`;
                  targetValue = `${goalTargetWeight.toFixed(1)} kg`;
                  progressDescription = '0.25 kg - 0.5 kg per week of controlled hyper-caloric nutrition';
                  progressDetails = `Starting: ${goalStartWeight.toFixed(1)} kg. Progress: ${(goalCurrentWeight - goalStartWeight).toFixed(1)} kg gained of ${totalDiff.toFixed(1)} kg goal.`;
                  milestones = [
                    'Surplus (20% met): Glycogen energy buffers optimized',
                    'Growth (50% met): Measurable muscular skeletal mass addition',
                    'Target Met (100% met): Ideal weight and athletic profile unlocked!'
                  ];
                } else if (isMuscleGain) {
                  progressPct = Math.max(0, Math.min(100, Math.round((currentWeeklyExercise / goalTargetExercise) * 100)));
                  statusLabel = 'Weekly Training';
                  statusValue = `${currentWeeklyExercise} mins`;
                  targetValue = `${goalTargetExercise} mins`;
                  progressDescription = 'Progressive resistance overload and training consistency';
                  progressDetails = `${currentWeeklyExercise} mins logged this week toward your ${goalTargetExercise} mins target.`;
                  milestones = [
                    'Activation (20% met): Safe anabolic training stimulus initialized',
                    'Development (50% met): Hypertrophy threshold reached successfully',
                    'Peak Performance (100% met): Ideal weekly exercise volume complete!'
                  ];
                } else if (isBloodSugar) {
                  progressPct = Math.max(0, Math.min(100, Math.round((currentWeeklyMeals / goalTargetMeals) * 100)));
                  statusLabel = 'Nutritious Meals';
                  statusValue = `${currentWeeklyMeals} meals`;
                  targetValue = `${goalTargetMeals} meals`;
                  progressDescription = '3 healthy, balanced meals daily with fiber buffers and low glycemic load';
                  progressDetails = `${currentWeeklyMeals} target meals logged this week toward your ${goalTargetMeals} target.`;
                  milestones = [
                    'Stabilization (20% met): Insulin response normalization initiated',
                    'Steady Energy (50% met): Steady post-prandial glycemic curve maintained',
                    'Full Control (100% met): Peak metabolic flexibility achieved!'
                  ];
                } else if (isHeartHealth) {
                  progressPct = Math.max(0, Math.min(100, Math.round((currentWeeklyExercise / goalTargetExercise) * 100)));
                  statusLabel = 'Cardio Aerobic';
                  statusValue = `${currentWeeklyExercise} mins`;
                  targetValue = `${goalTargetExercise} mins`;
                  progressDescription = '150 mins moderate cardio weekly (AHA gold standard)';
                  progressDetails = `${currentWeeklyExercise} active mins logged this week toward your ${goalTargetExercise} mins cardiovascular goal.`;
                  milestones = [
                    'Stimulation (20% met): Blood circulation and vascular elasticity trigger active',
                    'AHA Standard (50% met): Strengthened cardiac output limit established',
                    'Heart Hero (100% met): Reduced resting pulse & optimal aerobic recovery!'
                  ];
                } else {
                  // Improve Overall Health / Maintain Weight
                  progressPct = Math.max(0, Math.min(100, Math.round((avgWellnessScore / goalTargetWellness) * 100)));
                  statusLabel = 'Avg Wellness Score';
                  statusValue = `${avgWellnessScore}%`;
                  targetValue = `${goalTargetWellness}%`;
                  progressDescription = 'Maintain a high weekly average daily habit completion rate';
                  progressDetails = `Current 7-day average wellness rating: ${avgWellnessScore}% vs your ${goalTargetWellness}% benchmark.`;
                  milestones = [
                    'Consistent (20% met): Synchronized daily biological rhythms built',
                    'Vibrant (50% met): Optimized sleep, hydration, and nutrition balance',
                    'Zenith (100% met): Elite peak-health protection standards reached!'
                  ];
                }

                return (
                  <div className="flex flex-col gap-4 text-left border-t border-slate-100 dark:border-slate-800/60 pt-8 mt-6" id="health-goals-progress-section">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/60 pb-3.5 mb-2">
                      <div>
                        <h3 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                          <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          Personalized Health Goals & Progress
                        </h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                          Customized tracking cards synchronized with your {profile ? 'saved' : 'default'} goal parameters.
                        </p>
                      </div>
                      <span className="text-3xs font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20 tracking-wider">
                        {goalTitle}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Left: Interactive Goal Dashboard Card */}
                      <Card className="lg:col-span-8 border-slate-100 dark:border-slate-800 hover:shadow-md transition-all duration-300">
                        <CardContent className="p-6 flex flex-col gap-6">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex gap-3.5 items-center">
                              <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                                <Target className="w-6 h-6" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-3xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">ACTIVE GOAL FRAMEWORK</span>
                                <span className="text-lg font-black text-slate-900 dark:text-white">{goalTitle}</span>
                              </div>
                            </div>
                            
                            <div className="flex flex-row items-center gap-6 bg-slate-50 dark:bg-slate-900/40 px-4 py-2 rounded-2xl border border-slate-100 dark:border-slate-800">
                              <div className="flex flex-col">
                                <span className="text-4xs text-slate-400 dark:text-slate-500 uppercase font-bold">{statusLabel}</span>
                                <span className="text-sm font-extrabold text-slate-900 dark:text-white">{statusValue}</span>
                              </div>
                              <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
                              <div className="flex flex-col">
                                <span className="text-4xs text-slate-400 dark:text-slate-500 uppercase font-bold">Goal Target</span>
                                <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">{targetValue}</span>
                              </div>
                            </div>
                          </div>

                          {/* Dynamic Adjuster Slider/Buttons */}
                          <div className="flex flex-col gap-3">
                            <span className="text-3xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-extrabold">INTERACTIVE TARGET CONTROLS</span>
                            
                            {/* Weight controls */}
                            {(isWeightLoss || isWeightGain) && (
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <div className="flex flex-col gap-1 text-left">
                                  <span className="text-4xs text-slate-400 uppercase font-black">Starting weight</span>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <button onClick={() => setGoalStartWeight(prev => Math.max(30, prev - 0.5))} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-black hover:bg-slate-50 dark:hover:bg-slate-700 text-xs text-slate-600 dark:text-slate-300 shadow-sm">-</button>
                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 w-16 text-center">{goalStartWeight.toFixed(1)} kg</span>
                                    <button onClick={() => setGoalStartWeight(prev => prev + 0.5)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-black hover:bg-slate-50 dark:hover:bg-slate-700 text-xs text-slate-600 dark:text-slate-300 shadow-sm">+</button>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-1 text-left">
                                  <span className="text-4xs text-slate-400 uppercase font-black">Logged Current weight</span>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <button onClick={() => setGoalCurrentWeight(prev => Math.max(30, prev - 0.5))} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-black hover:bg-slate-50 dark:hover:bg-slate-700 text-xs text-slate-600 dark:text-slate-300 shadow-sm">-</button>
                                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 w-16 text-center">{goalCurrentWeight.toFixed(1)} kg</span>
                                    <button onClick={() => setGoalCurrentWeight(prev => prev + 0.5)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-black hover:bg-slate-50 dark:hover:bg-slate-700 text-xs text-slate-600 dark:text-slate-300 shadow-sm">+</button>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-1 text-left">
                                  <span className="text-4xs text-slate-400 uppercase font-black">Target weight goal</span>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <button onClick={() => setGoalTargetWeight(prev => Math.max(30, prev - 0.5))} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-black hover:bg-slate-50 dark:hover:bg-slate-700 text-xs text-slate-600 dark:text-slate-300 shadow-sm">-</button>
                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 w-16 text-center">{goalTargetWeight.toFixed(1)} kg</span>
                                    <button onClick={() => setGoalTargetWeight(prev => prev + 0.5)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-black hover:bg-slate-50 dark:hover:bg-slate-700 text-xs text-slate-600 dark:text-slate-300 shadow-sm">+</button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Exercise target controls */}
                            {(isMuscleGain || isHeartHealth) && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <div className="flex flex-col gap-1 text-left justify-center">
                                  <span className="text-4xs text-slate-400 uppercase font-black">Logged Active Training (7 Days)</span>
                                  <span className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">{currentWeeklyExercise} mins</span>
                                </div>
                                <div className="flex flex-col gap-1 text-left">
                                  <span className="text-4xs text-slate-400 uppercase font-black">Adjust Weekly Target Goal</span>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <button onClick={() => setGoalTargetExercise(prev => Math.max(30, prev - 15))} className="w-16 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 text-2xs text-slate-600 dark:text-slate-300 shadow-sm">-15m</button>
                                    <span className="text-xs font-extrabold text-orange-600 dark:text-orange-400 w-20 text-center">{goalTargetExercise} mins</span>
                                    <button onClick={() => setGoalTargetExercise(prev => prev + 15)} className="w-16 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 text-2xs text-slate-600 dark:text-slate-300 shadow-sm">+15m</button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Wellness target controls */}
                            {isImproveHealth && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <div className="flex flex-col gap-1 text-left justify-center">
                                  <span className="text-4xs text-slate-400 uppercase font-black">Current 7-Day Average Score</span>
                                  <span className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">{avgWellnessScore}%</span>
                                </div>
                                <div className="flex flex-col gap-1 text-left">
                                  <span className="text-4xs text-slate-400 uppercase font-black">Adjust Average Target Goal</span>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <button onClick={() => setGoalTargetWellness(prev => Math.max(50, prev - 5))} className="w-14 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 text-2xs text-slate-600 dark:text-slate-300 shadow-sm">-5%</button>
                                    <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 w-20 text-center">{goalTargetWellness}%</span>
                                    <button onClick={() => setGoalTargetWellness(prev => Math.min(100, prev + 5))} className="w-14 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 text-2xs text-slate-600 dark:text-slate-300 shadow-sm">+5%</button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Blood sugar controls */}
                            {isBloodSugar && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <div className="flex flex-col gap-1 text-left justify-center">
                                  <span className="text-4xs text-slate-400 uppercase font-black">Healthy Meals Completed (7 Days)</span>
                                  <span className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">{currentWeeklyMeals} meals</span>
                                </div>
                                <div className="flex flex-col gap-1 text-left">
                                  <span className="text-4xs text-slate-400 uppercase font-black">Adjust Weekly Target Goal</span>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <button onClick={() => setGoalTargetMeals(prev => Math.max(5, prev - 1))} className="w-12 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 text-2xs text-slate-600 dark:text-slate-300 shadow-sm">-1</button>
                                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 w-20 text-center">{goalTargetMeals} meals</span>
                                    <button onClick={() => setGoalTargetMeals(prev => Math.min(21, prev + 1))} className="w-12 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 text-2xs text-slate-600 dark:text-slate-300 shadow-sm">+1</button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Visual Progress Indicator */}
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <span className="text-3xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">VISUAL TARGET COVERAGE</span>
                              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{progressPct}% Met</span>
                            </div>
                            <div className="relative w-full h-4 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden border border-slate-200/40 dark:border-slate-700/30 shadow-inner">
                              <div 
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500 ease-out shadow-md"
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                            <span className="text-3xs text-slate-400 dark:text-slate-500 font-medium">
                              {progressDetails}
                            </span>
                          </div>

                          {/* Estimated Healthy Progress Info */}
                          <div className="flex gap-2.5 items-start bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10 text-left">
                            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                            <div className="flex flex-col gap-0.5">
                              <span className="text-3xs uppercase font-extrabold text-emerald-700 dark:text-emerald-400">ESTIMATED HEALTHY PACE</span>
                              <p className="text-2xs text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
                                {progressDescription}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Right: Motivational Milestones Card */}
                      <Card className="lg:col-span-4 border-slate-100 dark:border-slate-800 hover:shadow-md transition-all duration-300">
                        <CardContent className="p-6 flex flex-col gap-4 h-full text-left">
                          <div className="flex items-start justify-between">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-3xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Consistency</span>
                              <span className="text-sm font-bold text-slate-900 dark:text-white">Motivational Milestones</span>
                            </div>
                            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                              <Award className="w-5 h-5" />
                            </div>
                          </div>

                          <div className="flex flex-col gap-4 mt-2 flex-1 justify-center">
                            {milestones.map((milestone, idx) => {
                              // Calculate if milestone is reached based on percentage threshold
                              const threshold = idx === 0 ? 20 : idx === 1 ? 50 : 100;
                              const isReached = progressPct >= threshold;
                              
                              return (
                                <div key={idx} className="flex gap-3 items-start">
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 text-3xs font-extrabold ${isReached ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700'}`}>
                                    {isReached ? '✓' : idx + 1}
                                  </div>
                                  <div className="flex flex-col gap-0.5">
                                    <span className={`text-2xs font-extrabold ${isReached ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                                      {milestone.split(':')[0]}
                                    </span>
                                    <span className="text-3xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                                      {milestone.split(':')[1] || ''}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                );
              })()}

              {/* Personalized Daily Health Plan Section */}
              {(() => {
                const recs = profile ? generateRecommendations(profile) : null;
                const healthGoal = profile?.healthGoal || 'Improve Overall Health';

                const waterLitersGoal = recs?.waterIntake?.liters || 2.5;
                const waterCupsGoal = recs?.waterIntake?.cups || 10;
                const exerciseType = recs?.exercise?.type || 'Moderate Intensity Exercise';
                const exerciseDuration = recs?.exercise?.duration || '30 mins';

                // Locate existing bio-calculated recommendations for morning, lunch, dinner snacks
                const foodsList = recs?.foodsToEat || [];
                const breakfastFood = foodsList.find(f => f.category === 'Breakfast') || {
                  title: healthGoal === 'Weight Loss' ? 'Egg White & Vegetable Scramble' :
                         healthGoal === 'Weight Gain' ? 'Almond Butter Banana Toast' :
                         healthGoal === 'Muscle Gain' ? 'Greek Yogurt with Whey Protein & Berries' :
                         healthGoal === 'Heart Health' ? 'Steel-Cut Oats with Chia Seeds & Walnuts' :
                         healthGoal === 'Blood Sugar Control' ? 'Tofu Mushroom Scramble with Spinach' :
                         'Nutritious Fiber Oatmeal Bowl',
                  description: 'Rich in lean protein and essential macronutrients to support energy.'
                };

                const lunchFood = foodsList.find(f => f.category === 'Lunch') || {
                  title: healthGoal === 'Weight Loss' ? 'Grilled Chicken Breast Salad' :
                         healthGoal === 'Weight Gain' ? 'Quinoa Salmon Bowl with Avocado' :
                         healthGoal === 'Muscle Gain' ? 'Brown Rice with Lean Beef & Broccoli' :
                         healthGoal === 'Heart Health' ? 'Mediterranean Salad with Chickpeas' :
                         healthGoal === 'Blood Sugar Control' ? 'Baked Tempeh Bowl with Pumpkin Seeds' :
                         'Balanced Protein and Grain Medley',
                  description: 'Enforces glycemic control and supplies consistent mental energy.'
                };

                const dinnerFood = foodsList.find(f => f.category === 'Dinner') || {
                  title: healthGoal === 'Weight Loss' ? 'Baked Cod with Asparagus' :
                         healthGoal === 'Weight Gain' ? 'Stir-fried Beef with Rice & Bell Peppers' :
                         healthGoal === 'Muscle Gain' ? 'Pan-Seared Salmon with Sweet Potato' :
                         healthGoal === 'Heart Health' ? 'Pan-Seared Salmon with Steamed Spinach' :
                         healthGoal === 'Blood Sugar Control' ? 'Grilled Salmon with Zucchini' :
                         'Light Lean Protein and Greens',
                  description: 'Promotes muscle tissue recovery and rest-state homeostasis.'
                };

                const snackFood = foodsList.find(f => f.category === 'Healthy Snacks') || {
                  title: 'Raw Almonds & Fresh Blueberries',
                  description: 'Polished trace mineral support without blood sugar spike.'
                };

                // Formulate 4 beautiful plans
                const morningPlan = {
                  title: 'Morning Routine',
                  time: '06:00 AM - 12:00 PM',
                  gradient: 'from-amber-500/10 via-orange-500/5 to-transparent',
                  border: 'border-orange-500/20',
                  icon: <Sunrise className="w-5 h-5 text-amber-500" />,
                  hydration: `Drink 2 cups of water (${Math.round(waterLitersGoal * 1000 / waterCupsGoal * 2)}ml) post-waking.`,
                  meal: breakfastFood.title,
                  activity: healthGoal === 'Blood Sugar Control' ? 'Fasting blood sugar test.' : healthGoal === 'Weight Loss' ? 'Morning weight check.' : '5-minute activation stretch.',
                  benefit: healthGoal === 'Blood Sugar Control' ? 'Establishes morning glycemic stability.' : healthGoal === 'Weight Loss' ? 'Fosters early fat oxidation.' : 'Triggers metabolism and maintains cellular hydration.',
                  completed: planCompletedMorning,
                  toggle: () => setPlanCompletedMorning(!planCompletedMorning)
                };

                const afternoonPlan = {
                  title: 'Afternoon Routine',
                  time: '12:00 PM - 05:00 PM',
                  gradient: 'from-sky-500/10 via-blue-500/5 to-transparent',
                  border: 'border-sky-500/20',
                  icon: <Sun className="w-5 h-5 text-sky-500" />,
                  hydration: `Sip on ${Math.round(waterCupsGoal / 3)} cups of water.`,
                  meal: lunchFood.title,
                  activity: '5-minute stand-and-stretch break.',
                  benefit: healthGoal === 'Blood Sugar Control' ? 'Keeps blood sugar stable and avoids energy dips.' : healthGoal === 'Heart Health' ? 'Lowers vascular pressure and improves circulation.' : 'Replenishes vital nutrients to maintain afternoon energy.',
                  completed: planCompletedAfternoon,
                  toggle: () => setPlanCompletedAfternoon(!planCompletedAfternoon)
                };

                const eveningPlan = {
                  title: 'Evening Routine',
                  time: '05:00 PM - 09:00 PM',
                  gradient: 'from-rose-500/10 via-purple-500/5 to-transparent',
                  border: 'border-rose-500/20',
                  icon: <Sunset className="w-5 h-5 text-rose-500" />,
                  hydration: 'Drink 1-2 cups of water post-exercise.',
                  meal: dinnerFood.title,
                  activity: `Complete ${exerciseDuration} of ${exerciseType}.`,
                  benefit: healthGoal === 'Weight Loss' ? 'Enhances post-exercise nighttime fat burn.' : healthGoal === 'Muscle Gain' ? 'Triggers overnight muscular hypertrophy and repair.' : 'Promotes nighttime muscle recovery and cardiorespiratory rest.',
                  completed: planCompletedEvening,
                  toggle: () => setPlanCompletedEvening(!planCompletedEvening)
                };

                const nightPlan = {
                  title: 'Night Routine',
                  time: '09:00 PM - 06:00 AM',
                  gradient: 'from-indigo-500/10 via-slate-500/5 to-transparent',
                  border: 'border-indigo-500/20',
                  icon: <Moon className="w-5 h-5 text-indigo-500" />,
                  hydration: 'Discontinue fluids 1 hour prior to sleep.',
                  meal: snackFood ? snackFood.title : 'Maintain fasting window.',
                  activity: `Get ${profile?.sleepDuration || '6 to 8 hours'} of sleep.`,
                  benefit: healthGoal === 'Weight Loss' ? 'Improves leptin sensitivity and limits cravings.' : healthGoal === 'Blood Sugar Control' ? 'Assists liver glucose regulation overnight.' : 'Ensures deep restful sleep for hormone balance.',
                  completed: planCompletedNight,
                  toggle: () => setPlanCompletedNight(!planCompletedNight)
                };

                const routines = [morningPlan, afternoonPlan, eveningPlan, nightPlan];
                const totalChecked = [planCompletedMorning, planCompletedAfternoon, planCompletedEvening, planCompletedNight].filter(Boolean).length;
                const overallCompletionPct = Math.round((totalChecked / 4) * 100);

                return (
                  <div className="flex flex-col gap-4 text-left border-t border-slate-100 dark:border-slate-800/60 pt-8 mt-6 animate-fade-in" id="daily-health-timeline-section">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/60 pb-3.5 mb-2">
                      <div>
                        <h3 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                          <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          Personalized Daily Health Plan
                        </h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                          Chronological wellness schedule optimized for your goal target ({healthGoal}).
                        </p>
                      </div>

                      {/* Overall Checklist Progress Tracker */}
                      <div className="flex items-center gap-3.5 bg-slate-50 dark:bg-slate-900/40 px-4 py-2 rounded-2xl border border-slate-100 dark:border-slate-800/60 w-fit">
                        <div className="flex flex-col items-end">
                          <span className="text-4xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">Today's Momentum</span>
                          <span className="text-xs font-extrabold text-slate-900 dark:text-white">{overallCompletionPct}% Completed</span>
                        </div>
                        <div className="relative w-11 h-11 flex items-center justify-center">
                          {/* Radial Progress Ring */}
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="22" cy="22" r="16" stroke="currentColor" strokeWidth="3.5" fill="transparent" className="text-slate-100 dark:text-slate-800/60" />
                            <circle cx="22" cy="22" r="16" stroke="currentColor" strokeWidth="3.5" fill="transparent" strokeDasharray={2 * Math.PI * 16} strokeDashoffset={2 * Math.PI * 16 * (1 - overallCompletionPct / 100)} className="text-emerald-500 transition-all duration-500" />
                          </svg>
                          <span className="absolute text-3xs font-extrabold text-emerald-600 dark:text-emerald-400">{totalChecked}/4</span>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Grid layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="timeline-routine-grid">
                      {routines.map((routine, idx) => (
                        <Card 
                          key={idx} 
                          id={`timeline-card-${idx}`}
                          className={`relative border overflow-hidden group hover:shadow-md transition-all duration-300 ${routine.completed ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20' : `border-slate-100 dark:border-slate-800`}`}
                        >
                          {/* Subtle time-of-day gradient strip at top */}
                          <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${routine.completed ? 'from-emerald-500 to-teal-500' : routine.gradient.split(' ')[1] + ' ' + routine.gradient.split(' ')[2]}`} />

                          <CardContent className="p-5 pt-6 flex flex-col gap-4 h-full">
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex gap-2.5 items-center">
                                <div className={`p-2 rounded-xl flex items-center justify-center ${routine.completed ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-500'}`}>
                                  {routine.completed ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : routine.icon}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs font-black text-slate-950 dark:text-white leading-tight">{routine.title}</span>
                                  <span className="text-4xs text-slate-400 dark:text-slate-500 font-extrabold tracking-widest uppercase">{routine.time}</span>
                                </div>
                              </div>

                              {/* Interactive checkmark toggle */}
                              <button 
                                onClick={routine.toggle} 
                                className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all duration-300 shadow-sm ${routine.completed ? 'bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-transparent hover:border-emerald-400 hover:text-emerald-400/50'}`}
                              >
                                <span className="text-xs font-black select-none">✓</span>
                              </button>
                            </div>

                            {/* Timeline steps */}
                            <div className="flex flex-col gap-3 my-1 flex-1 text-left">
                              {/* Hydration */}
                              <div className="flex gap-2.5 items-start">
                                <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${routine.completed ? 'bg-emerald-500' : 'bg-blue-400 dark:bg-blue-500'}`} />
                                <div className="flex flex-col">
                                  <span className="text-4xs uppercase font-black tracking-widest text-slate-400 dark:text-slate-500">Hydration</span>
                                  <p className={`text-2xs font-semibold leading-relaxed ${routine.completed ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-700 dark:text-slate-300'}`}>
                                    {routine.hydration}
                                  </p>
                                </div>
                              </div>

                              {/* Meal */}
                              <div className="flex gap-2.5 items-start">
                                <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${routine.completed ? 'bg-emerald-500' : 'bg-emerald-500'}`} />
                                <div className="flex flex-col">
                                  <span className="text-4xs uppercase font-black tracking-widest text-slate-400 dark:text-slate-500">Meal</span>
                                  <p className={`text-2xs font-bold leading-relaxed ${routine.completed ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-900 dark:text-slate-100'}`}>
                                    {routine.meal}
                                  </p>
                                </div>
                              </div>

                              {/* Activity */}
                              <div className="flex gap-2.5 items-start">
                                <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${routine.completed ? 'bg-emerald-500' : 'bg-orange-400 dark:bg-orange-500'}`} />
                                <div className="flex flex-col">
                                  <span className="text-4xs uppercase font-black tracking-widest text-slate-400 dark:text-slate-500">Activity</span>
                                  <p className={`text-2xs font-semibold leading-relaxed ${routine.completed ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-700 dark:text-slate-300'}`}>
                                    {routine.activity}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Clinical Benefit */}
                            <div className="pt-3 border-t border-dashed border-slate-100 dark:border-slate-800">
                              <p className={`text-3xs font-medium leading-normal ${routine.completed ? 'text-slate-400 dark:text-slate-500 italic' : 'text-emerald-700 dark:text-emerald-400'}`}>
                                <span className="font-bold">Clinical Benefit: </span>{routine.benefit}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })()}

              </div>

              {/* RIGHT COLUMN: Sidebar (4 cols) */}
              <div className="lg:col-span-4 flex flex-col gap-6 sticky top-24 animate-fade-in" id="overview-sidebar">
                
                {/* Biological Parameters Header */}
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3 text-left">
                  <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Biological Parameters
                  </h3>
                  <p className="text-4xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">
                    Sync Status: Fully Synced
                  </p>
                </div>

                {/* Bio Grid Cards */}
                <div className="grid grid-cols-2 gap-4" id="overview-bio-grid">
                
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
              <Card hoverable className="border-slate-100 dark:border-slate-800 shadow-xs flex flex-col justify-between text-left animate-fade-in" id="allergen-simulator-card">
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

                <Card hoverable className="border-slate-100 dark:border-slate-800 shadow-xs flex flex-col justify-between text-left animate-fade-in" id="educational-links-card">
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
