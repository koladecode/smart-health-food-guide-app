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
  CupSoda,
  ChevronDown
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

  // State to manage collapsible progressive disclosure ("Learn more") per card
  const [expandedCards, setExpandedCards] = React.useState<Record<string, boolean>>({});
  const toggleCard = (id: string) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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
        { label: 'Morning Energy', text: 'Combines proteins and whole grains to deliver steady energy all morning without crashes.' },
        { label: 'Appetite Control', text: 'Helps keep you comfortably full and prevents mid-morning cravings.' },
        { label: 'Morning Alertness', text: 'Provides essential nutrients to help you start the day feeling focused and active.' }
      ],
      'comb-lunch': [
        { label: 'Balanced Energy', text: 'Combines lean protein, whole grains, and healthy fats to keep your energy steady for the afternoon.' },
        { label: 'No Afternoon Crash', text: 'Fiber from greens and vegetables slows down digestion so you stay sharp and avoid post-lunch sluggishness.' },
        { label: 'Daily Nourishment', text: 'Supplies high-quality protein to keep your muscles and body functioning at their best.' }
      ],
      'comb-dinner': [
        { label: 'Nighttime Comfort', text: 'Protects against acid reflux with gentle, soothing ingredients that are easy on the stomach.' },
        { label: 'Steady Night Energy', text: 'Keeps blood sugar stable through the night for deeper, uninterrupted sleep.' },
        { label: 'Overnight Repair', text: 'Supplies gentle minerals and nutrients to support your body while you sleep.' }
      ],
      'comb-snack': [
        { label: 'Hunger Control', text: 'Curbs hunger between main meals with natural fiber and healthy plant fats.' },
        { label: 'Steady Blood Sugar', text: 'Prevents mid-day energy dips without causing sudden sugar spikes.' },
        { label: 'Quick Refresh', text: 'Provides light hydration and essential minerals to keep you refreshed and focused.' }
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

  // Helper to extract clean, grounded data for Foods to Avoid cards
  const getAvoidCardData = (food: { id: string; title: string; description: string; badge?: string }) => {
    const text = `${food.title} ${food.description}`.toLowerCase();
    let category = 'Dietary Caution';
    let statusLabel = food.badge || 'Limit Intake';
    let statusStyle = 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20';
    let shortReason = '';
    let examples: string[] = [];
    let tip = '';

    if (text.includes('trans-fat') || text.includes('trans-fats') || text.includes('hydrogenated') || text.includes('margarine') || text.includes('shortening')) {
      category = 'Fats & Oils';
      statusLabel = 'Avoid Trans-Fats';
      statusStyle = 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20';
      shortReason = 'Partially hydrogenated oils may adversely shift LDL and HDL cholesterol ratios, impacting arterial elasticity.';
      examples = ['Commercial pastries and pies', 'Products with partially hydrogenated oils', 'Hard stick margarine', 'Packaged fried snacks'];
      tip = 'Swap for cold-pressed extra virgin olive oil, avocado oil, or unroasted seed oils.';
    } else if (text.includes('cured') || text.includes('salami') || text.includes('sausage') || text.includes('bacon') || text.includes('high-sodium') || text.includes('sodium') || text.includes('salt')) {
      category = 'Sodium & Cured Meats';
      statusLabel = food.badge || 'Portion Control';
      statusStyle = 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20';
      shortReason = 'High sodium concentration can increase fluid retention and elevate vascular tension, especially in salt-sensitive individuals.';
      examples = ['Sausages, salami, and bacon', 'Certain canned soups and packaged foods', 'Commercial bouillon cubes', 'Processed deli meats'];
      tip = 'Flavor dishes with fresh garlic, onion, cracked pepper, oregano, or lemon zest rather than added table salt.';
    } else if (text.includes('refined sugar') || text.includes('high-fructose') || text.includes('corn syrup') || text.includes('sweets') || text.includes('candy')) {
      category = 'Added Sugars';
      statusLabel = 'Limit Intake';
      statusStyle = 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20';
      shortReason = 'Simple sugars digest rapidly, causing blood glucose peaks and placing extra metabolic workload on liver tissue.';
      examples = ['Sweetened sodas & bottled iced teas', 'Commercial pastries & confectionery', 'Dessert syrups', 'Sugary breakfast cereals'];
      tip = 'Satisfy sweet cravings with fresh berries, whole fruit, or cinnamon-spiced tea.';
    } else if (text.includes('liquid calorie') || text.includes('soda') || text.includes('energy drink') || text.includes('fruit juice')) {
      category = 'Beverages';
      statusLabel = 'Limit Simple Sugars';
      statusStyle = 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20';
      shortReason = 'Liquid sugars absorb quickly without activating normal physical satiety cues, easily creating caloric excess.';
      examples = ['Regular sodas and colas', 'Commercial energy drinks', 'Packaged fruit juices from concentrate'];
      tip = 'Opt for cold filtered water with cucumber slices, mint leaves, or chilled herbal infusions.';
    } else if (text.includes('white bread') || text.includes('refined grain') || text.includes('white rice') || text.includes('processed pasta') || text.includes('cereal')) {
      category = 'Refined Grains';
      statusLabel = 'Substitute Grains';
      statusStyle = 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20';
      shortReason = 'Grains stripped of germ and bran fiber convert quickly into glucose, prompting insulin spikes and subsequent fatigue.';
      examples = ['White sandwich bread', 'Refined flour pasta', 'Low-fiber breakfast cereals', 'Instant white rice'];
      tip = 'Choose sprouted grain breads, rolled or steel-cut oats, quinoa, or lentil-based pastas.';
    } else if (text.includes('fast food') || text.includes('ultra-processed') || text.includes('junk')) {
      category = 'Ultra-Processed';
      statusLabel = 'Moderate Intake';
      statusStyle = 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20';
      shortReason = 'Commercial fried convenience meals are typically dense in oxidized industrial oils and refined starches with minimal micronutrient density.';
      examples = ['Deep-fried fast-food items', 'Commercial burger patties & nuggets', 'Pre-packaged frozen snacks'];
      tip = 'Prepare homemade oven-baked or air-crisped whole ingredients for balanced flavor and nutrients.';
    } else if (text.includes('alcohol')) {
      category = 'Lifestyle';
      statusLabel = 'Moderate Intake';
      statusStyle = 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20';
      shortReason = 'Can fragment restorative sleep architecture, slow muscle protein synthesis, and tax hepatic metabolic capacity.';
      examples = ['High-proof distilled spirits', 'Sugary mixed cocktails', 'Frequent daily beers'];
      tip = 'Alternate each drink with water and complete alcohol intake at least 4 hours prior to sleep.';
    } else if (text.includes('spinach') || text.includes('oxalate') || text.includes('beet greens')) {
      category = 'Renal Filtration';
      statusLabel = 'Kidney Precaution';
      statusStyle = 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20';
      shortReason = 'High oxalate density places additional filtration demands on compromised kidneys, potentially contributing to stones.';
      examples = ['Raw spinach smoothies', 'Uncooked beet greens', 'Heavy swiss chard salads'];
      tip = 'Lightly boil greens to reduce oxalate concentration, or choose low-oxalate alternatives like arugula and kale.';
    } else if (text.includes('potassium') || text.includes('lite salt')) {
      category = 'Electrolytes';
      statusLabel = 'Clinical Caution';
      statusStyle = 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20';
      shortReason = 'Weakened kidneys struggle to clear synthetic potassium chloride, elevating hyperkalemia risks.';
      examples = ['Potassium chloride salt substitutes', 'Lite salt blends', 'Sodium-free seasoning salts'];
      tip = 'Season meals with aromatic herbs, garlic, black pepper, and fresh lemon instead of potassium salts.';
    } else if (text.includes('spicy') || text.includes('garlic') || text.includes('coffee') || text.includes('reflux')) {
      category = 'Digestive Comfort';
      statusLabel = 'Reflux Trigger';
      statusStyle = 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20';
      shortReason = 'May relax the lower esophageal sphincter or irritate gastric mucosa in sensitive or reflux-prone individuals.';
      examples = ['Hot chili pepper sauces', 'Raw minced garlic', 'Excess dark-roast coffee on an empty stomach'];
      tip = 'Sip soothing ginger or chamomile tea, and maintain a 3-hour window between eating and lying down.';
    } else if (text.includes('carbonated') || text.includes('sorbitol') || text.includes('sweetener')) {
      category = 'Digestive Comfort';
      statusLabel = 'Digestive Care';
      statusStyle = 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20';
      shortReason = 'Artificial polyols and carbonation can draw water into the bowel and ferment, prompting intestinal distension and gas.';
      examples = ['Sugar-free gums with polyols', 'Diet beverages with sorbitol or maltitol', 'Heavily carbonated drinks'];
      tip = 'Drink filtered room-temperature water with fresh citrus or cucumber slices for gentle hydration.';
    } else if (text.includes('allergy') || text.includes('allergen') || text.includes('anaphylaxis') || text.includes('intolerance')) {
      category = 'Allergen';
      statusLabel = 'Strict Exclusion';
      statusStyle = 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20';
      shortReason = 'Flagged as an allergen or intolerance in your health profile. Requires consistent exclusion to avoid adverse physiological reactions.';
      if (text.includes('peanut')) examples = ['Peanut butter', 'Roasted peanuts', 'Peanut oil & satay sauces'];
      else if (text.includes('gluten')) examples = ['Wheat bread & rolls', 'Barley soups', 'Standard wheat pasta', 'Rye crackers'];
      else if (text.includes('dairy')) examples = ['Cow milk & heavy cream', 'Aged cheeses', 'Whey protein', 'Butter & dairy yogurt'];
      else if (text.includes('soy')) examples = ['Soy sauce & edamame', 'Tofu & tempeh', 'Processed foods containing soy lecithin'];
      else if (text.includes('shellfish')) examples = ['Shrimp & prawns', 'Crab & lobster', 'Oysters, clams, and mussels'];
      else if (text.includes('tree nut') || text.includes('walnut') || text.includes('almond')) examples = ['Walnuts, almonds, cashews', 'Hazelnut spreads', 'Mixed tree nut butters'];
      else if (text.includes('egg')) examples = ['Whole eggs & egg whites', 'Mayonnaise', 'Baked goods brushed with egg wash'];
      else examples = ['Processed goods containing allergen derivatives', 'Cross-contact restaurant items'];
      tip = 'Always review packaged food allergen statements for cross-contact advisories.';
    } else {
      category = 'Nutrition Strategy';
      shortReason = food.description.split(/(?<=[.!?])\s+/)[0] || 'Recommended to limit based on your physiological baseline and health goals.';
      examples = ['Processed packaged variations', 'High-heat commercial preparations'];
      tip = 'Focus on whole, minimally processed ingredients tailored to your nutritional targets.';
    }

    let clinicalNote = food.description;
    if (food.description.includes('• Clinical Reason: ')) {
      clinicalNote = food.description.split('• Clinical Reason: ')[1] || food.description;
    }

    return {
      title: food.title,
      category,
      statusLabel,
      statusStyle,
      shortReason,
      examples,
      tip,
      clinicalNote
    };
  };

  // Helper to extract clean, grounded data for Foods to Eat cards
  const getEatCardData = (food: { id: string; title: string; description: string; badge?: string; category?: string }) => {
    let cleanDesc = food.description;
    let clinicalReason = '';
    if (food.description.includes('• Clinical Reason: ')) {
      [cleanDesc, clinicalReason] = food.description.split('• Clinical Reason: ');
    }
    
    const sentences = cleanDesc.replace(/^[•\s\-\*]+/g, '').split(/(?<=[.!?])\s+/).filter(Boolean);
    const shortReason = sentences[0] || cleanDesc;

    const text = `${food.title} ${food.description}`.toLowerCase();
    let examples: string[] = [];
    let tip = '';

    if (text.includes('salmon') || text.includes('mackerel') || text.includes('sardine')) {
      examples = ['Wild salmon fillets', 'Fresh mackerel', 'Sardines in olive oil'];
      tip = 'Bake or grill lightly with herbs and lemon to preserve delicate Omega-3 fatty acids.';
    } else if (text.includes('chicken') || text.includes('poultry')) {
      examples = ['Skinless chicken breast', 'Ground turkey breast', 'Tenderloin cuts'];
      tip = 'Season with antioxidant-rich turmeric, paprika, and garlic for lean, clean protein.';
    } else if (text.includes('moin moin') || text.includes('koko')) {
      examples = ['Steamed honey-bean pudding', 'Red bell pepper sauce', 'Fermented millet porridge'];
      tip = 'Pair with fresh ginger and cloves to enhance gastrointestinal motility and flavor.';
    } else if (text.includes('ofada') || text.includes('efo riro')) {
      examples = ['Unpolished Ofada brown rice', 'Steamed local spinach (Efo)', 'Fluted pumpkin leaves (Ugu)'];
      tip = 'Prepare spinach stew with moderate unrefined oil to maximize fat-soluble vitamin uptake.';
    } else if (text.includes('tom brown') || text.includes('porridge')) {
      examples = ['Roasted guinea corn', 'Yellow millet flakes', 'Soybean porridge', 'Crushed almonds'];
      tip = 'Top with ground seeds or nuts to add essential minerals and slow down gastric transit.';
    } else if (text.includes('akara') || text.includes('pap')) {
      examples = ['Oven-baked honey-bean cakes', 'Naturally sweetened corn custard', 'Date fruit powder'];
      tip = 'Bake instead of deep-frying to preserve heart health while retaining satisfying crispness.';
    } else if (text.includes('garden egg') || text.includes('egg white')) {
      examples = ['Steamed green garden eggs', 'Herb-scrambled egg whites', 'Sautéed pumpkin leaves'];
      tip = 'A nutrient-dense, low-glycemic breakfast that supports steady morning energy.';
    } else if (text.includes('oat swallow') || text.includes('ewedu')) {
      examples = ['Whole-grain oat swallow', 'Slippery jute leaf (Ewedu) soup', 'Stewed freshwater tilapia'];
      tip = 'The soluble fiber in oat swallow and Ewedu helps buffer post-meal glucose absorption.';
    } else if (text.includes('cruciferous') || text.includes('broccoli') || text.includes('cauliflower')) {
      examples = ['Broccoli florets', 'Steamed cauliflower', 'Brussels sprouts', 'Cabbage'];
      tip = 'Steam lightly for 3-5 minutes to keep glucosinolates and active enzymes intact.';
    } else if (text.includes('chia') || text.includes('flax')) {
      examples = ['Whole chia seeds', 'Freshly ground flaxseed', 'Hemp hearts'];
      tip = 'Add ground flaxseed to warm porridge or smoothies for optimal lignan absorption.';
    } else if (text.includes('oat') || text.includes('steel-cut')) {
      examples = ['Steel-cut oats', 'Rolled oats', 'Oat bran flakes'];
      tip = 'Soak overnight with a pinch of cinnamon for gentle digestion and rich soluble beta-glucans.';
    } else if (text.includes('avocado') || text.includes('olive oil')) {
      examples = ['Hass avocados', 'Cold-pressed extra virgin olive oil', 'Green olives'];
      tip = 'Drizzle cold-pressed olive oil over finished warm dishes to protect its delicate polyphenols.';
    } else if (text.includes('tempeh') || text.includes('tofu')) {
      examples = ['Steamed organic tempeh', 'Firm sprouted tofu', 'Edamame pods'];
      tip = 'Marinate with low-sodium tamari and grated ginger before pan-searing lightly.';
    } else if (text.includes('egg') || text.includes('pasture-raised')) {
      examples = ['Pasture-raised whole eggs', 'Poached eggs', 'Vegetable egg frittata'];
      tip = 'Keep yolks runny (soft-boiled or poached) to protect heat-sensitive choline and lutein.';
    } else if (text.includes('yogurt') || text.includes('kefir')) {
      examples = ['Unsweetened Greek yogurt', 'Plain goat kefir', 'Probiotic cultured yogurt'];
      tip = 'Enjoy plain and add fresh blueberries or cinnamon for flavor without added syrups.';
    } else if (text.includes('blueberr') || text.includes('blackberr') || text.includes('berr')) {
      examples = ['Wild blueberries', 'Fresh blackberries', 'Organic raspberries'];
      tip = 'Combine with a source of healthy fat or protein to slow sugar absorption and boost uptake.';
    } else if (text.includes('greens') || text.includes('kale') || text.includes('arugula')) {
      examples = ['Fresh Tuscan kale', 'Wild arugula', 'Baby spinach', 'Swiss chard'];
      tip = 'Dress with lemon juice and olive oil to increase non-heme iron bioavailability by up to 300%.';
    } else if (text.includes('cinnamon') || text.includes('vinegar')) {
      examples = ['Ceylon cinnamon powder', 'Raw unfiltered apple cider vinegar', 'Cinnamon herbal infusion'];
      tip = 'Add a teaspoon of vinegar or cinnamon to meals containing starches to blunt glucose spikes.';
    } else if (text.includes('garlic') || text.includes('leek')) {
      examples = ['Freshly crushed garlic cloves', 'Sautéed leeks', 'Spring scallions'];
      tip = 'Let crushed garlic sit for 5 minutes before cooking to allow active allicin synthesis to peak.';
    } else if (text.includes('beetroot')) {
      examples = ['Steamed beetroot wedges', 'Grated fresh beets', 'Golden beet salads'];
      tip = 'Consume 2-3 hours before aerobic activity to support natural nitric oxide and vascular dilation.';
    } else if (text.includes('ginger')) {
      examples = ['Fresh grated ginger tea', 'Ginger-steamed carrots', 'Ginger root infusions'];
      tip = 'Sip warm ginger tea 15 minutes before meals to stimulate digestive motility and ease reflux.';
    } else if (text.includes('lentil') || text.includes('beans')) {
      examples = ['Sprouted red lentils', 'French green lentils', 'Black beans'];
      tip = 'Soak dried legumes with a pinch of cumin or kombu seaweed to make them gentle on digestion.';
    } else {
      examples = food.title.split(/&|,|\band\b/).map(s => s.trim()).filter(Boolean);
      tip = 'Incorporate into your regular weekly rotation for balanced micronutrient diversity.';
    }

    const mealCategory = food.category || (
      text.includes('breakfast') || text.includes('koko') || text.includes('pap') || text.includes('porridge') ? 'Breakfast' :
      text.includes('lunch') || text.includes('rice') || text.includes('stew') ? 'Lunch' :
      text.includes('dinner') || text.includes('evening') ? 'Dinner' :
      text.includes('snack') || text.includes('seeds') || text.includes('nuts') ? 'Healthy Snacks' :
      text.includes('tea') || text.includes('drink') || text.includes('broth') ? 'Drinks' :
      'Core Nutrition'
    );

    return {
      title: food.title,
      mealCategory,
      shortReason,
      examples: examples.slice(0, 4),
      tip,
      clinicalNote: clinicalReason ? summarizeClinicalRationale(clinicalReason) : (sentences.length > 1 ? sentences.slice(1).join(' ') : cleanDesc),
      badge: food.badge
    };
  };

  // Helper to extract clean, grounded data for Nutrition & Meals blueprints
  const getMealBlueprintData = (comb: { id: string; title: string; description: string; badge?: string }) => {
    const cleanTitle = comb.title.replace(/^[🌅🥗🍽️🍏❤️🌱🔋💪📉\s]+/g, '').trim();
    const benefits = getCombinationBenefits(comb);
    
    let mealType = 'Synergy Pairing';
    let ingredients: string[] = [];
    let tip = '';

    if (comb.id.includes('breakfast')) {
      mealType = 'Breakfast Blueprint';
      ingredients = ['Protein (Eggs, Tofu, or Yogurt)', 'Whole Grains (Oats or Sweet Potato)', 'Yogurt or Fermented Food', 'Healthy Seeds or Nuts'];
      tip = 'Enjoy breakfast within 90 minutes of waking up to give you steady morning energy and focus.';
    } else if (comb.id.includes('lunch')) {
      mealType = 'Lunch Blueprint';
      ingredients = ['Lean Protein (Salmon, Chicken, or Tofu)', 'Whole Grain (Brown Rice or Quinoa)', 'Fresh Green Vegetables', 'Olive Oil Dressing'];
      tip = 'Start with your vegetables or greens first to help digestion and keep your energy steady through the afternoon.';
    } else if (comb.id.includes('dinner')) {
      mealType = 'Dinner Blueprint';
      ingredients = ['Gentle Protein (Fish, Lentils, or Tempeh)', 'Light Whole Carbs (Squash or Steamed Roots)', 'Tender Steamed Vegetables', 'Olive Oil Drizzle'];
      tip = 'Finish dinner 3 hours before bed so your stomach has time to empty and you can sleep comfortably.';
    } else if (comb.id.includes('snack')) {
      mealType = 'Smart Snack Blueprint';
      ingredients = ['Handful of Seeds or Nuts', 'Fresh Veggie Slices or Berries', 'Natural Fiber'];
      tip = 'Pair nuts or seeds with fresh fruit or veggies to stay full between meals without energy crashes.';
    } else if (comb.id.includes('iron-vitc')) {
      mealType = 'Nutrient Synergy';
      ingredients = ['Plant-Based Iron (Lentils or Pumpkin Seeds)', 'Fresh Vitamin C (Citrus, Bell Pepper, or Berries)'];
      tip = 'Squeeze fresh lemon juice over cooked legumes immediately prior to serving.';
    } else if (comb.id.includes('fat-vitamins')) {
      mealType = 'Nutrient Synergy';
      ingredients = ['Vitamins A, D, E, K (Leafy Greens or Broccoli)', 'Healthy Lipids (Extra Virgin Olive Oil or Avocado)'];
      tip = 'Never consume fat-soluble vitamins raw and fat-free; lipids are required for intestinal uptake.';
    } else if (comb.id.includes('carb-fiber-protein')) {
      mealType = 'Glycemic Shield';
      ingredients = ['Complex Carbohydrate', 'Soluble Dietary Fiber', 'Clean Protein Cushion'];
      tip = 'Never eat naked fast carbs on an empty stomach; wrap them in fiber or protein.';
    } else if (comb.id.includes('potassium-magnesium')) {
      mealType = 'Cardioprotective Duo';
      ingredients = ['Potassium Source (Avocado, Banana)', 'Magnesium Source (Pumpkin Seeds, Cacao Nibs)'];
      tip = 'This mineral duo helps balance cellular osmotic pumps to support natural blood pressure.';
    } else if (comb.id.includes('fiber-sterols')) {
      mealType = 'Lipid Optimization';
      ingredients = ['Soluble Beta-Glucans (Oat Bran or Chia)', 'Monounsaturated Fats (Olive Oil or Avocado)'];
      tip = 'Viscous beta-glucans physically bind excess circulating biliary cholesterol in the bowel.';
    } else if (comb.id.includes('ginger-steamed')) {
      mealType = 'Digestive Comfort';
      ingredients = ['Soft Steamed Low-FODMAP Vegetables', 'Grated Fresh Ginger Root'];
      tip = 'Active gingerols promote gastric emptying and soothe stomach spasms.';
    } else {
      ingredients = ['Tailored Macronutrient Core', 'Synergistic Micronutrients'];
      tip = 'Combines complementary whole foods for elevated bioavailability.';
    }

    const sentences = comb.description.split(/(?<=[.!?])\s+/).filter(Boolean);
    const shortReason = sentences[0] || comb.description;

    return {
      cleanTitle,
      mealType,
      shortReason,
      ingredients,
      tip,
      benefits,
      badge: comb.badge
    };
  };

  // Helper to extract clean, grounded data for Hydration cards
  const getHydrationTipData = (tip: string, idx: number) => {
    const text = tip.toLowerCase();
    let title = `Hydration Guideline ${idx + 1}`;
    let timing = 'Daily Protocol';
    let shortReason = '';
    let practicalAction = '';

    if (text.includes('waking') || text.includes('wake') || text.includes('250ml')) {
      title = 'Morning Wake-Up Glass';
      timing = 'Upon Waking';
      shortReason = 'Rehydrates vascular organs and jumpstarts liver toxin clearance after overnight fluid loss.';
      practicalAction = 'Drink 250–350 ml of room-temperature or warm water before morning coffee or food.';
    } else if (text.includes('gradually') || text.includes('pacing') || text.includes('throughout')) {
      title = 'Steady Daytime Pacing';
      timing = 'Throughout the Day';
      shortReason = 'Prevents urinary filter overload and electrolyte dilution by distributing fluid absorption evenly.';
      practicalAction = 'Keep a water bottle nearby and take moderate sips every 30–45 minutes instead of chugging.';
    } else if (text.includes('urine') || text.includes('color') || text.includes('straw')) {
      title = 'Hydration Color Check';
      timing = 'Daily Bio-Feedback';
      shortReason = 'Urine color is your most direct visual bio-indicator of hydration and cellular electrolyte balance.';
      practicalAction = 'Aim for a pale straw color. Clear urine indicates mineral flushing; dark amber signals dehydration.';
    } else if (text.includes('kidney') || text.includes('urine output') || text.includes('match') || text.includes('swelling')) {
      title = 'Renal Fluid Tracking';
      timing = 'Kidney Protocol';
      shortReason = 'Protects compromised nephrons and avoids fluid accumulation in lungs and lower extremities.';
      practicalAction = 'Track fluid intake against urine volume to ensure fluid balance stays within safe clinical limits.';
    } else if (text.includes('salt') || text.includes('lemon') || text.includes('exercise') || text.includes('sodium')) {
      title = 'Electrolyte Workout Shield';
      timing = 'During Active Training';
      shortReason = 'Maintains cellular sodium and potassium pump gradients during heavy perspiration and movement.';
      practicalAction = 'Add a pinch of unrefined mineral salt and a squeeze of fresh lemon to your workout water bottle.';
    } else {
      title = `Hydration Habit ${idx + 1}`;
      timing = 'Daily Habit';
      const sentences = tip.split(/(?<=[.!?])\s+/).filter(Boolean);
      shortReason = sentences[0] || tip;
      practicalAction = sentences.length > 1 ? sentences.slice(1).join(' ') : 'Sip fluids regularly across your waking day.';
    }

    return {
      title,
      timing,
      shortReason,
      practicalAction,
      clinicalNote: tip
    };
  };

  // Helper to extract clean, grounded data for Exercise routine cards
  const getExerciseCardData = (item: string, idx: number) => {
    try {
      const parsed = JSON.parse(item);
      const name = parsed.name || `Exercise Routine ${idx + 1}`;
      const duration = parsed.duration || '20-30 mins';
      const frequency = parsed.frequency || '3-4 days/week';
      const intensity = parsed.intensity || 'Moderate';
      const caloriesBurned = parsed.caloriesBurned || 120;
      const safetyNotes = parsed.safetyNotes || 'Maintain steady breathing and pause if you experience discomfort.';
      
      const text = name.toLowerCase();
      let shortReason = 'Supports healthy heart function, boosts daily energy, and keeps your muscles active.';
      let formTip = safetyNotes;

      if (text.includes('brisk walk') || text.includes('walking')) {
        shortReason = 'A gentle, low-impact exercise that boosts heart health and supports healthy blood sugar without straining joints.';
        formTip = 'Keep your eyes forward, relax your shoulders, and swing your arms naturally with an upright posture.';
      } else if (text.includes('squat') || text.includes('push-up') || text.includes('bodyweight')) {
        shortReason = 'Builds muscle strength and supports bone health using your own body weight in safe, controlled motions.';
        formTip = 'Keep your stomach muscles gently tight, breathe out as you push, and avoid locking your knees or elbows.';
      } else if (text.includes('swim') || text.includes('water')) {
        shortReason = 'Water gently supports your body weight so you can build fitness and tone muscles with zero impact on joints.';
        formTip = 'Focus on long, smooth gliding strokes with steady, rhythmic breathing in and out of the water.';
      } else if (text.includes('cycling') || text.includes('bike')) {
        shortReason = 'Strengthens your leg muscles and improves heart endurance while being very easy on your knees.';
        formTip = 'Adjust your seat height so your knee has just a slight 15-degree bend at the bottom of each pedal stroke.';
      } else if (text.includes('yoga') || text.includes('mobility') || text.includes('stretch')) {
        shortReason = 'Helps calm everyday stress, loosens tight muscles, and keeps your spine and joints flexible.';
        formTip = 'Never force a stretch to the point of pain; breathe slowly and stretch gently until you feel mild tension.';
      } else if (text.includes('interval') || text.includes('hiit') || text.includes('cardio')) {
        shortReason = 'Alternates brisk and easy paces to burn calories, build stamina, and strengthen your heart.';
        formTip = 'Warm up thoroughly for 5 minutes first, and keep your pace at an intensity where you can catch your breath.';
      }

      return {
        name,
        duration,
        frequency,
        intensity,
        caloriesBurned,
        shortReason,
        formTip,
        safetyNotes
      };
    } catch {
      return {
        name: `Movement Routine ${idx + 1}`,
        duration: '20 mins',
        frequency: '3 days/week',
        intensity: 'Moderate',
        caloriesBurned: 100,
        shortReason: item,
        formTip: 'Perform at a comfortable, sustainable pace and maintain normal breathing.',
        safetyNotes: item
      };
    }
  };

  // Helper to extract clean, grounded data for Lifestyle cards
  const getLifestyleCardData = (tip: { id: string; title: string; description: string; badge?: string }) => {
    let cleanDesc = tip.description;
    let clinicalReason = '';

    if (tip.description.includes('\n\n• Clinical Reason: ')) {
      [cleanDesc, clinicalReason] = tip.description.split('\n\n• Clinical Reason: ');
    } else if (tip.description.includes('• Clinical Reason: ')) {
      [cleanDesc, clinicalReason] = tip.description.split('• Clinical Reason: ');
    }

    const sentences = cleanDesc
      .replace(/^[•\s\-\*]+/g, '')
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(Boolean);

    let shortReason = sentences[0] || cleanDesc;
    let practicalAction = sentences.length > 1 ? sentences.slice(1).join(' ') : 'Incorporate into your daily wellness routine.';

    const text = `${tip.title} ${tip.description}`.toLowerCase();
    let categoryTag = tip.badge || 'Daily Habit';

    if (text.includes('sleep') || text.includes('circadian') || text.includes('melatonin') || text.includes('light')) {
      categoryTag = tip.badge || 'Sleep & Rest';
      if (!shortReason || shortReason.length < 15) {
        shortReason = 'Supports restful sleep so you wake up feeling recharged and clear-headed.';
      }
    } else if (text.includes('stress') || text.includes('cortisol') || text.includes('breathing') || text.includes('nervous')) {
      categoryTag = tip.badge || 'Stress Balance';
      if (!shortReason || shortReason.length < 15) {
        shortReason = 'Calms the body and lowers everyday mental and physical tension.';
      }
    } else if (text.includes('chew') || text.includes('bed') || text.includes('gerd') || text.includes('reflux') || text.includes('gastro')) {
      categoryTag = tip.badge || 'Digestive Health';
      if (!shortReason || shortReason.length < 15) {
        shortReason = 'Promotes smooth digestion and helps prevent heartburn and bloating.';
      }
    } else if (text.includes('protein') || text.includes('muscle') || text.includes('meal')) {
      categoryTag = tip.badge || 'Meal Timing';
      if (!shortReason || shortReason.length < 15) {
        shortReason = 'Helps maintain steady energy and stamina throughout the day.';
      }
    } else if (text.includes('nitric oxide') || text.includes('vascular') || text.includes('endothelial')) {
      categoryTag = tip.badge || 'Circulation';
      if (!shortReason || shortReason.length < 15) {
        shortReason = 'Supports healthy circulation and normal blood flow.';
      }
    }

    const clinicalNote = clinicalReason 
      ? summarizeClinicalRationale(clinicalReason)
      : (sentences.length > 2 ? sentences.slice(2).join(' ') : cleanDesc);

    return {
      title: tip.title,
      categoryTag,
      shortReason,
      practicalAction,
      clinicalNote,
      badge: tip.badge
    };
  };

  const navigationSections = [
    { id: 'card-foods-to-eat', label: 'Foods to Eat', icon: Apple, color: 'text-emerald-500' },
    { id: 'card-foods-to-avoid', label: 'Foods to Avoid', icon: ShieldAlert, color: 'text-amber-500' },
    { id: 'card-food-combinations', label: 'Nutrition & Meals', icon: Sparkles, color: 'text-purple-500' },
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
            <Card className="border border-slate-200/80 dark:border-slate-800 shadow-xs rounded-3xl overflow-hidden bg-white dark:bg-slate-900" id="card-foods-to-eat">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-emerald-50/20 dark:bg-emerald-950/15 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl flex-shrink-0">
                    <Apple className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Foods to Eat</CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      Target ingredients and balanced options optimized for your clinical profile and wellness goals.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 sm:p-6">
                {recs.foodsToEat.length === 0 ? (
                  <EmptyState
                    title="No Food Recommendations Calculated"
                    description="Our biometric matching engine couldn't find matches. Please verify that your dietary choices and preferences are correctly set in your health profile."
                    id="recs-eat-empty-state"
                  />
                ) : recs.foodsToEat.some(f => f.category) ? (
                  <div className="flex flex-col gap-7" id="eat-items-list-grouped">
                    {(['Breakfast', 'Lunch', 'Dinner', 'Healthy Snacks', 'Drinks'] as const).map((category) => {
                      const maxOptions = (category === 'Healthy Snacks' || category === 'Drinks') ? 2 : 3;
                      const categoryFoods = recs.foodsToEat.filter((f) => f.category === category).slice(0, maxOptions);
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

                      return (
                        <div key={category} className="flex flex-col gap-3.5" id={`category-block-${category.toLowerCase().replace(' ', '-')}`}>
                          {/* Category Header */}
                          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2">
                            <div className="flex items-center gap-2">
                              <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-700 dark:text-slate-300">
                                {getCategoryIcon(category)}
                              </div>
                              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                {category === 'Healthy Snacks' ? 'Snack Options' : `${category} Options`}
                              </h3>
                            </div>
                            <span className="text-3xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                              {categoryFoods.length} {categoryFoods.length === 1 ? 'option' : 'options'}
                            </span>
                          </div>
                          
                          {/* Responsive 2-column grid */}
                          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                            {categoryFoods.map((food, fidx) => {
                              const eatData = getEatCardData(food);
                              const cardKey = `eat-${food.id}`;
                              const isExpanded = Boolean(expandedCards[cardKey]);

                              return (
                                <div 
                                  key={food.id}
                                  className={`p-3.5 sm:p-5 rounded-2xl flex flex-col gap-2.5 sm:gap-3 transition-all duration-200 border ${
                                    fidx === 0
                                      ? 'bg-white dark:bg-slate-900/80 border-slate-200/90 dark:border-slate-800 hover:border-emerald-500/30 shadow-xs'
                                      : 'bg-slate-50/40 dark:bg-slate-900/40 border-slate-200/70 dark:border-slate-800/70 hover:border-emerald-500/20'
                                  }`}
                                >
                                  {/* Meta header */}
                                  <div className="flex items-center justify-between gap-1.5 flex-wrap">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] sm:text-3xs font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                                        {fidx === 0 ? 'Primary' : 'Alternative'}
                                      </span>
                                      {eatData.badge && (
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] sm:text-3xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60 truncate">
                                          {eatData.badge}
                                        </span>
                                      )}
                                    </div>
                                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 flex-shrink-0" />
                                  </div>

                                  {/* Title */}
                                  <h4 className="text-xs sm:text-sm md:text-base font-bold text-slate-900 dark:text-slate-100 leading-snug break-words">
                                    {eatData.title}
                                  </h4>

                                  {/* Short Reason */}
                                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                                    {eatData.shortReason}
                                  </p>

                                  {/* Progressive Disclosure */}
                                  <button
                                    type="button"
                                    onClick={() => toggleCard(cardKey)}
                                    className="mt-auto pt-2 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 min-h-[44px] cursor-pointer group transition-colors select-none"
                                    aria-expanded={isExpanded}
                                  >
                                    <span>{isExpanded ? 'Hide details' : 'Learn more'}</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 group-hover:translate-y-0.5 ${isExpanded ? 'rotate-180' : ''}`} />
                                  </button>

                                  {isExpanded && (
                                    <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2.5 text-xs leading-relaxed animate-fade-in">
                                      {eatData.examples.length > 0 && (
                                        <div className="flex flex-col gap-1.5">
                                          <span className="text-4xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                            Examples & Ingredients
                                          </span>
                                          <div className="flex flex-wrap gap-1.5">
                                            {eatData.examples.map((ex, i) => (
                                              <span key={i} className="inline-flex items-center text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 font-medium">
                                                {ex}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {eatData.tip && (
                                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-150/70 dark:border-slate-800/70 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                                          <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                                          <span><strong className="font-semibold text-slate-800 dark:text-slate-200">Tip:</strong> {eatData.tip}</span>
                                        </div>
                                      )}

                                      <div className="p-3 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/15 dark:border-emerald-500/20 text-slate-600 dark:text-slate-400">
                                        <span className="font-bold text-emerald-700 dark:text-emerald-300 block mb-1">Clinical Context</span>
                                        <p>{eatData.clinicalNote}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}

                    {/* Uncategorized fallback */}
                    {recs.foodsToEat.filter((f) => !f.category).length > 0 && (() => {
                      const additionalStaples = recs.foodsToEat.filter((f) => !f.category).slice(0, 5);
                      return (
                        <div className="flex flex-col gap-3.5" id="category-block-uncategorized">
                          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2">
                            <div className="flex items-center gap-2">
                              <Apple className="w-4 h-4 text-emerald-500" />
                              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Additional Nutrition Staples</h3>
                            </div>
                            <span className="text-3xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                              {additionalStaples.length} {additionalStaples.length === 1 ? 'option' : 'options'}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                            {additionalStaples.map((food, fidx) => {
                            const eatData = getEatCardData(food);
                            const cardKey = `eat-${food.id}`;
                            const isExpanded = Boolean(expandedCards[cardKey]);

                            return (
                              <div 
                                key={food.id}
                                className={`p-3.5 sm:p-5 rounded-2xl flex flex-col gap-2.5 sm:gap-3 transition-all duration-200 border ${
                                  fidx === 0
                                    ? 'bg-white dark:bg-slate-900/80 border-slate-200/90 dark:border-slate-800 hover:border-emerald-500/30 shadow-xs'
                                    : 'bg-slate-50/40 dark:bg-slate-900/40 border-slate-200/70 dark:border-slate-800/70 hover:border-emerald-500/20'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1.5 flex-wrap">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] sm:text-3xs font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                                      {eatData.mealCategory}
                                    </span>
                                    {eatData.badge && (
                                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] sm:text-3xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60 truncate">
                                        {eatData.badge}
                                      </span>
                                    )}
                                  </div>
                                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 flex-shrink-0" />
                                </div>
                                <h4 className="text-xs sm:text-sm md:text-base font-bold text-slate-900 dark:text-slate-100 leading-snug break-words">
                                  {eatData.title}
                                </h4>
                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                                  {eatData.shortReason}
                                </p>
                                
                                <button
                                  type="button"
                                  onClick={() => toggleCard(cardKey)}
                                  className="mt-auto pt-2 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 min-h-[44px] cursor-pointer group transition-colors select-none"
                                  aria-expanded={isExpanded}
                                >
                                  <span>{isExpanded ? 'Hide details' : 'Learn more'}</span>
                                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 group-hover:translate-y-0.5 ${isExpanded ? 'rotate-180' : ''}`} />
                                </button>

                                {isExpanded && (
                                  <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2.5 text-xs leading-relaxed animate-fade-in">
                                    {eatData.examples.length > 0 && (
                                      <div className="flex flex-col gap-1.5">
                                        <span className="text-4xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                          Examples & Ingredients
                                        </span>
                                        <div className="flex flex-wrap gap-1.5">
                                          {eatData.examples.map((ex, i) => (
                                            <span key={i} className="inline-flex items-center text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 font-medium">
                                              {ex}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {eatData.tip && (
                                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-150/70 dark:border-slate-800/70 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                                        <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                                        <span><strong className="font-semibold text-slate-800 dark:text-slate-200">Tip:</strong> {eatData.tip}</span>
                                      </div>
                                    )}

                                    <div className="p-3 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/15 dark:border-emerald-500/20 text-slate-600 dark:text-slate-400">
                                      <span className="font-bold text-emerald-700 dark:text-emerald-300 block mb-1">Clinical Context</span>
                                      <p>{eatData.clinicalNote}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4" id="eat-items-list">
                    {recs.foodsToEat.map((food, fidx) => {
                      const eatData = getEatCardData(food);
                      const cardKey = `eat-${food.id}`;
                      const isExpanded = Boolean(expandedCards[cardKey]);

                      return (
                        <div 
                          key={food.id}
                          className={`p-3.5 sm:p-5 rounded-2xl flex flex-col gap-2.5 sm:gap-3 transition-all duration-200 border ${
                            fidx === 0 
                              ? 'bg-white dark:bg-slate-900/80 border-slate-200/90 dark:border-slate-800 hover:border-emerald-500/30 shadow-xs' 
                              : 'bg-slate-50/40 dark:bg-slate-900/40 border-slate-200/70 dark:border-slate-800/70 hover:border-emerald-500/20'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1.5 flex-wrap">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] sm:text-3xs font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                                {eatData.mealCategory}
                              </span>
                              {eatData.badge && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] sm:text-3xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60 truncate">
                                  {eatData.badge}
                                </span>
                              )}
                            </div>
                            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 flex-shrink-0" />
                          </div>
                          <h4 className="text-xs sm:text-sm md:text-base font-bold text-slate-900 dark:text-slate-100 leading-snug break-words">
                            {eatData.title}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                            {eatData.shortReason}
                          </p>

                          <button
                            type="button"
                            onClick={() => toggleCard(cardKey)}
                            className="mt-auto pt-2 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 min-h-[44px] cursor-pointer group transition-colors select-none"
                            aria-expanded={isExpanded}
                          >
                            <span>{isExpanded ? 'Hide details' : 'Learn more'}</span>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 group-hover:translate-y-0.5 ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>

                          {isExpanded && (
                            <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2.5 text-xs leading-relaxed animate-fade-in">
                              {eatData.examples.length > 0 && (
                                <div className="flex flex-col gap-1.5">
                                  <span className="text-4xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                    Examples & Ingredients
                                  </span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {eatData.examples.map((ex, i) => (
                                      <span key={i} className="inline-flex items-center text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 font-medium">
                                        {ex}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {eatData.tip && (
                                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-150/70 dark:border-slate-800/70 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                                  <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                                  <span><strong className="font-semibold text-slate-800 dark:text-slate-200">Tip:</strong> {eatData.tip}</span>
                                </div>
                              )}

                              <div className="p-3 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/15 dark:border-emerald-500/20 text-slate-600 dark:text-slate-400">
                                <span className="font-bold text-emerald-700 dark:text-emerald-300 block mb-1">Clinical Context</span>
                                <p>{eatData.clinicalNote}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SECTION 2: FOODS TO AVOID */}
            <Card className="border border-slate-200/80 dark:border-slate-800 shadow-xs rounded-3xl overflow-hidden bg-white dark:bg-slate-900" id="card-foods-to-avoid">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-amber-50/20 dark:bg-amber-950/15 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-2xl flex-shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Foods to Avoid</CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      Items to limit, moderate, or exclude based on portion size, preparation, or your medical profile.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 sm:p-6">
                {recs.foodsToAvoid.length === 0 ? (
                  <EmptyState
                    title="No Avoidance Filters Triggered"
                    description="Based on your profile, no specific food categories or items are currently flagged as inflammatory or reactive."
                    id="recs-avoid-empty-state"
                  />
                ) : (
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4" id="avoid-items-list">
                    {recs.foodsToAvoid.map((food) => {
                      const avoidData = getAvoidCardData(food);
                      const cardKey = `avoid-${food.id}`;
                      const isExpanded = Boolean(expandedCards[cardKey]);

                      return (
                        <div 
                          key={food.id} 
                          className="p-3.5 sm:p-5 bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex flex-col gap-2.5 sm:gap-3 shadow-xs hover:border-amber-500/30 transition-all duration-200"
                        >
                          {/* Top meta row */}
                          <div className="flex items-center justify-between gap-1.5 flex-wrap">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] sm:text-3xs font-semibold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
                                {avoidData.category}
                              </span>
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] sm:text-3xs font-bold uppercase tracking-wider border ${avoidData.statusStyle}`}>
                                {avoidData.statusLabel}
                              </span>
                            </div>
                            <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 flex-shrink-0" />
                          </div>

                          {/* Food Title */}
                          <h4 className="text-xs sm:text-sm md:text-base font-bold text-slate-900 dark:text-white leading-snug break-words">
                            {avoidData.title}
                          </h4>

                          {/* Short Reason */}
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                            {avoidData.shortReason}
                          </p>

                          {/* Progressive Disclosure */}
                          <button
                            type="button"
                            onClick={() => toggleCard(cardKey)}
                            className="mt-auto pt-2 flex items-center justify-between text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 min-h-[44px] cursor-pointer group transition-colors select-none"
                            aria-expanded={isExpanded}
                          >
                            <span>{isExpanded ? 'Hide details' : 'Learn more'}</span>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 group-hover:translate-y-0.5 ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>

                          {isExpanded && (
                            <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2.5 text-xs leading-relaxed animate-fade-in">
                              {/* Grounded Examples */}
                              {avoidData.examples.length > 0 && (
                                <div className="flex flex-col gap-1.5">
                                  <span className="text-4xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                    Examples to Limit or Avoid
                                  </span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {avoidData.examples.map((ex, i) => (
                                      <span key={i} className="inline-flex items-center text-xs px-2 py-0.5 rounded-md bg-amber-500/5 dark:bg-amber-950/30 text-slate-700 dark:text-slate-300 border border-amber-200/50 dark:border-amber-800/40 font-medium">
                                        {ex}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Practical Tip / Healthier Alternative */}
                              {avoidData.tip && (
                                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-150/70 dark:border-slate-800/70 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                                  <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                                  <span><strong className="font-semibold text-slate-800 dark:text-slate-200">Alternative:</strong> {avoidData.tip}</span>
                                </div>
                              )}

                              <div className="p-3 rounded-xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/15 dark:border-amber-900/30 text-slate-600 dark:text-slate-400">
                                <span className="font-bold text-amber-800 dark:text-amber-300 block mb-1">Clinical Context</span>
                                <p>{avoidData.clinicalNote}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SECTION 3: NUTRITION & MEALS (HEALTHY FOOD COMBINATIONS) */}
            <Card className="border border-slate-200/80 dark:border-slate-800 shadow-xs rounded-3xl overflow-hidden bg-white dark:bg-slate-900" id="card-food-combinations">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-purple-50/20 dark:bg-purple-950/15 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-2xl flex-shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Nutrition & Meals</CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      Synergistic food combinations, meal blueprints, and nutrient pairings designed for your health profile.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 sm:p-6">
                {(() => {
                  const filteredCombinations = recs.healthyCombinations.filter((comb) => {
                    const id = (comb.id || '').toLowerCase();
                    const badge = (comb.badge || '').trim().toLowerCase();
                    const title = (comb.title || '').trim().toLowerCase();
                    const mealData = getMealBlueprintData(comb);
                    const mealType = (mealData.mealType || '').trim().toLowerCase();

                    // 1. Nutrient Synergy — Absorption Synergy
                    if (
                      id === 'comb-iron-vitc' ||
                      badge === 'absorption synergy' ||
                      badge === 'absorption booster' ||
                      (mealType.includes('nutrient synergy') && badge.includes('absorption')) ||
                      title.includes('absorption synergy')
                    ) {
                      return false;
                    }

                    // 2. Nutrient Synergy — Bioavailability Hack
                    if (
                      id === 'comb-fat-vitamins' ||
                      badge === 'bioavailability hack' ||
                      (mealType.includes('nutrient synergy') && badge.includes('bioavailability')) ||
                      title.includes('bioavailability hack')
                    ) {
                      return false;
                    }

                    // 3. Glycemic Shield
                    if (
                      id === 'comb-carb-fiber-protein' ||
                      badge === 'glycemic shield' ||
                      badge === 'glycemic buffer' ||
                      mealType === 'glycemic shield' ||
                      title === 'glycemic shield'
                    ) {
                      return false;
                    }

                    // 4. Cardioprotective Duo
                    if (
                      id === 'comb-potassium-magnesium' ||
                      badge === 'cardioprotective duo' ||
                      mealType === 'cardioprotective duo' ||
                      title === 'cardioprotective duo'
                    ) {
                      return false;
                    }

                    return true;
                  });

                  if (filteredCombinations.length === 0) {
                    return (
                      <EmptyState
                        title="No Combinations Generated"
                        description="Our metabolic synergy analyzer is compiling healthy pairings for your biological markers."
                        id="recs-combinations-empty-state"
                      />
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4" id="combinations-items-list">
                      {filteredCombinations.map((comb) => {
                        const mealData = getMealBlueprintData(comb);
                        const cardKey = `meal-${comb.id}`;
                        const isExpanded = Boolean(expandedCards[cardKey]);

                        return (
                          <div 
                            key={comb.id} 
                            className="p-3.5 sm:p-5 bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex flex-col gap-2.5 sm:gap-3 shadow-xs hover:border-purple-500/30 transition-all duration-200"
                          >
                            {/* Top meta row */}
                            <div className="flex items-center justify-between gap-1.5 flex-wrap">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] sm:text-3xs font-semibold uppercase tracking-wider bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                                  {mealData.mealType}
                                </span>
                                {mealData.badge && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] sm:text-3xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60 truncate">
                                    {mealData.badge}
                                  </span>
                                )}
                              </div>
                              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500 flex-shrink-0" />
                            </div>

                            {/* Meal Title */}
                            <h4 className="text-xs sm:text-sm md:text-base font-bold text-slate-900 dark:text-white leading-snug break-words">
                              {mealData.cleanTitle}
                            </h4>

                            {/* Short Reason */}
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                              {mealData.shortReason}
                            </p>

                            {/* Progressive Disclosure */}
                            <button
                              type="button"
                              onClick={() => toggleCard(cardKey)}
                              className="mt-auto pt-2 flex items-center justify-between text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 min-h-[44px] cursor-pointer group transition-colors select-none"
                              aria-expanded={isExpanded}
                            >
                              <span>{isExpanded ? 'Hide details' : 'Learn more'}</span>
                              <ChevronDown className={`w-4 h-4 transition-transform duration-200 group-hover:translate-y-0.5 ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>

                            {isExpanded && (
                              <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2.5 text-xs leading-relaxed animate-fade-in">
                                {/* Meal Components */}
                                {mealData.ingredients.length > 0 && (
                                  <div className="flex flex-col gap-1.5">
                                    <span className="text-4xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                      Components & Pairings
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                      {mealData.ingredients.map((ing, i) => (
                                        <span key={i} className="inline-flex items-center text-xs px-2 py-0.5 rounded-md bg-purple-500/5 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200 border border-purple-200/50 dark:border-purple-800/40 font-medium">
                                          {ing}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Practical Tip */}
                                {mealData.tip && (
                                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-150/70 dark:border-slate-800/70 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                                    <Lightbulb className="w-3.5 h-3.5 text-purple-500 flex-shrink-0 mt-0.5" />
                                    <span><strong className="font-semibold text-slate-800 dark:text-slate-200">Meal tip:</strong> {mealData.tip}</span>
                                  </div>
                                )}

                                {mealData.benefits.map((benefit, bidx) => (
                                  <div key={bidx} className="p-2.5 rounded-xl bg-purple-500/5 dark:bg-purple-950/20 border border-purple-500/10 dark:border-purple-900/20 flex flex-col gap-0.5">
                                    <span className="font-bold text-xs text-purple-900 dark:text-purple-200">{benefit.label}</span>
                                    <p className="text-slate-600 dark:text-slate-400">{benefit.text}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* SECTION 4: DAILY WATER INTAKE & HYDRATION */}
            <Card className="border border-slate-200/80 dark:border-slate-800 shadow-xs rounded-3xl overflow-hidden bg-white dark:bg-slate-900" id="card-hydration">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-blue-50/20 dark:bg-blue-950/15 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-2xl flex-shrink-0">
                    <Droplet className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Daily Water Intake & Hydration</CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      Fluid balance targets, pacing protocols, and hydration indicators calculated for your body mass and physical activity.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 sm:p-6 flex flex-col gap-6">
                
                {/* Hydration Stat banner */}
                <div className="flex flex-col md:flex-row items-stretch justify-between gap-5 p-5 bg-gradient-to-br from-blue-500/5 to-indigo-500/10 dark:from-blue-950/20 dark:to-indigo-950/15 border border-blue-100/60 dark:border-blue-900/30 rounded-2xl" id="water-stat-banner">
                  <div className="flex flex-col gap-1 max-w-lg justify-center">
                    <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300">Hydration Baseline Overview</h4>
                    <p className="text-xs sm:text-sm text-blue-800/80 dark:text-blue-300/80 leading-relaxed font-normal">
                      {recs.waterIntake.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 bg-white dark:bg-slate-900/90 px-5 py-3 rounded-2xl border border-blue-200/50 dark:border-blue-900/40 shadow-xs justify-center self-start md:self-center">
                    <div className="text-center">
                      <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">{recs.waterIntake.liters}</span>
                      <span className="text-4xs font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-widest mt-0.5">Liters / Day</span>
                    </div>
                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
                    <div className="text-center">
                      <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">{recs.waterIntake.cups}</span>
                      <span className="text-4xs font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-widest mt-0.5">Cups / Day</span>
                    </div>
                  </div>
                </div>

                {/* Hydration Habit Cards Grid */}
                <div className="flex flex-col gap-3.5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Therapeutic Hydration Guidelines</h4>
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4" id="water-tips-list">
                    {recs.waterIntake.tips.map((tip, idx) => {
                      const hydData = getHydrationTipData(tip, idx);
                      const cardKey = `water-${idx}`;
                      const isExpanded = Boolean(expandedCards[cardKey]);

                      return (
                        <div 
                          key={idx} 
                          className="p-3.5 sm:p-5 bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex flex-col gap-2.5 sm:gap-3 shadow-xs hover:border-blue-500/30 transition-all duration-200"
                        >
                          <div className="flex items-center justify-between gap-1.5 flex-wrap">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] sm:text-3xs font-semibold uppercase tracking-wider bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                              {hydData.timing}
                            </span>
                            <Droplet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
                          </div>

                          <h4 className="text-xs sm:text-sm md:text-base font-bold text-slate-900 dark:text-white leading-snug break-words">
                            {hydData.title}
                          </h4>

                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                            <strong className="font-semibold text-slate-800 dark:text-slate-200">Why it helps:</strong> {hydData.shortReason}
                          </p>

                          <button
                            type="button"
                            onClick={() => toggleCard(cardKey)}
                            className="mt-auto pt-2 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 min-h-[44px] cursor-pointer group transition-colors select-none"
                            aria-expanded={isExpanded}
                          >
                            <span>{isExpanded ? 'Hide details' : 'Learn more'}</span>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 group-hover:translate-y-0.5 ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>

                          {isExpanded && (
                            <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2.5 text-xs leading-relaxed animate-fade-in">
                              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-150/70 dark:border-slate-800/70 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                                <Lightbulb className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                                <span><strong className="font-semibold text-slate-800 dark:text-slate-200">Tip:</strong> {hydData.practicalAction}</span>
                              </div>

                              <div className="p-3 rounded-xl bg-blue-500/5 dark:bg-blue-950/20 border border-blue-500/15 dark:border-blue-900/30 text-slate-600 dark:text-slate-400">
                                <span className="font-bold text-blue-800 dark:text-blue-300 block mb-1">Clinical Context</span>
                                <p>{hydData.clinicalNote}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SECTION 5: EXERCISE RECOMMENDATIONS */}
            <Card className="border border-slate-200/80 dark:border-slate-800 shadow-xs rounded-3xl overflow-hidden bg-white dark:bg-slate-900" id="card-exercise">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-orange-50/20 dark:bg-orange-950/15 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 rounded-2xl flex-shrink-0">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Exercise & Movement Plan</CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      Cardiovascular conditioning and active routines tailored to your clinical fitness level and movement tolerance.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 sm:p-6 flex flex-col gap-6">
                
                {/* Strategic stats overview */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl border border-slate-100/80 dark:border-slate-850">
                    <span className="text-4xs text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-widest mb-1">Strategy Type</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">{recs.exercise.type}</span>
                  </div>
                  <div className="p-3 bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl border border-slate-100/80 dark:border-slate-850">
                    <span className="text-4xs text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-widest mb-1">Weekly Frequency</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">{recs.exercise.frequency}</span>
                  </div>
                  <div className="p-3 bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl border border-slate-100/80 dark:border-slate-850">
                    <span className="text-4xs text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-widest mb-1">Session Target</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">{recs.exercise.duration}</span>
                  </div>
                  <div className="p-3 bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl border border-slate-100/80 dark:border-slate-850">
                    <span className="text-4xs text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-widest mb-1">Target Intensity</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">{recs.exercise.intensity}</span>
                  </div>
                </div>

                {/* Micro-Routines Responsive Grid */}
                <div className="flex flex-col gap-3.5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Suggested Micro-Routines</h4>
                  {recs.exercise.routine.length === 0 ? (
                    <EmptyState
                      title="No Micro-Routines Recommended"
                      description="Based on your cardiovascular baseline and health profile, no dedicated active routines are currently active."
                      id="recs-exercise-empty-state"
                    />
                  ) : (
                    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4" id="exercise-routines-list">
                      {recs.exercise.routine.map((item, idx) => {
                        const exData = getExerciseCardData(item, idx);
                        const cardKey = `ex-${idx}`;
                        const isExpanded = Boolean(expandedCards[cardKey]);

                        return (
                          <div 
                            key={idx} 
                            className="p-3.5 sm:p-5 bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex flex-col gap-2.5 sm:gap-3 shadow-xs hover:border-orange-500/30 transition-all duration-200"
                          >
                            {/* Meta row */}
                            <div className="flex items-center justify-between gap-1.5 flex-wrap">
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] sm:text-3xs font-semibold uppercase tracking-wider bg-orange-500/10 text-orange-700 dark:text-orange-300 border border-orange-500/20">
                                {exData.intensity}
                              </span>
                              <span className="text-[11px] sm:text-xs font-extrabold text-emerald-600 dark:text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20">
                                ~{exData.caloriesBurned} kcal
                              </span>
                            </div>

                            {/* Activity Title */}
                            <h4 className="text-xs sm:text-sm md:text-base font-bold text-slate-900 dark:text-white leading-snug break-words">
                              {exData.name}
                            </h4>

                            {/* Metrics Strip */}
                            <div className="grid grid-cols-3 gap-1.5 py-2 border-y border-slate-100 dark:border-slate-800/60 text-xs">
                              <div>
                                <span className="text-4xs font-bold text-slate-400 uppercase tracking-widest block">Duration</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200 text-3xs sm:text-xs truncate block">{exData.duration}</span>
                              </div>
                              <div>
                                <span className="text-4xs font-bold text-slate-400 uppercase tracking-widest block">Frequency</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200 text-3xs sm:text-xs truncate block">{exData.frequency}</span>
                              </div>
                              <div>
                                <span className="text-4xs font-bold text-slate-400 uppercase tracking-widest block">Intensity</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200 text-3xs sm:text-xs truncate block">{exData.intensity}</span>
                              </div>
                            </div>

                            {/* Short Reason */}
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                              <strong className="font-semibold text-slate-800 dark:text-slate-200">Why it helps:</strong> {exData.shortReason}
                            </p>

                            {/* Progressive Disclosure */}
                            <button
                              type="button"
                              onClick={() => toggleCard(cardKey)}
                              className="mt-auto pt-2 flex items-center justify-between text-xs font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 min-h-[44px] cursor-pointer group transition-colors select-none"
                              aria-expanded={isExpanded}
                            >
                              <span>{isExpanded ? 'Hide details' : 'Learn more'}</span>
                              <ChevronDown className={`w-4 h-4 transition-transform duration-200 group-hover:translate-y-0.5 ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>

                            {isExpanded && (
                              <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2.5 text-xs leading-relaxed animate-fade-in">
                                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-150/70 dark:border-slate-800/70 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                                  <CornerDownRight className="w-3.5 h-3.5 text-orange-500 flex-shrink-0 mt-0.5" />
                                  <span><strong className="font-semibold text-slate-800 dark:text-slate-200">Form tip:</strong> {exData.formTip}</span>
                                </div>

                                <div className="p-3 rounded-xl bg-orange-500/5 dark:bg-orange-950/20 border border-orange-500/15 dark:border-orange-900/30 text-slate-600 dark:text-slate-400">
                                  <span className="font-bold text-orange-800 dark:text-orange-300 block mb-1">Safety & Form Notes</span>
                                  <p>{exData.safetyNotes}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Precautions Alert Grid */}
                {recs.exercise.precautions.length > 0 && (
                  <div className="p-4 sm:p-5 bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 dark:border-amber-900/30 rounded-2xl flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span className="text-xs font-bold uppercase tracking-wider">Clinical Movement Precautions</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {recs.exercise.precautions.map((pre, pidx) => (
                        <div key={pidx} className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-amber-200/50 dark:border-amber-800/30 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0 mt-1.5" />
                          <span className="leading-relaxed">{pre}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SECTION 6: LIFESTYLE TIPS */}
            <Card className="border border-slate-200/80 dark:border-slate-800 shadow-xs rounded-3xl overflow-hidden bg-white dark:bg-slate-900" id="card-lifestyle">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-teal-50/20 dark:bg-teal-950/15 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 rounded-2xl flex-shrink-0">
                    <Lightbulb className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Lifestyle & Daily Habits</CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      Practical daily habits for quality sleep, stress balance, and natural recovery.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 sm:p-6">
                {(() => {
                  const seen = new Set<string>();
                  const removedLifestyleIds = new Set([
                    'life-smoking-never',
                    'life-alcohol-none',
                    'life-musclegain-protein-timing',
                    'life-hearthealth-nitric-oxide'
                  ]);
                  const uniqueTips = recs.lifestyleTips.filter((tip) => {
                    const id = (tip.id || '').toLowerCase();
                    const key = tip.title.trim().toLowerCase();

                    // Remove exactly four redundant, repetitive, or lowest-priority items:
                    // 1. Preserve Mitochondrial Oxygen Delivery
                    if (id === 'life-smoking-never' || key.includes('preserve mitochondrial oxygen delivery')) {
                      return false;
                    }
                    // 2. Optimize Liver Function and Unfragmented Sleep Stages
                    if (id === 'life-alcohol-none' || key.includes('optimize liver function and unfragmented sleep stages')) {
                      return false;
                    }
                    // 3. Distribute Protein Intake Evenly
                    if (id === 'life-musclegain-protein-timing' || key.includes('distribute protein intake evenly')) {
                      return false;
                    }
                    // 4. Boost Vascular Nitric Oxide Biosynthesis
                    if (id === 'life-hearthealth-nitric-oxide' || key.includes('boost vascular nitric oxide biosynthesis')) {
                      return false;
                    }

                    if (removedLifestyleIds.has(id)) return false;
                    if (seen.has(key)) return false;
                    seen.add(key);
                    return true;
                  });

                  if (uniqueTips.length === 0) {
                    return (
                      <EmptyState
                        title="No Lifestyle Adaptations Triggered"
                        description="No special circadian adjustments or lifestyle tips are suggested at this moment. Maintain standard wellness cycles."
                        id="recs-lifestyle-empty-state"
                      />
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4" id="lifestyle-items-list">
                      {uniqueTips.map((tip) => {
                        const lifeData = getLifestyleCardData(tip);
                        const cardKey = `life-${tip.id}`;
                        const isExpanded = Boolean(expandedCards[cardKey]);

                        return (
                          <div 
                            key={tip.id} 
                            className="p-3.5 sm:p-5 bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex flex-col gap-2.5 sm:gap-3 shadow-xs hover:border-teal-500/30 transition-all duration-200"
                          >
                            {/* Top meta */}
                            <div className="flex items-center justify-between gap-1.5 flex-wrap">
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] sm:text-3xs font-semibold uppercase tracking-wider bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                                {lifeData.categoryTag}
                              </span>
                              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-500 flex-shrink-0" />
                            </div>

                            {/* Habit Title */}
                            <h4 className="text-xs sm:text-sm md:text-base font-bold text-slate-900 dark:text-white leading-snug break-words">
                              {lifeData.title}
                            </h4>

                            {/* Short Reason */}
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                              <strong className="font-semibold text-slate-800 dark:text-slate-200">Why it helps:</strong> {lifeData.shortReason}
                            </p>

                            {/* Progressive Disclosure */}
                            <button
                              type="button"
                              onClick={() => toggleCard(cardKey)}
                              className="mt-auto pt-2 flex items-center justify-between text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 min-h-[44px] cursor-pointer group transition-colors select-none"
                              aria-expanded={isExpanded}
                            >
                              <span>{isExpanded ? 'Hide details' : 'Learn more'}</span>
                              <ChevronDown className={`w-4 h-4 transition-transform duration-200 group-hover:translate-y-0.5 ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>

                            {isExpanded && (
                              <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2.5 text-xs leading-relaxed animate-fade-in">
                                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-150/70 dark:border-slate-800/70 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                                  <Lightbulb className="w-3.5 h-3.5 text-teal-500 flex-shrink-0 mt-0.5" />
                                  <span><strong className="font-semibold text-slate-800 dark:text-slate-200">Recommended action:</strong> {lifeData.practicalAction}</span>
                                </div>

                                <div className="p-3 rounded-xl bg-teal-500/5 dark:bg-teal-950/20 border border-teal-500/15 dark:border-teal-900/30 text-slate-600 dark:text-slate-400">
                                  <span className="font-bold text-teal-800 dark:text-teal-300 block mb-1">Context & Details</span>
                                  <p>{lifeData.clinicalNote}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
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
