import React from 'react';
import {
  Heart,
  ArrowLeft,
  Sparkles,
  Apple,
  TrendingUp,
  Activity,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Flame,
  User,
  ExternalLink,
  ChevronRight,
  Utensils,
  Lightbulb,
  CornerDownRight,
  ShieldAlert,
  Droplet,
  Dumbbell,
  Scale,
  Pencil,
  Plus
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { useHealthProfile } from '../context/HealthProfileContext';
import { useAuth } from '../context/AuthContext';
import { generateRecommendations } from '../utils/recommendationEngine';
import Button from '../components/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/Card';
import ThemeToggle from '../components/ThemeToggle';
import Alert from '../components/Alert';

export default function RecommendationsPage() {
  const { navigateTo } = useNavigation();
  const { profile, loadingProfile } = useHealthProfile();
  const { fetchWithAuth, isAuthenticated } = useAuth();

  // Sync recommendations to the database on mount/load
  React.useEffect(() => {
    if (isAuthenticated && profile) {
      console.log('[DEBUG_LOG] [RECOMMENDATIONS_PAGE] Syncing recommendations with backend database...');
      fetchWithAuth('/api/recommendations')
        .then(async (res) => {
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            console.error('[DEBUG_LOG] [RECOMMENDATIONS_PAGE] Failed to sync recommendations to database:', errData?.message || res.statusText);
          } else {
            console.log('[DEBUG_LOG] [RECOMMENDATIONS_PAGE] Recommendations synchronized with backend successfully.');
          }
        })
        .catch((err) => {
          console.error('[DEBUG_LOG] [RECOMMENDATIONS_PAGE] Error syncing recommendations:', err);
        });
    }
  }, [isAuthenticated, profile, fetchWithAuth]);

  // 0. If profile is loading, show loading spinner
  if (loadingProfile) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300" id="recs-profile-loading">
        <header className="px-4 py-4 md:px-8 border-b border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 flex justify-between items-center" id="loading-recs-header">
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

        <main className="flex-1 flex items-center justify-center p-6" id="loading-recs-main">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading your profile and personalized recommendations...</p>
          </div>
        </main>

        <footer className="py-6 border-t border-slate-100 dark:border-slate-900 text-center text-xs text-slate-400" id="loading-recs-footer">
          © 2026 Smart Health Guide
        </footer>
      </div>
    );
  }

  // 1. If no profile, show friendly incomplete message
  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100" id="recs-empty-profile">
        <header className="px-4 py-4 border-b border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 flex justify-between items-center" id="empty-recs-header">
          <span className="font-extrabold text-base text-emerald-600">Smart Health Guide</span>
          <ThemeToggle />
        </header>
        <main className="flex-1 flex items-center justify-center p-6" id="empty-recs-main">
          <Card className="max-w-md p-8 border border-slate-100 dark:border-slate-800 text-center rounded-3xl bg-white dark:bg-slate-900" id="empty-profile-card">
            <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto mb-4 animate-bounce" />
            <h2 className="text-xl font-black text-slate-950 dark:text-white">Recommendations Locked</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-6 leading-relaxed">
              We couldn't detect your Health Profile parameters. Complete your clinical indicators to unlock customized dietary, therapeutic, and exercise guidelines.
            </p>
            <div className="flex flex-col gap-3">
              <Button variant="primary" size="md" onClick={() => navigateTo('profile-form')} id="empty-recs-setup-btn" className="w-full font-bold">
                Create Health Profile Now
              </Button>
              <Button variant="outline" size="md" onClick={() => navigateTo('dashboard')} id="empty-recs-home-btn" className="w-full font-bold">
                Go to Dashboard
              </Button>
            </div>
          </Card>
        </main>
        <footer className="px-4 py-6 text-center text-xs text-slate-400 border-t border-slate-100 dark:border-slate-900" id="empty-recs-footer">
          © 2026 Smart Health Guide. Built with patient-first precision.
        </footer>
      </div>
    );
  }

  // 2. Compute personalized data using our modular engine
  const recs = generateRecommendations(profile);

  // Helper to color-code BMI
  const getBmiBadgeStyle = (category: string) => {
    switch (category) {
      case 'Underweight':
        return 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30';
      case 'Healthy Weight':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30';
      case 'Overweight':
        return 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
      case 'Obese':
        return 'bg-red-50 text-red-600 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 animate-fade-in" id="recommendations-root">
      
      {/* Navbar Header */}
      <header className="px-4 py-4 md:px-8 border-b border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950/80 backdrop-blur-md flex justify-between items-center sticky top-0 z-30" id="recs-header">
        <button
          id="recs-back-btn"
          onClick={() => navigateTo('profile-summary')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Profile Summary</span>
          <span className="sm:hidden">Back</span>
        </button>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateTo('dashboard')}
            id="recs-dashboard-btn"
            className="font-bold text-xs"
          >
            Dashboard
          </Button>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 flex flex-col gap-6 text-left" id="recs-main">
        
        {/* Welcome Header Hero */}
        <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-lg shadow-emerald-600/10" id="recs-welcome">
          <div className="flex flex-col gap-2 max-w-2xl">
            <span className="bg-white/10 px-3 py-1 rounded-full text-2xs font-bold uppercase tracking-wider w-fit flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bio-Calculated Recommendation Engine</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Clinical Guidelines for {profile.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-50/90 leading-relaxed mt-1">
              Custom suggestions compiled using your registered parameters: 
              Age <strong className="text-white">{profile.age}</strong>, Goal <strong className="text-white">{profile.healthGoal}</strong>, Diet Strategy <strong className="text-white">{profile.dietaryPreference || 'Standard'}</strong>, and Chronic Flags <strong className="text-white">({profile.healthConditions.filter(c => c !== 'none').length || 'None'})</strong>.
            </p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button
              variant="secondary"
              className="bg-white/10 text-white hover:bg-white/20 border-white/15 whitespace-nowrap font-bold flex-1 md:flex-none text-xs flex items-center justify-center gap-2"
              onClick={() => navigateTo('profile-form')}
              id="recs-edit-profile-top"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </Button>
          </div>
        </div>

        {/* Dynamic Bio-Indicator Panel */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6" id="recs-indicators-panel">
          
          {/* Calculated BMI Meter Card */}
          <Card className="md:col-span-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800" id="bmi-calculator-card">
            <CardContent className="p-5 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-2xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-emerald-600" />
                  <span>Calculated Body Mass Index</span>
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${getBmiBadgeStyle(recs.bmiCategory)}`}>
                  {recs.bmiCategory}
                </span>
              </div>
              
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
                  {recs.bmiValue || '--'}
                </span>
                <span className="text-xs text-slate-400 font-medium">kg/m²</span>
              </div>

              {/* BMI Bar indicator */}
              <div className="flex flex-col gap-1.5 mt-2">
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex" id="bmi-range-bar">
                  <div className="h-full bg-blue-400" style={{ width: '20%' }} title="Underweight" />
                  <div className="h-full bg-emerald-500" style={{ width: '30%' }} title="Normal" />
                  <div className="h-full bg-amber-500" style={{ width: '25%' }} title="Overweight" />
                  <div className="h-full bg-red-500" style={{ width: '25%' }} title="Obese" />
                </div>
                <div className="flex justify-between text-2xs text-slate-400 dark:text-slate-500 font-mono">
                  <span>&lt; 18.5</span>
                  <span>18.5 - 24.9</span>
                  <span>25.0 - 29.9</span>
                  <span>30.0+</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                {recs.bmiCategory === 'Healthy Weight' ? (
                  "Your weight lies within the healthy clinical range. Our meal suggestions prioritize longevity, micronutrient loading, and energetic sustainability."
                ) : recs.bmiCategory === 'Underweight' ? (
                  "Your weight falls slightly below the healthy average. Recommendations focus on muscle preservation and calorie-dense nutrition complexes."
                ) : (
                  "Our recommendations optimize glycemic load, satiety thresholds, and steady cardiovascular output to assist in natural metabolic efficiency."
                )}
              </p>
            </CardContent>
          </Card>

          {/* Quick Clinical Profile Summary Card */}
          <Card className="md:col-span-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800" id="clinical-summary-panel">
            <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
              <span className="text-2xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-600" />
                <span>Clinical Profile Overview</span>
              </span>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850">
                  <span className="text-2xs text-slate-400 block font-semibold mb-0.5">Activity Factor</span>
                  <span className="font-bold text-slate-900 dark:text-white truncate block">{profile.activityLevel}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850">
                  <span className="text-2xs text-slate-400 block font-semibold mb-0.5">Diet Preference</span>
                  <span className="font-bold text-slate-900 dark:text-white truncate block">{profile.dietaryPreference || 'None'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850">
                  <span className="text-2xs text-slate-400 block font-semibold mb-0.5">Primary Goal</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 truncate block font-bold">{profile.healthGoal}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850">
                  <span className="text-2xs text-slate-400 block font-semibold mb-0.5">Allergens</span>
                  <span className={`truncate block font-bold ${profile.foodAllergies.includes('none') ? 'text-slate-500' : 'text-amber-600 dark:text-amber-400'}`}>
                    {profile.foodAllergies.includes('none') ? 'None' : `${profile.foodAllergies.length} Flagged`}
                  </span>
                </div>
              </div>

              {profile.currentMedications && (
                <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-2xs leading-relaxed text-slate-500 dark:text-slate-400">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Active RX: </span>
                  {profile.currentMedications}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* SECTION 1: FOODS TO EAT */}
        <Card className="border border-slate-100 dark:border-slate-800 shadow-xs" id="card-foods-to-eat">
          <CardHeader className="border-b border-slate-50 dark:border-slate-850/50 bg-emerald-50/10 dark:bg-emerald-950/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <Apple className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-black text-slate-900 dark:text-white">Foods to Eat</CardTitle>
                <CardDescription>Target ingredients optimized for your metabolic rate and wellness goals.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="eat-items-list">
              {recs.foodsToEat.map((food) => (
                <div 
                  key={food.id} 
                  className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-850 rounded-2xl flex items-start gap-3 hover:border-emerald-500/30 transition-all group"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{food.title}</h4>
                      {food.badge && (
                        <span className="text-4xs px-2 py-0.5 font-bold uppercase tracking-widest rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono">
                          {food.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{food.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SECTION 2: FOODS TO AVOID */}
        <Card className="border border-slate-100 dark:border-slate-800 shadow-xs" id="card-foods-to-avoid">
          <CardHeader className="border-b border-slate-50 dark:border-slate-850/50 bg-amber-50/10 dark:bg-amber-950/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-xl">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-black text-slate-900 dark:text-white">Foods to Avoid</CardTitle>
                <CardDescription>Potentially inflammatory, high-glycemic, or reactive dietary items to exclude.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="avoid-items-list">
              {recs.foodsToAvoid.map((food) => (
                <div 
                  key={food.id} 
                  className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-850 rounded-2xl flex items-start gap-3 hover:border-amber-500/30 transition-all group"
                >
                  <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{food.title}</h4>
                      {food.badge && (
                        <span className="text-4xs px-2 py-0.5 font-bold uppercase tracking-widest rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-mono">
                          {food.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{food.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SECTION 3: HEALTHY FOOD COMBINATIONS */}
        <Card className="border border-slate-100 dark:border-slate-800 shadow-xs" id="card-food-combinations">
          <CardHeader className="border-b border-slate-50 dark:border-slate-850/50 bg-purple-50/10 dark:bg-purple-950/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 rounded-xl">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-black text-slate-900 dark:text-white">Healthy Food Combinations</CardTitle>
                <CardDescription>Synergistic nutrition pairings designed to elevate bioavailability and suppress glycemic curves.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="combinations-items-list">
              {recs.healthyCombinations.map((comb) => (
                <div 
                  key={comb.id} 
                  className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-850 rounded-2xl flex items-start gap-3 hover:border-purple-500/30 transition-all group"
                >
                  <Heart className="w-5 h-5 text-purple-500 dark:text-purple-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{comb.title}</h4>
                      {comb.badge && (
                        <span className="text-4xs px-2 py-0.5 font-bold uppercase tracking-widest rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-mono">
                          {comb.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{comb.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SECTION 4: DAILY WATER INTAKE & HYDRATION */}
        <Card className="border border-slate-100 dark:border-slate-800 shadow-xs" id="card-hydration">
          <CardHeader className="border-b border-slate-50 dark:border-slate-850/50 bg-blue-50/10 dark:bg-blue-950/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-xl">
                <Droplet className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-black text-slate-900 dark:text-white">Daily Water Intake</CardTitle>
                <CardDescription>Calculated hydration thresholds adjusted for body mass and routine fluid excretion.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-5 bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/10 border border-blue-100/40 dark:border-blue-900/20 rounded-2xl" id="water-stat-banner">
              <div className="flex flex-col gap-1 max-w-xl">
                <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300">Hydration Baseline Overview</h4>
                <p className="text-xs text-blue-700/80 dark:text-blue-400/90 leading-relaxed font-medium">{recs.waterIntake.description}</p>
              </div>
              <div className="flex items-center gap-4 bg-white dark:bg-slate-900 px-5 py-4 rounded-xl border border-blue-200/50 dark:border-blue-900/40 shadow-xs flex-shrink-0 w-full sm:w-auto justify-center">
                <div className="text-center">
                  <span className="text-3xl font-black text-blue-600 dark:text-blue-400 font-mono">{recs.waterIntake.liters}</span>
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider mt-0.5">Liters / Day</span>
                </div>
                <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
                <div className="text-center">
                  <span className="text-3xl font-black text-blue-600 dark:text-blue-400 font-mono">{recs.waterIntake.cups}</span>
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider mt-0.5">Cups / Day</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold text-slate-450 uppercase tracking-widest font-mono">Therapeutic Hydration Tips</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="water-tips-list">
                {recs.waterIntake.tips.map((tip, idx) => (
                  <div key={idx} className="p-4 bg-slate-50/40 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-850 rounded-xl flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-mono font-black text-2xs flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 5: EXERCISE RECOMMENDATIONS */}
        <Card className="border border-slate-100 dark:border-slate-800 shadow-xs" id="card-exercise">
          <CardHeader className="border-b border-slate-50 dark:border-slate-850/50 bg-orange-50/10 dark:bg-orange-950/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 rounded-xl">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-black text-slate-900 dark:text-white">Exercise Recommendations</CardTitle>
                <CardDescription>Skeletal motion and cardiac base training custom-tailored to your clinical fitness level.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 flex flex-col gap-6">
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850">
                <span className="text-3xs text-slate-400 block font-bold uppercase tracking-wider mb-0.5">Strategy Type</span>
                <span className="text-xs font-black text-slate-950 dark:text-white block truncate">{recs.exercise.type}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850">
                <span className="text-3xs text-slate-400 block font-bold uppercase tracking-wider mb-0.5">Weekly Freq</span>
                <span className="text-xs font-black text-slate-950 dark:text-white block truncate">{recs.exercise.frequency}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850">
                <span className="text-3xs text-slate-400 block font-bold uppercase tracking-wider mb-0.5">Session Limit</span>
                <span className="text-xs font-black text-slate-950 dark:text-white block truncate">{recs.exercise.duration}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850">
                <span className="text-3xs text-slate-400 block font-bold uppercase tracking-wider mb-0.5">Target Intensity</span>
                <span className="text-xs font-black text-slate-950 dark:text-white block truncate">{recs.exercise.intensity}</span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold text-slate-450 uppercase tracking-widest font-mono">Suggested Micro-Routine</h4>
              <div className="flex flex-col gap-3" id="exercise-routines-list">
                {recs.exercise.routine.map((item, idx) => (
                  <div key={idx} className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-850 rounded-2xl flex gap-3 items-start">
                    <CornerDownRight className="w-4 h-4 text-orange-500 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {recs.exercise.precautions.length > 0 && (
              <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex flex-col gap-2">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Clinical Movement Precautions</span>
                </span>
                <ul className="list-disc pl-5 text-xs text-slate-550 dark:text-slate-400 flex flex-col gap-1.5 leading-relaxed font-medium">
                  {recs.exercise.precautions.map((pre, idx) => (
                    <li key={idx}>{pre}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* SECTION 6: LIFESTYLE TIPS */}
        <Card className="border border-slate-100 dark:border-slate-800 shadow-xs" id="card-lifestyle">
          <CardHeader className="border-b border-slate-50 dark:border-slate-850/50 bg-teal-50/10 dark:bg-teal-950/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 rounded-xl">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-black text-slate-900 dark:text-white">Lifestyle Tips</CardTitle>
                <CardDescription>Circadian and habit adaptations to assist biological markers and hormone regulation.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="lifestyle-items-list">
              {recs.lifestyleTips.map((tip) => (
                <div 
                  key={tip.id} 
                  className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-850 rounded-2xl flex items-start gap-3 hover:border-teal-500/30 transition-all group"
                >
                  <ShieldCheck className="w-5 h-5 text-teal-500 dark:text-teal-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{tip.title}</h4>
                      {tip.badge && (
                        <span className="text-4xs px-2 py-0.5 font-bold uppercase tracking-widest rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-mono">
                          {tip.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{tip.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Clinical / Educational Disclaimer Box */}
        <div className="p-5 rounded-3xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/40 dark:border-amber-900/25 flex gap-3.5 items-start" id="recs-clinical-disclaimer">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-2xs sm:text-xs text-slate-500 dark:text-slate-450 leading-relaxed font-medium">
            <strong>Clinical Disclaimer:</strong> Based on the information you provided, these recommendations are for educational purposes only and are not medical advice. Always consult a qualified healthcare professional before making health-related decisions.
          </p>
        </div>

        {/* Bottom Page Navigation Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end items-center gap-3 mt-4 border-t border-slate-100 dark:border-slate-900 pt-6" id="recs-bottom-actions">
          <Button
            variant="outline"
            size="md"
            onClick={() => navigateTo('profile-summary')}
            id="recs-view-summary-btn"
            className="w-full sm:w-auto font-bold text-sm"
          >
            Review Profile Summary
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => navigateTo('profile-form')}
            id="recs-edit-profile-btn"
            className="w-full sm:w-auto font-bold text-sm"
          >
            Edit Health Profile
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => navigateTo('dashboard')}
            id="recs-return-dashboard-btn"
            className="w-full sm:w-auto font-bold text-sm"
          >
            Return to Dashboard
          </Button>
        </div>

      </main>

      {/* Footer copyright */}
      <footer className="px-4 py-6 md:px-8 border-t border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 flex justify-between items-center text-xs text-slate-400" id="recs-footer">
        <span>© 2026 Smart Health Guide</span>
        <span>Secure Account Analysis</span>
      </footer>

    </div>
  );
}
