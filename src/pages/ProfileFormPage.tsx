import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Save,
  User,
  Activity,
  Heart,
  Calendar,
  Layers,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Stethoscope,
  Apple,
  Scale,
  Edit2,
  ClipboardCheck,
  Check,
  Globe,
  Smile,
  ShieldCheck,
  Dumbbell,
  ShieldAlert,
  Info,
  Flame,
  Moon,
  Compass,
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { useHealthProfile, HealthProfile } from '../context/HealthProfileContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/Card';
import { Input, Select, Textarea } from '../components/Input';
import { SearchableSelect } from '../components/SearchableSelect';
import ThemeToggle from '../components/ThemeToggle';
import Alert from '../components/Alert';
import { ProfileFormSkeleton } from '../components/Skeleton';

const REGIONS = [
  { value: 'Nigeria', label: 'Nigeria' },
  { value: 'Ghana', label: 'Ghana' },
  { value: 'Kenya', label: 'Kenya' },
  { value: 'South Africa', label: 'South Africa' },
  { value: 'USA', label: 'USA' },
  { value: 'UK', label: 'UK' },
  { value: 'Canada', label: 'Canada' },
  { value: 'India', label: 'India' },
  { value: 'China', label: 'China' },
  { value: 'Australia', label: 'Australia' },
  { value: 'Brazil', label: 'Brazil' },
  { value: 'Global/Other', label: 'Global/Other' }
];

const ACTIVITY_LEVELS = [
  { value: 'Sedentary', label: 'Sedentary', desc: 'Little to no physical exercise, desk job' },
  { value: 'Lightly Active', label: 'Lightly Active', desc: 'Light exercise or active lifestyle 1-3 days/week' },
  { value: 'Moderately Active', label: 'Moderately Active', desc: 'Moderate physical exercise 3-5 days/week' },
  { value: 'Very Active', label: 'Very Active', desc: 'Intense sports, heavy exercise, or physically demanding job' }
] as const;

const HEALTH_GOALS = [
  { value: 'Weight Loss', label: 'Weight Loss', desc: 'Caloric deficit focused nutrition and fitness guidance' },
  { value: 'Weight Gain', label: 'Weight Gain', desc: 'Healthy caloric surplus, nutrient loading and growth' },
  { value: 'Muscle Gain', label: 'Muscle Gain', desc: 'Protein synthesis, progressive load and strength training' },
  { value: 'Improve Overall Health', label: 'Improve Overall Health', desc: 'Micronutrient density, immunity, and lifestyle alignment' },
  { value: 'Heart Health', label: 'Heart Health', desc: 'Vascular elasticity, sodium management, and aerobic endurance' },
  { value: 'Blood Sugar Control', label: 'Blood Sugar Control', desc: 'Glycemic stabilization, insulin sensitivity, and clean fibers' }
] as const;

const HEALTH_CONDITIONS = [
  { id: 'diabetes', label: 'Diabetes / Insulin Resistance' },
  { id: 'hypertension', label: 'Hypertension (High Blood Pressure)' },
  { id: 'cholesterol', label: 'High Cholesterol' },
  { id: 'heart', label: 'Cardiovascular / Heart Disease' },
  { id: 'kidney', label: 'Kidney Disease' },
  { id: 'asthma', label: 'Asthma / Respiratory Issues' },
  { id: 'gastro', label: 'Gastrointestinal Issues (IBS, Acid Reflux)' },
  { id: 'none', label: 'No Chronic Conditions' }
];

const FOOD_ALLERGENS = [
  { id: 'peanuts', label: 'Peanuts' },
  { id: 'gluten', label: 'Gluten / Wheat' },
  { id: 'dairy', label: 'Dairy / Lactose' },
  { id: 'soy', label: 'Soy' },
  { id: 'shellfish', label: 'Shellfish' },
  { id: 'tree_nuts', label: 'Tree Nuts' },
  { id: 'eggs', label: 'Eggs' },
  { id: 'none', label: 'No Food Allergies' }
];

const DIETARY_PREFERENCES = [
  { value: 'None', label: 'Standard Balanced (No preference)' },
  { value: 'Vegetarian', label: 'Vegetarian (No meat, eggs/dairy OK)' },
  { value: 'Vegan', label: 'Vegan (100% plant-based)' },
  { value: 'Halal', label: 'Halal (Permitted islamic guidelines)' },
  { value: 'Kosher', label: 'Kosher (Permitted jewish dietary laws)' },
  { value: 'Keto', label: 'Ketogenic (Low carb, high fat)' },
  { value: 'Paleo', label: 'Paleolithic (Whole foods, no grains)' }
];

export default function ProfileFormPage() {
  const { navigateTo } = useNavigation();
  const { profile, saveProfile, loadingProfile, isProfileFetched } = useHealthProfile();
  const { loading } = useAuth();

  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form states
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState('');
  const [countryOrRegion, setCountryOrRegion] = useState('Global/Other');
  const [height, setHeight] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  
  const [activityLevel, setActivityLevel] = useState<HealthProfile['activityLevel']>('Moderately Active');
  const [healthGoal, setHealthGoal] = useState<HealthProfile['healthGoal']>('Improve Overall Health');
  const [smokingStatus, setSmokingStatus] = useState('Non-smoker');
  const [alcoholConsumption, setAlcoholConsumption] = useState('None');
  const [sleepDuration, setSleepDuration] = useState<'Less than 6 hours' | '6 to 8 hours' | 'More than 8 hours'>('6 to 8 hours');
  const [stressLevel, setStressLevel] = useState<'Low' | 'Moderate' | 'High'>('Moderate');

  const [selectedConditions, setSelectedConditions] = useState<string[]>(['none']);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>(['none']);
  const [dietaryPreference, setDietaryPreference] = useState('None');
  const [currentMedications, setCurrentMedications] = useState('');

  const initializedRef = React.useRef(false);

  // Pre-fill if editing profile
  useEffect(() => {
    if (initializedRef.current) {
      console.log('[INSTRUMENT_WEIGHT] [useEffect: profile] Skipping re-initialization as form is already initialized.');
      return;
    }

    if (isProfileFetched && !loadingProfile) {
      console.log('[INSTRUMENT_WEIGHT] [useEffect: profile] Initializing form with profile data. Profile weight is:', profile?.weight);
      if (profile) {
        setFullName(profile.fullName || '');
        setAge(profile.age || '');
        setGender(profile.gender || '');
        setCountryOrRegion(profile.countryOrRegion || 'Global/Other');
        setHeight(profile.height || '');
        setWeight(profile.weight || '');
        setActivityLevel(profile.activityLevel || 'Moderately Active');
        setHealthGoal(profile.healthGoal || 'Improve Overall Health');
        setSmokingStatus(profile.smokingStatus || 'Non-smoker');
        setAlcoholConsumption(profile.alcoholConsumption || 'None');
        setSelectedConditions(profile.healthConditions || ['none']);
        setSelectedAllergens(profile.foodAllergies || ['none']);
        setDietaryPreference(profile.dietaryPreference || 'None');
        setCurrentMedications(profile.currentMedications || '');
        setSleepDuration(profile.sleepDuration || '6 to 8 hours');
        setStressLevel(profile.stressLevel || 'Moderate');
      }
      initializedRef.current = true;
    }
  }, [profile, isProfileFetched, loadingProfile]);

  if (loading || !isProfileFetched || loadingProfile) {
    return <ProfileFormSkeleton />;
  }

  // Multi-select handler for conditions
  const handleConditionToggle = (id: string) => {
    if (id === 'none') {
      setSelectedConditions(['none']);
      return;
    }

    let updated = selectedConditions.filter(c => c !== 'none');
    if (updated.includes(id)) {
      updated = updated.filter(c => c !== id);
      if (updated.length === 0) {
        updated = ['none'];
      }
    } else {
      updated.push(id);
    }
    setSelectedConditions(updated);
  };

  // Multi-select handler for food allergens
  const handleAllergenToggle = (id: string) => {
    if (id === 'none') {
      setSelectedAllergens(['none']);
      return;
    }

    let updated = selectedAllergens.filter(a => a !== 'none');
    if (updated.includes(id)) {
      updated = updated.filter(a => a !== id);
      if (updated.length === 0) {
        updated = ['none'];
      }
    } else {
      updated.push(id);
    }
    setSelectedAllergens(updated);
  };

  // Step validation
  const validateStep = (currentStep: number): boolean => {
    const stepErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!fullName.trim()) {
        stepErrors.fullName = 'Full Name is required.';
      } else if (fullName.trim().length < 2) {
        stepErrors.fullName = 'Please enter a valid name (at least 2 characters).';
      }

      if (age === '') {
        stepErrors.age = 'Age is required.';
      } else {
        const ageNum = Number(age);
        if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
          stepErrors.age = 'Please enter a valid age between 1 and 120.';
        }
      }

      if (!gender) {
        stepErrors.gender = 'Please select your gender.';
      }

      if (height === '') {
        stepErrors.height = 'Height is required.';
      } else {
        const heightNum = Number(height);
        if (isNaN(heightNum) || heightNum < 50 || heightNum > 300) {
          stepErrors.height = 'Please enter a valid height (50 to 300 cm).';
        }
      }

      if (weight === '') {
        stepErrors.weight = 'Weight is required.';
      } else {
        const weightNum = Number(weight);
        if (isNaN(weightNum) || weightNum < 10 || weightNum > 500) {
          stepErrors.weight = 'Please enter a valid weight (10 to 500 kg).';
        }
      }
    }

    if (currentStep === 2) {
      if (!activityLevel) {
        stepErrors.activityLevel = 'Please select an activity level.';
      }
      if (!healthGoal) {
        stepErrors.healthGoal = 'Please select a health goal.';
      }
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      console.log('[INSTRUMENT_WEIGHT] [handleNext] Navigating to next step. Current step:', step, 'Weight value before navigation:', weight);
      setStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loadingProfile) return;
    if (!validateStep(1) || !validateStep(2)) {
      setStep(1);
      return;
    }

    console.log('[INSTRUMENT_WEIGHT] [handleSubmit] Weight state value immediately before constructing finalProfile:', weight);

    const finalProfile: HealthProfile = {
      fullName,
      age: Number(age),
      gender,
      height: Number(height),
      weight: Number(weight),
      activityLevel,
      healthGoal,
      healthConditions: selectedConditions,
      foodAllergies: selectedAllergens,
      dietaryPreference,
      currentMedications: currentMedications.trim() || undefined,
      smokingStatus: smokingStatus || undefined,
      alcoholConsumption: alcoholConsumption || undefined,
      sleepDuration,
      stressLevel,
      countryOrRegion
    };

    console.log('[INSTRUMENT_WEIGHT] [handleSubmit] finalProfile object constructed:', JSON.stringify(finalProfile));

    setSaveError(null);

    try {
      await saveProfile(finalProfile);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigateTo('profile-summary');
      }, 1500);
    } catch (err: any) {
      console.error('Error saving profile to database:', err);
      setSaveError(err.message || 'Failed to save health profile to backend database.');
    }
  };

  // Helper calculation metrics
  const hM = Number(height) / 100;
  const bmiVal = hM > 0 ? (Number(weight) / (hM * hM)) : 0;
  const bmiFormatted = bmiVal.toFixed(1);

  const getBMICategory = (bmi: number) => {
    if (bmi === 0) return { label: 'Not Calculated', color: 'text-slate-400 bg-slate-50 border-slate-100' };
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-amber-500 bg-amber-50 border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400' };
    if (bmi < 25) return { label: 'Optimal Normal', color: 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-orange-500 bg-orange-50 border-orange-100 dark:bg-orange-950/20 dark:border-orange-900/30 dark:text-orange-400' };
    return { label: 'Obese Range', color: 'text-red-500 bg-red-50 border-red-100 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400' };
  };

  const bmiCat = getBMICategory(bmiVal);

  const getConditionLabel = (id: string) => {
    return HEALTH_CONDITIONS.find(c => c.id === id)?.label || id;
  };

  const getAllergenLabel = (id: string) => {
    return FOOD_ALLERGENS.find(a => a.id === id)?.label || id;
  };

  const getGoalIcon = (goal: string, active: boolean) => {
    const cls = `w-5 h-5 transition-transform ${active ? 'scale-110' : ''}`;
    switch (goal) {
      case 'Weight Loss':
        return <Scale className={`${cls} text-amber-500`} />;
      case 'Weight Gain':
        return <Scale className={`${cls} text-blue-500`} />;
      case 'Muscle Gain':
        return <Dumbbell className={`${cls} text-orange-500`} />;
      case 'Improve Overall Health':
        return <Sparkles className={`${cls} text-emerald-500`} />;
      case 'Heart Health':
        return <Heart className={`${cls} text-rose-500`} />;
      case 'Blood Sugar Control':
        return <Activity className={`${cls} text-teal-500`} />;
      default:
        return <Sparkles className={`${cls} text-emerald-500`} />;
    }
  };

  const getActivityIcon = (level: string, active: boolean) => {
    const cls = `w-5 h-5 transition-transform ${active ? 'scale-110' : ''}`;
    switch (level) {
      case 'Sedentary':
        return <User className={`${cls} text-slate-400`} />;
      case 'Lightly Active':
        return <Smile className={`${cls} text-emerald-400`} />;
      case 'Moderately Active':
        return <Activity className={`${cls} text-emerald-500`} />;
      case 'Very Active':
        return <Flame className={`${cls} text-orange-500`} />;
      default:
        return <Activity className={`${cls} text-emerald-500`} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300" id="profile-form-root">
      
      {/* Header bar */}
      <header className="px-4 py-4 md:px-8 border-b border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950/80 backdrop-blur-md flex justify-between items-center sticky top-0 z-30" id="profile-form-header">
        <button
          id="profile-back-dashboard-btn"
          onClick={() => navigateTo(profile ? 'profile-summary' : 'dashboard')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{profile ? 'Back to Summary' : 'Back to Dashboard'}</span>
        </button>
        <div className="flex items-center gap-4">
          <span className="text-4xs font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/15 font-mono hidden sm:inline-block">
            Step {step} of 4
          </span>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8" id="profile-form-main">
        
        {/* Page title and prompt */}
        <div className="text-center mb-8" id="profile-form-intro">
          <div className="inline-flex p-3 bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 rounded-2xl mb-3">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
            Guided Health Assessment
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-md mx-auto leading-relaxed">
            Configure your lifestyle and clinical biomarkers to map accurate nutrition, therapeutic exercise, and hydration protocols.
          </p>
        </div>

        {/* Step Progress bar and labels */}
        <div className="mb-10 px-2" id="profile-progress-indicator">
          <div className="flex justify-between items-center relative" id="progress-labels">
            {/* Connecting Track Line */}
            <div className="absolute left-0 right-0 top-5 h-0.5 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0" />
            
            {/* Progress Fill Line */}
            <div 
              className="absolute left-0 top-5 h-0.5 bg-emerald-600 dark:bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-500"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
              id="progress-bar-fill"
            />

            {/* Step 1 Bubble */}
            <div className="flex flex-col items-center relative z-10">
              <button 
                type="button" 
                onClick={() => step > 1 && setStep(1)}
                disabled={step <= 1}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${
                  step === 1 
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20 scale-110' 
                    : step > 1 
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' 
                      : 'bg-white border-slate-200 text-slate-400 dark:bg-slate-900 dark:border-slate-800'
                }`}
              >
                {step > 1 ? <Check className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </button>
              <span className={`text-4xs font-bold uppercase tracking-wider mt-2.5 transition-colors ${step === 1 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                Bio-Stats
              </span>
            </div>

            {/* Step 2 Bubble */}
            <div className="flex flex-col items-center relative z-10">
              <button 
                type="button" 
                onClick={() => step > 2 && setStep(2)}
                disabled={step <= 2}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${
                  step === 2 
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20 scale-110' 
                    : step > 2 
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' 
                      : 'bg-white border-slate-200 text-slate-400 dark:bg-slate-900 dark:border-slate-800'
                }`}
              >
                {step > 2 ? <Check className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
              </button>
              <span className={`text-4xs font-bold uppercase tracking-wider mt-2.5 transition-colors ${step === 2 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                Lifestyle
              </span>
            </div>

            {/* Step 3 Bubble */}
            <div className="flex flex-col items-center relative z-10">
              <button 
                type="button" 
                onClick={() => step > 3 && setStep(3)}
                disabled={step <= 3}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${
                  step === 3 
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20 scale-110' 
                    : step > 3 
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' 
                      : 'bg-white border-slate-200 text-slate-400 dark:bg-slate-900 dark:border-slate-800'
                }`}
              >
                {step > 3 ? <Check className="w-5 h-5" /> : <Stethoscope className="w-5 h-5" />}
              </button>
              <span className={`text-4xs font-bold uppercase tracking-wider mt-2.5 transition-colors ${step === 3 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                Clinical Flags
              </span>
            </div>

            {/* Step 4 Bubble */}
            <div className="flex flex-col items-center relative z-10">
              <div 
                className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${
                  step === 4 
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20 scale-110' 
                    : 'bg-white border-slate-200 text-slate-400 dark:bg-slate-900 dark:border-slate-800'
                }`}
              >
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <span className={`text-4xs font-bold uppercase tracking-wider mt-2.5 transition-colors ${step === 4 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                Review
              </span>
            </div>

          </div>
        </div>

        {/* Alert for success */}
        {success && (
          <Alert variant="success" title="Health Profile Updates Logged" className="mb-6 rounded-2xl shadow-xs text-sm" id="profile-success-alert">
            Synchronizing profile with secure cloud database. Redirecting to summary...
          </Alert>
        )}

        {/* Alert for error */}
        {saveError && (
          <Alert variant="error" title="Failed to Save Health Profile" className="mb-6 rounded-2xl shadow-xs text-sm" id="profile-save-error-alert">
            {saveError}
          </Alert>
        )}

        <Card className="shadow-xl border border-slate-100 dark:border-slate-800/85 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden transition-all duration-300" id="profile-form-card">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSubmit} id="health-profile-step-form">
              
              {/* STEP 1: Basic Demographics */}
              {step === 1 && (
                <div className="flex flex-col gap-6 text-left animate-fade-in" id="step-1-container">
                  <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3 mb-1">
                    <div className="p-1.5 bg-emerald-500/10 rounded-xl">
                      <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-950 dark:text-white leading-tight">Biological Profile</h3>
                      <p className="text-4xs uppercase font-extrabold tracking-wider text-slate-400 mt-0.5">Step 1: Core Physical Metrics</p>
                    </div>
                  </div>

                  <Input
                    label="Full Name"
                    id="profile-fullName"
                    placeholder="e.g. Alex Smith"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    error={errors.fullName}
                    icon={<User className="w-4 h-4 text-slate-400" />}
                    maxLength={100}
                    required
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Input
                      label="Age (Years)"
                      id="profile-age"
                      type="number"
                      placeholder="e.g. 28"
                      value={age}
                      onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                      error={errors.age}
                      icon={<Calendar className="w-4 h-4 text-slate-400" />}
                      min="1"
                      max="120"
                      required
                    />

                    <Select
                      label="Gender Identification"
                      id="profile-gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      error={errors.gender}
                      required
                      options={[
                        { value: '', label: 'Select your gender' },
                        { value: 'Male', label: 'Male' },
                        { value: 'Female', label: 'Female' },
                        { value: 'Non-binary', label: 'Non-binary' },
                        { value: 'Prefer not to say', label: 'Prefer not to say' }
                      ]}
                    />
                  </div>

                  <SearchableSelect
                    label="Country / Region of Origin"
                    value={countryOrRegion}
                    onChange={(val) => setCountryOrRegion(val)}
                    options={REGIONS}
                    helperText="Enables regional food matching algorithms based on local dietary standards."
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 border-t border-slate-55 dark:border-slate-800 pt-5 mt-2">
                    <Input
                      label="Height (cm)"
                      id="profile-height"
                      type="number"
                      placeholder="e.g. 172"
                      value={height}
                      onChange={(e) => setHeight(e.target.value === '' ? '' : Number(e.target.value))}
                      error={errors.height}
                      icon={<Scale className="w-4 h-4 text-slate-400" />}
                      min="50"
                      max="300"
                      helperText="Specify height in centimeters."
                      required
                    />

                    <Input
                      label="Weight (kg)"
                      id="profile-weight"
                      type="number"
                      placeholder="e.g. 68"
                      value={weight}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : Number(e.target.value);
                        console.log('[INSTRUMENT_WEIGHT] [onChange] User changed weight in input field. New value:', val);
                        setWeight(val);
                      }}
                      error={errors.weight}
                      icon={<Scale className="w-4 h-4 text-slate-400" />}
                      min="10"
                      max="500"
                      helperText="Specify body weight in kilograms."
                      required
                    />
                  </div>

                  {/* Real-time calculated BMI metric widget inside step 1 */}
                  {height && weight && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-150/40 dark:border-slate-800 flex justify-between items-center gap-4 animate-fade-in mt-2" id="live-bmi-preview">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                          <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <span className="text-4xs font-bold text-slate-400 uppercase tracking-widest block font-mono">Live calculated BMI</span>
                          <span className="text-sm font-extrabold text-slate-850 dark:text-slate-200">{bmiFormatted} kg/m²</span>
                        </div>
                      </div>
                      <span className={`text-4xs px-2.5 py-1 font-bold uppercase tracking-wider rounded-md border ${bmiCat.color}`}>
                        {bmiCat.label}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: Lifestyle & Goals */}
              {step === 2 && (
                <div className="flex flex-col gap-6 text-left animate-fade-in" id="step-2-container">
                  <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3 mb-1">
                    <div className="p-1.5 bg-emerald-500/10 rounded-xl">
                      <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-950 dark:text-white leading-tight">Lifestyle & Goals</h3>
                      <p className="text-4xs uppercase font-extrabold tracking-wider text-slate-400 mt-0.5">Step 2: Activity and Metabolism Objectives</p>
                    </div>
                  </div>

                  {/* Activity Level selection with beautiful option cards */}
                  <div className="flex flex-col gap-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block font-mono">
                      Weekly Activity Level
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {ACTIVITY_LEVELS.map((item) => {
                        const isSelected = activityLevel === item.value;
                        return (
                          <div
                            key={item.value}
                            onClick={() => setActivityLevel(item.value)}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 group ${
                              isSelected
                                ? 'border-emerald-500 bg-emerald-50/15 dark:bg-emerald-950/20 shadow-xs'
                                : 'border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800/30'
                            }`}
                            id={`activity-${item.value.replace(/\s+/g, '-').toLowerCase()}`}
                          >
                            <div className={`p-2 rounded-xl border transition-all ${isSelected ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 group-hover:scale-105'}`}>
                              {getActivityIcon(item.value, isSelected)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                                {item.label}
                              </h4>
                              <p className="text-3xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                {item.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Health Goal selection cards */}
                  <div className="flex flex-col gap-3 border-t border-slate-100 dark:border-slate-800 pt-5 mt-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block font-mono">
                      Primary Health Goal
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {HEALTH_GOALS.map((item) => {
                        const isSelected = healthGoal === item.value;
                        return (
                          <div
                            key={item.value}
                            onClick={() => setHealthGoal(item.value)}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 group ${
                              isSelected
                                ? 'border-emerald-500 bg-emerald-50/15 dark:bg-emerald-950/20 shadow-xs'
                                : 'border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800/30'
                            }`}
                            id={`goal-${item.value.replace(/\s+/g, '-').toLowerCase()}`}
                          >
                            <div className={`p-2 rounded-xl border transition-all ${isSelected ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 group-hover:scale-105'}`}>
                              {getGoalIcon(item.value, isSelected)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                                {item.label}
                              </h4>
                              <p className="text-3xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                {item.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Optional social indicators */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 border-t border-slate-100 dark:border-slate-800 pt-5 mt-2">
                    <Select
                      label="Smoking Habits (Optional)"
                      id="profile-smoking"
                      value={smokingStatus}
                      onChange={(e) => setSmokingStatus(e.target.value)}
                      options={[
                        { value: 'Non-smoker', label: 'Non-smoker' },
                        { value: 'Former smoker', label: 'Former smoker' },
                        { value: 'Active smoker', label: 'Active smoker' }
                      ]}
                    />

                    <Select
                      label="Alcohol Intake (Optional)"
                      id="profile-alcohol"
                      value={alcoholConsumption}
                      onChange={(e) => setAlcoholConsumption(e.target.value)}
                      options={[
                        { value: 'None', label: 'None (Teetotaler)' },
                        { value: 'Rarely', label: 'Rarely / Occasional' },
                        { value: 'Socially', label: 'Social drinker' },
                        { value: 'Regularly', label: 'Regular consumption' }
                      ]}
                    />

                    <Select
                      label="Average Sleep Duration"
                      id="profile-sleep"
                      value={sleepDuration}
                      onChange={(e) => setSleepDuration(e.target.value as any)}
                      options={[
                        { value: 'Less than 6 hours', label: 'Less than 6 hours' },
                        { value: '6 to 8 hours', label: '6 to 8 hours' },
                        { value: 'More than 8 hours', label: 'More than 8 hours' }
                      ]}
                    />

                    <Select
                      label="Daily Stress Level"
                      id="profile-stress"
                      value={stressLevel}
                      onChange={(e) => setStressLevel(e.target.value as any)}
                      options={[
                        { value: 'Low', label: 'Low' },
                        { value: 'Moderate', label: 'Moderate' },
                        { value: 'High', label: 'High' }
                      ]}
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: Clinical Flags & Dietary Constraints */}
              {step === 3 && (
                <div className="flex flex-col gap-6 text-left animate-fade-in" id="step-3-container">
                  <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3 mb-1">
                    <div className="p-1.5 bg-emerald-500/10 rounded-xl">
                      <Stethoscope className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-950 dark:text-white leading-tight">Clinical Flags & Allergens</h3>
                      <p className="text-4xs uppercase font-extrabold tracking-wider text-slate-400 mt-0.5">Step 3: Medical Contraindications & Guidelines</p>
                    </div>
                  </div>

                  {/* Health conditions multi-select chips */}
                  <div className="flex flex-col gap-2.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block font-mono">
                      Chronic Health Conditions <span className="font-normal text-slate-500 lowercase">(Select all that apply)</span>
                    </label>
                    <div className="flex flex-wrap gap-2" id="conditions-chips">
                      {HEALTH_CONDITIONS.map((cond) => {
                        const isSelected = selectedConditions.includes(cond.id);
                        const isNone = cond.id === 'none';
                        return (
                          <button
                            type="button"
                            key={cond.id}
                            id={`chip-condition-${cond.id}`}
                            onClick={() => handleConditionToggle(cond.id)}
                            className={`px-4 py-2.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-2 ${
                              isSelected
                                ? isNone
                                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                                  : 'bg-rose-600 border-rose-600 text-white shadow-xs'
                                : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                            <span>{cond.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Food Allergens multi-select chips */}
                  <div className="flex flex-col gap-2.5 border-t border-slate-100 dark:border-slate-800 pt-5 mt-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block font-mono">
                      Severe Food Allergies <span className="font-normal text-slate-500 lowercase">(Select all that apply)</span>
                    </label>
                    <div className="flex flex-wrap gap-2" id="allergens-chips">
                      {FOOD_ALLERGENS.map((all) => {
                        const isSelected = selectedAllergens.includes(all.id);
                        const isNone = all.id === 'none';
                        return (
                          <button
                            type="button"
                            key={all.id}
                            id={`chip-allergen-${all.id}`}
                            onClick={() => handleAllergenToggle(all.id)}
                            className={`px-4 py-2.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-2 ${
                              isSelected
                                ? isNone
                                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                                  : 'bg-amber-600 border-amber-600 text-white shadow-xs'
                                : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                            <span>{all.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dietary Preference Selection */}
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-5 mt-2">
                    <Select
                      label="Primary Dietary Preference Strategy"
                      id="profile-dietary"
                      value={dietaryPreference}
                      onChange={(e) => setDietaryPreference(e.target.value)}
                      options={DIETARY_PREFERENCES}
                    />
                  </div>

                  {/* Current Medications optional text input */}
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-5 mt-2">
                    <Textarea
                      label="Active Medications (Optional)"
                      id="profile-medications"
                      placeholder="e.g. Metformin 500mg (Daily), Lisinopril 10mg..."
                      value={currentMedications}
                      onChange={(e) => setCurrentMedications(e.target.value)}
                      maxLength={250}
                      helperText="Required to flag potential drug-nutrient interactions in the recommendations suite."
                    />
                  </div>
                </div>
              )}

              {/* STEP 4: Review Assessment */}
              {step === 4 && (
                <div className="flex flex-col gap-6 text-left animate-fade-in" id="step-4-container">
                  {(() => {
                    console.log('[INSTRUMENT_WEIGHT] [render step 4] Rendering Review step. Current weight state:', weight);
                    return null;
                  })()}
                  <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3 mb-1">
                    <div className="p-1.5 bg-emerald-500/10 rounded-xl">
                      <ClipboardCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-950 dark:text-white leading-tight">Review Your Assessment</h3>
                      <p className="text-4xs uppercase font-extrabold tracking-wider text-slate-400 mt-0.5">Step 4: Verify inputs before generation</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed -mt-2">
                    Please confirm all clinical and biological inputs below. Each section can be modified directly before compiling your customized health report.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="review-cards-wrapper">
                    
                    {/* Card 1: Biological Profile */}
                    <Card className="border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl relative overflow-hidden" id="review-card-demographics">
                      <div className="p-4 flex flex-col gap-3">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                          <span className="text-2xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                            <User className="w-3.5 h-3.5 text-emerald-600" />
                            <span>1. Core Stats</span>
                          </span>
                          <button 
                            type="button"
                            onClick={() => setStep(1)}
                            className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                            title="Edit Core Stats"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        
                        <div className="flex flex-col gap-2.5 text-xs text-slate-600 dark:text-slate-350 font-semibold">
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-medium">Name:</span>
                            <span className="text-slate-850 dark:text-white">{fullName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-medium">Age & Gender:</span>
                            <span className="text-slate-850 dark:text-white">{age} Years old • {gender}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-medium">Origin Region:</span>
                            <span className="text-slate-850 dark:text-white">{countryOrRegion}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-medium">Stature / Weight:</span>
                            <span className="text-slate-850 dark:text-white">{height} cm / {weight} kg</span>
                          </div>
                          
                          <div className="p-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl flex items-center justify-between gap-2 mt-1">
                            <div className="flex items-center gap-2">
                              <Activity className="w-4 h-4 text-emerald-500" />
                              <span className="text-3xs font-bold text-slate-400 uppercase tracking-widest font-mono">BMI</span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-black text-slate-900 dark:text-white font-mono block leading-none">{bmiFormatted}</span>
                              <span className={`text-[9px] font-bold uppercase tracking-widest ${bmiCat.label === 'Optimal Normal' ? 'text-emerald-500' : 'text-amber-500'} block mt-0.5`}>
                                {bmiCat.label}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Card 2: Lifestyle & Goals */}
                    <Card className="border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl relative overflow-hidden" id="review-card-lifestyle">
                      <div className="p-4 flex flex-col gap-3">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                          <span className="text-2xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                            <Activity className="w-3.5 h-3.5 text-emerald-600" />
                            <span>2. Lifestyle</span>
                          </span>
                          <button 
                            type="button"
                            onClick={() => setStep(2)}
                            className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                            title="Edit Lifestyle"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        
                        <div className="flex flex-col gap-2.5 text-xs text-slate-600 dark:text-slate-350 font-semibold">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-slate-400 font-medium">Metabolism Goal:</span>
                            <span className="text-emerald-600 dark:text-emerald-450 font-extrabold">{healthGoal}</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-slate-400 font-medium">Weekly Exercise Activity:</span>
                            <span className="text-slate-850 dark:text-white">{activityLevel}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <div className="p-2 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl">
                              <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-mono">Stress Level</span>
                              <span className="text-2xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{stressLevel}</span>
                            </div>
                            <div className="p-2 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl">
                              <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-mono">Sleep Average</span>
                              <span className="text-2xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{sleepDuration}</span>
                            </div>
                            <div className="p-2 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl">
                              <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-mono">Smoking</span>
                              <span className="text-2xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{smokingStatus}</span>
                            </div>
                            <div className="p-2 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl">
                              <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-mono">Alcohol</span>
                              <span className="text-2xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{alcoholConsumption}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Card 3: Clinical Profiles & Allergies (Full width on review grid) */}
                    <Card className="border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl relative overflow-hidden md:col-span-2" id="review-card-clinical">
                      <div className="p-5 flex flex-col gap-4">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                          <span className="text-2xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                            <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                            <span>3. Clinical Flags & Constraints</span>
                          </span>
                          <button 
                            type="button"
                            onClick={() => setStep(3)}
                            className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                            title="Edit Clinical Flags"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-semibold">
                          <div className="flex flex-col gap-2">
                            <span className="text-slate-400 font-medium">Chronic Conditions:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {selectedConditions.map((cId) => {
                                const isNone = cId === 'none';
                                return (
                                  <span 
                                    key={cId}
                                    className={`px-2 py-1 rounded-lg font-bold border text-3xs ${
                                      isNone 
                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                                        : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                                    }`}
                                  >
                                    {getConditionLabel(cId)}
                                  </span>
                                );
                              })}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <span className="text-slate-400 font-medium">Food Allergens:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {selectedAllergens.map((aId) => {
                                const isNone = aId === 'none';
                                return (
                                  <span 
                                    key={aId}
                                    className={`px-2 py-1 rounded-lg font-bold border text-3xs ${
                                      isNone 
                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                                        : 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                                    }`}
                                  >
                                    {getAllergenLabel(aId)}
                                  </span>
                                );
                              })}
                            </div>
                          </div>

                          <div className="flex flex-col gap-1 sm:col-span-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between items-center">
                              <span className="text-slate-400 font-medium">Dietary Strategy:</span>
                              <span className="text-slate-850 dark:text-white">{dietaryPreference}</span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1 sm:col-span-2">
                            <span className="text-slate-400 font-medium">Active Prescription Drugs:</span>
                            <p className="text-slate-800 dark:text-slate-300 italic whitespace-pre-wrap bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850 mt-1">
                              {currentMedications.trim() || 'No medications declared.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>

                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-3xs font-semibold leading-relaxed flex items-start gap-2.5 mt-2" id="review-verify-info">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold text-emerald-600 uppercase tracking-widest block mb-0.5">Biocompatibility Engine ready</span>
                      <span>By clicking "Save and Compile Report" below, our engine will parse these inputs to filter ingredients, cross-reference drug-nutrient depletions, and compute therapeutic cardio goals.</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action and Navigation Buttons */}
              <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-6 mt-8" id="form-actions">
                <div>
                  {step > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="md"
                      onClick={handlePrev}
                      icon={<ArrowLeft className="w-4 h-4" />}
                      id="form-prev-btn"
                      className="font-bold text-xs rounded-2xl px-5"
                    >
                      Back
                    </Button>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    onClick={() => navigateTo(profile ? 'profile-summary' : 'dashboard')}
                    id="form-cancel-btn"
                    className="font-bold text-xs text-slate-500 rounded-2xl px-5"
                  >
                    Cancel
                  </Button>

                  {step < 4 ? (
                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      onClick={handleNext}
                      icon={<ArrowRight className="w-4 h-4" />}
                      iconPosition="right"
                      id="form-next-btn"
                      className="font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl px-6"
                    >
                      Next Step
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      onClick={handleSubmit}
                      isLoading={loadingProfile}
                      icon={<Save className="w-4 h-4" />}
                      id="form-submit-btn"
                      className="font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl px-6"
                    >
                      Save and Compile Report
                    </Button>
                  )}
                </div>
              </div>

            </form>
          </CardContent>
        </Card>
      </main>

      {/* Basic Footer Disclaimer */}
      <footer className="px-4 py-6 md:px-8 border-t border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400" id="profile-form-footer">
        <div className="flex items-center gap-2 max-w-lg text-left" id="profile-disclaimer">
          <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span>Profile configuration is secured using standard patient safety protocols. Your credentials and flags are isolated strictly to your clinical profile.</span>
        </div>
        <span>© 2026 Smart Health Guide</span>
      </footer>

    </div>
  );
}
