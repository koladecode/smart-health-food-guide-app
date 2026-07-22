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

export default function ProfileSummaryPage() {
  const { navigateTo } = useNavigation();
  const { profile, loadingProfile, recsExist, justCreatedProfile } = useHealthProfile();

  // If profile is loading, show loading spinner
  if (loadingProfile) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300" id="profile-summary-loading">
        <header className="px-4 py-4 md:px-8 border-b border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 flex justify-between items-center sticky top-0 z-30" id="loading-summary-header">
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
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider w-fit">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Profile Locked In</span>
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
        </div>

        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="summary-grid">
          
          {/* LEFT COLUMN: Biometrics & Metabolic Gauges */}
          <div className="lg:col-span-4 flex flex-col gap-6" id="summary-left-col">
            
            {/* CARD 1: Personal Information (Dossier Header) */}
            <Card className="border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300" id="summary-demographics-card">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-3xl mb-4 shadow-xs">
                  {profile.fullName ? profile.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'HP'}
                </div>
                
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-100 dark:border-emerald-900/30 mb-2">
                  Verified Member
                </span>
                
                <h3 className="text-xl font-black text-slate-950 dark:text-white truncate max-w-full tracking-tight">
                  {profile.fullName}
                </h3>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1 justify-center">
                  <Globe className="w-3.5 h-3.5 text-slate-450" />
                  <span>{profile.countryOrRegion || 'Global/Other'}</span>
                </p>

                <div className="grid grid-cols-2 gap-4 w-full border-t border-slate-100 dark:border-slate-800 pt-5 mt-5">
                  <div className="flex flex-col gap-1 text-left bg-slate-50/50 dark:bg-slate-950/20 p-3 rounded-2xl border border-slate-100/50 dark:border-slate-850/50">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold font-mono">Age Profile</span>
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white">{profile.age} Years</span>
                  </div>
                  <div className="flex flex-col gap-1 text-left bg-slate-50/50 dark:bg-slate-950/20 p-3 rounded-2xl border border-slate-100/50 dark:border-slate-850/50">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold font-mono">Gender</span>
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white">{profile.gender}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CARD 2: Body Measurements & Vitals (BMI prominence) */}
            <Card className="border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 text-left" id="summary-bmi-card">
              <CardContent className="p-6 flex flex-col gap-4">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-50 dark:border-slate-800">
                  <div className="p-1.5 bg-emerald-500/10 rounded-xl">
                    <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono leading-none">Body Measurements</h4>
                    <p className="text-[10px] text-slate-550 mt-0.5">Physical frame composition</p>
                  </div>
                </div>

                {/* Stature Stats Grid */}
                <div className="grid grid-cols-2 gap-3" id="vitals-stats-grid">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100/60 dark:border-slate-850">
                    <div className="p-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg text-slate-400 shadow-3xs">
                      <ArrowRight className="w-3.5 h-3.5 rotate-90" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Height</span>
                      <span className="text-sm font-extrabold text-slate-855 dark:text-white font-mono">{profile.height} cm</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100/60 dark:border-slate-850">
                    <div className="p-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg text-slate-400 shadow-3xs">
                      <Scale className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Weight</span>
                      <span className="text-sm font-extrabold text-slate-855 dark:text-white font-mono">{profile.weight} kg</span>
                    </div>
                  </div>
                </div>

                {/* BMI Index Visual Segment Bar */}
                <div className="p-4 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-100/70 dark:border-slate-850 flex flex-col gap-2 mt-1" id="prominent-bmi-box">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold font-mono flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Body Mass Index</span>
                    </span>
                    <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border ${bmiCat.color} border-slate-100/20 dark:border-slate-900`}>
                      {bmiCat.label}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5 mt-1" id="bmi-value-holder">
                    <span className="text-3xl font-black tracking-tight text-slate-950 dark:text-white font-mono">{bmiFormatted}</span>
                    <span className="text-3xs font-semibold text-slate-400">kg/m²</span>
                  </div>

                  {/* Visual slider track */}
                  <div className="relative w-full mt-2 pb-1" id="bmi-progress-container">
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden" id="bmi-track-segments">
                      <div className="bg-amber-400 h-full" style={{ width: '17.5%' }} title="Underweight" />
                      <div className="bg-emerald-500 h-full" style={{ width: '32.5%' }} title="Optimal" />
                      <div className="bg-orange-400 h-full" style={{ width: '25%' }} title="Overweight" />
                      <div className="bg-red-500 h-full" style={{ width: '25%' }} title="Obese" />
                    </div>
                    <div 
                      className="absolute top-0 -mt-1 w-4 h-4 bg-white dark:bg-slate-900 border-2 border-emerald-600 dark:border-emerald-500 rounded-full shadow-md -translate-x-1/2 transition-all duration-1000"
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
              </CardContent>
            </Card>

            {/* CARD 3: Energy Metabolism Budgets */}
            <Card className="border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 text-left" id="summary-metabolism-card">
              <CardContent className="p-6 flex flex-col gap-4">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-50 dark:border-slate-800">
                  <div className="p-1.5 bg-emerald-500/10 rounded-xl">
                    <Flame className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono leading-none">Energy Metabolism</h4>
                    <p className="text-[10px] text-slate-550 mt-0.5">Calculated Daily Caloric Budgets</p>
                  </div>
                </div>

                <div className="flex flex-col gap-4" id="metabolism-bars">
                  {/* BMR Rest */}
                  <div className="flex flex-col gap-1.5" id="bmr-bar-group">
                    <div className="flex justify-between text-xs font-bold" id="bmr-text">
                      <span className="text-slate-500 dark:text-slate-400">Basal Rest Budget (BMR)</span>
                      <span className="text-slate-855 dark:text-white font-mono">{bmrVal} kcal</span>
                    </div>
                    <div className="h-2 w-full bg-slate-50 dark:bg-slate-950 border border-slate-100/50 dark:border-slate-850/50 rounded-full overflow-hidden" id="bmr-bar-track">
                      <div className="bg-slate-400 dark:bg-slate-500 h-full rounded-full transition-all duration-550" style={{ width: `${(bmrVal / tdeeVal) * 100}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Energy required to fuel basic vital systems without external physical exertion.
                    </p>
                  </div>

                  {/* TDEE Active */}
                  <div className="flex flex-col gap-1.5 border-t border-slate-50 dark:border-slate-800 pt-3.5 mt-1" id="tdee-bar-group">
                    <div className="flex justify-between text-xs font-bold" id="tdee-text">
                      <span className="text-emerald-600 dark:text-emerald-400">Total Daily Energy (TDEE)</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono">{tdeeVal} kcal</span>
                    </div>
                    <div className="h-2 w-full bg-slate-50 dark:bg-slate-950 border border-slate-100/50 dark:border-slate-850/50 rounded-full overflow-hidden" id="tdee-bar-track">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }} />
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Estimated metabolic burning rate matching your <span className="font-semibold text-slate-550 dark:text-slate-300">{profile.activityLevel}</span> lifestyle routine.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* RIGHT COLUMN: Clinical & Lifestyle Profile Cards */}
          <div className="lg:col-span-8 flex flex-col gap-6" id="summary-right-col">
            
            {/* CARD 4: Lifestyle & Goals */}
            <Card className="border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 text-left" id="summary-lifestyle-card">
              <CardHeader className="pb-3 border-b border-slate-50 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-emerald-500/10 rounded-xl">
                    <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-black text-slate-950 dark:text-white">Lifestyle & Goals</CardTitle>
                    <CardDescription className="text-[10px] mt-0.5">Physical routines, metabolic goals, and daily schedules</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 flex flex-col gap-5">
                
                {/* Health Goal & Activity cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50/60 dark:bg-slate-950/20 border border-slate-100/80 dark:border-slate-850 rounded-2xl flex items-start gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/10">
                      <Award className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold font-mono">Metabolic Goal</span>
                      <h4 className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 leading-tight">{profile.healthGoal}</h4>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-slate-50/60 dark:bg-slate-950/20 border border-slate-100/80 dark:border-slate-850 rounded-2xl flex items-start gap-3">
                    <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                      <Flame className="w-4 h-4 text-orange-500" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold font-mono">Physical Routine</span>
                      <h4 className="text-sm font-extrabold text-slate-850 dark:text-white mt-1 leading-tight">{profile.activityLevel}</h4>
                    </div>
                  </div>
                </div>

                {/* Lifestyle details panel */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-50 dark:border-slate-800 pt-5">
                  
                  {/* Sleep Duration */}
                  <div className="flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/50 dark:border-slate-850/50 rounded-2xl">
                    <div className="flex items-center gap-2.5">
                      <Moon className="w-4 h-4 text-indigo-500" />
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-450">Sleep Duration</span>
                    </div>
                    <span className="text-xs font-extrabold text-slate-855 dark:text-white">{profile.sleepDuration || 'Not specified'}</span>
                  </div>

                  {/* Stress Level */}
                  <div className="flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/50 dark:border-slate-850/50 rounded-2xl">
                    <div className="flex items-center gap-2.5">
                      <TrendingUp className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-450">Stress Level</span>
                    </div>
                    <span className="text-xs font-extrabold text-slate-855 dark:text-white">{profile.stressLevel || 'Not specified'}</span>
                  </div>

                  {/* Smoking habits */}
                  <div className="flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/50 dark:border-slate-850/50 rounded-2xl">
                    <div className="flex items-center gap-2.5">
                      <AlertCircle className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-450">Smoking Habits</span>
                    </div>
                    <span className="text-xs font-extrabold text-slate-855 dark:text-white">{profile.smokingStatus || 'Not specified'}</span>
                  </div>

                  {/* Alcohol Consumption */}
                  <div className="flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/50 dark:border-slate-850/50 rounded-2xl">
                    <div className="flex items-center gap-2.5">
                      <Smile className="w-4 h-4 text-emerald-550" />
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-450">Alcohol Intake</span>
                    </div>
                    <span className="text-xs font-extrabold text-slate-855 dark:text-white">{profile.alcoholConsumption || 'Not specified'}</span>
                  </div>

                </div>
              </CardContent>
            </Card>

            {/* CARD 5: Dietary Strategy & Medications */}
            <Card className="border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 text-left" id="summary-dietary-card">
              <CardHeader className="pb-3 border-b border-slate-50 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-emerald-500/10 rounded-xl">
                    <Apple className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-black text-slate-950 dark:text-white">Dietary Strategy & Medications</CardTitle>
                    <CardDescription className="text-[10px] mt-0.5">Nutritional preferences and clinical pharmacological routines</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 flex flex-col gap-5">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  
                  {/* Dietary Strategy */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-slate-650 dark:text-slate-400 flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Dietary Preference Strategy</span>
                    </span>
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100/85 dark:border-slate-850 rounded-2xl flex flex-col justify-center min-h-[76px]">
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {profile.dietaryPreference || 'None Specified'}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                        Filters daily recommendations to comply with dietary guidelines.
                      </p>
                    </div>
                  </div>

                  {/* Medications */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-slate-650 dark:text-slate-400 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Active Medications</span>
                    </span>
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100/85 dark:border-slate-850 rounded-2xl flex flex-col justify-center min-h-[76px]">
                      {profile.currentMedications ? (
                        <div>
                          <span className="text-xs font-semibold text-rose-600 dark:text-rose-455 block break-words whitespace-pre-wrap leading-relaxed">
                            {profile.currentMedications}
                          </span>
                          <p className="text-[9px] text-slate-400 mt-1 leading-tight font-medium">
                            Monitored for drug-nutrient interactions.
                          </p>
                        </div>
                      ) : (
                        <div>
                          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 block">
                            No active prescriptions logged
                          </span>
                          <p className="text-[10px] text-slate-400 mt-1 leading-tight font-light">
                            Optional field for drug-nutrient safety scanning.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>

            {/* CARD 6: Health Conditions & Allergens */}
            <Card className="border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 text-left" id="summary-conditions-card">
              <CardHeader className="pb-3 border-b border-slate-50 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-emerald-500/10 rounded-xl">
                    <Stethoscope className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-black text-slate-950 dark:text-white">Clinical & Allergen Profile</CardTitle>
                    <CardDescription className="text-[10px] mt-0.5">Underlying conditions and dietary contraindications</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 flex flex-col gap-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Chronic Conditions */}
                  <div className="flex flex-col gap-3">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Chronic Health Conditions</span>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {profile.healthConditions?.filter(condId => !condId.startsWith('sleep_') && !condId.startsWith('stress_')).map((condId) => {
                        const label = condId === 'none' ? 'No Chronic Conditions' : condId.charAt(0).toUpperCase() + condId.slice(1);
                        const isNone = condId === 'none';
                        return (
                          <span
                            key={condId}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                              isNone
                                ? 'bg-slate-50 text-slate-450 border-slate-150 dark:bg-slate-950/20 dark:text-slate-500 dark:border-slate-900'
                                : 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-450 dark:border-rose-900/30'
                            }`}
                          >
                            {isNone ? (
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            )}
                            <span>{label}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Severe Food Allergens */}
                  <div className="flex flex-col gap-3">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-550" />
                      <span>Severe Food Allergens</span>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {profile.foodAllergies?.map((allergenId) => {
                        const label = allergenId === 'none' ? 'No Food Allergies' : allergenId.charAt(0).toUpperCase() + allergenId.slice(1);
                        const isNone = allergenId === 'none';
                        return (
                          <span
                            key={allergenId}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                              isNone
                                ? 'bg-slate-50 text-slate-450 border-slate-150 dark:bg-slate-950/20 dark:text-slate-500 dark:border-slate-900'
                                : 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30'
                            }`}
                          >
                            {isNone ? (
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            )}
                            <span>{label}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>

            {/* Clinical Verification Advice Disclaimer */}
            <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/15 border border-amber-200/40 dark:border-amber-900/20 text-left flex gap-3 text-xs text-amber-800 dark:text-amber-400 leading-relaxed" id="summary-advice-box">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600 dark:text-amber-500" />
              <div className="flex flex-col gap-1">
                <span className="font-bold">Clinical Verification Advice</span>
                <span>These profiles are utilized exclusively for educational metric indexing. Verify recommendations with a board-certified physician before adjusting prescriptions or introducing strict dietary constraints.</span>
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
