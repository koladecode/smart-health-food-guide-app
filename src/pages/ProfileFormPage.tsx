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
  Apple
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { useHealthProfile, HealthProfile } from '../context/HealthProfileContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/Card';
import { Input, Select, Textarea } from '../components/Input';
import ThemeToggle from '../components/ThemeToggle';
import Alert from '../components/Alert';

const ACTIVITY_LEVELS = [
  { value: 'Sedentary', label: 'Sedentary', desc: 'Little to no physical exercise, desk job' },
  { value: 'Lightly Active', label: 'Lightly Active', desc: 'Light exercise or active lifestyle 1-3 days/week' },
  { value: 'Moderately Active', label: 'Moderately Active', desc: 'Moderate physical exercise 3-5 days/week' },
  { value: 'Very Active', label: 'Very Active', desc: 'Intense sports, heavy exercise, or physically demanding job' }
] as const;

const HEALTH_GOALS = [
  { value: 'Lose Weight', label: 'Lose Weight', desc: 'Caloric deficit focused nutrition and fitness guidance' },
  { value: 'Maintain Weight', label: 'Maintain Weight', desc: 'Energy balance and healthy nutrient metabolism' },
  { value: 'Gain Weight', label: 'Gain Weight', desc: 'Caloric surplus, muscle-building nutrition and support' },
  { value: 'Improve Overall Health', label: 'Improve Overall Health', desc: 'Micronutrient density, immunity, and chronic prevention' }
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
  const [height, setHeight] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  
  const [activityLevel, setActivityLevel] = useState<HealthProfile['activityLevel']>('Moderately Active');
  const [healthGoal, setHealthGoal] = useState<HealthProfile['healthGoal']>('Improve Overall Health');
  const [smokingStatus, setSmokingStatus] = useState('Non-smoker');
  const [alcoholConsumption, setAlcoholConsumption] = useState('None');

  const [selectedConditions, setSelectedConditions] = useState<string[]>(['none']);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>(['none']);
  const [dietaryPreference, setDietaryPreference] = useState('None');
  const [currentMedications, setCurrentMedications] = useState('');

  // Pre-fill if editing profile
  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setAge(profile.age || '');
      setGender(profile.gender || '');
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
    }
  }, [profile]);

  if (loading || !isProfileFetched || loadingProfile) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300" id="profile-form-loading">
        <header className="px-4 py-4 md:px-8 border-b border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 flex justify-between items-center" id="loading-form-header">
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

        <main className="flex-1 flex items-center justify-center p-6" id="loading-form-main">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" id="loading-form-spinner" />
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading your profile details...</p>
          </div>
        </main>

        <footer className="py-6 border-t border-slate-100 dark:border-slate-900 text-center text-xs text-slate-400" id="loading-form-footer">
          © 2026 Smart Health Guide
        </footer>
      </div>
    );
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
    if (!validateStep(3)) return;

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
      alcoholConsumption: alcoholConsumption || undefined
    };

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
          <span className="text-xs text-slate-400 hidden sm:inline-block font-mono bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-md">
            Profile Builder Mode
          </span>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8" id="profile-form-main">
        
        {/* Page title and prompt */}
        <div className="text-center mb-8" id="profile-form-intro">
          <div className="inline-flex p-3 bg-emerald-600/10 text-emerald-600 rounded-2xl mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
            Configure Your Health Profile
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-md mx-auto">
            Input accurate biological and clinical indicators to generate precise nutritional and medication conflict analyses.
          </p>
        </div>

        {/* Step Progress bar and labels */}
        <div className="mb-8" id="profile-progress-indicator">
          <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-400 dark:text-slate-500 font-mono uppercase tracking-wider" id="progress-labels">
            <span className={step >= 1 ? 'text-emerald-600 dark:text-emerald-400' : ''}>1. Demographics</span>
            <span className={step >= 2 ? 'text-emerald-600 dark:text-emerald-400' : ''}>2. Lifestyle & Goals</span>
            <span className={step >= 3 ? 'text-emerald-600 dark:text-emerald-400' : ''}>3. Clinical Flags</span>
          </div>
          {/* Progress gauge bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden" id="progress-bar-track">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
              id="progress-bar-fill"
            />
          </div>
        </div>

        {/* Alert for success */}
        {success && (
          <Alert variant="success" title="Health Profile Updates Logged" className="mb-6" id="profile-success-alert">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Synchronizing profile with secure cloud backend. Redirecting you to your profile review...</span>
            </div>
          </Alert>
        )}

        {/* Alert for error */}
        {saveError && (
          <Alert variant="error" title="Failed to Save Health Profile" className="mb-6" id="profile-save-error-alert">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span>{saveError}</span>
            </div>
          </Alert>
        )}

        <Card className="shadow-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl" id="profile-form-card">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSubmit} id="health-profile-step-form">
              
              {/* STEP 1: Basic Demographics */}
              {step === 1 && (
                <div className="flex flex-col gap-5 text-left" id="step-1-container">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-600" />
                    <span>Basic Demographics</span>
                  </h3>

                  <Input
                    label="Full Name"
                    id="profile-fullName"
                    placeholder="e.g. Jane Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    error={errors.fullName}
                    required
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Age (Years)"
                      id="profile-age"
                      type="number"
                      placeholder="e.g. 28"
                      value={age}
                      onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                      error={errors.age}
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Height (cm)"
                      id="profile-height"
                      type="number"
                      placeholder="e.g. 172"
                      value={height}
                      onChange={(e) => setHeight(e.target.value === '' ? '' : Number(e.target.value))}
                      error={errors.height}
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
                      onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
                      error={errors.weight}
                      min="10"
                      max="500"
                      helperText="Specify body weight in kilograms."
                      required
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Lifestyle & Goals */}
              {step === 2 && (
                <div className="flex flex-col gap-6 text-left" id="step-2-container">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-600" />
                    <span>Lifestyle & Wellness Goals</span>
                  </h3>

                  {/* Activity Level selection with beautiful option cards */}
                  <div className="flex flex-col gap-3">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Weekly Activity Level
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {ACTIVITY_LEVELS.map((item) => {
                        const isSelected = activityLevel === item.value;
                        return (
                          <div
                            key={item.value}
                            onClick={() => setActivityLevel(item.value)}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                              isSelected
                                ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs'
                                : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-50'
                            }`}
                            id={`activity-${item.value.replace(/\s+/g, '-').toLowerCase()}`}
                          >
                            <h4 className="text-sm font-bold text-slate-950 dark:text-white flex items-center gap-2">
                              <span className={`w-3 h-3 rounded-full ${isSelected ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                              {item.label}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Health Goal selection cards */}
                  <div className="flex flex-col gap-3">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Primary Health & Metabolism Goal
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {HEALTH_GOALS.map((item) => {
                        const isSelected = healthGoal === item.value;
                        return (
                          <div
                            key={item.value}
                            onClick={() => setHealthGoal(item.value)}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                              isSelected
                                ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs'
                                : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-50'
                            }`}
                            id={`goal-${item.value.replace(/\s+/g, '-').toLowerCase()}`}
                          >
                            <h4 className="text-sm font-bold text-slate-950 dark:text-white flex items-center gap-2">
                              <span className={`w-3 h-3 rounded-full ${isSelected ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                              {item.label}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Optional social indicators */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
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
                  </div>
                </div>
              )}

              {/* STEP 3: Clinical Flags & Dietary Constraints */}
              {step === 3 && (
                <div className="flex flex-col gap-6 text-left" id="step-3-container">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-emerald-600" />
                    <span>Clinical Flags & Allergens</span>
                  </h3>

                  {/* Health conditions multi-select chips */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <span>Chronic Health Conditions</span>
                      <span className="text-xs text-slate-400 font-normal">(Select all that apply)</span>
                    </label>
                    <div className="flex flex-wrap gap-2" id="conditions-chips">
                      {HEALTH_CONDITIONS.map((cond) => {
                        const isSelected = selectedConditions.includes(cond.id);
                        return (
                          <button
                            type="button"
                            key={cond.id}
                            id={`chip-condition-${cond.id}`}
                            onClick={() => handleConditionToggle(cond.id)}
                            className={`px-4 py-2 text-xs md:text-sm font-bold rounded-xl border transition-all ${
                              isSelected
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                            }`}
                          >
                            {cond.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Food Allergens multi-select chips */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <Apple className="w-4 h-4 text-emerald-600" />
                      <span>Severe Food Allergies</span>
                      <span className="text-xs text-slate-400 font-normal">(Select all that apply)</span>
                    </label>
                    <div className="flex flex-wrap gap-2" id="allergens-chips">
                      {FOOD_ALLERGENS.map((all) => {
                        const isSelected = selectedAllergens.includes(all.id);
                        return (
                          <button
                            type="button"
                            key={all.id}
                            id={`chip-allergen-${all.id}`}
                            onClick={() => handleAllergenToggle(all.id)}
                            className={`px-4 py-2 text-xs md:text-sm font-bold rounded-xl border transition-all ${
                              isSelected
                                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                                : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                            }`}
                          >
                            {all.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dietary Preference Selection */}
                  <Select
                    label="Primary Dietary Preference Strategy"
                    id="profile-dietary"
                    value={dietaryPreference}
                    onChange={(e) => setDietaryPreference(e.target.value)}
                    options={DIETARY_PREFERENCES}
                  />

                  {/* Current Medications optional text input */}
                  <Textarea
                    label="Active Medications (Optional)"
                    id="profile-medications"
                    placeholder="e.g. Metformin 500mg (Daily), Lisinopril 10mg..."
                    value={currentMedications}
                    onChange={(e) => setCurrentMedications(e.target.value)}
                    helperText="Providing medical substances helps cross-reference known nutrient-drug depletion interactions."
                  />
                </div>
              )}

              {/* Action and Navigation Buttons */}
              <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-6 mt-8" id="form-actions">
                <div>
                  {step > 1 && (
                    <Button
                      variant="outline"
                      size="md"
                      onClick={handlePrev}
                      icon={<ArrowLeft className="w-4 h-4" />}
                      id="form-prev-btn"
                    >
                      Back
                    </Button>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={() => navigateTo(profile ? 'profile-summary' : 'dashboard')}
                    id="form-cancel-btn"
                  >
                    Cancel
                  </Button>

                  {step < 3 ? (
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleNext}
                      icon={<ArrowRight className="w-4 h-4" />}
                      iconPosition="right"
                      id="form-next-btn"
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
                    >
                      Save Profile
                    </Button>
                  )}
                </div>
              </div>

            </form>
          </CardContent>
        </Card>
      </main>

      {/* Basic Footer */}
      <footer className="px-4 py-6 md:px-8 border-t border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400" id="profile-form-footer">
        <div className="flex items-center gap-1.5 max-w-md text-left" id="profile-disclaimer">
          <AlertCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>Profile is synchronized with the authenticated backend and stored securely in your account.</span>
        </div>
        <span>© 2026 Smart Health Guide</span>
      </footer>

    </div>
  );
}
