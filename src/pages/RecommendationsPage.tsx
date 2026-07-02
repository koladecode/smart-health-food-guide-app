import React, { useState } from 'react';
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
  ShieldAlert
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { useHealthProfile } from '../context/HealthProfileContext';
import Button from '../components/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/Card';
import ThemeToggle from '../components/ThemeToggle';
import Alert from '../components/Alert';

type Category = 'meals' | 'fitness' | 'precautions';

export default function RecommendationsPage() {
  const { navigateTo } = useNavigation();
  const { profile } = useHealthProfile();
  const [activeCategory, setActiveCategory] = useState<Category>('meals');

  // If no profile, redirect or show setup
  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100" id="recs-empty-profile">
        <header className="px-4 py-4 border-b border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 flex justify-between items-center">
          <span className="font-extrabold text-base text-emerald-600">Smart Health Guide</span>
          <ThemeToggle />
        </header>
        <main className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md p-8 border border-slate-100 dark:border-slate-800 text-center rounded-3xl bg-white dark:bg-slate-900">
            <ShieldAlert className="w-10 h-10 text-emerald-600 mx-auto mb-4" />
            <h2 className="text-xl font-black text-slate-950 dark:text-white">Profile Required</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-6">
              Complete your health profile form first to unlock customizable, scientific nutritional indices and recommendations.
            </p>
            <Button variant="primary" size="md" onClick={() => navigateTo('profile-form')}>
              Set Up Profile Now
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300" id="recommendations-root">
      
      {/* Top sticky navbar header */}
      <header className="px-4 py-4 md:px-8 border-b border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950/80 backdrop-blur-md flex justify-between items-center sticky top-0 z-30" id="recs-header">
        <button
          id="recs-back-btn"
          onClick={() => navigateTo('profile-summary')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Profile Summary</span>
        </button>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateTo('dashboard')}
            id="recs-dashboard-btn"
          >
            Go to Dashboard
          </Button>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Body Column */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 flex flex-col gap-6 text-left" id="recs-main">
        
        {/* Intro Banner */}
        <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg shadow-emerald-600/10" id="recs-welcome">
          <div className="flex flex-col gap-2 max-w-xl">
            <span className="bg-white/10 px-3 py-1 rounded-full text-2xs font-bold uppercase tracking-wider w-fit flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personalized Engine Placeholder</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Recommendations for {profile.fullName}
            </h1>
            <p className="text-sm text-emerald-50/90 leading-relaxed">
              These recommendations are dynamically organized based on your goal: <strong className="underline">{profile.healthGoal}</strong>. Review your custom dashboard mock outputs below.
            </p>
          </div>
          <Button
            variant="secondary"
            className="bg-white text-emerald-700 hover:bg-slate-50 whitespace-nowrap font-bold"
            onClick={() => navigateTo('profile-form')}
            id="recs-edit-profile-shortcut"
          >
            Refine Profile
          </Button>
        </div>

        {/* Educational Disclaimer */}
        <Alert variant="disclaimer" title="Educational Clinical Notice" id="recs-disclaimer">
          The following outlines represent high-fidelity visual preview recommendations. They have not been compiled by clinical AI reasoning. Seek certified health practitioner approval before adjustments.
        </Alert>

        {/* Content Tabs Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800" id="recs-category-tabs">
          <button
            onClick={() => setActiveCategory('meals')}
            className={`px-5 py-3 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
              activeCategory === 'meals'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
            id="recs-tab-meals"
          >
            <Utensils className="w-4 h-4" />
            <span>Nutritional Meal Blueprint</span>
          </button>
          
          <button
            onClick={() => setActiveCategory('fitness')}
            className={`px-5 py-3 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
              activeCategory === 'fitness'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
            id="recs-tab-fitness"
          >
            <Activity className="w-4 h-4" />
            <span>Active Motion Routines</span>
          </button>

          <button
            onClick={() => setActiveCategory('precautions')}
            className={`px-5 py-3 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
              activeCategory === 'precautions'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
            id="recs-tab-precautions"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Allergen & Medication Safety</span>
          </button>
        </div>

        {/* TAB 1: MEALS */}
        {activeCategory === 'meals' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="recs-meals-content">
            
            {/* Safe & Target Foods List */}
            <div className="lg:col-span-8 flex flex-col gap-6" id="meals-main-panel">
              <Card id="meals-schedule-card">
                <CardHeader>
                  <CardTitle className="text-lg">Target Calorie & Macro Distribution</CardTitle>
                  <CardDescription>Based on dietary preference: <span className="text-emerald-600 font-bold">{profile.dietaryPreference || 'None'}</span></CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                  
                  {/* Energy indicators */}
                  <div className="grid grid-cols-3 gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-2xs text-slate-400 uppercase tracking-widest font-bold">Protein</span>
                      <span className="text-lg font-black text-slate-900 dark:text-white font-mono">140g</span>
                      <span className="text-2xs text-slate-400 font-medium">Sustains muscle mass</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-2xs text-slate-400 uppercase tracking-widest font-bold">Healthy Fats</span>
                      <span className="text-lg font-black text-slate-900 dark:text-white font-mono">65g</span>
                      <span className="text-2xs text-slate-400 font-medium">Hormone balance</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-2xs text-slate-400 uppercase tracking-widest font-bold">Carbohydrates</span>
                      <span className="text-lg font-black text-slate-900 dark:text-white font-mono">180g</span>
                      <span className="text-2xs text-slate-400 font-medium">Low-glycemic energy</span>
                    </div>
                  </div>

                  {/* Sample daily food timeline */}
                  <div className="flex flex-col gap-4">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Suggested High-Density Meal Template</h4>
                    
                    <div className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl">
                      <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 rounded-xl h-fit font-mono font-black text-xs">
                        AM
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-slate-900 dark:text-white">Stabilizing Power Oats Breakfast</h5>
                        <p className="text-xs text-slate-500 mt-1">Gluten-free rolled oats, protein isolate, organic chia seeds, mixed berries, and a handful of walnuts.</p>
                      </div>
                    </div>

                    <div className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl">
                      <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 rounded-xl h-fit font-mono font-black text-xs">
                        MID
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-slate-900 dark:text-white">Fibre-Dense Lean Salad Lunch</h5>
                        <p className="text-xs text-slate-500 mt-1">Fresh baby spinach, grilled chicken breast, chopped cucumbers, half avocado, drizzled with virgin olive oil.</p>
                      </div>
                    </div>

                    <div className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl">
                      <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 rounded-xl h-fit font-mono font-black text-xs">
                        PM
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-slate-900 dark:text-white">Pan-Seared Salmon & Asparagus</h5>
                        <p className="text-xs text-slate-500 mt-1">Omega-3 rich wild salmon fillet, steamed asparagus spears, baked sweet potato wedges with natural sea salt.</p>
                      </div>
                    </div>

                  </div>

                </CardContent>
              </Card>
            </div>

            {/* Micronutrient Guidelines Panel */}
            <div className="lg:col-span-4 flex flex-col gap-6" id="meals-side-panel">
              <Card id="micronutrients-card">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-emerald-600" />
                    <span>Essential Micro-Inductions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col gap-1">
                    <span className="text-2xs text-slate-400 font-bold uppercase tracking-wider">Magnesium Glycinate</span>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Promotes metabolic cellular recovery and supports muscular hydration.</p>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col gap-1">
                    <span className="text-2xs text-slate-400 font-bold uppercase tracking-wider">Omega-3 DHA & EPA</span>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Provides fundamental structural lipid assistance for vascular and cardiac tissue health.</p>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col gap-1">
                    <span className="text-2xs text-slate-400 font-bold uppercase tracking-wider">Vitamin D3 + K2</span>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Maintains calcium homeostasis and empowers immune defense cascades.</p>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        )}

        {/* TAB 2: FITNESS */}
        {activeCategory === 'fitness' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="recs-fitness-content">
            
            <div className="lg:col-span-8 flex flex-col gap-6" id="fitness-main-panel">
              <Card id="fitness-routine-card">
                <CardHeader>
                  <CardTitle className="text-lg">Structured Weekly Physical Outline</CardTitle>
                  <CardDescription>Optimized for activity level: <strong className="text-emerald-600 font-bold">{profile.activityLevel}</strong></CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Day 1 & 4: Functional Resistance Strength</h4>
                      <span className="text-2xs font-bold text-emerald-600 font-mono">45 MINS</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">Focus on multi-joint compound motions (squats, Romanian deadlifts, chest pressing, rowing movements). Resistance workouts regulate blood glucose and optimize glucose uptake into muscle cells without insulin dependency.</p>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Day 2 & 5: Low-Intensity Steady Cardio (LISS)</h4>
                      <span className="text-2xs font-bold text-emerald-600 font-mono">30-45 MINS</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">Maintain a target heart rate zone of 115-135 BPM (brisk walking, indoor stationary cycling). Excellent for cardiac capillary density and steady mitochondrial lipid oxidation.</p>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Day 3 & 6: Active Stretch & Decompression</h4>
                      <span className="text-2xs font-bold text-emerald-600 font-mono">20 MINS</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">Yin yoga, deep foam rolling, dynamic fascia lengthening. Minimizes sympathetic nervous overload and controls stress-induced cortisol levels.</p>
                  </div>

                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-6" id="fitness-side-panel">
              <Card id="fitness-safety-indices">
                <CardHeader>
                  <CardTitle className="text-base">Mitochondrial Indices</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="p-4 bg-emerald-50/20 dark:bg-emerald-950/10 rounded-2xl border border-emerald-100/30">
                    <h5 className="text-xs font-bold text-emerald-700 dark:text-emerald-300">VO2 Max Threshold</h5>
                    <p className="text-sm font-bold text-slate-900 dark:text-white font-mono mt-1">42.5 ml/kg/min</p>
                    <p className="text-2xs text-slate-400 mt-1">Optimal cardiovascular limits</p>
                  </div>

                  <div className="p-4 bg-teal-50/20 dark:bg-teal-950/10 rounded-2xl border border-teal-100/30">
                    <h5 className="text-xs font-bold text-teal-700 dark:text-teal-300">Recovery Pulse Index</h5>
                    <p className="text-sm font-bold text-slate-900 dark:text-white font-mono mt-1">1 min / -25 BPM</p>
                    <p className="text-2xs text-slate-400 mt-1">Excellent vagal recovery rate</p>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        )}

        {/* TAB 3: PRECAUTIONS */}
        {activeCategory === 'precautions' && (
          <div className="flex flex-col gap-6" id="recs-precautions-content">
            
            {/* Allergen Flag Section */}
            <Card id="precautions-allergies-card">
              <CardHeader className="bg-amber-500/5">
                <CardTitle className="text-lg flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Severe Allergen Preclusion Guidelines</span>
                </CardTitle>
                <CardDescription>Your registered allergen flags: <span className="font-bold text-amber-700">{profile.foodAllergies?.join(', ')}</span></CardDescription>
              </CardHeader>
              <CardContent className="p-6 flex flex-col gap-4">
                
                {profile.foodAllergies?.includes('none') ? (
                  <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800 text-sm text-slate-500">
                    No active allergen limits registered in your health profile. General nutrition guidelines remain active.
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {profile.foodAllergies?.map((allergen) => (
                      <div key={allergen} className="p-4 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl">
                        <h4 className="text-sm font-black text-amber-800 dark:text-amber-400 uppercase tracking-wider">
                          Critical Alert: {allergen.toUpperCase()} Exclusion Required
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                          Exclude raw inputs, processed fractions, or emulsifiers derived from {allergen}. Carefully audit allergen safety summaries printed on labels, as cross-contamination during manufacturing can spark anaphylactic/immunological cascades.
                        </p>
                      </div>
                    ))}
                  </div>
                )}

              </CardContent>
            </Card>

            {/* Nutrient-Drug Interaction Guidelines */}
            <Card id="precautions-meds-card">
              <CardHeader className="bg-emerald-600/5">
                <CardTitle className="text-lg flex items-center gap-2 text-emerald-600">
                  <ShieldCheck className="w-5 h-5" />
                  <span>Active Medication Interlocutors</span>
                </CardTitle>
                <CardDescription>Active Medications: <span className="font-bold">{profile.currentMedications || 'None specified'}</span></CardDescription>
              </CardHeader>
              <CardContent className="p-6 flex flex-col gap-4">
                
                {profile.currentMedications ? (
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 leading-relaxed text-xs text-slate-600 dark:text-slate-300">
                    <p className="font-bold text-slate-900 dark:text-white text-sm mb-1">Potential Nutrient Depletions Under Review</p>
                    <p>Some metabolic substances require enhanced co-factor intake to balance secondary nutrient depletions. For instance:</p>
                    <ul className="list-disc pl-5 mt-2 flex flex-col gap-1">
                      <li>Metformin may lower serum Vitamin B12 absorption coefficients. Consider supplementary Vitamin B12.</li>
                      <li>Cardiovascular medications (e.g., beta-blockers/statins) may decrease biological Coenzyme Q10 availability.</li>
                    </ul>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800 text-sm text-slate-500">
                    No chronic medical prescription substances currently defined. No known depletions triggered.
                  </div>
                )}

              </CardContent>
            </Card>

          </div>
        )}

      </main>

      {/* Footer bar */}
      <footer className="px-4 py-6 md:px-8 border-t border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 flex justify-between items-center text-xs text-slate-400" id="recs-footer">
        <span>© 2026 Smart Health Guide</span>
        <span>Verified Educational Outline</span>
      </footer>

    </div>
  );
}
