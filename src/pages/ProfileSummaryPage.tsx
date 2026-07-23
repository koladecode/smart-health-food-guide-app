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
  CheckCircle2,
  Scale,
  Moon,
  Compass,
  ShieldCheck,
  Globe,
  FileText,
  Smile,
  Apple
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { useHealthProfile } from '../context/HealthProfileContext';
import Button from '../components/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/Card';
import Alert from '../components/Alert';
import ThemeToggle from '../components/ThemeToggle';
import { ProfileSummarySkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

export default function ProfileSummaryPage() {
  const { navigateTo } = useNavigation();
  const { profile, loadingProfile, recsExist, justCreatedProfile } = useHealthProfile();

  // If profile is loading, show loading spinner
  if (loadingProfile) {
    return <ProfileSummarySkeleton />;
  }

  // If no profile exists, prompt user to create one
  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300" id="profile-summary-empty">
        <header className="px-4 py-4 md:px-8 border-b border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 flex justify-between items-center sticky top-0 z-30" id="empty-summary-header">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-600 rounded-lg text-white">
              <Heart className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Smart Health Guide
            </span>
          </div>
          <ThemeToggle />
        </header>

        <main className="flex-1 flex items-center justify-center p-6" id="empty-summary-main">
          <div className="max-w-md w-full text-center animate-fade-in" id="empty-summary-box">
            <Card className="p-8 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl shadow-lg" id="empty-summary-card">
              <div className="inline-flex p-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl mb-4" id="empty-icon">
                <ShieldAlert className="w-8 h-8 animate-pulse" />
              </div>
              <h2 className="text-xl font-black text-slate-950 dark:text-white tracking-tight">
                No Health Profile Found
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-6 leading-relaxed">
                Before accessing custom health algorithms, nutritional indexers, and therapeutic fitness guidelines, you need to configure your personal wellness profile.
              </p>
              <Button
                variant="primary"
                size="lg"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 transition-all rounded-xl shadow-md shadow-emerald-600/10"
                onClick={() => navigateTo('profile-form')}
                id="empty-create-btn"
                icon={<Sparkles className="w-5 h-5" />}
              >
                Create My Health Profile
              </Button>
            </Card>
          </div>
        </main>

        <footer className="py-6 border-t border-slate-100 dark:border-slate-900 text-center text-xs text-slate-400 bg-white dark:bg-slate-950" id="empty-summary-footer">
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

  const getBMIPercentage = (bmi: number) => {
    const min = 15;
    const max = 35;
    const percentage = ((bmi - min) / (max - min)) * 100;
    return Math.min(Math.max(percentage, 0), 100);
  };
  const bmiPercentage = getBMIPercentage(bmiVal);

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

  const formatLastUpdated = (dateInput: string | Date | undefined) => {
    if (!dateInput) return null;
    try {
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) return null;
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return null;
    }
  };
  const lastUpdatedStr = formatLastUpdated(profile.updatedAt);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 animate-fade-in" id="profile-summary-root">
      
      {/* Top Header navbar */}
      <header className="px-4 py-4 md:px-8 border-b border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950/80 backdrop-blur-md flex justify-between items-center sticky top-0 z-30 shadow-xs" id="summary-header">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigateTo('dashboard')}>
          <div className="p-1.5 bg-emerald-600 rounded-lg text-white shadow-sm">
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
            className="border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 font-bold"
            onClick={() => navigateTo('dashboard')}
            id="summary-nav-dashboard"
            icon={<LayoutDashboard className="w-4 h-4" />}
          >
            Dashboard
          </Button>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 flex flex-col gap-6" id="summary-main">
        
        {/* Profile Synchronized Alert Header / Banner */}
        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm" id="summary-action-banner">
          <div className="flex flex-col gap-2 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider w-fit">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Profile Locked In</span>
              </div>
              {lastUpdatedStr && (
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-950 px-2.5 py-1 rounded-full border border-slate-150 dark:border-slate-850">
                  Last updated: {lastUpdatedStr}
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-950 dark:text-white mt-1">
              {profile.fullName}'s Profile Summary
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
              Your biometric indexes, metabolic profiles, and dietary requirements are compiled. Update your profile anytime or navigate below to generate precision health reports.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto" id="banner-actions">
            <Button
              variant="outline"
              size="md"
              className="border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 font-bold transition-all"
              onClick={() => navigateTo('profile-form')}
              id="summary-edit-btn"
              icon={<Edit2 className="w-4 h-4" />}
            >
              Edit Profile
            </Button>
            {recsExist && !justCreatedProfile ? (
              <Button
                variant="primary"
                size="md"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md shadow-emerald-600/10"
                onClick={() => navigateTo('dashboard')}
                id="summary-go-dashboard-btn"
                icon={<LayoutDashboard className="w-4 h-4" />}
                iconPosition="right"
              >
                Go to Dashboard
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md shadow-emerald-600/10 animate-pulse"
                onClick={() => navigateTo('recommendations')}
                id="summary-get-recs-btn"
                icon={<Sparkles className="w-4 h-4" />}
                iconPosition="right"
              >
                Get Recommendations
              </Button>
            )}
          </div>
        </div>        {/* Bento Grid of 9 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="summary-grid">
          
          {/* Card 1: Personal Information */}
          <Card className="border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xs hover:shadow-sm transition-all duration-300 animate-fade-in" id="card-personal-info">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-850">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-emerald-500/10 rounded-xl">
                  <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <CardTitle className="text-sm font-extrabold text-slate-900 dark:text-white">Personal Information</CardTitle>
                  <CardDescription className="text-3xs">Identity and physical profile credentials</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 flex flex-col gap-5 text-left">
              <div className="flex items-center gap-4 bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-2xl border border-slate-100/50 dark:border-slate-850/50">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-xl shadow-3xs">
                  {profile.fullName ? profile.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'HP'}
                </div>
                <div>
                  <span className="text-4xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-100/30">
                    Verified Member
                  </span>
                  <h3 className="text-base font-black text-slate-950 dark:text-white mt-1 leading-tight">
                    {profile.fullName}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 p-3.5 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-100/50 dark:border-slate-850/50">
                  <span className="text-4xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-extrabold font-mono">Age Profile</span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">{profile.age || 'Not specified'} Years</span>
                </div>
                <div className="flex flex-col gap-1 p-3.5 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-100/50 dark:border-slate-850/50">
                  <span className="text-4xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-extrabold font-mono">Gender</span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">{profile.gender || 'Not specified'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Body Measurements */}
          <Card className="border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xs hover:shadow-sm transition-all duration-300 md:col-span-2" id="card-body-measurements">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-850">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-emerald-500/10 rounded-xl">
                  <Scale className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <CardTitle className="text-sm font-extrabold text-slate-900 dark:text-white">Body Measurements & Metabolism</CardTitle>
                  <CardDescription className="text-3xs">Stature, weight biometrics, and baseline metabolic indices</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 flex flex-col gap-6 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Height, Weight & BMI stats */}
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-100/50 dark:border-slate-850/50">
                      <div className="p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-3xs">
                        <ArrowRight className="w-4 h-4 rotate-90 text-slate-400 dark:text-slate-500" />
                      </div>
                      <div>
                        <span className="text-4xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-mono">Height</span>
                        <span className="text-sm font-extrabold text-slate-800 dark:text-white font-mono">{profile.height} cm</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-100/50 dark:border-slate-850/50">
                      <div className="p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-3xs">
                        <Scale className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      </div>
                      <div>
                        <span className="text-4xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-mono">Weight</span>
                        <span className="text-sm font-extrabold text-slate-800 dark:text-white font-mono">{profile.weight} kg</span>
                      </div>
                    </div>
                  </div>

                  {/* BMI Index Visual Bar */}
                  <div className="p-4 bg-slate-50/50 dark:bg-slate-950/25 rounded-2xl border border-slate-100/80 dark:border-slate-850 flex flex-col gap-2.5" id="prominent-bmi-box">
                    <div className="flex justify-between items-center">
                      <span className="text-4xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-extrabold font-mono flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Body Mass Index</span>
                      </span>
                      <span className={`text-4xs font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${bmiCat.color} border-slate-100/10 dark:border-slate-900`}>
                        {bmiCat.label}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-1 mt-0.5" id="bmi-value-holder">
                      <span className="text-3xl font-black tracking-tight text-slate-950 dark:text-white font-mono">{bmiFormatted}</span>
                      <span className="text-3xs font-semibold text-slate-500 dark:text-slate-550">kg/m²</span>
                    </div>

                    {/* Visual slider track */}
                    <div className="relative w-full mt-2.5 pb-1" id="bmi-progress-container">
                      <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden" id="bmi-track-segments">
                        <div className="bg-amber-400 h-full" style={{ width: '17.5%' }} title="Underweight" />
                        <div className="bg-emerald-500 h-full" style={{ width: '32.5%' }} title="Optimal" />
                        <div className="bg-orange-400 h-full" style={{ width: '25%' }} title="Overweight" />
                        <div className="bg-red-500 h-full" style={{ width: '25%' }} title="Obese" />
                      </div>
                      <div 
                        className="absolute top-0 -mt-1 w-3.5 h-3.5 bg-white dark:bg-slate-900 border-2 border-emerald-600 dark:border-emerald-500 rounded-full shadow-sm -translate-x-1/2 transition-all duration-1000"
                        style={{ left: `${bmiPercentage}%` }}
                        id="bmi-marker"
                      />
                      <div className="flex justify-between text-[8px] font-bold text-slate-400 dark:text-slate-500 mt-1.5 font-mono" id="bmi-scale-labels">
                        <span>15.0</span>
                        <span>18.5</span>
                        <span>25.0</span>
                        <span>30.0</span>
                        <span>35.0</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Energy Metabolism calories */}
                <div className="flex flex-col gap-4 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800/65 pt-4 sm:pt-0 sm:pl-6 justify-between">
                  {/* BMR Rest */}
                  <div className="flex flex-col gap-1.5" id="bmr-bar-group">
                    <div className="flex justify-between text-xs font-bold" id="bmr-text">
                      <span className="text-slate-500 dark:text-slate-400">Basal Metabolic Rate (BMR)</span>
                      <span className="text-slate-800 dark:text-white font-mono">{bmrVal} kcal</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-50 dark:bg-slate-955 border border-slate-100/50 dark:border-slate-850/50 rounded-full overflow-hidden" id="bmr-bar-track">
                      <div className="bg-slate-400 dark:bg-slate-500 h-full rounded-full transition-all duration-500" style={{ width: `${(bmrVal / tdeeVal) * 100}%` }} />
                    </div>
                    <p className="text-4xs text-slate-400 dark:text-slate-500 leading-relaxed font-medium">
                      Core energy consumption budget to fuel critical systems in a completely resting state.
                    </p>
                  </div>

                  {/* TDEE Active */}
                  <div className="flex flex-col gap-1.5 border-t border-slate-50 dark:border-slate-800/60 pt-3" id="tdee-bar-group">
                    <div className="flex justify-between text-xs font-bold" id="tdee-text">
                      <span className="text-emerald-600 dark:text-emerald-400">Total Daily Energy (TDEE)</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono">{tdeeVal} kcal</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-50 dark:bg-slate-955 border border-slate-100/50 dark:border-slate-850/50 rounded-full overflow-hidden" id="tdee-bar-track">
                      <div className="bg-emerald-500 dark:bg-emerald-650 h-full rounded-full" style={{ width: '100%' }} />
                    </div>
                    <p className="text-4xs text-slate-450 dark:text-slate-500 leading-relaxed font-medium">
                      Estimated metabolic consumption matching your physical routine of <span className="font-extrabold text-slate-600 dark:text-slate-350">{profile.activityLevel}</span>.
                    </p>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>

          {/* Card 3: Lifestyle & Goals */}
          <Card className="border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xs hover:shadow-sm transition-all duration-300 md:col-span-2" id="card-lifestyle">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-850">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-emerald-500/10 rounded-xl">
                  <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <CardTitle className="text-sm font-extrabold text-slate-900 dark:text-white">Lifestyle & Wellness Goals</CardTitle>
                  <CardDescription className="text-3xs">Daily schedule profiles, wellness priorities, and metabolic targets</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 flex flex-col gap-5 text-left">
              
              {/* Primary metabolic goal and routine highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-100/30 dark:border-emerald-900/10 rounded-2xl flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-xl">
                    <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-4xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-extrabold font-mono">Wellness Target</span>
                    <h4 className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-0.5 leading-tight">{profile.healthGoal}</h4>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/50 dark:border-slate-850/50 rounded-2xl flex items-center gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-xl">
                    <Flame className="w-4 h-4 text-orange-500 dark:text-orange-400" />
                  </div>
                  <div>
                    <span className="text-4xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-extrabold font-mono">Routine Level</span>
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 mt-0.5 leading-tight">{profile.activityLevel}</h4>
                  </div>
                </div>
              </div>

              {/* Grid of habits */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-slate-100 dark:border-slate-850 pt-5">
                
                {/* Sleep */}
                <div className="flex flex-col gap-1 p-3 bg-slate-50/55 dark:bg-slate-950/20 border border-slate-100/50 dark:border-slate-850/55 rounded-2xl">
                  <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                    <Moon className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                    <span className="text-4xs font-bold uppercase tracking-widest font-mono">Sleep Duration</span>
                  </div>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 mt-1 leading-tight">{profile.sleepDuration || 'Not specified'}</span>
                </div>

                {/* Stress */}
                <div className="flex flex-col gap-1 p-3 bg-slate-50/55 dark:bg-slate-950/20 border border-slate-100/50 dark:border-slate-850/55 rounded-2xl">
                  <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                    <span className="text-4xs font-bold uppercase tracking-widest font-mono">Stress Level</span>
                  </div>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 mt-1 leading-tight">{profile.stressLevel || 'Not specified'}</span>
                </div>

                {/* Smoking */}
                <div className="flex flex-col gap-1 p-3 bg-slate-50/55 dark:bg-slate-950/20 border border-slate-100/50 dark:border-slate-850/55 rounded-2xl">
                  <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                    <span className="text-4xs font-bold uppercase tracking-widest font-mono">Smoking Habits</span>
                  </div>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 mt-1 leading-tight">{profile.smokingStatus || 'Not specified'}</span>
                </div>

                {/* Alcohol */}
                <div className="flex flex-col gap-1 p-3 bg-slate-50/55 dark:bg-slate-950/20 border border-slate-100/50 dark:border-slate-850/55 rounded-2xl">
                  <div className="flex items-center gap-1.5 text-slate-455 dark:text-slate-500">
                    <Smile className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-4xs font-bold uppercase tracking-widest font-mono">Alcohol Intake</span>
                  </div>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 mt-1 leading-tight">{profile.alcoholConsumption || 'Not specified'}</span>
                </div>

              </div>
            </CardContent>
          </Card>

          {/* Card 4: Region & Climate */}
          <Card className="border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xs hover:shadow-sm transition-all duration-300" id="card-region">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-850">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-emerald-500/10 rounded-xl">
                  <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <CardTitle className="text-sm font-extrabold text-slate-900 dark:text-white">Region & Geography</CardTitle>
                  <CardDescription className="text-3xs">Local geographic environment and dietary index zone</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 flex flex-col gap-4 text-left">
              <div className="flex flex-col items-center justify-center p-4 bg-slate-5/50 dark:bg-slate-950/20 rounded-2xl border border-slate-100/50 dark:border-slate-855 text-center gap-2 min-h-[140px]">
                <Globe className="w-10 h-10 text-emerald-500/80 dark:text-emerald-400/80" />
                <div>
                  <span className="text-4xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-extrabold font-mono">Active Territory</span>
                  <h4 className="text-base font-black text-slate-900 dark:text-white mt-0.5 leading-tight">
                    {profile.countryOrRegion || 'Global / Other'}
                  </h4>
                </div>
                <p className="text-4xs text-slate-400 dark:text-slate-500 leading-normal max-w-[200px]">
                  Calibrates healthcare indices and fresh local produce availability parameters.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Card 5: Medical Conditions */}
          <Card className="border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xs hover:shadow-sm transition-all duration-300" id="card-medical-conditions">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-850">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-emerald-500/10 rounded-xl">
                  <Stethoscope className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <CardTitle className="text-sm font-extrabold text-slate-900 dark:text-white">Medical Conditions</CardTitle>
                  <CardDescription className="text-3xs">Underlying diagnoses, chronic indicators, and biometrics</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 flex flex-col gap-4 text-left min-h-[180px]">
              <div className="flex flex-wrap gap-2 w-full">
                {(!profile.healthConditions || profile.healthConditions.filter(condId => !condId.startsWith('sleep_') && !condId.startsWith('stress_') && condId !== 'none').length === 0) ? (
                  <div className="w-full">
                    <EmptyState
                      title="No Chronic Conditions Logged"
                      description="You currently have a perfect metabolic health baseline. No chronic medical issues have been declared."
                      id="summary-medical-empty"
                    />
                  </div>
                ) : (
                  profile.healthConditions?.filter(condId => !condId.startsWith('sleep_') && !condId.startsWith('stress_')).map((condId) => {
                    const label = condId === 'none' ? 'No Chronic Conditions' : condId.replace(/_/g, ' ').charAt(0).toUpperCase() + condId.replace(/_/g, ' ').slice(1);
                    return (
                      <span
                        key={condId}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold border bg-rose-50/50 text-rose-700 border-rose-100/60 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/20 transition-all flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 dark:bg-rose-400 flex-shrink-0" />
                        <span>{label}</span>
                      </span>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Card 6: Allergies */}
          <Card className="border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xs hover:shadow-sm transition-all duration-300" id="card-allergies">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-850">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-emerald-500/10 rounded-xl">
                  <ShieldAlert className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <CardTitle className="text-sm font-extrabold text-slate-900 dark:text-white">Allergies & Sensitivities</CardTitle>
                  <CardDescription className="text-3xs">Severe dietary allergens and immunogenic triggers</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 flex flex-col gap-4 text-left min-h-[180px]">
              <div className="flex flex-wrap gap-2 w-full">
                {(!profile.foodAllergies || profile.foodAllergies.filter(allergenId => allergenId !== 'none').length === 0) ? (
                  <div className="w-full">
                    <EmptyState
                      title="No Food Allergies Logged"
                      description="No severe food allergens are active. Your customized metabolic diet plan has zero allergen restrictions."
                      id="summary-allergies-empty"
                    />
                  </div>
                ) : (
                  profile.foodAllergies?.filter(allergenId => allergenId !== 'none').map((allergenId) => {
                    const label = allergenId.replace(/_/g, ' ').charAt(0).toUpperCase() + allergenId.replace(/_/g, ' ').slice(1);
                    return (
                      <span
                        key={allergenId}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold border bg-amber-50/55 text-amber-700 border-amber-100/60 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/20 transition-all flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 flex-shrink-0" />
                        <span>{label}</span>
                      </span>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Card 7: Dietary Preferences */}
          <Card className="border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xs hover:shadow-sm transition-all duration-300" id="card-dietary-preferences">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-850">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-emerald-500/10 rounded-xl">
                  <Apple className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <CardTitle className="text-sm font-extrabold text-slate-900 dark:text-white">Dietary Preferences</CardTitle>
                  <CardDescription className="text-3xs">Primary nutrition filter ruleset</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 flex flex-col gap-4 text-left min-h-[180px] justify-between">
              <div className="flex flex-col gap-3">
                <span className="text-4xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-extrabold font-mono">Nutritional Guideline</span>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100/80 dark:border-slate-850 rounded-2xl flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {profile.dietaryPreference || 'None Specified'}
                  </span>
                </div>
              </div>
              <p className="text-4xs text-slate-400 dark:text-slate-500 leading-normal">
                Restricts generated recipe collections and snack recommendations to align with this strategic preference.
              </p>
            </CardContent>
          </Card>

          {/* Card 8: Current Medications */}
          <Card className="border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xs hover:shadow-sm transition-all duration-300 md:col-span-2" id="card-current-medications">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-850">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-emerald-500/10 rounded-xl">
                  <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <CardTitle className="text-sm font-extrabold text-slate-900 dark:text-white">Current Medications</CardTitle>
                  <CardDescription className="text-3xs">Active pharmaceutical formulations and prescriptions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 flex flex-col gap-4 text-left">
              {profile.currentMedications ? (
                <div className="flex flex-col gap-4">
                  <div className="p-4 bg-rose-50/30 dark:bg-rose-950/10 border border-rose-100/40 dark:border-rose-900/20 rounded-2xl">
                    <span className="text-xs font-extrabold text-rose-700 dark:text-rose-400 block whitespace-pre-wrap break-words leading-relaxed font-mono">
                      {profile.currentMedications}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-4xs text-slate-450 dark:text-slate-500 leading-relaxed">
                    <AlertCircle className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
                    <span>Active components are monitored to identify and prevent potential drug-nutrient or drug-ingredient clinical interactions.</span>
                  </div>
                </div>
              ) : (
                <EmptyState
                  title="No Active Prescriptions Logged"
                  description="Optional documentation. Adding medication names enables automatic safety checks against therapeutic food indices."
                  id="summary-medications-empty"
                />
              )}
            </CardContent>
          </Card>

          {/* Card 9: Clinical Advisory Card */}
          <Card className="border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xs hover:shadow-sm transition-all duration-300" id="card-clinical-advisory">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-850">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-amber-500/10 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                </div>
                <div>
                  <CardTitle className="text-sm font-extrabold text-slate-900 dark:text-white">Clinical Guidance</CardTitle>
                  <CardDescription className="text-3xs">Safety disclaimers and metric compliance conditions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 flex flex-col gap-4 text-left text-xs text-amber-800 dark:text-amber-400 leading-relaxed justify-between min-h-[180px]">
              <p className="text-[11px] font-medium leading-relaxed text-slate-600 dark:text-slate-400">
                These profiles are compiled exclusively for educational biometric indexing and metabolic rate estimates. 
              </p>
              <div className="p-3 bg-amber-50/40 dark:bg-amber-950/10 border border-amber-100/40 dark:border-amber-900/10 rounded-2xl text-3xs text-amber-700 dark:text-amber-500 leading-normal">
                <strong className="font-extrabold block mb-1">Verify before altering details:</strong>
                Consult a board-certified physician before adjusting drug formulations or introducing strict dietary constraints.
              </div>
            </CardContent>
          </Card>

        </div>

      </main>

      {/* Footer disclaimer */}
      <footer className="px-4 py-6 md:px-8 border-t border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400" id="summary-footer">
        <span>© 2026 Smart Health Guide</span>
      </footer>

    </div>
  );
}
