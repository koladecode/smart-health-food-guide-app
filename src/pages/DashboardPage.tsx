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
  ShieldCheck,
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
  Clock,
  UtensilsCrossed,
  Lightbulb,
  Stethoscope,
  Users,
  UserPlus,
  Server,
  RefreshCw,
  Zap,
  Database,
  Trophy,
  Trash2,
  Play,
  BarChart3
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
import { DashboardSkeleton } from '../components/Skeleton';
import AdminUsersManagement from '../components/AdminUsersManagement';
import AdminFoodManagement from '../components/AdminFoodManagement';
import AdminExerciseManagement, { ManagedExercise } from '../components/AdminExerciseManagement';
import AdminRecommendationsManagement from '../components/AdminRecommendationsManagement';
import AdminDiseasesManagement from '../components/AdminDiseasesManagement';

type ActiveTab = 'overview' | 'nutrition' | 'fitness' | 'admin' | 'admin-food' | 'admin-exercise' | 'admin-recommendations' | 'admin-diseases';

export interface WorkoutLog {
  id: string;
  exerciseId?: string;
  name: string;
  category: string;
  duration: number;
  caloriesBurned: number;
  date: string;
  timestamp: string;
  difficulty?: string;
  notes?: string;
}

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

  // Extra modal workout fields
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('custom');
  const [workoutCategory, setWorkoutCategory] = useState<string>('Cardio');
  const [workoutCalories, setWorkoutCalories] = useState<string>('150');
  const [workoutDifficulty, setWorkoutDifficulty] = useState<string>('Beginner');

  // Workout Logs State
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>(() => {
    try {
      const uKey = user?.id ? `smart_health_guide_logged_workouts_${user.id}` : 'smart_health_guide_logged_workouts';
      const saved = localStorage.getItem(uKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {}

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const twoDaysAgo = new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0];
    const threeDaysAgo = new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0];

    return [
      {
        id: 'log-1',
        exerciseId: 'ex-101',
        name: 'Low-Impact Brisk Walking',
        category: 'Cardio',
        duration: 30,
        caloriesBurned: 140,
        date: todayStr,
        timestamp: '08:30 AM',
        difficulty: 'Beginner',
        notes: 'Continuous morning walk around neighborhood park.'
      },
      {
        id: 'log-2',
        exerciseId: 'ex-105',
        name: 'Yoga & Mindful Stretching',
        category: 'Flexibility',
        duration: 20,
        caloriesBurned: 85,
        date: todayStr,
        timestamp: '05:15 PM',
        difficulty: 'Beginner',
        notes: 'Diaphragmatic breathing and spinal decompression.'
      },
      {
        id: 'log-3',
        exerciseId: 'ex-103',
        name: 'Bodyweight Squats & Wall Pushes',
        category: 'Strength Training',
        duration: 25,
        caloriesBurned: 120,
        date: yesterday,
        timestamp: '09:00 AM',
        difficulty: 'Intermediate',
        notes: 'Completed 3 sets of bodyweight squats.'
      },
      {
        id: 'log-4',
        exerciseId: 'ex-104',
        name: 'Swimming & Water Aerobics',
        category: 'Cardio',
        duration: 40,
        caloriesBurned: 280,
        date: twoDaysAgo,
        timestamp: '10:00 AM',
        difficulty: 'Intermediate',
        notes: 'Low impact joint resistance in heated pool.'
      },
      {
        id: 'log-5',
        exerciseId: 'ex-102',
        name: 'Chair Aerobics & Gentle Mobility',
        category: 'Rehab & Recovery',
        duration: 15,
        caloriesBurned: 75,
        date: threeDaysAgo,
        timestamp: '02:30 PM',
        difficulty: 'Beginner',
        notes: 'Upper body rotations and seated knee lifts.'
      }
    ];
  });

  // Managed exercises state from Exercise Management
  const [managedExercisesList, setManagedExercisesList] = useState<ManagedExercise[]>([]);

  const refreshFitnessData = React.useCallback(() => {
    try {
      const savedEx = localStorage.getItem('smart_health_guide_managed_exercises');
      if (savedEx) {
        setManagedExercisesList(JSON.parse(savedEx));
      } else {
        setManagedExercisesList([
          {
            id: 'ex-101',
            name: 'Low-Impact Brisk Walking',
            category: 'Cardio',
            difficulty: 'Beginner',
            duration: '30 mins',
            targetBodyArea: 'Cardiovascular System',
            healthGoal: 'Heart Health',
            compatibleConditions: ['Hypertension Safe', 'Heart Healthy', 'Diabetes Friendly'],
            status: 'Active',
            caloriesBurned: 140,
            description: 'Gentle aerobic walking to support blood flow.',
            createdAt: '2026-01-10'
          },
          {
            id: 'ex-102',
            name: 'Chair Aerobics & Gentle Mobility',
            category: 'Rehab & Recovery',
            difficulty: 'Beginner',
            duration: '15 mins',
            targetBodyArea: 'Full Body',
            healthGoal: 'Mobility & Joint Health',
            compatibleConditions: ['Hypertension Safe', 'Arthritis Gentle'],
            status: 'Active',
            caloriesBurned: 75,
            description: 'Seated upper and lower body movements for joint health.',
            createdAt: '2026-01-15'
          },
          {
            id: 'ex-103',
            name: 'Bodyweight Squats & Wall Pushes',
            category: 'Strength Training',
            difficulty: 'Intermediate',
            duration: '20 mins',
            targetBodyArea: 'Lower Body & Core',
            healthGoal: 'Muscle Strength',
            compatibleConditions: ['Diabetes Friendly', 'Osteoporosis Safe'],
            status: 'Active',
            caloriesBurned: 110,
            description: 'Controlled squats and wall push-ups.',
            createdAt: '2026-01-20'
          },
          {
            id: 'ex-104',
            name: 'Swimming & Water Aerobics',
            category: 'Cardio',
            difficulty: 'Intermediate',
            duration: '40 mins',
            targetBodyArea: 'Full Body',
            healthGoal: 'Full Body Endurance',
            compatibleConditions: ['Arthritis Gentle', 'Low Back Pain Safe'],
            status: 'Active',
            caloriesBurned: 280,
            description: 'Buoyant water resistance exercise.',
            createdAt: '2026-01-22'
          },
          {
            id: 'ex-105',
            name: 'Yoga & Mindful Stretching',
            category: 'Flexibility',
            difficulty: 'Beginner',
            duration: '25 mins',
            targetBodyArea: 'Spine & Core',
            healthGoal: 'Stress Reduction & Flexibility',
            compatibleConditions: ['Hypertension Safe', 'Low Back Pain Safe'],
            status: 'Active',
            caloriesBurned: 90,
            description: 'Gentle spinal lengthening and mindful breathing.',
            createdAt: '2026-01-25'
          }
        ]);
      }
    } catch (e) {}
  }, []);

  React.useEffect(() => {
    refreshFitnessData();
  }, [activeTab, refreshFitnessData]);

  React.useEffect(() => {
    const uKey = user?.id ? `smart_health_guide_logged_workouts_${user.id}` : 'smart_health_guide_logged_workouts';
    localStorage.setItem(uKey, JSON.stringify(workoutLogs));
  }, [workoutLogs, user?.id]);

  // Allergen warning interaction states
  const [selectedAllergen, setSelectedAllergen] = useState('none');
  const [hasAllergyAlert, setHasAllergyAlert] = useState(false);

  // Admin stats state
  const [adminStats, setAdminStats] = useState(() => {
    let usersCount = 5;
    let foodsCount = 10;
    let exercisesCount = 10;
    let recsCount = 8;
    let diseasesCount = 8;

    try {
      const u = localStorage.getItem('smart_health_guide_managed_users');
      if (u) usersCount = JSON.parse(u).length;
    } catch (e) {}

    try {
      const f = localStorage.getItem('smart_health_guide_managed_foods');
      if (f) foodsCount = JSON.parse(f).length;
    } catch (e) {}

    try {
      const ex = localStorage.getItem('smart_health_guide_managed_exercises');
      if (ex) exercisesCount = JSON.parse(ex).length;
    } catch (e) {}

    try {
      const r = localStorage.getItem('smart_health_guide_managed_recommendations');
      if (r) recsCount = JSON.parse(r).length;
    } catch (e) {}

    try {
      const d = localStorage.getItem('smart_health_guide_managed_diseases');
      if (d) diseasesCount = JSON.parse(d).length;
    } catch (e) {}

    return { usersCount, foodsCount, exercisesCount, recsCount, diseasesCount };
  });

  const refreshAdminStats = React.useCallback(() => {
    let usersCount = 5;
    let foodsCount = 10;
    let exercisesCount = 10;
    let recsCount = 8;
    let diseasesCount = 8;

    try {
      const u = localStorage.getItem('smart_health_guide_managed_users');
      if (u) usersCount = JSON.parse(u).length;
    } catch (e) {}

    try {
      const f = localStorage.getItem('smart_health_guide_managed_foods');
      if (f) foodsCount = JSON.parse(f).length;
    } catch (e) {}

    try {
      const ex = localStorage.getItem('smart_health_guide_managed_exercises');
      if (ex) exercisesCount = JSON.parse(ex).length;
    } catch (e) {}

    try {
      const r = localStorage.getItem('smart_health_guide_managed_recommendations');
      if (r) recsCount = JSON.parse(r).length;
    } catch (e) {}

    try {
      const d = localStorage.getItem('smart_health_guide_managed_diseases');
      if (d) diseasesCount = JSON.parse(d).length;
    } catch (e) {}

    setAdminStats({ usersCount, foodsCount, exercisesCount, recsCount, diseasesCount });
  }, []);

  React.useEffect(() => {
    refreshAdminStats();
  }, [activeTab, refreshAdminStats]);

  // Local states for goal tracker adjustments
  const uSuffix = user?.id ? `_${user.id}` : '';

  const [goalStartWeight, setGoalStartWeight] = useState<number>(() => {
    const saved = localStorage.getItem(`health_goal_weight_start${uSuffix}`);
    if (saved) return parseFloat(saved);
    return profile?.weight ? Number(profile.weight) : 80;
  });
  const [goalCurrentWeight, setGoalCurrentWeight] = useState<number>(() => {
    const saved = localStorage.getItem(`health_goal_weight_current${uSuffix}`);
    if (saved) return parseFloat(saved);
    return profile?.weight ? Number(profile.weight) : 80;
  });
  const [goalTargetWeight, setGoalTargetWeight] = useState<number>(() => {
    const saved = localStorage.getItem(`health_goal_weight_target${uSuffix}`);
    if (saved) return parseFloat(saved);
    const w = profile?.weight ? Number(profile.weight) : 80;
    const g = profile?.healthGoal || 'Improve Overall Health';
    if (g === 'Weight Gain' || g === 'Gain Weight') return w + 5;
    return w - 5;
  });

  const [goalTargetExercise, setGoalTargetExercise] = useState<number>(() => {
    const saved = localStorage.getItem(`health_goal_exercise_target${uSuffix}`);
    return saved ? parseInt(saved, 10) : 150;
  });

  const [goalTargetWellness, setGoalTargetWellness] = useState<number>(() => {
    const saved = localStorage.getItem(`health_goal_wellness_target${uSuffix}`);
    return saved ? parseInt(saved, 10) : 85;
  });

  const [goalTargetMeals, setGoalTargetMeals] = useState<number>(() => {
    const saved = localStorage.getItem(`health_goal_meals_target${uSuffix}`);
    return saved ? parseInt(saved, 10) : 18;
  });

  // Keep goal weights in sync with profile updates
  React.useEffect(() => {
    if (profile && profile.weight) {
      const w = Number(profile.weight);
      if (!localStorage.getItem(`health_goal_weight_start${uSuffix}`)) {
        setGoalStartWeight(w);
      }
      if (!localStorage.getItem(`health_goal_weight_current${uSuffix}`)) {
        setGoalCurrentWeight(w);
      }
      if (!localStorage.getItem(`health_goal_weight_target${uSuffix}`)) {
        const g = profile.healthGoal;
        if (g === 'Weight Gain' || g === 'Gain Weight') {
          setGoalTargetWeight(w + 5);
        } else {
          setGoalTargetWeight(w - 5);
        }
      }
    }
  }, [profile, uSuffix]);

  // Persist goal changes to local storage
  React.useEffect(() => {
    localStorage.setItem(`health_goal_weight_start${uSuffix}`, goalStartWeight.toString());
  }, [goalStartWeight, uSuffix]);

  React.useEffect(() => {
    localStorage.setItem(`health_goal_weight_current${uSuffix}`, goalCurrentWeight.toString());
  }, [goalCurrentWeight, uSuffix]);

  React.useEffect(() => {
    localStorage.setItem(`health_goal_weight_target${uSuffix}`, goalTargetWeight.toString());
  }, [goalTargetWeight, uSuffix]);

  React.useEffect(() => {
    localStorage.setItem(`health_goal_exercise_target${uSuffix}`, goalTargetExercise.toString());
  }, [goalTargetExercise, uSuffix]);

  React.useEffect(() => {
    localStorage.setItem(`health_goal_wellness_target${uSuffix}`, goalTargetWellness.toString());
  }, [goalTargetWellness, uSuffix]);

  React.useEffect(() => {
    localStorage.setItem(`health_goal_meals_target${uSuffix}`, goalTargetMeals.toString());
  }, [goalTargetMeals, uSuffix]);

  // Daily Plan Completion States
  const [planCompletedMorning, setPlanCompletedMorning] = useState(() => {
    return localStorage.getItem(`health_plan_completed_morning${uSuffix}`) === 'true';
  });
  const [planCompletedAfternoon, setPlanCompletedAfternoon] = useState(() => {
    return localStorage.getItem(`health_plan_completed_afternoon${uSuffix}`) === 'true';
  });
  const [planCompletedEvening, setPlanCompletedEvening] = useState(() => {
    return localStorage.getItem(`health_plan_completed_evening${uSuffix}`) === 'true';
  });
  const [planCompletedNight, setPlanCompletedNight] = useState(() => {
    return localStorage.getItem(`health_plan_completed_night${uSuffix}`) === 'true';
  });

  React.useEffect(() => {
    localStorage.setItem(`health_plan_completed_morning${uSuffix}`, planCompletedMorning.toString());
  }, [planCompletedMorning, uSuffix]);

  React.useEffect(() => {
    localStorage.setItem(`health_plan_completed_afternoon${uSuffix}`, planCompletedAfternoon.toString());
  }, [planCompletedAfternoon, uSuffix]);

  React.useEffect(() => {
    localStorage.setItem(`health_plan_completed_evening${uSuffix}`, planCompletedEvening.toString());
  }, [planCompletedEvening, uSuffix]);

  React.useEffect(() => {
    localStorage.setItem(`health_plan_completed_night${uSuffix}`, planCompletedNight.toString());
  }, [planCompletedNight, uSuffix]);

  // Daily Tracking States
  const WATER_KEY = `health_tracker_water${uSuffix}`;
  const WATER_TARGET_KEY = `health_tracker_water_target${uSuffix}`;
  const EXERCISE_KEY = `health_tracker_exercise${uSuffix}`;
  const EXERCISE_TARGET_KEY = `health_tracker_exercise_target${uSuffix}`;
  const MEAL_BREAKFAST_KEY = `health_tracker_meal_breakfast${uSuffix}`;
  const MEAL_LUNCH_KEY = `health_tracker_meal_lunch${uSuffix}`;
  const MEAL_DINNER_KEY = `health_tracker_meal_dinner${uSuffix}`;

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

  // Re-synchronize state whenever active user switches
  React.useEffect(() => {
    if (!user?.id) return;

    try {
      const savedLogs = localStorage.getItem(`smart_health_guide_logged_workouts_${user.id}`);
      if (savedLogs) setWorkoutLogs(JSON.parse(savedLogs));
    } catch (e) {}

    const savedStart = localStorage.getItem(`health_goal_weight_start_${user.id}`);
    if (savedStart) setGoalStartWeight(parseFloat(savedStart));
    else if (profile?.weight) setGoalStartWeight(Number(profile.weight));

    const savedCurrent = localStorage.getItem(`health_goal_weight_current_${user.id}`);
    if (savedCurrent) setGoalCurrentWeight(parseFloat(savedCurrent));
    else if (profile?.weight) setGoalCurrentWeight(Number(profile.weight));

    const savedTarget = localStorage.getItem(`health_goal_weight_target_${user.id}`);
    if (savedTarget) setGoalTargetWeight(parseFloat(savedTarget));
    else if (profile?.weight) {
      const w = Number(profile.weight);
      const g = profile.healthGoal || 'Improve Overall Health';
      setGoalTargetWeight(g === 'Weight Gain' || g === 'Gain Weight' ? w + 5 : w - 5);
    }

    const savedExGoal = localStorage.getItem(`health_goal_exercise_target_${user.id}`);
    if (savedExGoal) setGoalTargetExercise(parseInt(savedExGoal, 10));

    const savedWellGoal = localStorage.getItem(`health_goal_wellness_target_${user.id}`);
    if (savedWellGoal) setGoalTargetWellness(parseInt(savedWellGoal, 10));

    const savedMealGoal = localStorage.getItem(`health_goal_meals_target_${user.id}`);
    if (savedMealGoal) setGoalTargetMeals(parseInt(savedMealGoal, 10));

    setPlanCompletedMorning(localStorage.getItem(`health_plan_completed_morning_${user.id}`) === 'true');
    setPlanCompletedAfternoon(localStorage.getItem(`health_plan_completed_afternoon_${user.id}`) === 'true');
    setPlanCompletedEvening(localStorage.getItem(`health_plan_completed_evening_${user.id}`) === 'true');
    setPlanCompletedNight(localStorage.getItem(`health_plan_completed_night_${user.id}`) === 'true');

    const savedWater = localStorage.getItem(`health_tracker_water_${user.id}`);
    setWaterIntake(savedWater ? parseInt(savedWater, 10) : 1000);

    const savedWaterTarget = localStorage.getItem(`health_tracker_water_target_${user.id}`);
    setWaterTarget(savedWaterTarget ? parseInt(savedWaterTarget, 10) : 2500);

    const savedExercise = localStorage.getItem(`health_tracker_exercise_${user.id}`);
    setExerciseProgress(savedExercise ? parseInt(savedExercise, 10) : 15);

    const savedExerciseTarget = localStorage.getItem(`health_tracker_exercise_target_${user.id}`);
    setExerciseTarget(savedExerciseTarget ? parseInt(savedExerciseTarget, 10) : 30);

    setMealBreakfast(localStorage.getItem(`health_tracker_meal_breakfast_${user.id}`) === 'true');
    setMealLunch(localStorage.getItem(`health_tracker_meal_lunch_${user.id}`) === 'true');
    setMealDinner(localStorage.getItem(`health_tracker_meal_dinner_${user.id}`) === 'true');

    const savedHist = localStorage.getItem(`health_tracker_history_${user.id}`);
    if (savedHist) {
      try {
        setHistory(JSON.parse(savedHist));
      } catch (e) {}
    }
  }, [user?.id, profile]);

  // Effects to synchronize tracker state to localStorage
  React.useEffect(() => {
    localStorage.setItem(WATER_KEY, waterIntake.toString());
  }, [waterIntake, WATER_KEY]);

  React.useEffect(() => {
    localStorage.setItem(WATER_TARGET_KEY, waterTarget.toString());
  }, [waterTarget, WATER_TARGET_KEY]);

  React.useEffect(() => {
    localStorage.setItem(EXERCISE_KEY, exerciseProgress.toString());
  }, [exerciseProgress, EXERCISE_KEY]);

  React.useEffect(() => {
    localStorage.setItem(EXERCISE_TARGET_KEY, exerciseTarget.toString());
  }, [exerciseTarget, EXERCISE_TARGET_KEY]);

  React.useEffect(() => {
    localStorage.setItem(MEAL_BREAKFAST_KEY, mealBreakfast.toString());
  }, [mealBreakfast, MEAL_BREAKFAST_KEY]);

  React.useEffect(() => {
    localStorage.setItem(MEAL_LUNCH_KEY, mealLunch.toString());
  }, [mealLunch, MEAL_LUNCH_KEY]);

  React.useEffect(() => {
    localStorage.setItem(MEAL_DINNER_KEY, mealDinner.toString());
  }, [mealDinner, MEAL_DINNER_KEY]);

  // Daily Progress History State
  const HISTORY_KEY = `health_tracker_history${uSuffix}`;
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
    { id: 'overview', label: 'Admin Control Center', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'nutrition', label: 'Nutrition & Meals', icon: <Apple className="w-5 h-5" /> },
    { id: 'fitness', label: 'Fitness & Motion', icon: <Activity className="w-5 h-5" /> },
    { id: 'admin', label: 'Admin Users', icon: <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" /> },
    { id: 'admin-food', label: 'Food Management', icon: <UtensilsCrossed className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> },
    { id: 'admin-exercise', label: 'Exercise Management', icon: <Dumbbell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> },
    { id: 'admin-recommendations', label: 'Recommendations', icon: <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400" /> },
    { id: 'admin-diseases', label: 'Diseases & Conditions', icon: <Stethoscope className="w-5 h-5 text-rose-600 dark:text-rose-400" /> },
  ];

  const handleCreateWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workoutName.trim()) return;
    setIsSavingWorkout(true);
    
    setTimeout(() => {
      setIsSavingWorkout(false);
      setIsModalOpen(false);
      
      const durationNum = parseInt(workoutDuration, 10) || 30;
      const caloriesNum = parseInt(workoutCalories, 10) || Math.round(durationNum * 5.5);
      const todayStr = new Date().toISOString().split('T')[0];

      const newLog: WorkoutLog = {
        id: `log-${Date.now()}`,
        exerciseId: selectedExerciseId !== 'custom' ? selectedExerciseId : undefined,
        name: workoutName.trim(),
        category: workoutCategory || 'Cardio',
        duration: durationNum,
        caloriesBurned: caloriesNum,
        date: todayStr,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        difficulty: workoutDifficulty || 'Beginner',
        notes: workoutNotes.trim() || undefined
      };

      setWorkoutLogs(prev => [newLog, ...prev]);
      setExerciseProgress(prev => prev + durationNum);

      // Reset
      setWorkoutName('');
      setWorkoutDuration('30');
      setWorkoutCategory('Cardio');
      setWorkoutCalories('150');
      setWorkoutDifficulty('Beginner');
      setWorkoutNotes('');
      setSelectedExerciseId('custom');

      setToastMessage(`Recorded "${newLog.name}" (${durationNum} mins, ~${caloriesNum} kcal) in your activity log.`);
      setTimeout(() => setToastMessage(null), 4000);
    }, 800);
  };

  const handleQuickLogManagedExercise = (ex: ManagedExercise) => {
    const durationNum = parseInt(ex.duration.replace(/\D/g, ''), 10) || 30;
    const caloriesNum = ex.caloriesBurned || Math.round(durationNum * 5.5);
    const todayStr = new Date().toISOString().split('T')[0];

    const newLog: WorkoutLog = {
      id: `log-${Date.now()}`,
      exerciseId: ex.id,
      name: ex.name,
      category: ex.category,
      duration: durationNum,
      caloriesBurned: caloriesNum,
      date: todayStr,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      difficulty: ex.difficulty,
      notes: `Quick logged from Exercise Management library (${ex.targetBodyArea}).`
    };

    setWorkoutLogs(prev => [newLog, ...prev]);
    setExerciseProgress(prev => prev + durationNum);

    setToastMessage(`Logged "${ex.name}" (${durationNum} mins, ~${caloriesNum} kcal) from Exercise Management!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleDeleteWorkoutLog = (logId: string) => {
    const logToDelete = workoutLogs.find(l => l.id === logId);
    setWorkoutLogs(prev => prev.filter(l => l.id !== logId));
    if (logToDelete && logToDelete.date === new Date().toISOString().split('T')[0]) {
      setExerciseProgress(prev => Math.max(0, prev - logToDelete.duration));
    }
    setToastMessage('Workout entry deleted from activity history.');
    setTimeout(() => setToastMessage(null), 3000);
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
    return <DashboardSkeleton />;
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
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-6 py-4 flex items-center justify-between gap-4 transition-all duration-300" id="dashboard-header">
          <div className="flex items-center gap-3">
            <button
              id="dashboard-sidebar-toggle"
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors md:hidden"
              aria-label="Toggle Navigation Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden md:flex flex-col">
              <span className="text-2xs font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Control Center</span>
              <h1 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                {menuItems.find(i => i.id === activeTab)?.label || 'Health Overview'}
              </h1>
            </div>
          </div>
          
          <div 
            className="flex items-center gap-3 p-1.5 pl-3.5 pr-2 bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800/80 rounded-2xl cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-900/80 hover:border-slate-300/80 transition-all duration-200 shadow-3xs" 
            id="header-user-status"
            onClick={() => navigateTo(profile ? 'profile-summary' : 'profile-form')}
            title="View Profile Summary"
          >
            <div className="text-right hidden sm:block">
              <p className="text-3xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Active Account</p>
              <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">{userBio.name}</p>
            </div>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20" id="header-bell-badge">
              <Award className="w-4 h-4" />
            </div>
          </div>
        </header>

        {/* Core Dashboard Body Panel */}
        <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto flex flex-col gap-8" id="dashboard-body">
          
          {/* MANDATORY Medical Disclaimer Alert Container */}
          <Alert variant="disclaimer" title="Educational Nutrition Disclaimer" id="dashboard-disclaimer-alert">
            Based on the information you provided, these recommendations are for educational purposes only and are not medical advice. Always consult a qualified healthcare professional before making health-related decisions.
          </Alert>

          {/* TAB 1: Admin Control Center & Health Overview Panel */}
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-8 animate-fade-in" id="tab-overview-content">
              
              {/* PRIMARY ADMIN CONTROL CENTER HEADER */}
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl border border-indigo-500/20" id="admin-control-center-banner">
                <div className="flex flex-col gap-2 max-w-2xl text-left">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-3xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Live System Active
                    </span>
                    <span className="text-2xs font-extrabold text-slate-400 uppercase tracking-widest">Master Admin Control Center</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    System Control & Analytics Center
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                    Real-time entity counts, rapid administrative creation shortcuts, system status monitoring, and clinical audit activity streams.
                  </p>
                </div>

                <div className="flex items-center gap-3 self-stretch sm:self-auto">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<RefreshCw className="w-3.5 h-3.5" />}
                    onClick={refreshAdminStats}
                    className="bg-slate-800 text-slate-200 hover:bg-slate-700 font-extrabold text-xs h-10 border border-slate-700 rounded-xl"
                  >
                    Refresh Sync
                  </Button>
                </div>
              </div>

              {/* DASHBOARD WIDGETS: Responsive KPI Grid */}
              <div className="flex flex-col gap-3 text-left" id="admin-widgets-section">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Entity Metrics & Repository Totals
                  </h3>
                  <span className="text-3xs font-extrabold uppercase text-slate-400 tracking-wider">5 Managed Repositories</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4" id="admin-kpi-widgets-grid">
                  
                  {/* Total Users Widget */}
                  <Card
                    id="widget-total-users"
                    onClick={() => setActiveTab('admin')}
                    className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-3xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl cursor-pointer group"
                  >
                    <CardContent className="p-5 flex flex-col justify-between h-full gap-3 text-left">
                      <div className="flex items-start justify-between">
                        <span className="text-3xs uppercase font-black tracking-wider text-purple-600 dark:text-purple-400">
                          Total Users
                        </span>
                        <div className="p-2.5 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-xl border border-purple-100 dark:border-purple-900/30 group-hover:scale-110 transition-transform">
                          <Users className="w-5 h-5" />
                        </div>
                      </div>
                      <div>
                        <span className="text-3xl font-black text-slate-900 dark:text-white">{adminStats.usersCount}</span>
                        <p className="text-3xs font-semibold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Roles & accounts
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Total Foods Widget */}
                  <Card
                    id="widget-total-foods"
                    onClick={() => setActiveTab('admin-food')}
                    className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-3xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl cursor-pointer group"
                  >
                    <CardContent className="p-5 flex flex-col justify-between h-full gap-3 text-left">
                      <div className="flex items-start justify-between">
                        <span className="text-3xs uppercase font-black tracking-wider text-emerald-600 dark:text-emerald-400">
                          Total Foods
                        </span>
                        <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-900/30 group-hover:scale-110 transition-transform">
                          <UtensilsCrossed className="w-5 h-5" />
                        </div>
                      </div>
                      <div>
                        <span className="text-3xl font-black text-slate-900 dark:text-white">{adminStats.foodsCount}</span>
                        <p className="text-3xs font-semibold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Nutritional items
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Total Exercises Widget */}
                  <Card
                    id="widget-total-exercises"
                    onClick={() => setActiveTab('admin-exercise')}
                    className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-3xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl cursor-pointer group"
                  >
                    <CardContent className="p-5 flex flex-col justify-between h-full gap-3 text-left">
                      <div className="flex items-start justify-between">
                        <span className="text-3xs uppercase font-black tracking-wider text-indigo-600 dark:text-indigo-400">
                          Total Exercises
                        </span>
                        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100 dark:border-indigo-900/30 group-hover:scale-110 transition-transform">
                          <Dumbbell className="w-5 h-5" />
                        </div>
                      </div>
                      <div>
                        <span className="text-3xl font-black text-slate-900 dark:text-white">{adminStats.exercisesCount}</span>
                        <p className="text-3xs font-semibold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Fitness routines
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Total Recommendations Widget */}
                  <Card
                    id="widget-total-recommendations"
                    onClick={() => setActiveTab('admin-recommendations')}
                    className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-3xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl cursor-pointer group"
                  >
                    <CardContent className="p-5 flex flex-col justify-between h-full gap-3 text-left">
                      <div className="flex items-start justify-between">
                        <span className="text-3xs uppercase font-black tracking-wider text-amber-600 dark:text-amber-400">
                          Total Recommendations
                        </span>
                        <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-100 dark:border-amber-900/30 group-hover:scale-110 transition-transform">
                          <Lightbulb className="w-5 h-5" />
                        </div>
                      </div>
                      <div>
                        <span className="text-3xl font-black text-slate-900 dark:text-white">{adminStats.recsCount}</span>
                        <p className="text-3xs font-semibold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Clinical rules
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Total Diseases & Conditions Widget */}
                  <Card
                    id="widget-total-diseases"
                    onClick={() => setActiveTab('admin-diseases')}
                    className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-3xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl cursor-pointer group"
                  >
                    <CardContent className="p-5 flex flex-col justify-between h-full gap-3 text-left">
                      <div className="flex items-start justify-between">
                        <span className="text-3xs uppercase font-black tracking-wider text-rose-600 dark:text-rose-400">
                          Total Diseases
                        </span>
                        <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-100 dark:border-rose-900/30 group-hover:scale-110 transition-transform">
                          <Stethoscope className="w-5 h-5" />
                        </div>
                      </div>
                      <div>
                        <span className="text-3xl font-black text-slate-900 dark:text-white">{adminStats.diseasesCount}</span>
                        <p className="text-3xs font-semibold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Disease profiles
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* QUICK ACTIONS & SYSTEM STATUS ROW */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="quick-actions-status-row">
                
                {/* Quick Actions (7 cols) */}
                <Card className="lg:col-span-7 border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xs rounded-2xl text-left" id="card-quick-actions">
                  <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
                    <CardTitle className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      Quick Administrative Actions
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Instant shortcuts to create new entities across core system domains.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      
                      {/* Add User */}
                      <button
                        id="quick-action-add-user"
                        onClick={() => setActiveTab('admin')}
                        className="flex items-center gap-3 p-3.5 rounded-xl border border-purple-200/60 dark:border-purple-900/40 bg-purple-50/50 dark:bg-purple-950/20 hover:bg-purple-100/60 dark:hover:bg-purple-900/30 transition-all duration-200 group text-left cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                          <UserPlus className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                            Add User
                          </span>
                          <span className="text-3xs text-slate-500 dark:text-slate-400 font-medium truncate">
                            Register new user, clinician or admin
                          </span>
                        </div>
                      </button>

                      {/* Add Food */}
                      <button
                        id="quick-action-add-food"
                        onClick={() => setActiveTab('admin-food')}
                        className="flex items-center gap-3 p-3.5 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/30 transition-all duration-200 group text-left cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                          <UtensilsCrossed className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                            Add Food
                          </span>
                          <span className="text-3xs text-slate-500 dark:text-slate-400 font-medium truncate">
                            Create nutritional meal entry
                          </span>
                        </div>
                      </button>

                      {/* Add Exercise */}
                      <button
                        id="quick-action-add-exercise"
                        onClick={() => setActiveTab('admin-exercise')}
                        className="flex items-center gap-3 p-3.5 rounded-xl border border-indigo-200/60 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-100/60 dark:hover:bg-indigo-900/30 transition-all duration-200 group text-left cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                          <Dumbbell className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                            Add Exercise
                          </span>
                          <span className="text-3xs text-slate-500 dark:text-slate-400 font-medium truncate">
                            Add physical activity routine
                          </span>
                        </div>
                      </button>

                      {/* Add Recommendation */}
                      <button
                        id="quick-action-add-recommendation"
                        onClick={() => setActiveTab('admin-recommendations')}
                        className="flex items-center gap-3 p-3.5 rounded-xl border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-100/60 dark:hover:bg-amber-900/30 transition-all duration-200 group text-left cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                          <Lightbulb className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                            Add Recommendation
                          </span>
                          <span className="text-3xs text-slate-500 dark:text-slate-400 font-medium truncate">
                            Configure clinical rule
                          </span>
                        </div>
                      </button>

                      {/* Add Disease */}
                      <button
                        id="quick-action-add-disease"
                        onClick={() => setActiveTab('admin-diseases')}
                        className="flex items-center gap-3 p-3.5 rounded-xl border border-rose-200/60 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100/60 dark:hover:bg-rose-900/30 transition-all duration-200 group text-left cursor-pointer sm:col-span-2"
                      >
                        <div className="w-9 h-9 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                          <Stethoscope className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-300 transition-colors">
                            Add Disease & Condition
                          </span>
                          <span className="text-3xs text-slate-500 dark:text-slate-400 font-medium truncate">
                            Define medical condition profile, dietary restrictions & exercise clearances
                          </span>
                        </div>
                      </button>

                    </div>
                  </CardContent>
                </Card>

                {/* System Status (5 cols) */}
                <Card className="lg:col-span-5 border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xs rounded-2xl flex flex-col justify-between text-left" id="card-system-status">
                  <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <Server className="w-4 h-4 text-emerald-500" />
                        System Status
                      </CardTitle>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-3xs font-black bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        Operational
                      </span>
                    </div>
                    <CardDescription className="text-xs">
                      Live status indicators for core health guide services.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-5 flex flex-col gap-2.5 my-auto">
                    
                    {/* Users Status */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60">
                      <div className="flex items-center gap-2.5">
                        <Users className="w-4 h-4 text-purple-500" />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Users</span>
                      </div>
                      <span className="text-3xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200/40">
                        Operational
                      </span>
                    </div>

                    {/* Foods Status */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60">
                      <div className="flex items-center gap-2.5">
                        <UtensilsCrossed className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Foods</span>
                      </div>
                      <span className="text-3xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200/40">
                        Operational
                      </span>
                    </div>

                    {/* Exercises Status */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60">
                      <div className="flex items-center gap-2.5">
                        <Dumbbell className="w-4 h-4 text-indigo-500" />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Exercises</span>
                      </div>
                      <span className="text-3xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200/40">
                        Operational
                      </span>
                    </div>

                    {/* Recommendations Status */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60">
                      <div className="flex items-center gap-2.5">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Recommendations</span>
                      </div>
                      <span className="text-3xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200/40">
                        Operational
                      </span>
                    </div>

                    {/* Diseases Status */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60">
                      <div className="flex items-center gap-2.5">
                        <Stethoscope className="w-4 h-4 text-rose-500" />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Diseases</span>
                      </div>
                      <span className="text-3xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200/40">
                        Operational
                      </span>
                    </div>

                  </CardContent>
                </Card>

              </div>

              {/* RECENT ACTIVITY LOG */}
              <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xs rounded-2xl text-left" id="card-recent-activity">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <Activity className="w-4 h-4 text-indigo-500" />
                      Recent Admin Activity Stream
                    </CardTitle>
                    <span className="text-3xs font-black uppercase text-slate-400 tracking-wider">Audit Feed</span>
                  </div>
                  <CardDescription className="text-xs">
                    Real-time timeline of recent administrative modifications and system events.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    
                    {/* Activity 1: User Created */}
                    <div className="py-3.5 flex items-start justify-between gap-4 first:pt-0 last:pb-0 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 px-2 rounded-xl transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-xl border border-purple-200/50 shrink-0 mt-0.5">
                          <UserPlus className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col text-left">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-slate-900 dark:text-white">User Created</span>
                            <span className="text-3xs font-extrabold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/40">
                              Users
                            </span>
                          </div>
                          <p className="text-2xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                            User account "Akanji Cornelius" created with Clinician privileges.
                          </p>
                        </div>
                      </div>
                      <span className="text-3xs font-extrabold text-slate-400 dark:text-slate-500 whitespace-nowrap">
                        12 mins ago
                      </span>
                    </div>

                    {/* Activity 2: Food Updated */}
                    <div className="py-3.5 flex items-start justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 px-2 rounded-xl transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-200/50 shrink-0 mt-0.5">
                          <UtensilsCrossed className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col text-left">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-slate-900 dark:text-white">Food Updated</span>
                            <span className="text-3xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/40">
                              Foods
                            </span>
                          </div>
                          <p className="text-2xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                            "Avocado Salmon Bowl" macronutrient and sodium targets updated.
                          </p>
                        </div>
                      </div>
                      <span className="text-3xs font-extrabold text-slate-400 dark:text-slate-500 whitespace-nowrap">
                        38 mins ago
                      </span>
                    </div>

                    {/* Activity 3: Exercise Added */}
                    <div className="py-3.5 flex items-start justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 px-2 rounded-xl transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-200/50 shrink-0 mt-0.5">
                          <Dumbbell className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col text-left">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-slate-900 dark:text-white">Exercise Added</span>
                            <span className="text-3xs font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/40">
                              Exercises
                            </span>
                          </div>
                          <p className="text-2xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                            "Low-Impact Cardiovascular Cycling" added to fitness repository.
                          </p>
                        </div>
                      </div>
                      <span className="text-3xs font-extrabold text-slate-400 dark:text-slate-500 whitespace-nowrap">
                        2 hours ago
                      </span>
                    </div>

                    {/* Activity 4: Recommendation Edited */}
                    <div className="py-3.5 flex items-start justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 px-2 rounded-xl transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-200/50 shrink-0 mt-0.5">
                          <Lightbulb className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col text-left">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-slate-900 dark:text-white">Recommendation Edited</span>
                            <span className="text-3xs font-extrabold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/40">
                              Recommendations
                            </span>
                          </div>
                          <p className="text-2xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                            Hypertension protocol "Low-Sodium Daily Guideline" rule edited.
                          </p>
                        </div>
                      </div>
                      <span className="text-3xs font-extrabold text-slate-400 dark:text-slate-500 whitespace-nowrap">
                        5 hours ago
                      </span>
                    </div>

                    {/* Activity 5: Disease Added */}
                    <div className="py-3.5 flex items-start justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 px-2 rounded-xl transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-200/50 shrink-0 mt-0.5">
                          <Stethoscope className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col text-left">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-slate-900 dark:text-white">Disease Added</span>
                            <span className="text-3xs font-extrabold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/40">
                              Diseases
                            </span>
                          </div>
                          <p className="text-2xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                            "Type 2 Diabetes & Insulin Resistance" clinical condition added.
                          </p>
                        </div>
                      </div>
                      <span className="text-3xs font-extrabold text-slate-400 dark:text-slate-500 whitespace-nowrap">
                        1 day ago
                      </span>
                    </div>

                  </div>
                </CardContent>
              </Card>

              {/* PRESERVED PERSONAL HEALTH OVERVIEW WORKSPACE */}
              <div className="border-t border-slate-200/80 dark:border-slate-800/80 pt-8 mt-2 flex flex-col gap-8" id="personal-health-overview-section">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                  <div>
                    <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
                      <Heart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      Personal Health Overview & Daily Tracker
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                      Individual biological parameters, active trackers, hydration goals, and custom health schedules.
                    </p>
                  </div>
                  <span className="text-3xs font-extrabold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 tracking-wider w-fit">
                    Preserved & Active
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* LEFT COLUMN: Main Dashboard Workspace (8 cols) */}
                  <div className="lg:col-span-8 flex flex-col gap-8" id="overview-main-feed-preserved">
                  
                  {/* Health Profile Completion Callout */}
                  {!isProfileFetched || loadingProfile ? (
                <div className="p-5 rounded-2xl bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 animate-pulse text-left flex items-center justify-between" id="dashboard-profile-loading">
                  <div className="flex gap-3 items-center">
                    <div className="w-5 h-5 bg-slate-200 dark:bg-slate-800 rounded-full" />
                    <div className="flex flex-col gap-1.5">
                      <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
                      <div className="h-3 w-64 bg-slate-200 dark:bg-slate-800 rounded" />
                    </div>
                  </div>
                </div>
              ) : !profile ? (
                <div className="p-5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-3xs" id="dashboard-profile-setup-cta">
                  <div className="flex gap-3.5">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-950 dark:text-white">Complete Your Health Profile</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium leading-relaxed">Define parameters to unlock personalized meal recommendations and allergy warnings.</p>
                    </div>
                  </div>
                  <Button variant="primary" size="sm" onClick={() => navigateTo('profile-form')} id="setup-profile-cta-btn" className="bg-amber-600 hover:bg-amber-700 font-extrabold whitespace-nowrap shadow-xs">
                    Complete Profile
                  </Button>
                </div>
              ) : (
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-3xs" id="dashboard-profile-active-cta">
                  <div className="flex gap-3.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-950 dark:text-white">Health Profile Active</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium leading-relaxed">Your biological parameters are synchronized. Access customized suggestions or revise your inputs.</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                    <Button variant="secondary" size="sm" onClick={() => navigateTo('profile-summary')} id="active-profile-summary-btn" className="font-extrabold whitespace-nowrap shadow-2xs">
                      View Summary
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigateTo('recommendations')} id="active-profile-recs-btn" className="font-extrabold whitespace-nowrap shadow-2xs">
                      Recommendations
                    </Button>
                  </div>
                </div>
              )}

              {/* Top Banner Widget */}
              <div className="p-6 sm:p-8 md:p-10 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl shadow-emerald-600/10 border border-emerald-500/20 transition-all duration-300" id="overview-welcome-banner">
                <div className="flex flex-col gap-2.5 max-w-xl text-left">
                  <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3.5 py-1 rounded-full text-2xs font-extrabold uppercase tracking-wider text-emerald-50 border border-white/20 w-fit">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                    <span>Active Health Hub</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight text-white">
                    Hello, {userBio.name}!
                  </h2>
                  <p className="text-sm sm:text-base text-emerald-50/90 leading-relaxed font-normal">
                    Track and optimize your daily health performance. View dynamic parameters, log exercise, and monitor nutrition targets.
                  </p>
                </div>
                <Button variant="secondary" className="bg-white text-emerald-800 hover:bg-emerald-50 whitespace-nowrap font-extrabold px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer border border-emerald-100" onClick={() => setIsModalOpen(true)} id="overview-add-workout-btn">
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
                  <div className="flex flex-col gap-6 text-left animate-fade-in" id="daily-health-tracking-center">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800/80 pb-3.5">
                      <div>
                        <h3 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
                          <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          Daily Health Tracking Center
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                          Monitor daily wellness milestones in real-time.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xs font-extrabold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 tracking-wider">
                          Local Sync Active
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="trackers-cards-container">
                      
                      {/* Card 1: Water Intake */}
                      <Card id="tracker-card-water" className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-2xl flex flex-col justify-between h-full">
                        <CardContent className="p-6 flex flex-col justify-between h-full gap-5 text-left">
                          <div className="flex items-start justify-between">
                            <div className="flex flex-col gap-1 min-w-0">
                              <span className="text-2xs text-blue-600 dark:text-blue-400 uppercase tracking-widest font-black">Hydration</span>
                              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Daily Water Intake</span>
                              <div className="flex items-baseline gap-1 mt-1">
                                <span className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">{waterIntake}</span>
                                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">/ {waterTarget} ml</span>
                              </div>
                            </div>
                            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex-shrink-0">
                              <Droplet className="w-5 h-5" />
                            </div>
                          </div>

                          {/* Circular Progress Gauge */}
                          <div className="flex items-center gap-4 py-2 border-t border-slate-100 dark:border-slate-800/60">
                            <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
                              <svg className="w-full h-full transform -rotate-90">
                                <circle
                                  cx="24"
                                  cy="24"
                                  r="19"
                                  className="stroke-slate-100 dark:stroke-slate-800"
                                  strokeWidth="3.5"
                                  fill="transparent"
                                />
                                <circle
                                  cx="24"
                                  cy="24"
                                  r="19"
                                  className="stroke-blue-500 transition-all duration-500 ease-out"
                                  strokeWidth="3.5"
                                  fill="transparent"
                                  strokeDasharray={2 * Math.PI * 19}
                                  strokeDashoffset={2 * Math.PI * 19 - (waterPercent / 100) * 2 * Math.PI * 19}
                                  strokeLinecap="round"
                                />
                              </svg>
                              <span className="absolute text-3xs font-extrabold text-blue-600 dark:text-blue-400">{waterPercent}%</span>
                            </div>
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 truncate">
                                {waterPercent >= 100 ? 'Target Reached! 💧' : 'Stay Hydrated'}
                              </span>
                              <button
                                type="button"
                                className="text-3xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors text-left font-extrabold"
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
                          <div className="flex items-center gap-2 mt-auto pt-1">
                            <button
                              onClick={() => setWaterIntake(prev => Math.max(0, prev - 250))}
                              className="flex-1 flex items-center justify-center h-8 px-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 transition-all font-extrabold text-3xs cursor-pointer active:scale-95"
                              title="Subtract 250ml"
                            >
                              <Minus className="w-3 h-3 mr-1" /> 250
                            </button>
                            <button
                              onClick={() => setWaterIntake(prev => prev + 250)}
                              className="flex-1 flex items-center justify-center h-8 px-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-950/60 border border-blue-200/60 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 transition-all font-extrabold text-3xs cursor-pointer active:scale-95"
                              title="Add 250ml"
                            >
                              <Plus className="w-3 h-3 mr-1" /> 250
                            </button>
                            <button
                              onClick={() => setWaterIntake(prev => prev + 500)}
                              className="flex-1 flex items-center justify-center h-8 px-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all font-extrabold text-3xs cursor-pointer active:scale-95"
                              title="Add 500ml"
                            >
                              <Plus className="w-3 h-3 mr-1" /> 500
                            </button>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Card 2: Exercise Progress */}
                      <Card id="tracker-card-exercise" className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-2xl flex flex-col justify-between h-full">
                        <CardContent className="p-6 flex flex-col justify-between h-full gap-5 text-left">
                          <div className="flex items-start justify-between">
                            <div className="flex flex-col gap-1 min-w-0">
                              <span className="text-2xs text-orange-600 dark:text-orange-400 uppercase tracking-widest font-black">Fitness</span>
                              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Exercise Progress</span>
                              <div className="flex items-baseline gap-1 mt-1">
                                <span className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">{exerciseProgress}</span>
                                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">/ {exerciseTarget} mins</span>
                              </div>
                            </div>
                            <div className="p-2.5 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 rounded-2xl border border-orange-100 dark:border-orange-900/30 flex-shrink-0">
                              <Flame className="w-5 h-5" />
                            </div>
                          </div>

                          {/* Circular Progress Gauge */}
                          <div className="flex items-center gap-4 py-2 border-t border-slate-100 dark:border-slate-800/60">
                            <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
                              <svg className="w-full h-full transform -rotate-90">
                                <circle
                                  cx="24"
                                  cy="24"
                                  r="19"
                                  className="stroke-slate-100 dark:stroke-slate-800"
                                  strokeWidth="3.5"
                                  fill="transparent"
                                />
                                <circle
                                  cx="24"
                                  cy="24"
                                  r="19"
                                  className="stroke-orange-500 transition-all duration-500 ease-out"
                                  strokeWidth="3.5"
                                  fill="transparent"
                                  strokeDasharray={2 * Math.PI * 19}
                                  strokeDashoffset={2 * Math.PI * 19 - (exercisePercent / 100) * 2 * Math.PI * 19}
                                  strokeLinecap="round"
                                />
                              </svg>
                              <span className="absolute text-3xs font-extrabold text-orange-600 dark:text-orange-400">{exercisePercent}%</span>
                            </div>
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 truncate">
                                {exercisePercent >= 100 ? 'Goal Completed! 🔥' : 'Keep Moving'}
                              </span>
                              <button
                                type="button"
                                className="text-3xs text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors text-left font-extrabold"
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
                          <div className="flex items-center gap-2 mt-auto pt-1">
                            <button
                              onClick={() => setExerciseProgress(prev => Math.max(0, prev - 10))}
                              className="flex-1 flex items-center justify-center h-8 px-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 transition-all font-extrabold text-3xs cursor-pointer active:scale-95"
                              title="Subtract 10 mins"
                            >
                              <Minus className="w-3 h-3 mr-1" /> 10m
                            </button>
                            <button
                              onClick={() => setExerciseProgress(prev => prev + 10)}
                              className="flex-1 flex items-center justify-center h-8 px-2 rounded-xl bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/40 dark:hover:bg-orange-950/60 border border-orange-200/60 dark:border-orange-900/40 text-orange-600 dark:text-orange-400 transition-all font-extrabold text-3xs cursor-pointer active:scale-95"
                              title="Add 10 mins"
                            >
                              <Plus className="w-3 h-3 mr-1" /> 10m
                            </button>
                            <button
                              onClick={() => setIsModalOpen(true)}
                              className="flex-1 flex items-center justify-center h-8 px-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-xs transition-all font-extrabold text-3xs cursor-pointer whitespace-nowrap active:scale-95"
                              title="Record detailed session"
                            >
                              <Dumbbell className="w-3 h-3 mr-1" /> Log
                            </button>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Card 3: Healthy Meals Completed */}
                      <Card id="tracker-card-meals" className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-2xl flex flex-col justify-between h-full">
                        <CardContent className="p-6 flex flex-col justify-between h-full gap-5 text-left">
                          <div className="flex items-start justify-between">
                            <div className="flex flex-col gap-1 min-w-0">
                              <span className="text-2xs text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-black">Diet & Nutrition</span>
                              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Meals Completed</span>
                              <div className="flex items-baseline gap-1 mt-1">
                                <span className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">{mealsCompleted}</span>
                                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">/ {mealsTarget} Healthy Meals</span>
                              </div>
                            </div>
                            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 flex-shrink-0">
                              <Utensils className="w-5 h-5" />
                            </div>
                          </div>

                          {/* Circular Progress Gauge */}
                          <div className="flex items-center gap-4 py-2 border-t border-slate-100 dark:border-slate-800/60">
                            <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
                              <svg className="w-full h-full transform -rotate-90">
                                <circle
                                  cx="24"
                                  cy="24"
                                  r="19"
                                  className="stroke-slate-100 dark:stroke-slate-800"
                                  strokeWidth="3.5"
                                  fill="transparent"
                                />
                                <circle
                                  cx="24"
                                  cy="24"
                                  r="19"
                                  className="stroke-emerald-500 transition-all duration-500 ease-out"
                                  strokeWidth="3.5"
                                  fill="transparent"
                                  strokeDasharray={2 * Math.PI * 19}
                                  strokeDashoffset={2 * Math.PI * 19 - (mealsPercent / 100) * 2 * Math.PI * 19}
                                  strokeLinecap="round"
                                />
                              </svg>
                              <span className="absolute text-3xs font-extrabold text-emerald-600 dark:text-emerald-400">{mealsCompleted}/3</span>
                            </div>
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 truncate">
                                {mealsPercent >= 100 ? 'All Meals Healthy! 🍏' : 'Track Healthy Plates'}
                              </span>
                              <button
                                type="button"
                                className="text-3xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors text-left font-extrabold"
                                onClick={() => {
                                  setActiveTab('nutrition');
                                }}
                              >
                                Explore Safe Foods
                              </button>
                            </div>
                          </div>

                          {/* Interactive Controls - Toggles */}
                          <div className="flex items-center gap-1.5 mt-auto pt-1">
                            <button
                              onClick={() => setMealBreakfast(!mealBreakfast)}
                              className={`flex-1 h-8 px-1 rounded-xl text-3xs font-black border transition-all cursor-pointer text-center flex items-center justify-center ${
                                mealBreakfast
                                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                                  : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80'
                              }`}
                            >
                              Breakfast
                            </button>
                            <button
                              onClick={() => setMealLunch(!mealLunch)}
                              className={`flex-1 h-8 px-1 rounded-xl text-3xs font-black border transition-all cursor-pointer text-center flex items-center justify-center ${
                                mealLunch
                                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                                  : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80'
                              }`}
                            >
                              Lunch
                            </button>
                            <button
                              onClick={() => setMealDinner(!mealDinner)}
                              className={`flex-1 h-8 px-1 rounded-xl text-3xs font-black border transition-all cursor-pointer text-center flex items-center justify-center ${
                                mealDinner
                                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                                  : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80'
                              }`}
                            >
                              Dinner
                            </button>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Card 4: Daily Wellness Score */}
                      <Card id="tracker-card-wellness" className="border border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-br from-emerald-500/5 to-teal-500/10 dark:from-emerald-950/20 dark:to-teal-950/30 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-2xl flex flex-col justify-between h-full">
                        <CardContent className="p-6 flex flex-col justify-between h-full gap-5 text-left">
                          <div className="flex items-start justify-between">
                            <div className="flex flex-col gap-1 min-w-0">
                              <span className="text-2xs text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-black">Scorecard</span>
                              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Wellness Score</span>
                              <div className="flex items-baseline gap-1 mt-1">
                                <span className="text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">{dailyWellnessScore}</span>
                                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">/ 100 pts</span>
                              </div>
                            </div>
                            <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-500/20 flex-shrink-0">
                              <Sparkles className="w-5 h-5" />
                            </div>
                          </div>

                          {/* Large Circular Gauge Dial */}
                          <div className="flex items-center gap-4 py-2 border-t border-slate-100 dark:border-slate-800/60">
                            <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
                              <svg className="w-full h-full transform -rotate-90">
                                <circle
                                  cx="24"
                                  cy="24"
                                  r="19"
                                  className="stroke-slate-100 dark:stroke-slate-800"
                                  strokeWidth="3.5"
                                  fill="transparent"
                                />
                                <circle
                                  cx="24"
                                  cy="24"
                                  r="19"
                                  className="stroke-emerald-600 dark:stroke-emerald-400 transition-all duration-500 ease-out"
                                  strokeWidth="3.5"
                                  fill="transparent"
                                  strokeDasharray={2 * Math.PI * 19}
                                  strokeDashoffset={2 * Math.PI * 19 - (dailyWellnessScore / 100) * 2 * Math.PI * 19}
                                  strokeLinecap="round"
                                />
                              </svg>
                              <span className="absolute text-3xs font-extrabold text-emerald-700 dark:text-emerald-300">{dailyWellnessScore}%</span>
                            </div>
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span className="text-3xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-black">Dynamic Status</span>
                              <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 leading-snug truncate">
                                {dailyWellnessScore === 0 && "Ready to start?"}
                                {dailyWellnessScore > 0 && dailyWellnessScore < 40 && "Starting strong! 🚀"}
                                {dailyWellnessScore >= 40 && dailyWellnessScore < 70 && "Steady progress! 👍"}
                                {dailyWellnessScore >= 70 && dailyWellnessScore < 100 && "Almost peak day! 💪"}
                                {dailyWellnessScore === 100 && "Perfect wellness day! 🎉"}
                              </p>
                            </div>
                          </div>

                          <div className="text-4xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider leading-normal mt-auto pt-1">
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
                  <div className="flex flex-col gap-6 text-left mt-2" id="daily-progress-history-section">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800/80 pb-3.5">
                      <div>
                        <h3 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
                          <History className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          Wellness Progress History (Last 7 Days)
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                          Historical daily logs of your wellness performance, metrics, and trends.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xs font-extrabold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700/80 tracking-wider">
                          Interactive History
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4" id="history-cards-container">
                      {displayHistory.length === 0 ? (
                        <div className="col-span-full py-4 w-full" id="history-empty">
                          <EmptyState
                            title="No Historical Progress Logs"
                            description="Your daily tracker history is currently clear. Complete your first health and habit metrics today to begin compiling your weekly progress trends!"
                            id="history-empty-state"
                          />
                        </div>
                      ) : (
                        displayHistory.map((entry) => {
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
                            <Card key={entry.date} id={`history-card-${entry.date}`} className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-2xl flex flex-col justify-between h-full">
                              <div className="p-4 flex flex-col gap-3 h-full text-left">
                                {/* Card Header: Date & Trend */}
                                <div className="flex flex-col gap-1 border-b border-slate-100 dark:border-slate-800/60 pb-2.5">
                                  <span className="text-2xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                    {formatHistoryDate(entry.date).split(',')[0]}
                                  </span>
                                  <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                                    {formatHistoryDate(entry.date).split(',')[1] || formatHistoryDate(entry.date)}
                                  </span>
                                  
                                  {/* Trend Indicator Badge */}
                                  <div className="mt-1">
                                    {trend === 'improving' && (
                                      <span className="inline-flex items-center gap-1 text-3xs font-extrabold uppercase bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-900/40">
                                        <TrendingUp className="w-2.5 h-2.5 flex-shrink-0" /> Improving
                                      </span>
                                    )}
                                    {trend === 'stable' && (
                                      <span className="inline-flex items-center gap-1 text-3xs font-extrabold uppercase bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-400 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700/60">
                                        <Minus className="w-2.5 h-2.5 flex-shrink-0" /> Stable
                                      </span>
                                    )}
                                    {trend === 'declining' && (
                                      <span className="inline-flex items-center gap-1 text-3xs font-extrabold uppercase bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 px-2 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-900/40">
                                        <TrendingDown className="w-2.5 h-2.5 flex-shrink-0" /> Declining
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Wellness Score Badge / Circle */}
                                <div className="flex items-center gap-2.5 py-1">
                                  <div className="text-2xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                                    {entry.wellnessScore}
                                  </div>
                                  <div className="flex flex-col leading-none">
                                    <span className="text-3xs text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider">Score</span>
                                    <span className="text-2xs font-extrabold text-slate-700 dark:text-slate-300 mt-0.5">
                                      {entry.wellnessScore >= 80 ? 'Excellent' : entry.wellnessScore >= 50 ? 'Good' : 'Incomplete'}
                                    </span>
                                  </div>
                                </div>

                                {/* Daily Metrics breakdown */}
                                <div className="flex flex-col gap-2 text-2xs text-slate-600 dark:text-slate-400 font-medium mt-auto pt-2.5 border-t border-slate-100 dark:border-slate-800/60">
                                  {/* Water */}
                                  <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1 min-w-0">
                                      <Droplet className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                                      <span className="truncate">Hydration</span>
                                    </span>
                                    <span className="font-extrabold text-slate-900 dark:text-slate-100">
                                      {Math.round(entry.waterIntake / 100) / 10}L
                                    </span>
                                  </div>
                                  
                                  {/* Exercise */}
                                  <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1 min-w-0">
                                      <Flame className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                                      <span className="truncate">Fitness</span>
                                    </span>
                                    <span className="font-extrabold text-slate-900 dark:text-slate-100">
                                      {entry.exerciseProgress}m
                                    </span>
                                  </div>

                                  {/* Meals */}
                                  <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1 min-w-0">
                                      <Utensils className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                      <span className="truncate">Nutrition</span>
                                    </span>
                                    <span className="font-extrabold text-slate-900 dark:text-slate-100">
                                      {entry.mealsCompleted}/{entry.mealsTarget}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          );
                        })
                      )}
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
                  <div className="flex flex-col gap-6 text-left mt-2" id="weekly-health-insights-section">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800/80 pb-3.5">
                      <div>
                        <h3 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
                          <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          Weekly Health Insights & Recommendations
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                          Data-driven feedback, habit consistency analysis, and targeted suggestions based on the last 7 days.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xs font-extrabold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 tracking-wider">
                          Weekly Report
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="insights-cards-container">
                      
                      <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-2xl flex flex-col justify-between h-full">
                        <CardContent className="p-6 flex flex-col gap-4 h-full text-left justify-between">
                          <div className="flex items-start justify-between">
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span className="text-2xs text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-black">Success Milestones</span>
                              <span className="text-base font-extrabold text-slate-900 dark:text-white">Weekly Achievements</span>
                            </div>
                            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 flex-shrink-0">
                              <Award className="w-5 h-5" />
                            </div>
                          </div>

                          <div className="flex flex-col gap-3 flex-1 justify-center my-1">
                            {achievements.map((ach, idx) => (
                              <div key={idx} className="flex gap-2.5 items-start">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                                  {ach}
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Card 2: Habit Consistency */}
                      <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-2xl flex flex-col justify-between h-full">
                        <CardContent className="p-6 flex flex-col gap-4 h-full text-left justify-between">
                          <div className="flex items-start justify-between">
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span className="text-2xs text-blue-600 dark:text-blue-400 uppercase tracking-widest font-black">Habit Quality</span>
                              <span className="text-base font-extrabold text-slate-900 dark:text-white">Consistency Matrix</span>
                            </div>
                            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex-shrink-0">
                              <Activity className="w-5 h-5" />
                            </div>
                          </div>

                          <div className="flex flex-col gap-3 flex-1 justify-center my-1">
                            <div className="flex items-center gap-3 bg-blue-50/60 dark:bg-blue-950/20 p-3 rounded-xl border border-blue-200/60 dark:border-blue-900/40">
                              <div className="px-3 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg font-extrabold text-base border border-blue-500/20">
                                {avgWellnessScore}%
                              </div>
                              <div className="flex flex-col leading-tight min-w-0">
                                <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{consistencyMessage}</span>
                                <span className="text-3xs text-slate-400 dark:text-slate-500 uppercase font-black mt-0.5">Avg Wellness Score</span>
                              </div>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                              {consistencySubtitle}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Card 3: Areas for Improvement */}
                      <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-2xl flex flex-col justify-between h-full">
                        <CardContent className="p-6 flex flex-col gap-4 h-full text-left justify-between">
                          <div className="flex items-start justify-between">
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span className="text-2xs text-orange-600 dark:text-orange-400 uppercase tracking-widest font-black">Optimization</span>
                              <span className="text-base font-extrabold text-slate-900 dark:text-white">Opportunity Gaps</span>
                            </div>
                            <div className="p-2.5 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 rounded-2xl border border-orange-100 dark:border-orange-900/30 flex-shrink-0">
                              <AlertTriangle className="w-5 h-5" />
                            </div>
                          </div>

                          <div className="flex flex-col gap-3 flex-1 justify-center my-1">
                            {improvements.map((imp, idx) => (
                              <div key={idx} className="flex gap-2.5 items-start">
                                <span className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                                  {imp}
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Card 4: Actionable Tip */}
                      <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-indigo-500/10 dark:from-indigo-950/20 dark:to-purple-950/20 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-2xl flex flex-col justify-between h-full">
                        <CardContent className="p-6 flex flex-col gap-4 h-full text-left justify-between">
                          <div className="flex items-start justify-between">
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span className="text-2xs text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-black">Habit Builder</span>
                              <span className="text-base font-extrabold text-slate-900 dark:text-white">Daily Wellness Tip</span>
                            </div>
                            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 flex-shrink-0">
                              <Sparkles className="w-5 h-5" />
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 flex-1 justify-center my-1">
                            <span className="text-xs font-extrabold text-indigo-700 dark:text-indigo-300">
                              {tipTitle}
                            </span>
                            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
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
                    <div className="flex flex-col gap-6 text-left border-t border-slate-200/80 dark:border-slate-800/80 pt-8 mt-6" id="health-goals-progress-section">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800/80 pb-3.5">
                      <div>
                        <h3 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
                          <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          Personalized Health Goals & Progress
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                          Customized tracking cards synchronized with your {profile ? 'saved' : 'default'} goal parameters.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xs font-extrabold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 tracking-wider">
                          {goalTitle}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Left: Interactive Goal Dashboard Card */}
                      <Card className="lg:col-span-8 border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md transition-all duration-300 rounded-2xl">
                        <CardContent className="p-6 flex flex-col gap-6">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex gap-3.5 items-center">
                              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                                <Target className="w-6 h-6" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-2xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">ACTIVE GOAL FRAMEWORK</span>
                                <span className="text-lg font-extrabold text-slate-900 dark:text-white">{goalTitle}</span>
                              </div>
                            </div>
                            
                            <div className="flex flex-row items-center gap-6 bg-slate-50 dark:bg-slate-950/40 px-4 py-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                              <div className="flex flex-col text-left">
                                <span className="text-3xs text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider">{statusLabel}</span>
                                <span className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">{statusValue}</span>
                              </div>
                              <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
                              <div className="flex flex-col text-left">
                                <span className="text-3xs text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider">Goal Target</span>
                                <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">{targetValue}</span>
                              </div>
                            </div>
                          </div>

                          {/* Dynamic Adjuster Slider/Buttons */}
                          <div className="flex flex-col gap-3">
                            <span className="text-2xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">INTERACTIVE TARGET CONTROLS</span>
                            
                            {/* Weight controls */}
                            {(isWeightLoss || isWeightGain) && (
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/60 dark:bg-slate-950/20 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                                <div className="flex flex-col gap-1.5 text-left">
                                  <span className="text-3xs text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider">Starting weight</span>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <button onClick={() => setGoalStartWeight(prev => Math.max(30, prev - 0.5))} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-extrabold hover:bg-slate-50 dark:hover:bg-slate-700 text-sm text-slate-700 dark:text-slate-200 shadow-2xs hover:scale-105 active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">-</button>
                                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 w-16 text-center">{goalStartWeight.toFixed(1)} kg</span>
                                    <button onClick={() => setGoalStartWeight(prev => prev + 0.5)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-extrabold hover:bg-slate-50 dark:hover:bg-slate-700 text-sm text-slate-700 dark:text-slate-200 shadow-2xs hover:scale-105 active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">+</button>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-1.5 text-left">
                                  <span className="text-3xs text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider">Logged Current weight</span>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <button onClick={() => setGoalCurrentWeight(prev => Math.max(30, prev - 0.5))} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-extrabold hover:bg-slate-50 dark:hover:bg-slate-700 text-sm text-slate-700 dark:text-slate-200 shadow-2xs hover:scale-105 active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">-</button>
                                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 w-16 text-center">{goalCurrentWeight.toFixed(1)} kg</span>
                                    <button onClick={() => setGoalCurrentWeight(prev => prev + 0.5)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-extrabold hover:bg-slate-50 dark:hover:bg-slate-700 text-sm text-slate-700 dark:text-slate-200 shadow-2xs hover:scale-105 active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">+</button>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-1.5 text-left">
                                  <span className="text-3xs text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider">Target weight goal</span>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <button onClick={() => setGoalTargetWeight(prev => Math.max(30, prev - 0.5))} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-extrabold hover:bg-slate-50 dark:hover:bg-slate-700 text-sm text-slate-700 dark:text-slate-200 shadow-2xs hover:scale-105 active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">-</button>
                                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 w-16 text-center">{goalTargetWeight.toFixed(1)} kg</span>
                                    <button onClick={() => setGoalTargetWeight(prev => prev + 0.5)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-extrabold hover:bg-slate-50 dark:hover:bg-slate-700 text-sm text-slate-700 dark:text-slate-200 shadow-2xs hover:scale-105 active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">+</button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Exercise target controls */}
                            {(isMuscleGain || isHeartHealth) && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/60 dark:bg-slate-950/20 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                                <div className="flex flex-col gap-1 text-left justify-center">
                                  <span className="text-3xs text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider">Logged Active Training (7 Days)</span>
                                  <span className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">{currentWeeklyExercise} mins</span>
                                </div>
                                <div className="flex flex-col gap-1.5 text-left">
                                  <span className="text-3xs text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider">Adjust Weekly Target Goal</span>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <button onClick={() => setGoalTargetExercise(prev => Math.max(30, prev - 15))} className="w-20 h-8 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-extrabold hover:bg-slate-50 dark:hover:bg-slate-700 text-xs text-slate-700 dark:text-slate-200 shadow-2xs hover:scale-105 active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500">-15m</button>
                                    <span className="text-xs font-extrabold text-orange-600 dark:text-orange-400 w-24 text-center">{goalTargetExercise} mins</span>
                                    <button onClick={() => setGoalTargetExercise(prev => prev + 15)} className="w-20 h-8 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-extrabold hover:bg-slate-50 dark:hover:bg-slate-700 text-xs text-slate-700 dark:text-slate-200 shadow-2xs hover:scale-105 active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500">+15m</button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Wellness target controls */}
                            {isImproveHealth && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/60 dark:bg-slate-950/20 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                                <div className="flex flex-col gap-1 text-left justify-center">
                                  <span className="text-3xs text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider">Current 7-Day Average Score</span>
                                  <span className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">{avgWellnessScore}%</span>
                                </div>
                                <div className="flex flex-col gap-1.5 text-left">
                                  <span className="text-3xs text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider">Adjust Average Target Goal</span>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <button onClick={() => setGoalTargetWellness(prev => Math.max(50, prev - 5))} className="w-16 h-8 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-extrabold hover:bg-slate-50 dark:hover:bg-slate-700 text-xs text-slate-700 dark:text-slate-200 shadow-2xs hover:scale-105 active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">-5%</button>
                                    <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 w-24 text-center">{goalTargetWellness}%</span>
                                    <button onClick={() => setGoalTargetWellness(prev => Math.min(100, prev + 5))} className="w-16 h-8 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-extrabold hover:bg-slate-50 dark:hover:bg-slate-700 text-xs text-slate-700 dark:text-slate-200 shadow-2xs hover:scale-105 active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">+5%</button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Blood sugar controls */}
                            {isBloodSugar && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/60 dark:bg-slate-950/20 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                                <div className="flex flex-col gap-1 text-left justify-center">
                                  <span className="text-3xs text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider">Healthy Meals Completed (7 Days)</span>
                                  <span className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">{currentWeeklyMeals} meals</span>
                                </div>
                                <div className="flex flex-col gap-1.5 text-left">
                                  <span className="text-3xs text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider">Adjust Weekly Target Goal</span>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <button onClick={() => setGoalTargetMeals(prev => Math.max(5, prev - 1))} className="w-14 h-8 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-extrabold hover:bg-slate-50 dark:hover:bg-slate-700 text-xs text-slate-700 dark:text-slate-200 shadow-2xs hover:scale-105 active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">-1</button>
                                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 w-24 text-center">{goalTargetMeals} meals</span>
                                    <button onClick={() => setGoalTargetMeals(prev => Math.min(21, prev + 1))} className="w-14 h-8 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-extrabold hover:bg-slate-50 dark:hover:bg-slate-700 text-xs text-slate-700 dark:text-slate-200 shadow-2xs hover:scale-105 active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">+1</button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Visual Progress Indicator */}
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <span className="text-2xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">VISUAL TARGET COVERAGE</span>
                              <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">{progressPct}% Met</span>
                            </div>
                            <div className="relative w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
                              <div 
                                className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full transition-all duration-500 ease-out shadow-xs"
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                            <span className="text-2xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                              {progressDetails}
                            </span>
                          </div>

                          {/* Estimated Healthy Progress Info */}
                          <div className="flex gap-3 items-start bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 text-left">
                            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                            <div className="flex flex-col gap-0.5">
                              <span className="text-3xs uppercase font-black text-emerald-700 dark:text-emerald-400 tracking-wider">ESTIMATED HEALTHY PACE</span>
                              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed mt-0.5">
                                {progressDescription}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Right: Motivational Milestones Card */}
                      <Card className="lg:col-span-4 border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md transition-all duration-300 rounded-2xl flex flex-col justify-between h-full">
                        <CardContent className="p-6 flex flex-col gap-4 h-full text-left justify-between">
                          <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3.5">
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span className="text-2xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Consistency</span>
                              <span className="text-base font-extrabold text-slate-900 dark:text-white">Motivational Milestones</span>
                            </div>
                            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 flex-shrink-0">
                              <Award className="w-5 h-5" />
                            </div>
                          </div>

                          <div className="flex flex-col gap-5 mt-2 flex-1 justify-center">
                            {milestones.map((milestone, idx) => {
                              // Calculate if milestone is reached based on percentage threshold
                              const threshold = idx === 0 ? 20 : idx === 1 ? 50 : 100;
                              const isReached = progressPct >= threshold;
                              
                              return (
                                <div key={idx} className="flex gap-3.5 items-start">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 text-2xs font-extrabold transition-all duration-300 ${isReached ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700'}`}>
                                    {isReached ? '✓' : idx + 1}
                                  </div>
                                  <div className="flex flex-col gap-0.5 min-w-0">
                                    <span className={`text-xs font-extrabold ${isReached ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                                      {milestone.split(':')[0]}
                                    </span>
                                    <span className="text-2xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-0.5">
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
                  <div className="flex flex-col gap-6 text-left border-t border-slate-200/80 dark:border-slate-800/80 pt-8 mt-6" id="daily-health-timeline-section">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800/80 pb-3.5">
                      <div>
                        <h3 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
                          <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          Personalized Daily Health Plan
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                          Chronological wellness schedule optimized for your goal target ({healthGoal}).
                        </p>
                      </div>

                      {/* Overall Checklist Progress Tracker */}
                      <div className="flex items-center gap-3.5 bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 w-fit">
                        <div className="flex flex-col items-end">
                          <span className="text-3xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-extrabold">Today's Momentum</span>
                          <span className="text-xs font-extrabold text-slate-900 dark:text-white">{overallCompletionPct}% Completed</span>
                        </div>
                        <div className="relative w-11 h-11 flex items-center justify-center">
                          {/* Radial Progress Ring */}
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="22" cy="22" r="16" stroke="currentColor" strokeWidth="3.5" fill="transparent" className="text-slate-200 dark:text-slate-800" />
                            <circle cx="22" cy="22" r="16" stroke="currentColor" strokeWidth="3.5" fill="transparent" strokeDasharray={2 * Math.PI * 16} strokeDashoffset={2 * Math.PI * 16 * (1 - overallCompletionPct / 100)} className="text-emerald-600 dark:text-emerald-400 transition-all duration-500" />
                          </svg>
                          <span className="absolute text-3xs font-black text-emerald-600 dark:text-emerald-400">{totalChecked}/4</span>
                        </div>
                      </div>
                    </div>
                    {/* Timeline Grid layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="timeline-routine-grid">
                      {routines.map((routine, idx) => (
                        <Card 
                          key={idx} 
                          id={`timeline-card-${idx}`}
                          className={`relative border overflow-hidden transition-all duration-300 rounded-2xl flex flex-col justify-between h-full ${routine.completed ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/30 shadow-xs' : 'border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md hover:-translate-y-0.5'}`}
                        >
                          {/* Subtle time-of-day gradient strip at top */}
                          <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${routine.completed ? 'from-emerald-500 to-teal-500' : routine.gradient.split(' ')[1] + ' ' + routine.gradient.split(' ')[2]}`} />

                          <CardContent className="p-5 pt-6 flex flex-col gap-4 h-full justify-between">
                            <div className="flex justify-between items-start gap-2 border-b border-slate-100 dark:border-slate-800/60 pb-3.5">
                              <div className="flex gap-2.5 items-center">
                                <div className={`p-2 rounded-xl flex items-center justify-center border ${routine.completed ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-slate-50 dark:bg-slate-950 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}>
                                  {routine.completed ? <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> : routine.icon}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs font-extrabold text-slate-900 dark:text-white leading-tight">{routine.title}</span>
                                  <span className="text-3xs text-slate-400 dark:text-slate-500 font-black tracking-wider uppercase mt-0.5">{routine.time}</span>
                                </div>
                              </div>

                              {/* Interactive checkmark toggle */}
                              <button 
                                onClick={routine.toggle} 
                                className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all duration-300 shadow-2xs ${routine.completed ? 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-transparent hover:border-emerald-500 hover:text-emerald-500/50'}`}
                              >
                                <span className="text-xs font-black select-none">✓</span>
                              </button>
                            </div>

                            {/* Timeline steps */}
                            <div className="flex flex-col gap-3.5 my-1 flex-1 text-left justify-center">
                              {/* Hydration */}
                              <div className="flex gap-2.5 items-start">
                                <span className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${routine.completed ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                                <div className="flex flex-col">
                                  <span className="text-3xs uppercase font-black tracking-wider text-slate-400 dark:text-slate-500">Hydration</span>
                                  <p className={`text-2xs font-medium leading-relaxed mt-0.5 ${routine.completed ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-700 dark:text-slate-300'}`}>
                                    {routine.hydration}
                                  </p>
                                </div>
                              </div>

                              {/* Meal */}
                              <div className="flex gap-2.5 items-start">
                                <span className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${routine.completed ? 'bg-emerald-500' : 'bg-emerald-500'}`} />
                                <div className="flex flex-col">
                                  <span className="text-3xs uppercase font-black tracking-wider text-slate-400 dark:text-slate-500">Meal</span>
                                  <p className={`text-2xs font-extrabold leading-relaxed mt-0.5 ${routine.completed ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-900 dark:text-slate-100'}`}>
                                    {routine.meal}
                                  </p>
                                </div>
                              </div>

                              {/* Activity */}
                              <div className="flex gap-2.5 items-start">
                                <span className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${routine.completed ? 'bg-emerald-500' : 'bg-orange-500'}`} />
                                <div className="flex flex-col">
                                  <span className="text-3xs uppercase font-black tracking-wider text-slate-400 dark:text-slate-500">Activity</span>
                                  <p className={`text-2xs font-medium leading-relaxed mt-0.5 ${routine.completed ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-700 dark:text-slate-300'}`}>
                                    {routine.activity}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Clinical Benefit */}
                            <div className="pt-3 border-t border-dashed border-slate-200 dark:border-slate-800">
                              <p className={`text-2xs font-medium leading-relaxed ${routine.completed ? 'text-slate-400 dark:text-slate-500 italic' : 'text-emerald-700 dark:text-emerald-400'}`}>
                                <span className="font-extrabold">Clinical Benefit: </span>{routine.benefit}
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
              <div className="lg:col-span-4 flex flex-col gap-6 sticky top-24" id="overview-sidebar">
                
                {/* Biological Parameters Header */}
                <div className="border-b border-slate-200/80 dark:border-slate-800/80 pb-3 text-left">
                  <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Biological Parameters
                  </h3>
                  <p className="text-3xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-extrabold mt-0.5">
                    Sync Status: Fully Synced
                  </p>
                </div>

                {/* Bio Grid Cards */}
                <div className="grid grid-cols-2 gap-4" id="overview-bio-grid">
                
                <Card id="bio-card-weight" className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md transition-all duration-300 rounded-2xl">
                  <CardContent className="p-5 flex flex-col gap-1 text-left">
                    <span className="text-3xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Body Mass</span>
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{userBio.weight}</span>
                    <span className="text-2xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-1 font-extrabold">
                      <TrendingUp className="w-3.5 h-3.5" /> Stable Trend
                    </span>
                  </CardContent>
                </Card>

                <Card id="bio-card-height" className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md transition-all duration-300 rounded-2xl">
                  <CardContent className="p-5 flex flex-col gap-1 text-left">
                    <span className="text-3xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Physical Stature</span>
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{userBio.height}</span>
                    <span className="text-2xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Normal limits</span>
                  </CardContent>
                </Card>

                <Card id="bio-card-activity" className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md transition-all duration-300 rounded-2xl">
                  <CardContent className="p-5 flex flex-col gap-1 text-left">
                    <span className="text-3xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Metabolic Activity</span>
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white mt-1.5 truncate">{userBio.activity}</span>
                    <span className="text-2xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-1 font-extrabold">
                      <CheckCircle className="w-3.5 h-3.5" /> Normal range
                    </span>
                  </CardContent>
                </Card>

                <Card id="bio-card-goal" className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md transition-all duration-300 rounded-2xl">
                  <CardContent className="p-5 flex flex-col gap-1 text-left">
                    <span className="text-3xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Onboarding Goal</span>
                    <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-1.5 truncate">{userBio.goal}</span>
                    <span className="text-2xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Educational focus</span>
                  </CardContent>
                </Card>

              </div>

              {/* Middle Section - Allergen Warning Simulator */}
              <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md transition-all duration-300 rounded-2xl flex flex-col justify-between text-left" id="allergen-simulator-card">
                  <CardHeader className="p-6 pb-3">
                    <CardTitle className="text-base font-extrabold text-slate-900 dark:text-white">Interactive Food Allergen Warning Radar</CardTitle>
                    <CardDescription className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Select an allergen biological flag below to preview the instant alert guidelines framework in action.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 flex flex-col gap-5">
                    
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
                      <Alert variant="success" title="No Active Triggers" id="simulator-empty-notif" className="rounded-xl border-emerald-100 dark:border-emerald-900/40 text-xs">
                        No allergy profile alerts currently triggered. Defaulting to general nutrition listings.
                      </Alert>
                    )}

                  </CardContent>
                </Card>

                <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md transition-all duration-300 rounded-2xl flex flex-col justify-between text-left" id="educational-links-card">
                  <CardHeader className="p-6 pb-3">
                    <CardTitle className="text-base font-extrabold text-slate-900 dark:text-white">Scientific Resources</CardTitle>
                    <CardDescription className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Trusted educational organizations and dietary research data portals.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 flex flex-col gap-3">
                    
                    <div className="flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl cursor-pointer border border-slate-100 dark:border-slate-800/60 transition-all duration-300" id="edu-link-1">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">World Health Organization</h4>
                          <p className="text-3xs font-extrabold text-slate-400 dark:text-slate-500 uppercase mt-0.5 tracking-wider">Public diet & lifestyle reviews</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>

                    <div className="flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl cursor-pointer border border-slate-100 dark:border-slate-800/60 transition-all duration-300" id="edu-link-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                          <ClipboardList className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Harvard Nutrition Source</h4>
                          <p className="text-3xs font-extrabold text-slate-400 dark:text-slate-500 uppercase mt-0.5 tracking-wider">Comprehensive ingredient research</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>

                  </CardContent>
                </Card>

              </div>

            </div>
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
          {activeTab === 'fitness' && (() => {
            const todayStr = new Date().toISOString().split('T')[0];
            const todayWorkoutLogs = workoutLogs.filter(l => l.date === todayStr);

            const todayDurationTotal = todayWorkoutLogs.reduce((sum, l) => sum + l.duration, 0);
            const todayCaloriesTotal = todayWorkoutLogs.reduce((sum, l) => sum + l.caloriesBurned, 0);
            const todayWorkoutsCount = todayWorkoutLogs.length;

            const dailyDurationGoal = exerciseTarget || 30;
            const dailyCaloriesGoal = 300;

            const last7Days = Array.from({ length: 7 }).map((_, i) => {
              const d = new Date(Date.now() - (6 - i) * 86400000);
              const dateStr = d.toISOString().split('T')[0];
              const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
              const dayLogs = workoutLogs.filter(l => l.date === dateStr);
              const minutes = dayLogs.reduce((sum, l) => sum + l.duration, 0);
              const calories = dayLogs.reduce((sum, l) => sum + l.caloriesBurned, 0);
              const isToday = dateStr === todayStr;
              return { dateStr, dayName, minutes, calories, isToday, count: dayLogs.length };
            });

            const weeklyTotalMinutes = last7Days.reduce((sum, d) => sum + d.minutes, 0);
            const weeklyTotalCalories = last7Days.reduce((sum, d) => sum + d.calories, 0);
            const weeklyGoalMinutes = dailyDurationGoal * 7;

            let currentStreak = 0;
            let checkDate = new Date();
            for (let i = 0; i < 30; i++) {
              const dateStr = checkDate.toISOString().split('T')[0];
              const hasLogs = workoutLogs.some(l => l.date === dateStr && l.duration > 0);
              if (hasLogs) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
              } else if (i === 0) {
                checkDate.setDate(checkDate.getDate() - 1);
              } else {
                break;
              }
            }

            return (
              <div className="flex flex-col gap-8 animate-fade-in" id="tab-fitness-content">
                
                {/* 1. Header Banner */}
                <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl border border-indigo-500/20" id="fitness-header-banner">
                  <div className="flex flex-col gap-2 max-w-2xl text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-3xs font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        <Dumbbell className="w-3 h-3 text-indigo-400" />
                        Exercise Management Integrated
                      </span>
                      <span className="text-2xs font-extrabold text-slate-400 uppercase tracking-widest">Fitness & Activity Engine</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                      Fitness & Motion Dashboard
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                      Real-time workout telemetry connected directly to your clinical exercise management repository. Track duration, estimated calories, weekly consistency, and exercise logs.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-stretch sm:self-auto shrink-0 flex-wrap">
                    <Button
                      variant="primary"
                      size="md"
                      icon={<Plus className="w-4 h-4" />}
                      onClick={() => setIsModalOpen(true)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs h-11 px-5 rounded-xl shadow-md border-none cursor-pointer"
                      id="btn-record-workout-hero"
                    >
                      Record Activity
                    </Button>
                    <Button
                      variant="secondary"
                      size="md"
                      icon={<Dumbbell className="w-4 h-4" />}
                      onClick={() => setActiveTab('admin-exercise')}
                      className="bg-slate-800 text-slate-200 hover:bg-slate-700 font-extrabold text-xs h-11 px-4 border border-slate-700 rounded-xl cursor-pointer"
                      id="btn-manage-exercises-hero"
                    >
                      Exercise Repository
                    </Button>
                  </div>
                </div>

                {/* 2. Today's Exercise Summary (KPI Grid) */}
                <div className="flex flex-col gap-3 text-left" id="fitness-kpi-section">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                      <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      Today's Activity Telemetry & KPI Summary
                    </h3>
                    <span className="text-3xs font-extrabold uppercase text-slate-400 tracking-wider">Live Metrics</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="fitness-kpi-cards">
                    
                    {/* KPI 1: Active Duration */}
                    <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-3xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-2xl">
                      <CardContent className="p-5 flex flex-col justify-between h-full gap-3 text-left">
                        <div className="flex items-start justify-between">
                          <span className="text-3xs uppercase font-black tracking-wider text-indigo-600 dark:text-indigo-400">
                            Total Duration
                          </span>
                          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                            <Clock className="w-5 h-5" />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-3xl font-black text-slate-900 dark:text-white">{todayDurationTotal}</span>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">/ {dailyDurationGoal} mins</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2.5 overflow-hidden">
                            <div
                              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, Math.round((todayDurationTotal / dailyDurationGoal) * 100))}%` }}
                            />
                          </div>
                          <p className="text-3xs font-semibold text-slate-500 dark:text-slate-400 mt-1.5 flex items-center justify-between">
                            <span>Goal: {dailyDurationGoal}m</span>
                            <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                              {Math.round((todayDurationTotal / dailyDurationGoal) * 100)}%
                            </span>
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* KPI 2: Calories Burned */}
                    <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-3xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-2xl">
                      <CardContent className="p-5 flex flex-col justify-between h-full gap-3 text-left">
                        <div className="flex items-start justify-between">
                          <span className="text-3xs uppercase font-black tracking-wider text-amber-600 dark:text-amber-400">
                            Calories Burned
                          </span>
                          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-100 dark:border-amber-900/30">
                            <Flame className="w-5 h-5" />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-3xl font-black text-slate-900 dark:text-white">{todayCaloriesTotal}</span>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">kcal est.</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2.5 overflow-hidden">
                            <div
                              className="bg-amber-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, Math.round((todayCaloriesTotal / dailyCaloriesGoal) * 100))}%` }}
                            />
                          </div>
                          <p className="text-3xs font-semibold text-slate-500 dark:text-slate-400 mt-1.5 flex items-center justify-between">
                            <span>Target: ~{dailyCaloriesGoal} kcal</span>
                            <span className="font-extrabold text-amber-600 dark:text-amber-400">
                              {Math.round((todayCaloriesTotal / dailyCaloriesGoal) * 100)}%
                            </span>
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* KPI 3: Completed Workouts */}
                    <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-3xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-2xl">
                      <CardContent className="p-5 flex flex-col justify-between h-full gap-3 text-left">
                        <div className="flex items-start justify-between">
                          <span className="text-3xs uppercase font-black tracking-wider text-emerald-600 dark:text-emerald-400">
                            Completed Workouts
                          </span>
                          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-3xl font-black text-slate-900 dark:text-white">{todayWorkoutsCount}</span>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">sessions today</span>
                          </div>
                          <p className="text-3xs font-semibold text-slate-500 dark:text-slate-400 mt-2.5 flex items-center gap-1">
                            <Dumbbell className="w-3 h-3 text-emerald-500" />
                            {todayWorkoutsCount > 0 ? `${todayWorkoutsCount} logged active sets` : 'No workouts logged yet today'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* KPI 4: Activity Streak */}
                    <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-3xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-2xl">
                      <CardContent className="p-5 flex flex-col justify-between h-full gap-3 text-left">
                        <div className="flex items-start justify-between">
                          <span className="text-3xs uppercase font-black tracking-wider text-purple-600 dark:text-purple-400">
                            Activity Streak
                          </span>
                          <div className="p-2.5 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-xl border border-purple-100 dark:border-purple-900/30">
                            <Trophy className="w-5 h-5" />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-3xl font-black text-slate-900 dark:text-white">{currentStreak}</span>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">days active 🔥</span>
                          </div>
                          <p className="text-3xs font-semibold text-purple-600 dark:text-purple-400 mt-2.5 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-500" /> Consistency Milestone Level {Math.max(1, Math.floor(currentStreak / 3))}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                  </div>
                </div>

                {/* 3. WEEKLY ACTIVITY OVERVIEW & TARGET PROGRESS RINGS */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="weekly-overview-section">
                  
                  {/* Weekly Activity Distribution Bar Chart (7 cols) */}
                  <Card className="lg:col-span-7 border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xs rounded-2xl text-left">
                    <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          Weekly Activity Overview
                        </CardTitle>
                        <span className="text-3xs font-black uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-full border border-indigo-200/50">
                          {weeklyTotalMinutes} mins total
                        </span>
                      </div>
                      <CardDescription className="text-xs">
                        Daily breakdown of physical movement duration across the last 7 days.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="flex items-end justify-between gap-2 h-48 pt-6 pb-2 px-2">
                        {last7Days.map((day, idx) => {
                          const maxMins = Math.max(60, ...last7Days.map(d => d.minutes));
                          const barHeightPercent = Math.max(8, Math.round((day.minutes / maxMins) * 100));
                          return (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                              <span className="text-3xs font-extrabold text-slate-600 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                {day.minutes}m
                              </span>
                              <div className="w-full max-w-[36px] bg-slate-100 dark:bg-slate-800 rounded-t-lg overflow-hidden flex flex-col justify-end h-36">
                                <div
                                  className={`w-full transition-all duration-500 rounded-t-lg ${
                                    day.isToday
                                      ? 'bg-gradient-to-t from-indigo-600 to-indigo-400 shadow-sm'
                                      : day.minutes > 0
                                      ? 'bg-indigo-400 dark:bg-indigo-600/80 hover:bg-indigo-500'
                                      : 'bg-slate-200/60 dark:bg-slate-800/60'
                                  }`}
                                  style={{ height: `${barHeightPercent}%` }}
                                />
                              </div>
                              <span className={`text-2xs font-bold ${day.isToday ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'text-slate-400'}`}>
                                {day.dayName}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-2xs text-slate-500 dark:text-slate-400 font-medium">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" /> Today's Session
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 inline-block" /> Past Recorded Days
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          Est. Calories: {weeklyTotalCalories} kcal
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Weekly Progress Ring & Goal Compliance (5 cols) */}
                  <Card className="lg:col-span-5 border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xs rounded-2xl text-left flex flex-col justify-between">
                    <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
                      <CardTitle className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        Weekly Target Progress Ring
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Accumulated active time vs recommended {weeklyGoalMinutes}-min weekly baseline.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 flex flex-col items-center justify-center my-auto gap-4">
                      <div className="relative w-36 h-36 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            className="stroke-slate-100 dark:stroke-slate-800"
                            strokeWidth="10"
                            fill="transparent"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            className="stroke-indigo-600 transition-all duration-1000 ease-out"
                            strokeWidth="10"
                            strokeDasharray={251.2}
                            strokeDashoffset={251.2 - (251.2 * Math.min(100, Math.round((weeklyTotalMinutes / weeklyGoalMinutes) * 100))) / 100}
                            strokeLinecap="round"
                            fill="transparent"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center text-center">
                          <span className="text-2xl font-black text-slate-900 dark:text-white">
                            {Math.min(100, Math.round((weeklyTotalMinutes / weeklyGoalMinutes) * 100))}%
                          </span>
                          <span className="text-3xs uppercase font-extrabold text-slate-400 tracking-wider">Target Met</span>
                        </div>
                      </div>

                      <div className="w-full flex items-center justify-around bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                        <div className="text-center">
                          <p className="text-2xs text-slate-400 uppercase font-black">Logged Time</p>
                          <p className="text-sm font-black text-slate-900 dark:text-white">{weeklyTotalMinutes} mins</p>
                        </div>
                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
                        <div className="text-center">
                          <p className="text-2xs text-slate-400 uppercase font-black">Weekly Goal</p>
                          <p className="text-sm font-black text-slate-900 dark:text-white">{weeklyGoalMinutes} mins</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                </div>

                {/* 4. EXERCISE MANAGEMENT REPOSITORY INTEGRATION */}
                <div className="flex flex-col gap-3 text-left" id="managed-exercise-catalog">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                        <Dumbbell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        Exercise Management Library Quick Launcher
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Clinical routines from Exercise Management. Click "Log Session" to quickly register a completed workout.
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab('admin-exercise')}
                      className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-950/40 cursor-pointer"
                    >
                      Manage Repository →
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="managed-exercises-grid">
                    {managedExercisesList.slice(0, 6).map((ex) => (
                      <Card
                        key={ex.id}
                        className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-3xs hover:shadow-md transition-all duration-200 rounded-2xl flex flex-col justify-between"
                      >
                        <CardContent className="p-5 flex flex-col justify-between h-full gap-3 text-left">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-3xs uppercase font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/40">
                                {ex.category}
                              </span>
                              <span className="text-3xs font-extrabold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {ex.difficulty}
                              </span>
                            </div>
                            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">{ex.name}</h4>
                            <p className="text-2xs text-slate-500 dark:text-slate-400 line-clamp-2">{ex.description || 'Clinical health exercise routine.'}</p>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 mt-1">
                            <div className="flex items-center gap-3 text-2xs font-extrabold text-slate-600 dark:text-slate-300">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-indigo-500" /> {ex.duration}
                              </span>
                              <span className="flex items-center gap-1">
                                <Flame className="w-3.5 h-3.5 text-amber-500" /> ~{ex.caloriesBurned || 120} kcal
                              </span>
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              icon={<Plus className="w-3 h-3" />}
                              onClick={() => handleQuickLogManagedExercise(ex)}
                              className="text-xs font-bold border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl cursor-pointer"
                            >
                              Log Session
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* 5. COMPLETED WORKOUTS ACTIVITY TIMELINE */}
                <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xs rounded-2xl text-left" id="card-workout-timeline">
                  <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <History className="w-4 h-4 text-indigo-500" />
                        Completed Workout Logs & Activity Timeline
                      </CardTitle>
                      <span className="text-3xs font-extrabold uppercase text-slate-400 tracking-wider">
                        {workoutLogs.length} Records
                      </span>
                    </div>
                    <CardDescription className="text-xs">
                      Chronological activity stream of all recorded physical workout sessions.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-5">
                    {workoutLogs.length === 0 ? (
                      <EmptyState
                        title="No Workout Logs Recorded"
                        description="You have not logged any exercise sessions yet. Click below or pick a routine from the Exercise Management library above."
                        actionLabel="Record Activity Session"
                        onAction={() => setIsModalOpen(true)}
                        id="fitness-timeline-empty"
                      />
                    ) : (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {workoutLogs.map((log) => (
                          <div
                            key={log.id}
                            className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 px-3 rounded-xl transition-colors"
                          >
                            <div className="flex items-start gap-3.5">
                              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-200/50 shrink-0 mt-0.5">
                                <Dumbbell className="w-4 h-4" />
                              </div>
                              <div className="flex flex-col text-left">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">{log.name}</span>
                                  <span className="text-3xs font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/40">
                                    {log.category}
                                  </span>
                                  {log.difficulty && (
                                    <span className="text-3xs font-extrabold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                      {log.difficulty}
                                    </span>
                                  )}
                                </div>
                                {log.notes && (
                                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                                    "{log.notes}"
                                  </p>
                                )}
                                <div className="flex items-center gap-3 text-3xs font-extrabold text-slate-400 dark:text-slate-500 mt-1.5">
                                  <span>📅 {log.date} at {log.timestamp}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                              <div className="flex items-center gap-3 text-2xs font-extrabold">
                                <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/30 flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {log.duration} mins
                                </span>
                                <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-900/30 flex items-center gap-1">
                                  <Flame className="w-3 h-3" /> ~{log.caloriesBurned} kcal
                                </span>
                              </div>

                              <button
                                onClick={() => handleDeleteWorkoutLog(log.id)}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                                title="Delete Workout Log"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

              </div>
            );
          })()}

          {/* TAB 4: Admin Users Management */}
          {activeTab === 'admin' && (
            <div className="flex flex-col gap-6" id="tab-admin-users-content">
              <AdminUsersManagement />
            </div>
          )}

          {/* TAB 5: Admin Food Management */}
          {activeTab === 'admin-food' && (
            <div className="flex flex-col gap-6" id="tab-admin-food-content">
              <AdminFoodManagement />
            </div>
          )}

          {/* TAB 6: Admin Exercise Management */}
          {activeTab === 'admin-exercise' && (
            <div className="flex flex-col gap-6" id="tab-admin-exercise-content">
              <AdminExerciseManagement />
            </div>
          )}

          {/* TAB 7: Admin Recommendations Management */}
          {activeTab === 'admin-recommendations' && (
            <div className="flex flex-col gap-6" id="tab-admin-recommendations-content">
              <AdminRecommendationsManagement />
            </div>
          )}

          {/* TAB 8: Admin Diseases & Conditions Management */}
          {activeTab === 'admin-diseases' && (
            <div className="flex flex-col gap-6" id="tab-admin-diseases-content">
              <AdminDiseasesManagement />
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
              Save Activity Log
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateWorkout} className="flex flex-col gap-4 text-left" id="modal-workout-form">
          
          <Select
            label="Preset Routine from Exercise Management"
            id="modal-select-managed-exercise"
            value={selectedExerciseId}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedExerciseId(val);
              if (val !== 'custom') {
                const matched = managedExercisesList.find(m => m.id === val);
                if (matched) {
                  setWorkoutName(matched.name);
                  setWorkoutCategory(matched.category);
                  const d = parseInt(matched.duration.replace(/\D/g, ''), 10) || 30;
                  setWorkoutDuration(d.toString());
                  setWorkoutCalories((matched.caloriesBurned || Math.round(d * 5.5)).toString());
                  setWorkoutDifficulty(matched.difficulty);
                }
              }
            }}
            options={[
              { value: 'custom', label: 'Custom Activity (Type Manual Routine Below)' },
              ...managedExercisesList.map(m => ({
                value: m.id,
                label: `${m.name} (${m.category} • ${m.duration} • ~${m.caloriesBurned || 120} kcal)`
              }))
            ]}
          />

          <Input
            label="Workout Exercise Name"
            id="modal-workout-name"
            placeholder="e.g. Cardiovascular Jogging, Yoga, Weight Lifting"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Exercise Category"
              id="modal-workout-category"
              value={workoutCategory}
              onChange={(e) => setWorkoutCategory(e.target.value)}
              options={[
                { value: 'Cardio', label: 'Cardio' },
                { value: 'Strength Training', label: 'Strength Training' },
                { value: 'Flexibility', label: 'Flexibility' },
                { value: 'Rehab & Recovery', label: 'Rehab & Recovery' },
                { value: 'Mind-Body', label: 'Mind-Body' },
              ]}
            />

            <Select
              label="Difficulty Intensity"
              id="modal-workout-difficulty"
              value={workoutDifficulty}
              onChange={(e) => setWorkoutDifficulty(e.target.value)}
              options={[
                { value: 'Beginner', label: 'Beginner' },
                { value: 'Intermediate', label: 'Intermediate' },
                { value: 'Advanced', label: 'Advanced' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Session Duration (Minutes)"
              type="number"
              id="modal-workout-duration"
              value={workoutDuration}
              onChange={(e) => {
                const d = e.target.value;
                setWorkoutDuration(d);
                const dNum = parseInt(d, 10);
                if (!isNaN(dNum)) {
                  setWorkoutCalories(Math.round(dNum * 5.5).toString());
                }
              }}
              required
            />

            <Input
              label="Estimated Calories Burned (kcal)"
              type="number"
              id="modal-workout-calories"
              value={workoutCalories}
              onChange={(e) => setWorkoutCalories(e.target.value)}
            />
          </div>

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
