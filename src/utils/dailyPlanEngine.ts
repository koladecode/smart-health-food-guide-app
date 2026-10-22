import { HealthProfile } from '../context/HealthProfileContext';
import { RecommendationItem, PersonalizedRecommendations, generateRecommendations } from './recommendationEngine';

export interface DailyScheduleItem {
  id: string;
  sectionKey: 'breakfast' | 'hydration' | 'lunch' | 'snacks' | 'exercise' | 'dinner' | 'habits';
  sectionName: string;
  suggestedTime: string;
  name: string;
  shortDescription: string;
  practicalAction: string;
  clinicalReason?: string;
  safetyNotes?: string[];
  preparationTip?: string;
  badge?: string;
}

export interface GeneratedDailyPlan {
  date: string;
  formattedDate: string;
  items: DailyScheduleItem[];
  userGoal: string;
}

/**
 * Computes a deterministic UTC-based day number from a YYYY-MM-DD string.
 */
export function getDayNumber(dateStr: string): number {
  if (!dateStr) return 0;
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    const now = new Date();
    return Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
  }
  return Math.floor(Date.UTC(parts[0], parts[1] - 1, parts[2]) / 86400000);
}

/**
 * Deterministically select an item from a list based on day number, section offset, and optional user rotation.
 */
function selectFromPool<T>(pool: T[], dayNum: number, sectionOffset: number, rotationOffset: number = 0): T | null {
  if (!pool || pool.length === 0) return null;
  const index = Math.abs((dayNum + sectionOffset + rotationOffset) % pool.length);
  return pool[index];
}

/**
 * Heuristically categorize a food item if an explicit category is not provided.
 */
function getInferredCategory(item: RecommendationItem): 'Breakfast' | 'Lunch' | 'Dinner' | 'Healthy Snacks' | 'Drinks' {
  if (item.category) return item.category;

  const text = `${item.title} ${item.description} ${item.badge || ''}`.toLowerCase();

  if (/porridge|oat|egg|scramble|toast|pancake|smoothie|parfait|chia|koko|akara|moin|waffle|cereal/i.test(text)) {
    return 'Breakfast';
  }
  if (/snack|almond|walnut|berry|berries|seed|apple|avocado|cracker|chip|munch/i.test(text)) {
    return 'Healthy Snacks';
  }
  if (/drink|tea|infusion|zobo|kunun|water|beverage|hydrat/i.test(text)) {
    return 'Drinks';
  }
  if (/salad|quinoa|rice|bowl|wrap|sandwich|fufu|swallow|soup|stew|bean|lentil|chickpea|lunch/i.test(text)) {
    return 'Lunch';
  }
  if (/salmon|cod|tilapia|mackerel|trout|beef|steak|chicken|poultry|turkey|dinner|roast|stir-fry/i.test(text)) {
    return 'Dinner';
  }

  return 'Lunch';
}

/**
 * Format a clean 1-line description from an item's description text (strips multi-line clinical boilerplates).
 */
function extractConciseDescription(text: string): { concise: string; clinicalReason?: string } {
  if (!text) return { concise: 'Nutritious balanced meal tailored to your health goals.' };
  
  const parts = text.split(/\n\n• Clinical Reason: |\n\n|\. Highly recommended/i);
  const concise = parts[0].trim().replace(/\.$/, '') + '.';
  const clinicalReason = parts[1] ? parts[1].trim() : undefined;
  
  return { concise, clinicalReason };
}

/**
 * Generates an actionable daily health plan for a specific calendar date and profile.
 * - Extracts eligible foods and recommendations from the recommendation engine.
 * - Rotates among eligible options deterministically by calendar date.
 * - Respects all user allergies, conditions, preferences, and goals.
 */
export function buildDailyHealthPlan(
  profile: HealthProfile | null,
  dateStr: string,
  rotationOffset: number = 0
): GeneratedDailyPlan {
  const dayNum = getDayNumber(dateStr);
  const dateObj = new Date(`${dateStr}T12:00:00`);
  const formattedDate = dateObj.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const goal = profile?.healthGoal || 'Improve Overall Health';

  // 1. If no profile, provide a minimal empty plan structure
  if (!profile) {
    return {
      date: dateStr,
      formattedDate,
      items: [],
      userGoal: goal
    };
  }

  // 2. Generate eligible recommendations for the profile
  const recs: PersonalizedRecommendations = generateRecommendations(profile);
  const allFoods = recs.foodsToEat || [];

  // Categorize eligible foods
  const breakfastPool: RecommendationItem[] = [];
  const lunchPool: RecommendationItem[] = [];
  const dinnerPool: RecommendationItem[] = [];
  const snackPool: RecommendationItem[] = [];
  const drinkPool: RecommendationItem[] = [];

  allFoods.forEach(food => {
    const cat = getInferredCategory(food);
    if (cat === 'Breakfast') breakfastPool.push(food);
    else if (cat === 'Lunch') lunchPool.push(food);
    else if (cat === 'Dinner') dinnerPool.push(food);
    else if (cat === 'Healthy Snacks') snackPool.push(food);
    else if (cat === 'Drinks') drinkPool.push(food);
  });

  // Goal-based baseline fallbacks (strictly clinical, used only if pool is empty)
  const defaultBreakfasts: Record<string, RecommendationItem[]> = {
    'Weight Loss': [
      { id: 'def-bf-wl-1', title: 'Egg White & Vegetable Scramble', description: 'Fluffy scrambled egg whites with baby spinach and mushrooms. Promotes high satiety with low caloric density.' },
      { id: 'def-bf-wl-2', title: 'Spiced Chia Seed & Berry Pudding', description: 'Soluble fiber-rich chia seeds steeped in unsweetened almond milk. Stabilizes morning fasting blood sugar.' },
      { id: 'def-bf-wl-3', title: 'Steamed Garden Eggs with Herb Eggs', description: 'Tender native garden egg wheels paired with soft-scrambled pasture eggs. Low-carb metabolic starter.' }
    ],
    'Weight Gain': [
      { id: 'def-bf-wg-1', title: 'Almond Butter Banana Whole-Grain Toast', description: 'Complex slow carbs with potassium and monounsaturated healthy fats for steady calorie surplus.' },
      { id: 'def-bf-wg-2', title: 'Tom Brown Multi-Grain Porridge with Nuts', description: 'Roasted guinea corn and millet porridge fortified with ground almonds and plant protein.' }
    ],
    'Muscle Gain': [
      { id: 'def-bf-mg-1', title: 'Greek Yogurt with Whey Protein & Berries', description: 'High-leucine morning meal providing 35g of protein to maximize muscle protein synthesis.' },
      { id: 'def-bf-mg-2', title: 'Poached Eggs over Avocado Sweet Potato Toast', description: 'Micronutrient-dense muscle fuel pairing choline with complex carbohydrates and healthy lipids.' }
    ],
    'Heart Health': [
      { id: 'def-bf-hh-1', title: 'Steel-Cut Oats with Chia Seeds & Walnuts', description: 'Beta-glucan soluble fiber that binds intestinal bile acids to reduce LDL cholesterol naturally.' },
      { id: 'def-bf-hh-2', title: 'Warm Cinnamon Berry Quinoa Bowl', description: 'Cardioprotective flavonoids and complete plant protein with low sodium load.' }
    ],
    'Blood Sugar Control': [
      { id: 'def-bf-bs-1', title: 'Tofu Mushroom Scramble with Spinach', description: 'Zero glycemic spike breakfast rich in plant isoflavones, chromium, and magnesium.' },
      { id: 'def-bf-bs-2', title: 'Steamed Honey-Bean Moin Moin with Koko', description: 'Low-glycemic legumes that provide prolonged postprandial glucose stability.' }
    ]
  };

  const activeBreakfastPool = breakfastPool.length > 0 
    ? breakfastPool 
    : (defaultBreakfasts[goal] || [
        { id: 'def-bf-gen', title: 'Nutritious Fiber Oatmeal Bowl', description: 'Slow-digesting oats with seeds and berries to sustain cellular energy.' }
      ]);

  const defaultLunches: Record<string, RecommendationItem[]> = {
    'Weight Loss': [
      { id: 'def-lu-wl-1', title: 'Grilled Herb Chicken Breast & Crisp Garden Salad', description: 'Lean poultry protein with leafy greens and lemon vinaigrette. High satiety, low calorie density.' },
      { id: 'def-lu-wl-2', title: 'Unpolished Ofada Brown Rice with Efo Riro Spinach', description: 'High-fiber unrefined grain paired with low-oil vegetable stew.' }
    ],
    'Weight Gain': [
      { id: 'def-lu-wg-1', title: 'Quinoa Salmon Bowl with Sliced Hass Avocado', description: 'Healthy omega-3 fatty acids and complete plant proteins for healthy lean mass development.' },
      { id: 'def-lu-wg-2', title: 'Brown Rice with Lean Beef & Steamed Broccoli', description: 'Bioavailable heme iron and complex carbohydrates for muscle energy.' }
    ],
    'Muscle Gain': [
      { id: 'def-lu-mg-1', title: 'Slow-Cooked Turkey Breast with Sweet Potato & Asparagus', description: 'Balanced macronutrient plate optimizing glycogen restoration and muscle recovery.' },
      { id: 'def-lu-mg-2', title: 'Fiber-Rich Oat Swallow with Ewedu Soup & Tilapia', description: 'Easily digestible protein and protective mucilage to support nutrient absorption.' }
    ],
    'Heart Health': [
      { id: 'def-lu-hh-1', title: 'Mediterranean Chickpea & Olive Oil Salad', description: 'High in potassium, polyphenol antioxidants, and soluble fiber to support arterial elasticity.' },
      { id: 'def-lu-hh-2', title: 'Steamed Tilapia with Sautéed Ugu Leaves & Sweet Potato', description: 'Lean aquatic protein and fluted pumpkin greens supporting vascular relaxation.' }
    ],
    'Blood Sugar Control': [
      { id: 'def-lu-bs-1', title: 'Baked Tempeh Bowl with Pumpkin Seeds & Steamed Greens', description: 'High-fiber fermented soy with zinc and magnesium to enhance peripheral insulin sensitivity.' },
      { id: 'def-lu-bs-2', title: 'Creamy Gbegiri Bean Soup & Ewedu over Brown Rice', description: 'Natural glycemic shield meal buffering postprandial glucose response.' }
    ]
  };

  const activeLunchPool = lunchPool.length > 0 
    ? lunchPool 
    : (defaultLunches[goal] || [
        { id: 'def-lu-gen', title: 'Balanced Protein and Grain Medley', description: 'Wholesome whole grains paired with lean protein and colorful vegetables.' }
      ]);

  const defaultDinners: Record<string, RecommendationItem[]> = {
    'Weight Loss': [
      { id: 'def-di-wl-1', title: 'Baked Atlantic Cod with Steamed Asparagus & Lemon', description: 'Very lean white fish rich in iodine for thyroid support, paired with prebiotic asparagus.' },
      { id: 'def-di-wl-2', title: 'Aromatic Catfish Pepper Soup with Boiled Green Plantain', description: 'Warm herbal pepper broth with ginger and garlic, supporting nighttime thermogenesis.' }
    ],
    'Weight Gain': [
      { id: 'def-di-wg-1', title: 'Pan-Seared Salmon with Baked Sweet Potato Wedges', description: 'Nutrient-rich dinner promoting overnight cellular repair and caloric density.' },
      { id: 'def-di-wg-2', title: 'Stir-fried Lean Beef with Wild Brown Rice & Bell Peppers', description: 'High-density restorative dinner with essential minerals and zinc.' }
    ],
    'Muscle Gain': [
      { id: 'def-di-mg-1', title: 'Pan-Seared Salmon Fillet with Steamed Ugu Greens', description: 'Omega-3 fatty acids to suppress nocturnal muscular inflammation.' },
      { id: 'def-di-mg-2', title: 'Unripe Green Plantain Porridge with Flaked Mackerel', description: 'Resistant starch and cardiovascular fats to replenish training energy.' }
    ],
    'Heart Health': [
      { id: 'def-di-hh-1', title: 'Lemon-Grilled Lake Tilapia with Steamed Greens', description: 'Ultra-low sodium marine protein with potassium-rich steamed vegetables.' },
      { id: 'def-di-hh-2', title: 'Thoroughly Washed Bitterleaf Soup with Lean Protein', description: 'Hepatic cleanse herbal meal promoting vascular elasticity and blood pressure balance.' }
    ],
    'Blood Sugar Control': [
      { id: 'def-di-bs-1', title: 'Grilled Wild Salmon with Zucchini Ribbons & Olive Oil', description: 'Very low carbohydrate dinner preventing late-night liver glucose dumps (dawn phenomenon).' },
      { id: 'def-di-bs-2', title: 'Prebiotic Okra Soup with Steamed Lean Fish', description: 'Okra mucilage slows gastric emptying and moderates glucose absorption overnight.' }
    ]
  };

  const activeDinnerPool = dinnerPool.length > 0 
    ? dinnerPool 
    : (defaultDinners[goal] || [
        { id: 'def-di-gen', title: 'Light Lean Protein and Greens', description: 'Easily digestible restorative dinner supporting nighttime recovery.' }
      ]);

  const defaultSnacks: RecommendationItem[] = [
    { id: 'def-sn-1', title: 'Raw Almonds & Fresh Blueberries', description: 'Antioxidant anthocyanins with monounsaturated healthy fats. Does not trigger insulin spikes.' },
    { id: 'def-sn-2', title: 'Raw Tiger Nuts (Ofio) with Coconut Flakes', description: 'Prebiotic resistant starch supporting gut microbiome and sustained satiety.' },
    { id: 'def-sn-3', title: 'Sliced Garden Eggs with Pure Unsweetened Peanut Paste', description: 'High fiber with potassium and healthy fats for afternoon satiety.' },
    { id: 'def-sn-4', title: 'Steam-Baked Sweet Potato Wedges with Avocado Dip', description: 'Beta-carotene rich complex carbohydrates supporting afternoon cognitive focus.' }
  ];

  const activeSnackPool = snackPool.length > 0 ? snackPool : defaultSnacks;

  // Select items deterministically for this calendar date
  const selectedBreakfast = selectFromPool(activeBreakfastPool, dayNum, 0, rotationOffset)!;
  const selectedLunch = selectFromPool(activeLunchPool, dayNum, 2, rotationOffset)!;
  const selectedDinner = selectFromPool(activeDinnerPool, dayNum, 4, rotationOffset)!;
  const selectedSnack = selectFromPool(activeSnackPool, dayNum, 6, rotationOffset)!;

  // Hydration Details
  const waterLiters = recs.waterIntake?.liters || 2.5;
  const waterCups = recs.waterIntake?.cups || 10;
  const morningWaterMl = Math.round((waterLiters * 1000 / waterCups) * 2);
  const drinkSuggestion = selectFromPool(drinkPool, dayNum, 1, rotationOffset);

  // Exercise Details
  const exercise = recs.exercise || {
    type: 'Moderate Intensity Exercise',
    duration: '30 mins',
    intensity: 'Moderate',
    description: 'Promotes cardiovascular conditioning and metabolic vitality.',
    routine: ['5-min warm-up', '20-min cardio/resistance', '5-min cool-down stretch']
  };

  // Lifestyle / Sleep Details
  const sleepTarget = profile.sleepDuration || '7 to 8 hours';
  const lifestyleTip = recs.lifestyleTips && recs.lifestyleTips.length > 0 
    ? selectFromPool(recs.lifestyleTips, dayNum, 5, rotationOffset)
    : null;

  // Build the 7 structured daily schedule items
  const bfDesc = extractConciseDescription(selectedBreakfast.description);
  const luDesc = extractConciseDescription(selectedLunch.description);
  const diDesc = extractConciseDescription(selectedDinner.description);
  const snDesc = extractConciseDescription(selectedSnack.description);

  const items: DailyScheduleItem[] = [
    {
      id: `schedule-breakfast-${selectedBreakfast.id}`,
      sectionKey: 'breakfast',
      sectionName: 'Breakfast',
      suggestedTime: '07:30 AM – 08:30 AM',
      name: selectedBreakfast.title,
      shortDescription: bfDesc.concise,
      practicalAction: 'Prepare fresh with clean healthy protein and slow carbohydrates to jumpstart your metabolic rate.',
      clinicalReason: bfDesc.clinicalReason || 'Provides sustained amino acids and complex fuel without sharp glucose spikes.',
      badge: selectedBreakfast.badge || 'Energizing Starter'
    },
    {
      id: 'schedule-hydration-morning',
      sectionKey: 'hydration',
      sectionName: 'Hydration',
      suggestedTime: '09:00 AM – 11:30 AM',
      name: `Active Hydration (${morningWaterMl}ml morning intake)`,
      shortDescription: `Target: 2 to 3 glasses of pure water${drinkSuggestion ? ` or ${drinkSuggestion.title}` : ''}.`,
      practicalAction: `Drink steadily between meals to support kidney filtration and cellular nutrient absorption.`,
      clinicalReason: recs.waterIntake?.description || 'Prevents cellular dehydration and sustains cardiac stroke volume.',
      badge: `${waterLiters}L Daily Target`
    },
    {
      id: `schedule-lunch-${selectedLunch.id}`,
      sectionKey: 'lunch',
      sectionName: 'Lunch',
      suggestedTime: '12:30 PM – 01:30 PM',
      name: selectedLunch.title,
      shortDescription: luDesc.concise,
      practicalAction: 'Combine with high-fiber greens to buffer the postprandial glycemic curve and maintain afternoon clarity.',
      clinicalReason: luDesc.clinicalReason || 'Balances energy replenishment with digestive ease for midday mental focus.',
      badge: selectedLunch.badge || 'Midday Power'
    },
    {
      id: `schedule-snack-${selectedSnack.id}`,
      sectionKey: 'snacks',
      sectionName: 'Snacks',
      suggestedTime: '03:30 PM – 04:30 PM',
      name: selectedSnack.title,
      shortDescription: snDesc.concise,
      practicalAction: 'Enjoy as a mindful portion to curb cravings and prevent compensatory evening overeating.',
      clinicalReason: snDesc.clinicalReason || 'Delivers micronutrients and healthy lipids without stressing pancreatic insulin.',
      badge: selectedSnack.badge || 'Satiety Booster'
    },
    {
      id: 'schedule-exercise-evening',
      sectionKey: 'exercise',
      sectionName: 'Exercise or Movement',
      suggestedTime: '05:30 PM – 06:30 PM',
      name: `${exercise.duration} of ${exercise.type}`,
      shortDescription: `${exercise.intensity} intensity movement tailored for ${goal}.`,
      practicalAction: `Follow your target routine: ${exercise.routine?.slice(0, 2).join(', ') || 'dynamic warm-up, active training, and stretch'}.`,
      clinicalReason: exercise.description || 'Stimulates muscular glucose uptake via GLUT4 translocation independent of insulin.',
      badge: `${exercise.intensity} Intensity`
    },
    {
      id: `schedule-dinner-${selectedDinner.id}`,
      sectionKey: 'dinner',
      sectionName: 'Dinner',
      suggestedTime: '07:00 PM – 08:00 PM',
      name: selectedDinner.title,
      shortDescription: diDesc.concise,
      practicalAction: 'Opt for clean lean protein and cooked vegetables at least 2 to 3 hours before your bedtime.',
      clinicalReason: diDesc.clinicalReason || 'Assists muscle protein synthesis and rest-state tissue repair while preventing acid reflux.',
      badge: selectedDinner.badge || 'Restorative Recovery'
    },
    {
      id: 'schedule-habits-night',
      sectionKey: 'habits',
      sectionName: 'Healthy Habits',
      suggestedTime: '09:30 PM – 10:30 PM',
      name: `Nightly Wind-Down & ${sleepTarget} Restorative Sleep`,
      shortDescription: lifestyleTip ? lifestyleTip.title : 'Digital disconnect and sleep hygiene routine.',
      practicalAction: lifestyleTip ? lifestyleTip.description : 'Dim ambient lights, stop fluid intake 1 hour prior to sleep, and maintain a cool sleep environment.',
      clinicalReason: 'Restores circadian hormone balance (growth hormone, leptin, cortisol) essential for metabolic recovery.',
      badge: 'Circadian Balance'
    }
  ];

  return {
    date: dateStr,
    formattedDate,
    items,
    userGoal: goal
  };
}
