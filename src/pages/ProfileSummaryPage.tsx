import React from 'react';
import {
  Edit2,
  Heart,
  Activity,
  Award,
  ShieldAlert,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Flame,
  User,
  AlertCircle,
  Stethoscope,
  LayoutDashboard,
  CheckCircle2
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { useHealthProfile } from '../context/HealthProfileContext';
import Button from '../components/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/Card';
import Alert from '../components/Alert';
import ThemeToggle from '../components/ThemeToggle';

export default function ProfileSummaryPage() {
  const { navigateTo } = useNavigation();
  const { profile, loadingProfile } = useHealthProfile();

  // If profile is loading, show loading spinner
  if (loadingProfile) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300" id="profile-summary-loading">
        <header className="px-4 py-4 md:px-8 border-b border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 flex justify-between items-center" id="loading-summary-header">
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

        <main className="flex-1 flex items-center justify-center p-6" id="loading-summary-main">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading your health profile...</p>
          </div>
        </main>

        <footer className="py-6 border-t border-slate-100 dark:border-slate-900 text-center text-xs text-slate-400" id="loading-summary-footer">
          © 2026 Smart Health Guide
        </footer>
      </div>
    );
  }

  // If no profile exists, prompt user to create one
  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300" id="profile-summary-empty">
        <header className="px-4 py-4 md:px-8 border-b border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 flex justify-between items-center" id="empty-summary-header">
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

        <main className="flex-1 flex items-center justify-center p-6" id="empty-summary-main">
          <div className="max-w-md w-full text-center" id="empty-summary-box">
            <Card className="p-8 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl" id="empty-summary-card">
              <div className="inline-flex p-4 bg-emerald-600/10 text-emerald-600 rounded-2xl mb-4" id="empty-icon">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                No Health Profile Found
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-6 leading-relaxed">
                Before accessing custom health algorithms and food recommendations, you need to configure your personal wellness profile.
              </p>
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => navigateTo('profile-form')}
                id="empty-create-btn"
                icon={<Sparkles className="w-5 h-5" />}
              >
                Create My Health Profile
              </Button>
            </Card>
          </div>
        </main>

        <footer className="py-6 border-t border-slate-100 dark:border-slate-900 text-center text-xs text-slate-400" id="empty-summary-footer">
          © 2026 Smart Health Guide
        </footer>
      </div>
    );
  }

  // Helper calculation metrics
  const hM = Number(profile.height) / 100;
  const bmiVal = hM > 0 ? (Number(profile.weight) / (hM * hM)) : 0;
  const bmiFormatted = bmiVal.toFixed(1);

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' };
    if (bmi < 25) return { label: 'Optimal Normal', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/20' };
    return { label: 'Obese Range', color: 'text-red-500 bg-red-50 dark:bg-red-950/20' };
  };

  const bmiCat = getBMICategory(bmiVal);

  // Mifflin-St Jeor formula for BMR (Base calories before multiplier)
  const calculateBMR = () => {
    const w = Number(profile.weight);
    const h = Number(profile.height);
    const a = Number(profile.age);
    if (!w || !h || !a) return 0;

    if (profile.gender === 'Male') {
      return Math.round(10 * w + 6.25 * h - 5 * a + 5);
    } else {
      // Female and default formula
      return Math.round(10 * w + 6.25 * h - 5 * a - 161);
    }
  };

  const bmrVal = calculateBMR();

  // Multipliers for total active daily energy expenditure (TDEE)
  const getTDEEMultiplier = () => {
    switch (profile.activityLevel) {
      case 'Sedentary': return 1.2;
      case 'Lightly Active': return 1.375;
      case 'Moderately Active': return 1.55;
      case 'Very Active': return 1.725;
      default: return 1.2;
    }
  };

  const tdeeVal = Math.round(bmrVal * getTDEEMultiplier());

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300" id="profile-summary-root">
      
      {/* Top Header navbar */}
      <header className="px-4 py-4 md:px-8 border-b border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950/80 backdrop-blur-md flex justify-between items-center sticky top-0 z-30" id="summary-header">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigateTo('dashboard')}>
          <div className="p-1.5 bg-emerald-600 rounded-lg text-white">
            <Heart className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            Smart Health Guide
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateTo('dashboard')}
            id="summary-nav-dashboard"
            icon={<LayoutDashboard className="w-4 h-4" />}
          >
            Dashboard
          </Button>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 flex flex-col gap-6" id="summary-main">
        
        {/* Success / Saved State notice banner */}
        <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-emerald-950 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl" id="summary-action-banner">
          <div className="flex flex-col gap-2 text-left">
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider w-fit">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Profile Synchronized with Account</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-1">
              {profile.fullName}'s Profile Summary
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Your profile parameters are locked in. You can now use the Recommendations feature or go to the general Dashboard overview.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto" id="banner-actions">
            <Button
              variant="outline"
              size="md"
              className="border-white/20 text-white hover:bg-white/10"
              onClick={() => navigateTo('profile-form')}
              id="summary-edit-btn"
              icon={<Edit2 className="w-4 h-4" />}
            >
              Edit Profile
            </Button>
            <Button
              variant="primary"
              size="md"
              className="bg-emerald-500 text-slate-950 hover:bg-emerald-400 border-none font-bold"
              onClick={() => navigateTo('recommendations')}
              id="summary-get-recs-btn"
              icon={<Sparkles className="w-5 h-5" />}
              iconPosition="right"
            >
              Get My Recommendations
            </Button>
          </div>
        </div>

        {/* Dashboard grid panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="summary-grid">
          
          {/* LEFT PANEL: Metabolic Index Gauges */}
          <div className="lg:col-span-4 flex flex-col gap-6" id="summary-left-col">
            
            {/* Profile demographics card */}
            <Card className="text-left" id="summary-demographics-card">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-3xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-black text-2xl mb-4 shadow-inner">
                  {profile.fullName ? profile.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'HP'}
                </div>
                <h3 className="text-xl font-extrabold text-slate-950 dark:text-white truncate max-w-full">
                  {profile.fullName}
                </h3>
                <p className="text-sm font-semibold text-slate-400 dark:text-slate-500">
                  {profile.age} Years Old • {profile.gender}
                </p>

                <div className="grid grid-cols-2 gap-4 w-full border-t border-slate-100 dark:border-slate-800 pt-5 mt-5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-2xs text-slate-400 uppercase tracking-widest font-bold">Stature</span>
                    <span className="text-base font-black text-slate-900 dark:text-white font-mono">{profile.height} cm</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-2xs text-slate-400 uppercase tracking-widest font-bold">Body Mass</span>
                    <span className="text-base font-black text-slate-900 dark:text-white font-mono">{profile.weight} kg</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Calculated BMI */}
            <Card className="text-left" id="summary-bmi-card">
              <CardContent className="p-6 flex flex-col gap-3">
                <span className="text-2xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Body Mass Index (BMI)</span>
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black tracking-tight text-slate-950 dark:text-white font-mono">{bmiFormatted}</span>
                  <span className={`text-2xs font-bold px-2.5 py-1 rounded-full ${bmiCat.color}`}>
                    {bmiCat.label}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                  BMI evaluates body fat ratios based strictly on mathematical height-to-weight proportion coefficients.
                </p>
              </CardContent>
            </Card>

            {/* Calories (BMR / TDEE) */}
            <Card className="text-left" id="summary-bmr-card">
              <CardContent className="p-6 flex flex-col gap-4">
                <span className="text-2xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-emerald-600" />
                  <span>Estimated Daily Metabolism</span>
                </span>

                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Basal Metabolic Rate</h4>
                      <p className="text-2xs text-slate-400">Calories burned at absolute rest</p>
                    </div>
                    <span className="text-lg font-black text-slate-900 dark:text-white font-mono">{bmrVal} kcal</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div>
                      <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Total Active Energy (TDEE)</h4>
                      <p className="text-2xs text-slate-400">Calories burned matching activity</p>
                    </div>
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">{tdeeVal} kcal</span>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* RIGHT PANEL: Health Goals, Conditions, Allergens, Preferences */}
          <div className="lg:col-span-8 flex flex-col gap-6" id="summary-right-col">
            
            {/* Lifestyle & Clinical Profile Core Details */}
            <Card className="text-left flex-1" id="summary-details-card">
              <CardHeader>
                <CardTitle>Clinical & Lifestyle Profiles</CardTitle>
                <CardDescription>Cross-referenced chronic flags, nutrient limits, and metabolic preferences.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                
                {/* Health Goal & Activity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-2xl">
                    <span className="text-2xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">Targeted Metabolism Goal</span>
                    <h4 className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{profile.healthGoal}</h4>
                  </div>
                  <div className="p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-2xl">
                    <span className="text-2xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">Active Physical Routine</span>
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">{profile.activityLevel}</h4>
                  </div>
                </div>

                {/* Chronic Conditions & Allergies */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-slate-100 dark:border-slate-800 pt-5">
                  
                  {/* Conditions */}
                  <div className="flex flex-col gap-3">
                    <span className="text-xs font-bold text-slate-700 dark:text-gray-300 flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-emerald-600" />
                      <span>Chronic Health Conditions</span>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {profile.healthConditions?.map((condId) => {
                        const label = condId === 'none' ? 'No Chronic Conditions' : condId.charAt(0).toUpperCase() + condId.slice(1);
                        const isNone = condId === 'none';
                        return (
                          <span
                            key={condId}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                              isNone
                                ? 'bg-slate-100 dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40'
                            }`}
                          >
                            {label}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Food Allergies */}
                  <div className="flex flex-col gap-3">
                    <span className="text-xs font-bold text-slate-700 dark:text-gray-300 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-500" />
                      <span>Severe Food Allergens</span>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {profile.foodAllergies?.map((allergenId) => {
                        const label = allergenId === 'none' ? 'No Food Allergies' : allergenId.charAt(0).toUpperCase() + allergenId.slice(1);
                        const isNone = allergenId === 'none';
                        return (
                          <span
                            key={allergenId}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                              isNone
                                ? 'bg-slate-100 dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800'
                                : 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/40'
                            }`}
                          >
                            {label}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Dietary Strategy & Medications */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-slate-100 dark:border-slate-800 pt-5">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-gray-300">
                      Dietary Preference Strategy
                    </span>
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {profile.dietaryPreference || 'None'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-gray-300">
                      Active Clinical Medications
                    </span>
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl">
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-400 block whitespace-pre-wrap">
                        {profile.currentMedications || 'None specified / Optional'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Social and lifestyle habits */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-5">
                  <div className="flex justify-between items-center px-4 py-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-xl">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Smoking Status</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{profile.smokingStatus || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-xl">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Alcohol Consumption</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{profile.alcoholConsumption || 'Not specified'}</span>
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Disclaimer and recommendation trigger guidance */}
            <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/15 border border-amber-200/50 dark:border-amber-900/30 text-left flex gap-3 text-xs text-amber-800 dark:text-amber-400 leading-relaxed" id="summary-advice-box">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600 dark:text-amber-500" />
              <div className="flex flex-col gap-1">
                <span className="font-bold">Clinical Verification Advice</span>
                <span>These profiles are utilized exclusively for educational metric indexing. Verify recommendations with a board-certified physician before adjusting prescriptions or introducing strict caloric constraints.</span>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* Footer disclaimer */}
      <footer className="px-4 py-6 md:px-8 border-t border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400" id="summary-footer">
        <span>© 2026 Smart Health Guide</span>
      </footer>

    </div>
  );
}
