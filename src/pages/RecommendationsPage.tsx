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
  Plus,
  Coffee,
  CupSoda
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { useHealthProfile } from '../context/HealthProfileContext';
import { useAuth } from '../context/AuthContext';
import { safeJsonResponse } from '../utils/apiUtils';
import { generateRecommendations } from '../utils/recommendationEngine';
import Button from '../components/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/Card';
import ThemeToggle from '../components/ThemeToggle';
import Alert from '../components/Alert';
import { RecommendationsSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

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
            const errData = await safeJsonResponse(res).catch(() => ({}));
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

  // Smooth scroll handler for quick navigation
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const headerOffset = 145; // Height of navbar + sticky quick links bar
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // 0. If profile is loading, show loading spinner
  if (loadingProfile) {
    return <RecommendationsSkeleton />;
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

  // Helper to compute horizontal BMI marker position (from BMI 15 to 35)
  const getBmiPercent = (bmi: number) => {
    const minBmi = 15;
    const maxBmi = 35;
    const percent = ((bmi - minBmi) / (maxBmi - minBmi)) * 100;
    return Math.min(Math.max(percent, 0), 100);
  };

  // Helper to rewrite every Clinical Rationale into a single concise benefit sentence (maximum two short sentences)
  const summarizeClinicalRationale = (text: string): string => {
    if (!text) return '';
    let cleaned = text.trim();
    
    const commonReplacements: { [key: string]: string } = {
      'its low-glycemic nature assists in preventing sharp blood glucose surges and moderates insulin spikes.': 
        'Stabilizes blood glucose curves and prevents pancreatic insulin spikes with a slow-release, low-glycemic design.',
      'it has natural cardioprotective minerals, is low in sodium, and optimizes vascular elasticity and circulation.': 
        'Contains rich cardioprotective minerals and low sodium to optimize arterial elasticity and general circulation.',
      'it is rich in soluble fibers/healthy lipids that actively bind and help clear excessive circulating LDL cholesterol.': 
        'Actively binds and clears excess circulating LDL cholesterol using active soluble fibers and healthy lipids.',
      'its high nutrient density and low glycemic load support healthy caloric deficits while preserving lean tissues.': 
        'Maintains high nutrient density and low glycemic load to protect lean muscle tissue in a calorie deficit.',
      'its clean amino acid structure and calorie-efficient density promote lean tissue protein synthesis and energy recovery.': 
        'Accelerates clean muscle protein synthesis and energy recovery with a premium bioavailable amino acid profile.',
      'it is extremely soothing, low in gastrointestinal irritants, and highly easy to digest, preserving intestinal integrity.': 
        'Eases digestion and prevents acid reflux or gastric discomfort by protecting the delicate stomach lining.',
      'its balanced micro-mineral profile is safe for renal filtration, limiting unnecessary nitrogenous waste load.': 
        'Protects renal health and limits nitrogenous waste with a kidney-safe micro-mineral balance.',
      'it is loaded with essential bioavailable micronutrients, reinforcing antioxidant defense and physical vitality.': 
        'Strengthens cellular antioxidant defenses and boosts daily physical vitality with bioavailable micronutrients.'
    };

    for (const [key, val] of Object.entries(commonReplacements)) {
      if (cleaned.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(cleaned.toLowerCase())) {
        return val;
      }
    }

    const sentences = cleaned
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (sentences.length > 0) {
      let summary = sentences[0];
      if (sentences.length > 1 && (summary.length + sentences[1].length < 130)) {
        summary += ' ' + sentences[1];
      }
      if (!summary.endsWith('.')) {
        summary += '.';
      }
      return summary;
    }

    return cleaned;
  };

  // Helper to convert Healthy Food Combinations into 3 key benefits
  const getCombinationBenefits = (comb: { id: string; title: string; description: string }): { label: string; text: string }[] => {
    const id = comb.id;
    const desc = comb.description;

    const library: { [key: string]: { label: string; text: string }[] } = {
      'comb-breakfast': [
        { label: 'Morning Energy', text: 'Combines complete proteins and complex grains to deliver hours of stable, non-fluctuating energy.' },
        { label: 'Hormone Regulation', text: 'Suppresses breakfast-induced cortisol peaks and satisfies physical fullness cues.' },
        { label: 'Metabolic Ignite', text: 'Supports early thyroid and metabolic rate processes safely without insulin spikes.' }
      ],
      'comb-lunch': [
        { label: 'Macronutrient Split', text: 'Delivers a perfectly-proportioned mix of lean proteins, complex grains, and healthy lipids.' },
        { label: 'Glycemic Buffer', text: 'Soluble fiber from greens delays gastric emptying, eliminating post-lunch brain fog.' },
        { label: 'Cellular Fueling', text: 'Provides a rich spectrum of bioavailable amino acids for muscle and organ repair.' }
      ],
      'comb-dinner': [
        { label: 'Nocturnal Safety', text: 'Protects esophageal walls and prevents overnight acid reflux with soft, alkaline items.' },
        { label: 'Sustained Glycogen', text: 'Keeps blood sugar stable throughout the night, preventing cortisol-induced sleep disruptions.' },
        { label: 'System Recovery', text: 'Supplies concentrated trace minerals to support cellular detox and biological repair.' }
      ],
      'comb-snack': [
        { label: 'Hunger Control', text: 'Physically fills the stomach between main meals using dietary fiber and healthy plant fats.' },
        { label: 'Insulin Defense', text: 'Prevents mid-day energy dips without prompting sudden glycemic spikes or cravings.' },
        { label: 'Cortisol Cushioning', text: 'Provides crucial minerals that help buffer physiological stress responses.' }
      ],
      'comb-iron-vitc': [
        { label: '300% Absorption', text: 'Vitamin C chemically reduces non-heme iron into a highly bioavailable ferrous form.' },
        { label: 'Oxygen Capacity', text: 'Directly supports red blood cell production to combat clinical fatigue and anemia.' },
        { label: 'Cellular Synergy', text: 'Combines dynamic plant-based iron carriers with active citrus ascorbic acids.' }
      ],
      'comb-fat-vitamins': [
        { label: 'Lipid Transport', text: 'Healthy fats act as critical carriers to ferry fat-soluble vitamins (A, D, E, K) across the gut barrier.' },
        { label: 'Skeletal Integrity', text: 'Maximizes calcium absorption and binding to secure healthy bone density.' },
        { label: 'Uptake Efficiency', text: 'Guarantees fat-soluble co-factors are fully utilized by cells instead of flushed out.' }
      ],
      'comb-carb-fiber-protein': [
        { label: 'Glucose Damping', text: 'Wrapping raw starches in fibers and clean proteins smooths the post-meal glucose rise.' },
        { label: 'Extended Fullness', text: 'Significantly extends digestion transit time, signaling long-term satiety.' },
        { label: 'Pancreatic Rest', text: 'Reduces heavy work for beta-cells, preserving high insulin sensitivity.' }
      ],
      'comb-amino-synthesis': [
        { label: 'Complete Spectrum', text: 'Fuses complementary plant foods to yield a full profile of all nine essential amino acids.' },
        { label: 'Muscle Protection', text: 'Supplies high-quality building blocks to halt muscle catabolism and waste.' },
        { label: 'Vascular Longevity', text: 'Provides satisfying proteins without the heavy saturated fats of animal sources.' }
      ],
      'comb-potassium-magnesium': [
        { label: 'Osmotic Balance', text: 'Active potassium drives excess intracellular sodium out of circulation through the kidneys.' },
        { label: 'Arterial Relaxation', text: 'Magnesium relaxes vascular smooth muscles, lowering resting systemic tension.' },
        { label: 'Pressure Defence', text: 'Combined mineral action supports natural, healthy blood pressure readings.' }
      ],
      'comb-kidney-safe-flavour': [
        { label: 'Renal Relief', text: 'Protects sensitive nephrons from pressure damage by avoiding synthetic sodium seasonings.' },
        { label: 'Safe Taste', text: 'Uses fresh herbs and mild citrus to delight taste buds without overloading blood potassium levels.' },
        { label: 'Endothelial Tone', text: 'Provides natural cardiovascular co-factors that support arterial health.' }
      ],
      'comb-fiber-sterols': [
        { label: 'Cholesterol Sweep', text: 'Viscous fibers form a temporary gel that traps and excretes dietary cholesterol.' },
        { label: 'Lipid Balance', text: 'Monounsaturated olive oil acids encourage liver synthesis of protective HDL.' },
        { label: 'Artery Preservation', text: 'Lowers circulating atherogenic LDL particles to keep cardiovascular passages clear.' }
      ],
      'comb-ginger-steamed': [
        { label: 'Digestive Comfort', text: 'Active gingerols stimulate stomach motility, preventing backward flow of gastric acids.' },
        { label: 'Soothed Gut Lining', text: 'Softened steamed fibers digest gently without causing mechanical gut friction.' },
        { label: 'Anti-Bloat Action', text: 'Stops bacterial fermentation to prevent stomach distension and flatulence.' }
      ],
      'comb-density-gain': [
        { label: 'Caloric Efficiency', text: 'Delivers a clean caloric surplus using complex grains and natural lipids rather than sugar.' },
        { label: 'Gut Protection', text: 'Avoids digestive overload, allowing efficient calorie processing without bloating.' },
        { label: 'Glycogen Storage', text: 'Replenishes energy stores inside active muscle and liver tissues completely.' }
      ],
      'comb-omega3-lycopene-hh': [
        { label: '400% Bioavailability', text: 'Heating tomatoes in extra virgin olive oil unlocks high quantities of active lycopene.' },
        { label: 'Arterial Shielding', text: 'Protects vascular lining from free-radical oxidation and calcification.' },
        { label: 'Inflammation Relief', text: 'Fuses omega-3 and carotenoids to reduce systemic cellular inflammatory responses.' }
      ],
      'comb-amino-synthesis-mg': [
        { label: 'Anabolic Delivery', text: 'Triggers a slight insulin push that shuttles amino acids straight into recovering fibers.' },
        { label: 'Muscle Recovery', text: 'Supplies the perfect ratio of structural materials to rebuild and expand muscle tissue.' },
        { label: 'Glycogen Recharge', text: 'Refuels muscle glycogen levels within the critical post-workout repair window.' }
      ]
    };

    for (const [key, val] of Object.entries(library)) {
      if (id.startsWith(key) || key.startsWith(id)) {
        return val;
      }
    }

    const sentences = desc
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 5);

    const fallbackBenefits: { label: string; text: string }[] = [];
    if (sentences.length >= 3) {
      fallbackBenefits.push(
        { label: 'Synergy Boost', text: sentences[0] },
        { label: 'Active Benefit', text: sentences[1] },
        { label: 'Target Outcome', text: sentences[2] }
      );
    } else if (sentences.length === 2) {
      fallbackBenefits.push(
        { label: 'Synergy Boost', text: sentences[0] },
        { label: 'Active Benefit', text: sentences[1] },
        { label: 'Target Outcome', text: 'Promotes complete nutrient absorption and long-term metabolic health.' }
      );
    } else {
      fallbackBenefits.push(
        { label: 'Synergy Boost', text: desc },
        { label: 'Nutrient Uptake', text: 'Combines natural compounds to elevate metabolic absorption and cell efficiency.' },
        { label: 'Target Outcome', text: 'Supports vital metabolic functions and reduces oxidative tissue stress.' }
      );
    }
    return fallbackBenefits.slice(0, 3);
  };

  // Helper to parse description with optional clinical reason into short, high-scannability sentences
  const renderDescriptionText = (text: string) => {
    if (!text) return null;
    
    let mainText = text;
    let clinicalReason = '';
    
    if (text.includes('\n\n• Clinical Reason: ')) {
      [mainText, clinicalReason] = text.split('\n\n• Clinical Reason: ');
    } else if (text.includes('• Clinical Reason: ')) {
      [mainText, clinicalReason] = text.split('• Clinical Reason: ');
    }
    
    // Clear bullet/list decorations
    const cleanedText = mainText.replace(/^[•\s\-\*]+/g, '').trim();
    
    // Split sentences dynamically on punctuation
    const sentences = cleanedText
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
      
    const highlightWords = (sentence: string) => {
      const words = sentence.split(' ');
      if (words.length > 2) {
        const boldPart = words.slice(0, 2).join(' ');
        const restPart = words.slice(2).join(' ');
        return (
          <>
            <span className="font-bold text-slate-800 dark:text-slate-150">{boldPart}</span> {restPart}
          </>
        );
      }
      return sentence;
    };

    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1.5">
          {sentences.map((sentence, idx) => (
            <p key={idx} className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              {highlightWords(sentence)}
            </p>
          ))}
        </div>
        
        {clinicalReason && (
          <div className="mt-1.5 p-3 rounded-2xl bg-teal-500/5 dark:bg-teal-500/10 border border-teal-500/15 dark:border-teal-500/20 text-3xs text-teal-700 dark:text-teal-300 flex items-start gap-2 font-semibold leading-relaxed">
            <Activity className="w-4 h-4 text-teal-500 dark:text-teal-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold text-teal-600 dark:text-teal-400 uppercase tracking-widest text-4xs block mb-0.5">Clinical Rationale</span>
              {summarizeClinicalRationale(clinicalReason)}
            </div>
          </div>
        )}
      </div>
    );
  };

  const navigationSections = [
    { id: 'card-foods-to-eat', label: 'Foods to Eat', icon: Apple, color: 'text-emerald-500' },
    { id: 'card-foods-to-avoid', label: 'Foods to Avoid', icon: ShieldAlert, color: 'text-amber-500' },
    { id: 'card-food-combinations', label: 'Combinations', icon: Sparkles, color: 'text-purple-500' },
    { id: 'card-hydration', label: 'Hydration', icon: Droplet, color: 'text-blue-500' },
    { id: 'card-exercise', label: 'Exercise', icon: Dumbbell, color: 'text-orange-500' },
    { id: 'card-lifestyle', label: 'Lifestyle Tips', icon: Lightbulb, color: 'text-teal-500' },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 animate-fade-in" id="recommendations-root">
      
      {/* Navbar Header */}
      <header className="px-4 py-4 md:px-8 border-b border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950/85 backdrop-blur-md flex justify-between items-center sticky top-0 z-30" id="recs-header">
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

      {/* Sticky Quick-Navigation Category Bar (Desktop / Tablet Only) */}
      <div className="sticky top-[73px] bg-white/90 dark:bg-slate-950/90 backdrop-blur-md z-20 border-b border-slate-100 dark:border-slate-900/60 py-3 px-4 md:px-8 hidden md:block" id="recs-sticky-nav">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1">
            <span className="text-4xs font-bold text-slate-400 uppercase tracking-widest mr-3">Jump to:</span>
            {navigationSections.map((sect) => {
              const IconComp = sect.icon;
              return (
                <button
                  key={sect.id}
                  onClick={() => scrollToSection(sect.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100/80 dark:hover:bg-slate-900/60 transition-all cursor-pointer"
                >
                  <IconComp className={`w-3.5 h-3.5 ${sect.color}`} />
                  <span>{sect.label}</span>
                </button>
              );
            })}
          </div>
          <span className="text-4xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
            Real-Time Bio Sync
          </span>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 flex flex-col gap-8 text-left" id="recs-main">
        
        {/* Welcome Header Hero */}
        <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-lg shadow-emerald-600/10" id="recs-welcome">
          <div className="flex flex-col gap-2 max-w-3xl">
            <span className="bg-white/10 px-3 py-1 rounded-full text-2xs font-bold uppercase tracking-wider w-fit flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
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
          <div className="flex gap-2 w-full md:w-auto self-end md:self-center">
            <Button
              variant="secondary"
              className="bg-white/10 text-white hover:bg-white/20 border-white/15 whitespace-nowrap font-bold text-xs flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl w-full sm:w-auto"
              onClick={() => navigateTo('profile-form')}
              id="recs-edit-profile-top"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit Health Profile</span>
            </Button>
          </div>
        </div>

        {/* Master Two-Column Grid (Layout inspired by Linear & Apple Health) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="recs-grid-wrapper">
          
          {/* LEFT SIDEBAR (BMI & Clinical Indicators) */}
          <div className="lg:col-span-4 flex flex-col gap-6 sticky lg:top-[160px]" id="recs-left-sidebar">
            
            {/* Calculated BMI Meter Card */}
            <Card className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl" id="bmi-calculator-card">
              <CardContent className="p-6 flex flex-col gap-5">
                <div className="flex justify-between items-center">
                  <span className="text-2xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-extrabold flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Body Mass Index</span>
                  </span>
                  <span className={`text-3xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${getBmiBadgeStyle(recs.bmiCategory)}`}>
                    {recs.bmiCategory}
                  </span>
                </div>
                
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
                    {recs.bmiValue || '--'}
                  </span>
                  <span className="text-xs text-slate-400 font-bold font-mono">kg/m²</span>
                </div>

                {/* Highly visual horizontal progress tick bar */}
                <div className="flex flex-col gap-2 mt-1">
                  <div className="relative pt-4 pb-1">
                    {/* Floating BMI Pin Indicator */}
                    <div 
                      className="absolute top-0 flex flex-col items-center -translate-x-1/2 transition-all duration-700" 
                      style={{ left: `${getBmiPercent(recs.bmiValue)}%` }}
                    >
                      <span className="text-4xs font-bold text-emerald-600 dark:text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20">
                        {recs.bmiValue}
                      </span>
                      <div className="w-1.5 h-1.5 bg-emerald-600 dark:bg-emerald-400 rounded-full mt-1.5 animate-ping absolute" />
                      <div className="w-1.5 h-1.5 bg-emerald-600 dark:bg-emerald-400 rounded-full mt-1.5" />
                    </div>
                    
                    {/* Range Gradient Bar */}
                    <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex" id="bmi-range-bar">
                      <div className="h-full bg-blue-400/90" style={{ width: '17.5%' }} title="Underweight (< 18.5)" />
                      <div className="h-full bg-emerald-500/90" style={{ width: '32.5%' }} title="Healthy (18.5 - 24.9)" />
                      <div className="h-full bg-amber-500/90" style={{ width: '25%' }} title="Overweight (25.0 - 29.9)" />
                      <div className="h-full bg-red-500/90" style={{ width: '25%' }} title="Obese (30.0+)" />
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-4xs text-slate-400 dark:text-slate-500 font-mono font-bold uppercase tracking-wider px-1">
                    <span>Under (&lt;18.5)</span>
                    <span>Healthy (18.5)</span>
                    <span>Over (25.0)</span>
                    <span>Obese (30+)</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium pt-2 border-t border-slate-100 dark:border-slate-800/60">
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
            <Card className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl" id="clinical-summary-panel">
              <CardContent className="p-6 flex flex-col gap-5">
                <span className="text-2xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-extrabold flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Clinical Profile Summary</span>
                </span>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100/80 dark:border-slate-800/60">
                    <span className="text-4xs text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-widest mb-1">Activity Factor</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 block truncate text-xs">{profile.activityLevel}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100/80 dark:border-slate-800/60">
                    <span className="text-4xs text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-widest mb-1">Diet Preference</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 block truncate text-xs">{profile.dietaryPreference || 'Standard'}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100/80 dark:border-slate-800/60">
                    <span className="text-4xs text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-widest mb-1">Primary Goal</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 block truncate text-xs">{profile.healthGoal}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100/80 dark:border-slate-800/60">
                    <span className="text-4xs text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-widest mb-1">Allergens</span>
                    <span className={`truncate block text-xs font-extrabold ${profile.foodAllergies.includes('none') ? 'text-slate-500' : 'text-amber-600 dark:text-amber-400'}`}>
                      {profile.foodAllergies.includes('none') ? 'None' : `${profile.foodAllergies.length} Flagged`}
                    </span>
                  </div>
                </div>

                {profile.currentMedications && (
                  <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-2xs leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest text-4xs mr-1 block mb-0.5">Active Prescriptions:</span>
                    {profile.currentMedications}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="hidden lg:flex items-center gap-2 p-4 bg-slate-100/50 dark:bg-slate-900/30 rounded-2xl border border-slate-200/40 dark:border-slate-800/50">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span className="text-4xs font-bold text-slate-400 uppercase tracking-wider">
                Clinical data isolated to active session.
              </span>
            </div>
          </div>

          {/* RIGHT CONTAINER (Recommendation Details) */}
          <div className="lg:col-span-8 flex flex-col gap-8" id="recs-right-content">
            
            {/* SECTION 1: FOODS TO EAT */}
            <Card className="border border-slate-100 dark:border-slate-800/80 shadow-xs rounded-3xl overflow-hidden" id="card-foods-to-eat">
              <CardHeader className="border-b border-slate-50 dark:border-slate-850/50 bg-emerald-50/15 dark:bg-emerald-950/10 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                    <Apple className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">Foods to Eat</CardTitle>
                    <CardDescription className="text-xs mt-0.5">Target ingredients optimized for your metabolic rate and wellness goals.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {recs.foodsToEat.length === 0 ? (
                  <EmptyState
                    title="No Food Recommendations Calculated"
                    description="Our biometric matching engine couldn't find matches. Please verify that your dietary choices and preferences are correctly set in your health profile."
                    id="recs-eat-empty-state"
                  />
                ) : recs.foodsToEat.some(f => f.category) ? (
                  <div className="flex flex-col gap-8" id="eat-items-list-grouped">
                    {(['Breakfast', 'Lunch', 'Dinner', 'Healthy Snacks', 'Drinks'] as const).map((category) => {
                      const categoryFoods = recs.foodsToEat.filter((f) => f.category === category);
                      if (categoryFoods.length === 0) return null;
                      
                      const getCategoryIcon = (cat: string) => {
                        switch (cat) {
                          case 'Breakfast':
                            return <Coffee className="w-4 h-4 text-amber-500" />;
                          case 'Lunch':
                            return <Utensils className="w-4 h-4 text-emerald-500" />;
                          case 'Dinner':
                            return <Flame className="w-4 h-4 text-orange-500" />;
                          case 'Healthy Snacks':
                            return <Apple className="w-4 h-4 text-rose-500" />;
                          case 'Drinks':
                            return <CupSoda className="w-4 h-4 text-blue-500" />;
                          default:
                            return <CheckCircle2 className="w-4 h-4 text-slate-400" />;
                        }
                      };

                      const primaryFood = categoryFoods[0];
                      const alternativeFood = categoryFoods[1];

                      return (
                        <div key={category} className="flex flex-col gap-4" id={`category-block-${category.toLowerCase().replace(' ', '-')}`}>
                          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800/80 pb-2">
                            <div className="p-1.5 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100/60 dark:border-slate-800/40">
                              {getCategoryIcon(category)}
                            </div>
                            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                              {category === 'Healthy Snacks' ? 'Snacks' : category}
                            </h3>
                            {categoryFoods.length > 2 && (
                              <span className="text-4xs px-2 py-0.5 font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-mono ml-auto">
                                2 of {categoryFoods.length} shown
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Primary Choice */}
                            {primaryFood && (
                              <div 
                                className="p-5 bg-white dark:bg-slate-900/60 border border-slate-150 dark:border-slate-800 rounded-2xl flex flex-col gap-3 shadow-xs hover:border-emerald-500/30 transition-all duration-300 group relative overflow-hidden"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-2xs uppercase tracking-wider">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    <span>Primary Choice</span>
                                  </div>
                                  {primaryFood.badge && (
                                    <span className="text-4xs px-2 py-0.5 font-bold uppercase tracking-widest rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono">
                                      {primaryFood.badge}
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                                  {primaryFood.title}
                                </h4>
                                <div className="text-xs leading-relaxed font-medium">
                                  {renderDescriptionText(primaryFood.description)}
                                </div>
                              </div>
                            )}

                            {/* Optional Alternative */}
                            {alternativeFood && (
                              <div 
                                className="p-5 bg-slate-50/20 dark:bg-slate-950/20 border border-dashed border-slate-200 dark:border-slate-800/80 rounded-2xl flex flex-col gap-3 hover:border-emerald-500/20 hover:bg-white dark:hover:bg-slate-900/40 transition-all duration-300 group"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-bold text-2xs uppercase tracking-wider font-mono">
                                    <CornerDownRight className="w-4 h-4 text-slate-400" />
                                    <span>Optional Alternative</span>
                                  </div>
                                  {alternativeFood.badge && (
                                    <span className="text-4xs px-2 py-0.5 font-bold uppercase tracking-widest rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono">
                                      {alternativeFood.badge}
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight">
                                  {alternativeFood.title}
                                </h4>
                                <div className="text-xs leading-relaxed font-medium">
                                  {renderDescriptionText(alternativeFood.description)}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Uncategorized Fallback */}
                    {recs.foodsToEat.filter((f) => !f.category).length > 0 && (
                      <div className="flex flex-col gap-4" id="category-block-uncategorized">
                        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2">
                          <CheckCircle2 className="w-4 h-4 text-slate-400" />
                          <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Other Suggestions</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {recs.foodsToEat.filter((f) => !f.category).slice(0, 2).map((food, fidx) => (
                            <div 
                              key={food.id} 
                              className={`p-5 rounded-2xl flex flex-col gap-3 transition-all duration-300 group ${
                                fidx === 0 
                                  ? 'bg-white dark:bg-slate-900/60 border border-slate-150 dark:border-slate-800 hover:border-emerald-500/30' 
                                  : 'bg-slate-50/20 dark:bg-slate-950/20 border border-dashed border-slate-200 dark:border-slate-800/80 hover:border-emerald-500/20 hover:bg-white dark:hover:bg-slate-900/40'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-bold text-2xs uppercase tracking-wider">
                                  {fidx === 0 ? (
                                    <>
                                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                      <span>Primary Suggestion</span>
                                    </>
                                  ) : (
                                    <>
                                      <CornerDownRight className="w-4 h-4 text-slate-400" />
                                      <span>Alternative Suggestion</span>
                                    </>
                                  )}
                                </div>
                                {food.badge && (
                                  <span className="text-4xs px-2 py-0.5 font-bold uppercase tracking-widest rounded-full bg-slate-100 dark:bg-slate-800 text-slate-550 dark:text-slate-450 font-mono">
                                    {food.badge}
                                  </span>
                                )}
                              </div>
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{food.title}</h4>
                              <div className="text-xs leading-relaxed font-medium">
                                {renderDescriptionText(food.description)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="eat-items-list">
                    {recs.foodsToEat.slice(0, 2).map((food, fidx) => (
                      <div 
                        key={food.id} 
                        className={`p-5 rounded-2xl flex flex-col gap-3 transition-all duration-300 group ${
                          fidx === 0 
                            ? 'bg-white dark:bg-slate-900/60 border border-slate-150 dark:border-slate-800 hover:border-emerald-500/30 shadow-xs' 
                            : 'bg-slate-50/20 dark:bg-slate-950/20 border border-dashed border-slate-200 dark:border-slate-800/80 hover:border-emerald-500/20 hover:bg-white dark:hover:bg-slate-900/40'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-bold text-2xs uppercase tracking-wider">
                            {fidx === 0 ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <span>Primary Suggestion</span>
                              </>
                            ) : (
                              <>
                                <CornerDownRight className="w-4 h-4 text-slate-400" />
                                <span>Alternative Suggestion</span>
                              </>
                            )}
                          </div>
                          {food.badge && (
                            <span className="text-4xs px-2 py-0.5 font-bold uppercase tracking-widest rounded-full bg-slate-100 dark:bg-slate-800 text-slate-550 dark:text-slate-450 font-mono">
                              {food.badge}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{food.title}</h4>
                        <div className="text-xs leading-relaxed font-medium">
                          {renderDescriptionText(food.description)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SECTION 2: FOODS TO AVOID */}
            <Card className="border border-slate-100 dark:border-slate-800/80 shadow-xs rounded-3xl overflow-hidden" id="card-foods-to-avoid">
              <CardHeader className="border-b border-slate-50 dark:border-slate-850/50 bg-amber-50/15 dark:bg-amber-950/10 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-2xl">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">Foods to Avoid</CardTitle>
                    <CardDescription className="text-xs mt-0.5">Potentially inflammatory, high-glycemic, or reactive items to exclude.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {recs.foodsToAvoid.length === 0 ? (
                  <EmptyState
                    title="No Avoidance Filters Triggered"
                    description="Based on your profile, no specific food categories or items are currently flagged as inflammatory or reactive."
                    id="recs-avoid-empty-state"
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="avoid-items-list">
                    {recs.foodsToAvoid.map((food) => (
                      <div 
                        key={food.id} 
                        className="p-4 bg-slate-50/40 dark:bg-slate-900/40 border border-slate-100/80 dark:border-slate-850 rounded-2xl flex items-start gap-3 hover:border-amber-500/25 hover:bg-white dark:hover:bg-slate-900/60 transition-all duration-300 group"
                      >
                        <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                        <div className="flex flex-col gap-1.5 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{food.title}</h4>
                            {food.badge && (
                              <span className="text-4xs px-2 py-0.5 font-bold uppercase tracking-widest rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono">
                                {food.badge}
                              </span>
                            )}
                          </div>
                          {renderDescriptionText(food.description)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SECTION 3: HEALTHY FOOD COMBINATIONS */}
            <Card className="border border-slate-100 dark:border-slate-800/80 shadow-xs rounded-3xl overflow-hidden" id="card-food-combinations">
              <CardHeader className="border-b border-slate-50 dark:border-slate-850/50 bg-purple-50/15 dark:bg-purple-950/10 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-2xl">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">Healthy Food Combinations</CardTitle>
                    <CardDescription className="text-xs mt-0.5">Synergistic nutrition pairings designed to elevate bioavailability and suppress glycemic curves.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {recs.healthyCombinations.length === 0 ? (
                  <EmptyState
                    title="No Combinations Generated"
                    description="Our metabolic synergy analyzer is compiling healthy pairings for your biological markers."
                    id="recs-combinations-empty-state"
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="combinations-items-list">
                    {recs.healthyCombinations.map((comb) => (
                      <div 
                        key={comb.id} 
                        className="p-5 bg-white dark:bg-slate-900/40 border border-slate-150 dark:border-slate-800/80 rounded-2xl flex flex-col gap-3.5 hover:border-purple-500/25 dark:hover:border-purple-500/30 transition-all duration-300 group"
                      >
                        <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/60 pb-2.5">
                          <div className="flex items-center gap-2">
                            <Heart className="w-4 h-4 text-purple-500 dark:text-purple-400 flex-shrink-0 group-hover:scale-115 transition-transform duration-300" />
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{comb.title}</h4>
                          </div>
                          {comb.badge && (
                            <span className="text-4xs px-2 py-0.5 font-bold uppercase tracking-widest rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-mono flex-shrink-0">
                              {comb.badge}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col gap-3">
                          {getCombinationBenefits(comb).map((benefit, bidx) => (
                            <div key={bidx} className="flex items-start gap-2.5 text-2xs leading-relaxed text-slate-550 dark:text-slate-400 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 dark:bg-purple-400 mt-1.5 flex-shrink-0" />
                              <div>
                                <strong className="font-extrabold text-slate-850 dark:text-slate-200">{benefit.label}</strong>
                                <span className="text-slate-400 dark:text-slate-500 mx-1">•</span>
                                <span>{benefit.text}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SECTION 4: DAILY WATER INTAKE & HYDRATION */}
            <Card className="border border-slate-100 dark:border-slate-800/80 shadow-xs rounded-3xl overflow-hidden" id="card-hydration">
              <CardHeader className="border-b border-slate-50 dark:border-slate-850/50 bg-blue-50/15 dark:bg-blue-950/10 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-2xl">
                    <Droplet className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">Daily Water Intake</CardTitle>
                    <CardDescription className="text-xs mt-0.5">Calculated hydration thresholds adjusted for body mass and routine fluid excretion.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 flex flex-col gap-6">
                
                {/* Premium Stat banner */}
                <div className="flex flex-col md:flex-row items-stretch justify-between gap-6 p-5 bg-gradient-to-br from-blue-500/5 to-indigo-500/10 dark:from-blue-950/15 dark:to-indigo-950/10 border border-blue-100/40 dark:border-blue-900/25 rounded-2xl" id="water-stat-banner">
                  <div className="flex flex-col gap-1 max-w-lg justify-center">
                    <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300">Hydration Baseline Overview</h4>
                    <p className="text-xs text-blue-700/85 dark:text-blue-400/85 leading-relaxed font-medium">
                      {recs.waterIntake.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl border border-blue-200/50 dark:border-blue-900/40 shadow-xs justify-center md:self-center">
                    <div className="text-center">
                      <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">{recs.waterIntake.liters}</span>
                      <span className="text-4xs font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-widest mt-0.5">Liters / Day</span>
                    </div>
                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
                    <div className="text-center">
                      <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">{recs.waterIntake.cups}</span>
                      <span className="text-4xs font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-widest mt-0.5">Cups / Day</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Therapeutic Hydration Tips</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="water-tips-list">
                    {recs.waterIntake.tips.map((tip, idx) => (
                      <div key={idx} className="p-4 bg-slate-50/40 dark:bg-slate-900/40 border border-slate-100/80 dark:border-slate-850 rounded-2xl flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-mono font-bold text-2xs flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed font-medium">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SECTION 5: EXERCISE RECOMMENDATIONS */}
            <Card className="border border-slate-100 dark:border-slate-800/80 shadow-xs rounded-3xl overflow-hidden" id="card-exercise">
              <CardHeader className="border-b border-slate-50 dark:border-slate-850/50 bg-orange-50/15 dark:bg-orange-950/10 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 rounded-2xl">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">Exercise Plan</CardTitle>
                    <CardDescription className="text-xs mt-0.5">Skeletal motion and cardiac base training custom-tailored to your clinical fitness level.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 flex flex-col gap-6">
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl border border-slate-100/80 dark:border-slate-850">
                    <span className="text-4xs text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-widest mb-1">Strategy Type</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">{recs.exercise.type}</span>
                  </div>
                  <div className="p-3 bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl border border-slate-100/80 dark:border-slate-850">
                    <span className="text-4xs text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-widest mb-1">Weekly Freq</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">{recs.exercise.frequency}</span>
                  </div>
                  <div className="p-3 bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl border border-slate-100/80 dark:border-slate-850">
                    <span className="text-4xs text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-widest mb-1">Session Limit</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">{recs.exercise.duration}</span>
                  </div>
                  <div className="p-3 bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl border border-slate-100/80 dark:border-slate-850">
                    <span className="text-4xs text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-widest mb-1">Target Intensity</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">{recs.exercise.intensity}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Suggested Micro-Routine</h4>
                  <div className="flex flex-col gap-4.5" id="exercise-routines-list">
                    {recs.exercise.routine.length === 0 ? (
                      <EmptyState
                        title="No Micro-Routines Recommended"
                        description="Based on your cardiovascular baseline and region requirements, no dedicated active routines are currently active."
                        id="recs-exercise-empty-state"
                      />
                    ) : (
                      recs.exercise.routine.map((item, idx) => {
                        try {
                          const parsed = JSON.parse(item);
                          return (
                            <div key={idx} className="p-5 bg-slate-50/40 dark:bg-slate-900/40 border border-slate-100/80 dark:border-slate-850 rounded-2xl flex flex-col gap-4 hover:border-orange-500/20 hover:bg-white dark:hover:bg-slate-900/50 transition-all duration-300">
                              <div className="flex justify-between items-start gap-4">
                                <div className="flex items-start gap-3">
                                  <div className="p-1.5 bg-orange-500/10 dark:bg-orange-950/55 rounded-xl border border-orange-500/20 flex-shrink-0 mt-0.5">
                                    <CornerDownRight className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{parsed.name}</h4>
                                    <div className="p-2.5 rounded-xl bg-orange-500/5 border border-orange-500/10 text-2xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-2">
                                      <span className="font-extrabold text-orange-600 dark:text-orange-400 uppercase tracking-widest text-4xs block mb-0.5">Safety Precaution</span>
                                      {parsed.safetyNotes}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end flex-shrink-0 text-right">
                                  <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                                    ~{parsed.caloriesBurned} kcal
                                  </span>
                                  <span className="text-4xs font-bold text-slate-400 uppercase tracking-widest mt-1">Est. Burn</span>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-3 pt-3.5 border-t border-slate-100 dark:border-slate-800/60 text-2xs font-semibold">
                                <div className="bg-white dark:bg-slate-950/65 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800/80">
                                  <span className="text-slate-400 block mb-0.5 text-3xs uppercase font-mono tracking-wider">Duration</span>
                                  <span className="text-slate-800 dark:text-slate-200 block truncate font-bold">{parsed.duration}</span>
                                </div>
                                <div className="bg-white dark:bg-slate-950/65 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800/80">
                                  <span className="text-slate-400 block mb-0.5 text-3xs uppercase font-mono tracking-wider">Frequency</span>
                                  <span className="text-slate-800 dark:text-slate-200 block truncate font-bold">{parsed.frequency}</span>
                                </div>
                                <div className="bg-white dark:bg-slate-950/65 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800/80">
                                  <span className="text-slate-400 block mb-0.5 text-3xs uppercase font-mono tracking-wider">Intensity</span>
                                  <span className="text-slate-800 dark:text-slate-200 block truncate font-bold">{parsed.intensity}</span>
                                </div>
                              </div>
                            </div>
                          );
                        } catch (e) {
                          return (
                            <div key={idx} className="p-4 bg-slate-50/40 dark:bg-slate-900/40 border border-slate-100/80 dark:border-slate-850 rounded-2xl flex gap-3 items-start text-left">
                              <CornerDownRight className="w-4 h-4 text-orange-500 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-bold">{item}</p>
                            </div>
                          );
                        }
                      })
                    )}
                  </div>
                </div>

                {recs.exercise.precautions.length > 0 && (
                  <div className="p-4.5 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex flex-col gap-2.5">
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Clinical Movement Precautions</span>
                    </span>
                    <ul className="list-disc pl-5 text-xs text-slate-550 dark:text-slate-400 flex flex-col gap-2 leading-relaxed font-medium">
                      {recs.exercise.precautions.map((pre, idx) => (
                        <li key={idx}>{pre}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SECTION 6: LIFESTYLE TIPS */}
            <Card className="border border-slate-100 dark:border-slate-800/80 shadow-xs rounded-3xl overflow-hidden" id="card-lifestyle">
              <CardHeader className="border-b border-slate-50 dark:border-slate-850/50 bg-teal-50/15 dark:bg-teal-950/10 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 rounded-2xl">
                    <Lightbulb className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">Lifestyle Adaptations</CardTitle>
                    <CardDescription className="text-xs mt-0.5">Circadian and habit adaptations to assist biological markers and hormone regulation.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {recs.lifestyleTips.length === 0 ? (
                  <EmptyState
                    title="No Lifestyle Adaptations Triggered"
                    description="No special circadian adjustments or lifestyle tips are suggested at this moment. Maintain standard wellness cycles."
                    id="recs-lifestyle-empty-state"
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="lifestyle-items-list">
                    {recs.lifestyleTips.map((tip) => (
                      <div 
                        key={tip.id} 
                        className="p-4 bg-slate-50/40 dark:bg-slate-900/40 border border-slate-100/80 dark:border-slate-850 rounded-2xl flex items-start gap-3 hover:border-teal-500/25 hover:bg-white dark:hover:bg-slate-900/60 transition-all duration-300 group"
                      >
                        <ShieldCheck className="w-5 h-5 text-teal-500 dark:text-teal-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                        <div className="flex flex-col gap-1.5 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{tip.title}</h4>
                            {tip.badge && (
                              <span className="text-4xs px-2 py-0.5 font-bold uppercase tracking-widest rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-mono">
                                {tip.badge}
                              </span>
                            )}
                          </div>
                          {renderDescriptionText(tip.description)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Clinical / Educational Disclaimer Box */}
            <div className="p-5 rounded-3xl bg-amber-500/5 dark:bg-amber-950/10 border border-amber-500/15 dark:border-amber-900/20 flex gap-3.5 items-start" id="recs-clinical-disclaimer">
              <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-2xs sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                <strong>Clinical Disclaimer:</strong> Based on the information you provided, these recommendations are for educational purposes only and are not medical advice. Always consult a qualified healthcare professional before making health-related decisions.
              </p>
            </div>

            {/* Bottom Page Navigation Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end items-center gap-3.5 border-t border-slate-150 dark:border-slate-900/60 pt-6 mt-2" id="recs-bottom-actions">
              <Button
                variant="outline"
                size="md"
                onClick={() => navigateTo('profile-summary')}
                id="recs-view-summary-btn"
                className="w-full sm:w-auto font-bold text-xs px-5 py-2.5 rounded-2xl"
              >
                Review Profile Summary
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => navigateTo('profile-form')}
                id="recs-edit-profile-btn"
                className="w-full sm:w-auto font-bold text-xs px-5 py-2.5 rounded-2xl"
              >
                Edit Health Profile
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => navigateTo('dashboard')}
                id="recs-return-dashboard-btn"
                className="w-full sm:w-auto font-bold text-xs px-5 py-2.5 rounded-2xl"
              >
                Return to Dashboard
              </Button>
            </div>

          </div>
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
