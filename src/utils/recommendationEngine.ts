import { HealthProfile } from '../context/HealthProfileContext';

export interface RecommendationItem {
  id: string;
  title: string;
  description: string;
  badge?: string;
  category?: 'Breakfast' | 'Lunch' | 'Dinner' | 'Healthy Snacks' | 'Drinks';
}

export interface WaterIntakeRecommendation {
  liters: number;
  cups: number;
  description: string;
  tips: string[];
}

export interface ExerciseRecommendation {
  type: string;
  frequency: string;
  duration: string;
  intensity: string;
  description: string;
  routine: string[];
  precautions: string[];
}

export interface PersonalizedRecommendations {
  bmiValue: number;
  bmiCategory: string;
  foodsToEat: RecommendationItem[];
  foodsToAvoid: RecommendationItem[];
  healthyCombinations: RecommendationItem[];
  waterIntake: WaterIntakeRecommendation;
  exercise: ExerciseRecommendation;
  lifestyleTips: RecommendationItem[];
}

/**
 * Robust allergy safety filter that analyzes titles, descriptions, and badges.
 */
function isAllergySafe(
  title: string,
  description: string,
  badge: string,
  allergies: string[]
): boolean {
  if (!allergies || allergies.length === 0) return true;
  const normAllergies = allergies.filter(Boolean).map(a => a.toLowerCase().trim());
  if (normAllergies.includes('none') && normAllergies.length === 1) return true;

  const combinedText = `${title} ${description} ${badge}`.toLowerCase();

  if (normAllergies.includes('peanuts') && (combinedText.includes('peanut') || combinedText.includes('arachis') || combinedText.includes('groundnut'))) {
    return false;
  }
  if ((normAllergies.includes('tree_nuts') || normAllergies.includes('tree nuts')) && (
    combinedText.includes('almond') || 
    combinedText.includes('walnut') || 
    combinedText.includes('cashew') || 
    combinedText.includes('macadamia') || 
    combinedText.includes('pecan') || 
    combinedText.includes('pistachio') ||
    combinedText.includes('hazelnut') ||
    combinedText.includes('tree nut') ||
    combinedText.includes('nut butter')
  )) {
    return false;
  }
  if (normAllergies.includes('gluten') && (
    combinedText.includes('gluten') || 
    combinedText.includes('wheat') || 
    combinedText.includes('barley') || 
    combinedText.includes('rye') || 
    combinedText.includes('spelt') || 
    combinedText.includes('bran') ||
    combinedText.includes('pasta') ||
    combinedText.includes('bread') ||
    combinedText.includes('sourdough')
  )) {
    return false;
  }
  if (normAllergies.includes('dairy') && (
    combinedText.includes('dairy') || 
    combinedText.includes('milk') || 
    combinedText.includes('butter') || 
    combinedText.includes('cheese') || 
    combinedText.includes('yogurt') || 
    combinedText.includes('kefir') || 
    combinedText.includes('whey') || 
    combinedText.includes('cream') ||
    combinedText.includes('lactose') ||
    combinedText.includes('paneer')
  )) {
    return false;
  }
  if (normAllergies.includes('soy') && (
    combinedText.includes('soy') || 
    combinedText.includes('tofu') || 
    combinedText.includes('tempeh') || 
    combinedText.includes('edamame') || 
    combinedText.includes('miso') || 
    combinedText.includes('lecithin')
  )) {
    return false;
  }
  if (normAllergies.includes('eggs') && (
    combinedText.includes('egg') || 
    combinedText.includes('albumen') || 
    combinedText.includes('mayo')
  )) {
    return false;
  }
  if (normAllergies.includes('shellfish') && (
    combinedText.includes('shellfish') || 
    combinedText.includes('shrimp') || 
    combinedText.includes('lobster') || 
    combinedText.includes('crab') || 
    combinedText.includes('oyster') || 
    combinedText.includes('mussel') || 
    combinedText.includes('clam') || 
    combinedText.includes('prawn') ||
    combinedText.includes('periwinkle')
  )) {
    return false;
  }

  // Generic custom allergy fallback checks
  const standardAllergies = ['peanuts', 'tree_nuts', 'tree nuts', 'gluten', 'dairy', 'soy', 'eggs', 'shellfish', 'none'];
  for (const allergy of normAllergies) {
    if (!allergy || standardAllergies.includes(allergy)) {
      continue;
    }
    const cleanAllergy = allergy.replace(/_/g, ' ').trim();
    if (!cleanAllergy) continue;

    if (combinedText.includes(cleanAllergy)) {
      return false;
    }

    // Check individual words in multi-word custom allergies if at least 3 characters
    const words = cleanAllergy.split(/\s+/).filter(w => w.length > 2);
    for (const word of words) {
      if (combinedText.includes(word)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Filter that enforces dietary preferences.
 */
function isDietaryFriendly(
  title: string,
  description: string,
  diet: string
): boolean {
  const normDiet = diet.toLowerCase();
  const text = `${title} ${description}`.toLowerCase();

  if (normDiet === 'vegan') {
    if (
      text.includes('chicken') || 
      text.includes('poultry') || 
      text.includes('beef') || 
      text.includes('bison') || 
      text.includes('meat') || 
      text.includes('fish') || 
      text.includes('salmon') || 
      text.includes('sardine') || 
      text.includes('seafood') || 
      text.includes('shrimp') || 
      text.includes('egg') || 
      text.includes('kefir') || 
      text.includes('yogurt') || 
      text.includes('milk') || 
      text.includes('cheese') || 
      text.includes('dairy') || 
      text.includes('collagen') || 
      text.includes('bone broth') || 
      text.includes('whey')
    ) {
      return false;
    }
  }

  if (normDiet === 'vegetarian') {
    if (
      text.includes('chicken') || 
      text.includes('poultry') || 
      text.includes('beef') || 
      text.includes('bison') || 
      text.includes('meat') || 
      text.includes('fish') || 
      text.includes('salmon') || 
      text.includes('sardine') || 
      text.includes('seafood') || 
      text.includes('shrimp') || 
      text.includes('collagen') || 
      text.includes('bone broth')
    ) {
      return false;
    }
  }

  if (normDiet === 'keto') {
    if (
      text.includes('sweet potato') || 
      text.includes('quinoa') || 
      text.includes('oat') || 
      text.includes('rice') || 
      text.includes('banana') || 
      text.includes('sugar') || 
      text.includes('maple') || 
      text.includes('honey') || 
      text.includes('pasta') || 
      text.includes('bread') || 
      text.includes('lentils') || 
      text.includes('beans')
    ) {
      return false;
    }
  }

  if (normDiet === 'paleo') {
    if (
      text.includes('oat') || 
      text.includes('quinoa') || 
      text.includes('rice') || 
      text.includes('wheat') || 
      text.includes('lentils') || 
      text.includes('beans') || 
      text.includes('soy') || 
      text.includes('tofu') || 
      text.includes('tempeh') || 
      text.includes('dairy') || 
      text.includes('milk') || 
      text.includes('yogurt') || 
      text.includes('kefir') || 
      text.includes('cheese') || 
      text.includes('bread') || 
      text.includes('pasta')
    ) {
      return false;
    }
  }

  return true;
}

export function generateRecommendations(profile: HealthProfile): PersonalizedRecommendations {
  const weight = Number(profile.weight) || 0;
  const height = Number(profile.height) || 0;
  const age = Number(profile.age) || 30;
  const gender = profile.gender || 'Other';
  const activity = profile.activityLevel || 'Moderately Active';
  const goal = profile.healthGoal || 'Improve Overall Health';
  const conditions = profile.healthConditions || ['none'];
  const allergies = profile.foodAllergies || ['none'];
  const diet = profile.dietaryPreference || 'None';

  const isWeightLoss = goal === 'Weight Loss' || goal === 'Lose Weight';
  const isWeightGain = goal === 'Weight Gain' || goal === 'Gain Weight';
  const isMuscleGain = goal === 'Muscle Gain';
  const isOverallHealth = goal === 'Improve Overall Health';
  const isHeartHealth = goal === 'Heart Health';
  const isBloodSugarControl = goal === 'Blood Sugar Control';

  const normConditions = conditions.map(c => c.toLowerCase());
  const normAllergies = allergies.map(a => a.toLowerCase());
  const isFemale = gender.toLowerCase() === 'female';
  const isMale = gender.toLowerCase() === 'male';

  // 1. BMI Calculation & Category
  let bmiValue = 0;
  let bmiCategory = 'Unknown';
  if (weight > 0 && height > 0) {
    const heightInMeters = height / 100;
    bmiValue = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
    if (bmiValue < 18.5) {
      bmiCategory = 'Underweight';
    } else if (bmiValue < 25) {
      bmiCategory = 'Healthy Weight';
    } else if (bmiValue < 30) {
      bmiCategory = 'Overweight';
    } else {
      bmiCategory = 'Obese';
    }
  }

  // 2. Resolve Health Condition Flags
  const hasDiabetes = normConditions.includes('diabetes');
  const hasHypertension = normConditions.includes('hypertension');
  const hasCholesterol = normConditions.includes('cholesterol');
  const hasHeart = normConditions.includes('heart');
  const hasKidney = normConditions.includes('kidney');
  const hasAsthma = normConditions.includes('asthma');
  const hasGastro = normConditions.includes('gastro');

  // 3. Generate "Foods to Eat" List
  const rawFoodsToEat: RecommendationItem[] = [];

  // Diet-Based Core Recommendations
  if (diet === 'Vegan') {
    rawFoodsToEat.push({
      id: 'eat-tempeh-core',
      title: 'Organic Tempeh & Extra Firm Tofu',
      description: 'Clean plant-based protein with high amino-acid profiles and prebiotics that protect gut flora.',
      badge: 'Plant Protein'
    });
    rawFoodsToEat.push({
      id: 'eat-quinoa-core',
      title: 'Sprouted Quinoa & Amaranth',
      description: 'Gluten-free complete protein source containing a complex grain structure and minerals.',
      badge: 'Whole Grains'
    });
  } else if (diet === 'Vegetarian') {
    rawFoodsToEat.push({
      id: 'eat-eggs-core',
      title: 'Pasture-Raised Whole Eggs',
      description: 'High-quality source of proteins, vitamin D, and choline, which enhances cognitive retention.',
      badge: 'Premium Protein'
    });
    rawFoodsToEat.push({
      id: 'eat-greek-yogurt-core',
      title: 'Unsweetened Greek Yogurt',
      description: 'Double the protein of standard yogurt, packed with active bacterial cultures for digestion.',
      badge: 'Gut Health'
    });
  } else if (diet === 'Keto') {
    rawFoodsToEat.push({
      id: 'eat-avocados-core',
      title: 'Hass Avocados & Cold-Pressed Olive Oil',
      description: 'Monounsaturated healthy fatty acids, packed with potassium to stabilize cellular hydration.',
      badge: 'Keto Essential Fats'
    });
    rawFoodsToEat.push({
      id: 'eat-salmon-core',
      title: 'Wild-Caught Cold-Water Salmon',
      description: 'Loaded with healthy anti-inflammatory Omega-3 fats (EPA & DHA) and high-quality clean proteins.',
      badge: 'Healthy Protein'
    });
  } else if (diet === 'Paleo') {
    rawFoodsToEat.push({
      id: 'eat-grassfed-poultry-core',
      title: 'Grass-Fed Poultry & Bison',
      description: 'Pure bioavailable minerals (iron, zinc, B-vitamins) without synthetic agricultural residues.',
      badge: 'Paleo Protein'
    });
    rawFoodsToEat.push({
      id: 'eat-mixed-berries-core',
      title: 'Wild Blueberries & Blackberries',
      description: 'Low glycemic organic sugars rich in polyphenols and vital health antioxidants.',
      badge: 'Phytonutrients'
    });
  } else {
    // Standard Balanced, Halal, Kosher
    rawFoodsToEat.push({
      id: 'eat-salmon-balanced',
      title: 'Wild-Caught Salmon & Mackerel',
      description: 'Sufficient essential fatty acids (Omega-3) to maintain heart rhythm and lower arterial plaque.',
      badge: 'Cardiovascular Support'
    });
    rawFoodsToEat.push({
      id: 'eat-chicken-breast-balanced',
      title: 'Lean Skinless Chicken Breast',
      description: 'Pure essential amino acids necessary for physical recovery, tissue healing, and cellular maintenance.',
      badge: 'Lean Protein'
    });
    rawFoodsToEat.push({
      id: 'eat-sweet-potato-balanced',
      title: 'Slow-Release Sweet Potatoes',
      description: 'A great source of beta-carotene, delivering slow, complex carbohydrates for muscular fuel.',
      badge: 'Complex Carbohydrate'
    });
  }

  // Health-Goal Additions
  if (isWeightLoss) {
    rawFoodsToEat.push({
      id: 'eat-cruciferous-goal',
      title: 'Cruciferous Vegetables (Broccoli & Cauliflower)',
      description: 'Provides high food volume, cellular hydration, and fiber to trigger stomach stretch receptors while maintaining a low calorie density.',
      badge: 'Weight Management'
    });
    rawFoodsToEat.push({
      id: 'eat-chia-goal',
      title: 'Organic Chia & Flax Seeds',
      description: 'Absorbs up to 10x their weight in water, expanding in the GI tract to slow digestion and support prolonged satiety.',
      badge: 'High Satiety Fiber'
    });
    rawFoodsToEat.push({
      id: 'eat-lean-chicken-breast-wl',
      title: 'Lean Skinless Chicken Breast',
      description: 'High thermic effect of food (TEF) and essential proteins to preserve lean body mass during a caloric deficit.',
      badge: 'Satiety Protein'
    });
  } else if (isWeightGain) {
    rawFoodsToEat.push({
      id: 'eat-nut-butter-goal',
      title: 'Natural Almond & Cashew Butter',
      description: 'Highly energy-dense source of micronutrients and clean fats, helping easily meet surplus calorie targets.',
      badge: 'Caloric Density'
    });
    rawFoodsToEat.push({
      id: 'eat-oats-goal',
      title: 'Steel-Cut Oats & Raw Seeds',
      description: 'Packed with dense carbohydrates and minerals to feed muscular recovery and sustain progressive exercise loads.',
      badge: 'Glycogen Support'
    });
  } else if (isMuscleGain) {
    rawFoodsToEat.push({
      id: 'eat-tempeh-mg',
      title: 'Organic Tempeh or Grass-Fed Bison',
      description: 'High in creatine, zinc, iron, and rich branch-chain amino acids (BCAAs) that directly signal muscle protein synthesis.',
      badge: 'Muscle Hypertrophy'
    });
    rawFoodsToEat.push({
      id: 'eat-egg-whites-mg',
      title: 'Pasture-Raised Eggs or Whey Isolated Protein',
      description: 'Highest biological value (BV) protein that is rapidly absorbed by damaged muscle fibers to accelerate strength recovery.',
      badge: 'Anabolic Recovery'
    });
  } else if (isOverallHealth) {
    rawFoodsToEat.push({
      id: 'eat-sauerkraut-goal',
      title: 'Raw Fermented Sauerkraut or Kefir',
      description: 'Inoculates the gastrointestinal microbiome with beneficial bacteria, supporting systemic immune functions.',
      badge: 'Microbiome Shield'
    });
    rawFoodsToEat.push({
      id: 'eat-leafy-greens-goal',
      title: 'Dark Organic Leafy Greens (Kale & Arugula)',
      description: 'Concentrated source of non-heme iron, lutein, vitamin K, and magnesium to protect bones and blood vessels.',
      badge: 'Antioxidant Defense'
    });
  } else if (isHeartHealth) {
    rawFoodsToEat.push({
      id: 'eat-extra-virgin-olive-oil-hh',
      title: 'Cold-Pressed Extra Virgin Olive Oil',
      description: 'Rich in polyphenols and monounsaturated oleic acid, which helps raise protective HDL cholesterol and reduce arterial plaque.',
      badge: 'Vascular Protection'
    });
    rawFoodsToEat.push({
      id: 'eat-wild-salmon-hh',
      title: 'Wild-Caught Salmon & Sardines',
      description: 'Contains high levels of EPA and DHA Omega-3 fatty acids, which regulate heartbeat rhythm and decrease resting heart rate.',
      badge: 'Cardioprotection'
    });
  } else if (isBloodSugarControl) {
    rawFoodsToEat.push({
      id: 'eat-cinnamon-apple-cider-bs',
      title: 'Organic Apple Cider Vinegar & Ceylon Cinnamon',
      description: 'ACV delays gastric emptying to slow carbohydrate digestion, while cinnamon acts as an insulin-mimetic to pull glucose into cells.',
      badge: 'Glycemic Shield'
    });
    rawFoodsToEat.push({
      id: 'eat-chia-flax-seeds-bs',
      title: 'Soaked Chia & Flax Seeds',
      description: 'Gel-forming soluble fibers that coat the intestinal walls, slowing down starch breakdown and smoothing glucose levels.',
      badge: 'Insulin Sensitivity'
    });
  }

  // BMI-specific Additions
  if (bmiCategory === 'Underweight') {
    rawFoodsToEat.push({
      id: 'eat-avocados-bmi',
      title: 'Whole Hass Avocados',
      description: 'Excellent source of healthy monounsaturated fats that safely boost calorie intake without overloading organs with sugars.',
      badge: 'BMI Optimization'
    });
  } else if (bmiCategory === 'Overweight' || bmiCategory === 'Obese') {
    rawFoodsToEat.push({
      id: 'eat-celery-bmi',
      title: 'Fresh Celery, Cucumber & Arugula',
      description: 'Extremely high in hydration and fiber, perfect for volume eating to safely maintain caloric deficits.',
      badge: 'Cellular Volume'
    });
  }

  // Age-specific Additions
  if (age < 30) {
    rawFoodsToEat.push({
      id: 'eat-cocoa-age',
      title: 'Raw Organic Cacao Nibs',
      description: 'Rich in magnesium and active flavanols that boost brain blood flow, supporting focus and intense exercise.',
      badge: 'Cognitive & Energy Support'
    });
  } else if (age >= 30 && age <= 50) {
    rawFoodsToEat.push({
      id: 'eat-greentea-age',
      title: 'Organic Matcha Green Tea',
      description: 'Abundant in EGCG catechins, which active cellular longevity pathways, supporting metabolic efficiency through middle age.',
      badge: 'Antioxidant Longevity'
    });
  } else if (age > 50) {
    rawFoodsToEat.push({
      id: 'eat-collagen-age',
      title: 'Slow-Simmered Bone Broth',
      description: 'Rich in key amino acids glycine, proline, and hydroxyproline, which preserve joint cartilage and support vascular wall elasticity.',
      badge: 'Structural Protection'
    });
    rawFoodsToEat.push({
      id: 'eat-blueberries-age',
      title: 'Fresh Wild Blueberries',
      description: 'Polyphenol-dense compounds shown to easily pass the blood-brain barrier, providing vital cognitive protection.',
      badge: 'Neuroprotection'
    });
  }

  // Gender-specific Additions
  if (isFemale) {
    if (age <= 50) {
      rawFoodsToEat.push({
        id: 'eat-lentils-gender',
        title: 'Sprouted Red Lentils',
        description: 'Excellent plant sources of heme-free iron and active folate, supporting hormonal balance and cellular division.',
        badge: 'Female Health: Iron Support'
      });
    } else {
      rawFoodsToEat.push({
        id: 'eat-sesame-gender',
        title: 'Unhulled Sesame Seeds',
        description: 'Packed with highly bioavailable plant calcium, helping preserve bone mineral density during aging.',
        badge: 'Female Health: Bone Shield'
      });
    }
  } else if (isMale) {
    rawFoodsToEat.push({
      id: 'eat-pumpkin-gender',
      title: 'Raw Pumpkin Seeds (Pepitas)',
      description: 'Concentrated sources of dietary zinc and selenium, supporting prostate health and healthy testosterone synthesis.',
      badge: 'Male Health: Endocrine Aid'
    });
  }

  // Safe Multi-Condition Additions & Merge Logic
  if (hasDiabetes) {
    rawFoodsToEat.push({
      id: 'eat-cinnamon-diabetes',
      title: 'Ceylon Cinnamon & Apple Cider Vinegar',
      description: 'Helps sensitize insulin receptors and slows down the enzymatic breakdown of starches, easing glycemic spikes.',
      badge: 'Glycemic Regulator'
    });
    rawFoodsToEat.push({
      id: 'eat-seeds-diabetes',
      title: 'Raw Pumpkin & Sunflower Seeds',
      description: 'High in organic magnesium, a vital co-factor required for normal pancreatic glucose release.',
      badge: 'Insulin Sensitivity'
    });
  }

  if (hasHypertension || hasHeart) {
    rawFoodsToEat.push({
      id: 'eat-garlic-cardio',
      title: 'Crushed Fresh Garlic & Leeks',
      description: 'Rich in active allicin, which triggers endothelial release of nitric oxide, dilating blood vessels and lowering pressure.',
      badge: 'Arterial Vasodilation'
    });
    // Beetroot safety guard: beetroot is highly high-oxalate. If they have kidney disease, restrict it completely!
    if (!hasKidney) {
      rawFoodsToEat.push({
        id: 'eat-beetroot-cardio',
        title: 'Steamed Beetroot',
        description: 'Abundant in inorganic nitrates, which relax and soften stiff arterial walls, supporting safe blood pressure.',
        badge: 'Nitric Oxide Booster'
      });
    } else {
      rawFoodsToEat.push({
        id: 'eat-hibiscus-cardio',
        title: 'Organic Hibiscus Tea',
        description: 'Acts as a mild, safe natural ACE-inhibitor to support pressure without loading kidneys with excess oxalates.',
        badge: 'Kidney-Safe Vascular Aid'
      });
    }
  }

  if (hasCholesterol) {
    rawFoodsToEat.push({
      id: 'eat-oatbran-cholesterol',
      title: 'Oat Bran or Beta-Glucan Oats',
      description: 'Creates a thick viscous gel in the intestinal tract that binds bile acids and safely removes excess circulating LDL cholesterol.',
      badge: 'LDL Binding Fiber'
    });
  }

  if (hasKidney) {
    rawFoodsToEat.push({
      id: 'eat-cranberries-kidney',
      title: 'Fresh Cranberries & Blueberries',
      description: 'Extremely low in sodium, potassium, and phosphorus. Helps support renal filter cells and prevents bacterial urinary adhesion.',
      badge: 'Renal Protection'
    });
  }

  if (hasGastro) {
    rawFoodsToEat.push({
      id: 'eat-ginger-gastro',
      title: 'Freshly Grated Ginger Tea',
      description: 'Soothes active GI spasms, speeds up gastric emptying, and relieves mild symptoms of heartburn or acid reflux.',
      badge: 'Digestive Motility'
    });
    rawFoodsToEat.push({
      id: 'eat-zucchini-gastro',
      title: 'Peeled Steamed Zucchini & Carrots',
      description: 'Low-FODMAP, soft-fiber vegetables that digest easily, avoiding fermentation that causes painful intestinal gases.',
      badge: 'Gut Lining Comfort'
    });
  }

  // Deduplicate and filter Foods to Eat based on Allergies and Diet Preferences
  const uniqueEatMap = new Map<string, RecommendationItem>();
  const seenEatTitles = new Set<string>();

  rawFoodsToEat.forEach(item => {
    const normTitle = item.title.toLowerCase().trim();
    if (!uniqueEatMap.has(item.id) && !seenEatTitles.has(normTitle)) {
      const isSafe = isAllergySafe(item.title, item.description, item.badge || '', normAllergies);
      const isFriendly = isDietaryFriendly(item.title, item.description, diet);
      if (isSafe && isFriendly) {
        seenEatTitles.add(normTitle);
        uniqueEatMap.set(item.id, item);
      }
    }
  });
  const foodsToEat = Array.from(uniqueEatMap.values());


  // 4. Generate "Foods to Avoid" List
  const rawFoodsToAvoid: RecommendationItem[] = [];

  // Universal Sins
  rawFoodsToAvoid.push({
    id: 'avoid-refined-sugar',
    title: 'Refined Sugar & High-Fructose Corn Syrup',
    description: 'Bypasses cellular satiety signals, causes severe fat deposits in liver tissue, and triggers systemic blood vessel inflammation.',
    badge: 'Highly Inflammatory'
  });
  rawFoodsToAvoid.push({
    id: 'avoid-trans-fats',
    title: 'Hydrogenated Oils & Trans-Fats',
    description: 'Found in commercial pastries and deep-fried fast foods. Heavily elevates arterial-blocking, atherogenic LDL cholesterol.',
    badge: 'Cardiovascular Hazard'
  });

  // Goal-based Avoids
  if (isWeightLoss) {
    rawFoodsToAvoid.push({
      id: 'avoid-liquid-calories',
      title: 'Sodas, Energy Drinks & Fruit Juices',
      description: 'Highly concentrated simple liquid sugars that spike insulin and store fat immediately, failing to trigger stomach fullness.',
      badge: 'Caloric Surplus Hazard'
    });
    rawFoodsToAvoid.push({
      id: 'avoid-processed-dressing-wl',
      title: 'Creamy Commercial Salad Dressings',
      description: 'Contain hidden sugars and refined seed oils that instantly add hundreds of empty calories to healthy meals, stalling weight loss.',
      badge: 'Hidden Calorie Trap'
    });
  } else if (isWeightGain) {
    rawFoodsToAvoid.push({
      id: 'avoid-processed-junk',
      title: 'Ultra-Processed Cheap Fast Food',
      description: 'While calorically dense, these empty nutrients cause oxidative organ stress and lack the amino profiles required for muscle hypertrophy.',
      badge: 'Poor Micronutrients'
    });
  } else if (isMuscleGain) {
    rawFoodsToAvoid.push({
      id: 'avoid-alcohol-mg',
      title: 'Excessive Alcohol Consumption',
      description: 'Alcohol suppresses muscle protein synthesis pathways (mTOR) and decreases testosterone levels, severely impairing muscle recovery.',
      badge: 'Protein Synthesis Inhibitor'
    });
    rawFoodsToAvoid.push({
      id: 'avoid-processed-sugars-mg',
      title: 'Refined Sugar & High-Fructose Sweets',
      description: 'Triggers rapid blood glucose drops that lead to sudden lethargy and muscle breakdown (catabolism).',
      badge: 'Catabolic Trigger'
    });
  } else if (isOverallHealth) {
    rawFoodsToAvoid.push({
      id: 'avoid-trans-fats-oh',
      title: 'Hydrogenated Seed & Vegetable Oils',
      description: 'Highly processed industrial seed oils (canola, corn, soy) that promote systemic cellular oxidation and damage arterial walls.',
      badge: 'Oxidative Stress'
    });
  } else if (isHeartHealth) {
    rawFoodsToAvoid.push({
      id: 'avoid-cured-sodium-hh',
      title: 'Cured Meats, Salami, and High-Sodium Soups',
      description: 'Excess sodium retains extracellular fluids, instantly increasing pressure in the cardiovascular walls and straining cardiac chambers.',
      badge: 'Cardiovascular Stress'
    });
    rawFoodsToAvoid.push({
      id: 'avoid-margarine-trans-hh',
      title: 'Margarine, Shortening, & Commercial Trans-Fats',
      description: 'Directly lowers cardioprotective HDL while raising atherogenic LDL, leading to rapid vascular plaque buildup.',
      badge: 'Atherogenesis Hazard'
    });
  } else if (isBloodSugarControl) {
    rawFoodsToAvoid.push({
      id: 'avoid-refined-grains-bs',
      title: 'White Bread, White Rice & Processed Cereals',
      description: 'Stripped of protective fiber, these refined starches digest in minutes, sparking aggressive pancreatic insulin spikes.',
      badge: 'Insulin Resistance Trap'
    });
    rawFoodsToAvoid.push({
      id: 'avoid-dried-fruits-bs',
      title: 'Dried Glazed Fruits with Added Syrups',
      description: 'Concentrated fructose without water content triggers immediate glycogen liver congestion and rapid blood sugar spikes.',
      badge: 'High Glycemic Load'
    });
  }

  // Condition-driven Avoids (Safely merged!)
  if (hasDiabetes) {
    rawFoodsToAvoid.push({
      id: 'avoid-refined-carbs-diab',
      title: 'White Bread, White Rice & Processed Pasta',
      description: 'High-glycemic processed grains that convert instantly to simple glucose, causing dramatic blood sugar spikes.',
      badge: 'High Glycemic Load'
    });
    rawFoodsToAvoid.push({
      id: 'avoid-dried-fruit-diab',
      title: 'Dried Glazed Fruits (Dates, Raisins with added sugar)',
      description: 'Dehydrated concentrated sugars that trigger sudden liver fat storage and exhaust beta-cells in the pancreas.',
      badge: 'Sugar Concentration'
    });
  }

  if (hasHypertension || hasHeart) {
    rawFoodsToAvoid.push({
      id: 'avoid-cured-meat-cardio',
      title: 'Cured Meats, Salami & Canned Soups',
      description: 'Contains high sodium counts that alter osmotic balance, forcing blood vessels to hold extra water and spike arterial pressure.',
      badge: 'Sodium Alert'
    });
    rawFoodsToAvoid.push({
      id: 'avoid-added-salt-cardio',
      title: 'Raw Table Salt additions',
      description: 'Adding extra table salt to already cooked meals causes acute arterial tension. Flavor instead with potassium-safe herbs or lemon.',
      badge: 'Arterial Pressure'
    });
  }

  if (hasCholesterol || hasHeart) {
    rawFoodsToAvoid.push({
      id: 'avoid-saturated-bakes',
      title: 'Commercial Saturated Baked Goods',
      description: 'Utilizes low-quality saturated palm oil and margarine, which signal the liver to suppress LDL receptors, leading to higher plaque.',
      badge: 'LDL Overload'
    });
  }

  if (hasKidney) {
    rawFoodsToAvoid.push({
      id: 'avoid-raw-spinach-kidney',
      title: 'Raw Spinach & Beet Greens',
      description: 'Contains extremely high levels of organic oxalates, which compromised kidneys struggle to filter, promoting kidney stones.',
      badge: 'High Oxalates'
    });
    rawFoodsToAvoid.push({
      id: 'avoid-potassium-salts-kidney',
      title: 'Synthetic "Lite Salt" substitutes',
      description: 'Synthetically enriched with potassium chloride. Because weakened kidneys cannot excrete potassium efficiently, this risks hyperkalemia.',
      badge: 'Dangerous Potassium Spike'
    });
  }

  if (hasGastro) {
    rawFoodsToAvoid.push({
      id: 'avoid-spicy-acid-gastro',
      title: 'Spicy Seasonings, Raw Garlic, & Excess Coffee',
      description: 'Relaxes the lower esophageal sphincter, permitting harsh stomach gastric acids to backflow and damage esophageal walls.',
      badge: 'Reflux Trigger'
    });
    rawFoodsToAvoid.push({
      id: 'avoid-carbonated-gastro',
      title: 'Sodas & Artificial Sweeteners (Sorbitol, Erythritol)',
      description: 'Releases high volumes of gas and draws excess water into the bowel, causing abdominal distension, cramps, and IBS pain.',
      badge: 'GI Fermentation'
    });
  }

  // Strictly inject active Allergens to Avoid list
  if (normAllergies.includes('peanuts')) {
    rawFoodsToAvoid.push({
      id: 'avoid-allergy-peanuts',
      title: 'Peanuts, Peanut Butter & Peanut Oil',
      description: 'Strict absolute exclusion required. Carefully read all packaging labels for raw peanut traces or processing cross-contamination.',
      badge: 'Critical Allergen'
    });
  }
  if (normAllergies.includes('gluten')) {
    rawFoodsToAvoid.push({
      id: 'avoid-allergy-gluten',
      title: 'Wheat, Barley, Rye & Standard Malt',
      description: 'Avoid gluten proteins that trigger severe intestinal lining destruction and systemic immune stress.',
      badge: 'Severe Gluten Intolerance'
    });
  }
  if (normAllergies.includes('dairy')) {
    rawFoodsToAvoid.push({
      id: 'avoid-allergy-dairy',
      title: 'Cow Milk, Cheese, Whey, Butter & Creams',
      description: 'Contains dairy sugars (lactose) and proteins (casein) that trigger severe digestive distress or systemic skin/sinus immune reactions.',
      badge: 'Severe Dairy Allergen'
    });
  }
  if (normAllergies.includes('soy')) {
    rawFoodsToAvoid.push({
      id: 'avoid-allergy-soy',
      title: 'Soy Sauce, Edamame, Tofu & Soy Lecithin',
      description: 'Contains soy proteins that spark immune cascades in sensitive individuals. Check processed food binders for soy additives.',
      badge: 'Soy Allergen'
    });
  }
  if (normAllergies.includes('shellfish')) {
    rawFoodsToAvoid.push({
      id: 'avoid-allergy-shellfish',
      title: 'Shrimp, Lobster, Crabs, Oysters & Mussels',
      description: 'Highly reactive shellfish tropomyosin proteins can initiate severe respiratory bronchospasms or systemic anaphylaxis.',
      badge: 'Anaphylaxis Hazard'
    });
  }
  if (normAllergies.includes('tree_nuts')) {
    rawFoodsToAvoid.push({
      id: 'avoid-allergy-treenuts',
      title: 'Walnuts, Almonds, Cashews, Macadamias & Hazelnut',
      description: 'Avoid all tree-born nuts. Re-verify food labels on sauces, pestos, or baked treats.',
      badge: 'Tree Nut Allergen'
    });
  }
  if (normAllergies.includes('eggs')) {
    rawFoodsToAvoid.push({
      id: 'avoid-allergy-eggs',
      title: 'Whole Eggs, Egg Whites & Egg Lecithins',
      description: 'Strictly avoid pastries glazed with egg-wash, traditional mayonnaise, and protein powders containing egg solids.',
      badge: 'Egg Allergen'
    });
  }

  // Deduplicate avoids
  const uniqueAvoidsMap = new Map<string, RecommendationItem>();
  const seenAvoidTitles = new Set<string>();

  rawFoodsToAvoid.forEach(item => {
    const normTitle = item.title.toLowerCase().trim();
    if (!uniqueAvoidsMap.has(item.id) && !seenAvoidTitles.has(normTitle)) {
      seenAvoidTitles.add(normTitle);
      uniqueAvoidsMap.set(item.id, item);
    }
  });
  const foodsToAvoid = Array.from(uniqueAvoidsMap.values());


  // 5. Generate "Healthy Food Combinations"
  const rawHealthyCombinations: RecommendationItem[] = [];

  const isVegan = diet === 'Vegan';
  const isVeg = diet === 'Vegetarian' || diet === 'Vegan';
  const isKeto = diet === 'Keto';
  const isPaleo = diet === 'Paleo';

  const allergyPeanuts = normAllergies.includes('peanuts');
  const allergyGluten = normAllergies.includes('gluten');
  const allergyDairy = normAllergies.includes('dairy');
  const allergySoy = normAllergies.includes('soy');
  const allergyShellfish = normAllergies.includes('shellfish');
  const allergyTreeNuts = normAllergies.includes('tree_nuts');
  const allergyEggs = normAllergies.includes('eggs');

  // --- DYNAMIC MEAL COMBINATIONS GENERATOR ---
  // A. Breakfast Base, Carb, Protein, and Fat Selection
  let breakfastBase = 'organic plain Greek yogurt';
  if (isVegan || allergyDairy) {
    breakfastBase = allergyTreeNuts ? 'organic oat beverage' : 'coconut ferment';
  } else {
    breakfastBase = allergyTreeNuts ? 'organic goat yogurt' : 'organic plain Greek yogurt';
  }

  let breakfastCarb = 'organic steel-cut oats';
  if (isKeto) {
    breakfastCarb = 'sliced avocado & fresh raspberries';
  } else if (isPaleo) {
    breakfastCarb = 'roasted sweet potato hash & wild blueberries';
  } else if (allergyGluten) {
    breakfastCarb = isBloodSugarControl || hasDiabetes ? 'organic quinoa flakes & fresh blackberries' : 'roasted sweet potato hash & wild blueberries';
  } else if (isBloodSugarControl || hasDiabetes) {
    breakfastCarb = 'quinoa flakes & wild organic blueberries';
  } else if (hasGastro) {
    breakfastCarb = 'warm cooked banana porridge';
  }

  let breakfastProtein = 'pasture-raised eggs';
  if (isVegan || allergyEggs) {
    if (isKeto) {
      breakfastProtein = allergySoy ? 'organic pea protein concentrate' : 'scrambled organic firm tofu';
    } else {
      breakfastProtein = allergySoy ? 'cooked red lentils' : 'steamed organic tempeh';
    }
  } else {
    breakfastProtein = 'soft-boiled pasture-raised eggs';
  }

  let breakfastFat = 'organic walnuts';
  if (allergyTreeNuts || allergyPeanuts) {
    breakfastFat = 'organic pumpkin seeds & chia seeds';
  } else if (isKeto) {
    breakfastFat = 'sliced avocado & organic pumpkin seeds';
  }

  const breakfastTitle = '🌅 Balanced Morning Breakfast';
  let breakfastDesc = `Power your morning with a nourishing combination of ${breakfastProtein} paired with ${breakfastCarb} and a base of ${breakfastBase}, sprinkled with ${breakfastFat} for steady energy.`;
  
  if (isKeto) {
    breakfastDesc = `A satisfying, low-carb morning meal with ${breakfastProtein} and ${breakfastCarb} cooked in olive oil, topped with ${breakfastFat} to keep your energy steady.`;
  } else if (isWeightLoss) {
    breakfastDesc = `A wholesome, filling breakfast pairing lean ${breakfastProtein} with fiber-rich ${breakfastCarb}, served with ${breakfastBase} and a light sprinkle of ${breakfastFat} to keep you full all morning.`;
  } else if (isMuscleGain || isWeightGain) {
    breakfastDesc = `A nutrient-packed breakfast combining protein-rich ${breakfastProtein} with ${breakfastCarb} and ${breakfastBase}, topped with ${breakfastFat} to fuel recovery and muscle growth.`;
  } else if (isHeartHealth || hasHypertension) {
    breakfastDesc = `A heart-smart, low-salt breakfast combining ${breakfastProtein} and whole-grain ${breakfastCarb} with light ${breakfastBase} and heart-healthy ${breakfastFat}.`;
  } else if (isBloodSugarControl || hasDiabetes) {
    breakfastDesc = `A balanced morning bowl pairing ${breakfastProtein} with slow-digesting ${breakfastCarb} and ${breakfastBase}, sprinkled with ${breakfastFat} to help keep blood sugar steady.`;
  } else if (hasGastro) {
    breakfastDesc = `An easy-to-digest, warm morning bowl combining well-cooked ${breakfastProtein} with soothing ${breakfastCarb} and stomach-friendly ${breakfastBase}, lightly dusted with ${breakfastFat}.`;
  }

  rawHealthyCombinations.push({
    id: 'comb-breakfast',
    title: breakfastTitle,
    description: breakfastDesc,
    badge: 'Morning Fuel'
  });

  // B. Lunch Protein, Carb, Veg, and Dressing Selection
  let lunchProtein = 'organic chicken breast';
  if (isVegan || isVeg) {
    if (allergySoy) {
      lunchProtein = 'steamed French lentils';
    } else {
      lunchProtein = 'steamed organic tempeh';
    }
  } else if (isHeartHealth || hasHypertension || hasCholesterol) {
    lunchProtein = 'wild-caught salmon';
  } else if (hasKidney) {
    lunchProtein = 'moderate portion of skinless organic chicken';
  }

  let lunchCarb = 'steamed brown rice';
  if (isKeto) {
    lunchCarb = 'steamed cauliflower rice';
  } else if (isPaleo) {
    lunchCarb = 'roasted sweet potato wedges';
  } else if (allergyGluten) {
    lunchCarb = 'cooked red quinoa';
  } else if (isBloodSugarControl || hasDiabetes) {
    lunchCarb = 'organic red quinoa';
  } else if (hasGastro) {
    lunchCarb = 'warm cooked jasmine rice';
  }

  let lunchVeg = 'sautéed baby spinach and carrots';
  if (hasKidney) {
    lunchVeg = 'steamed green beans & sliced carrots';
  } else if (hasGastro) {
    lunchVeg = 'well-cooked peeled carrots & tender zucchini slices';
  } else if (isKeto) {
    lunchVeg = 'sautéed asparagus spears & arugula';
  }

  let lunchDressing = 'extra virgin olive oil & fresh lemon juice';
  if (hasGastro) {
    lunchDressing = 'extra virgin olive oil & fresh herbs';
  } else if (isHeartHealth || hasCholesterol) {
    lunchDressing = 'cold-pressed extra virgin olive oil';
  }

  const lunchTitle = '🥗 Balanced Energy Lunch';
  let lunchDesc = `A satisfying lunch bowl with ${lunchProtein}, wholesome ${lunchCarb}, fresh ${lunchVeg}, and a light drizzle of ${lunchDressing}.`;

  if (isKeto) {
    lunchDesc = `A filling, low-carb lunch of ${lunchProtein} over low-carb ${lunchCarb}, served with fiber-rich ${lunchVeg} and a drizzle of ${lunchDressing} for steady energy.`;
  } else if (isWeightLoss) {
    lunchDesc = `A light and filling lunch pairing lean ${lunchProtein} with a portion of ${lunchCarb}, plenty of fresh ${lunchVeg}, and a light splash of ${lunchDressing}.`;
  } else if (isMuscleGain || isWeightGain) {
    lunchDesc = `A hearty, protein-rich lunch fueling your body with ${lunchProtein}, a generous serving of ${lunchCarb}, fresh ${lunchVeg}, and energizing ${lunchDressing}.`;
  } else if (isHeartHealth || hasHypertension) {
    lunchDesc = `A low-salt, heart-healthy lunch combining lean ${lunchProtein} with fiber-rich ${lunchCarb}, colorful ${lunchVeg}, and a drizzle of olive oil ${lunchDressing}.`;
  } else if (isBloodSugarControl || hasDiabetes) {
    lunchDesc = `A balanced lunch that helps keep blood sugar steady by pairing ${lunchProtein} with slow-burning ${lunchCarb}, crisp ${lunchVeg}, and ${lunchDressing}.`;
  } else if (hasGastro) {
    lunchDesc = `A soothing, easy-to-digest lunch pairing soft ${lunchProtein} with well-cooked ${lunchCarb}, tender steamed ${lunchVeg}, and light ${lunchDressing}.`;
  }

  rawHealthyCombinations.push({
    id: 'comb-lunch',
    title: lunchTitle,
    description: lunchDesc,
    badge: 'Mid-day Satiety'
  });

  // C. Dinner Protein, Carb, Veg, and Fat Selection
  let dinnerProtein = 'wild-caught cod fillet';
  if (isVegan || isVeg) {
    if (allergySoy) {
      dinnerProtein = 'cooked black-eyed peas';
    } else {
      dinnerProtein = 'baked organic tofu';
    }
  } else if (isHeartHealth || hasHypertension) {
    dinnerProtein = 'wild-caught cod fillet';
  } else if (hasKidney) {
    dinnerProtein = 'moderate portion of steamed cod';
  }

  let dinnerCarb = 'steamed wild rice';
  if (isKeto) {
    dinnerCarb = 'spiralized zucchini noodles';
  } else if (isPaleo) {
    dinnerCarb = 'roasted butternut squash slices';
  } else if (allergyGluten) {
    dinnerCarb = 'steamed wild rice';
  } else if (isBloodSugarControl || hasDiabetes) {
    dinnerCarb = 'cooked red quinoa';
  } else if (hasGastro) {
    dinnerCarb = 'warm butternut squash puree';
  }

  let dinnerVeg = 'steamed green beans';
  if (hasKidney) {
    dinnerVeg = 'steamed zucchini slices';
  } else if (hasGastro) {
    dinnerVeg = 'steamed peeled zucchini & sliced carrots';
  } else if (isKeto) {
    dinnerVeg = 'sautéed asparagus spears';
  }

  let dinnerFat = 'extra virgin olive oil drizzle';
  if (isKeto) {
    dinnerFat = 'sliced avocado & extra virgin olive oil';
  } else if (isHeartHealth || hasCholesterol) {
    dinnerFat = 'cold-pressed extra virgin olive oil';
  }

  const dinnerTitle = '🍽️ Nourishing Restorative Dinner';
  let dinnerDesc = `Conclude your day with a comforting dinner of ${dinnerProtein} accompanied by slow-release ${dinnerCarb}, light ${dinnerVeg}, and finished with ${dinnerFat}.`;

  if (isKeto) {
    dinnerDesc = `A nutrient-rich, low-carb dinner pairing ${dinnerProtein} with low-carb ${dinnerCarb}, sautéed ${dinnerVeg}, and enriched with ${dinnerFat} to support overnight metabolic repair.`;
  } else if (isWeightLoss) {
    dinnerDesc = `A light, portion-conscious evening meal featuring ${dinnerProtein} paired with a small portion of ${dinnerCarb}, a generous plate of low-calorie ${dinnerVeg}, and ${dinnerFat}.`;
  } else if (isMuscleGain || isWeightGain) {
    dinnerDesc = `An abundant recovery dinner optimizing overnight protein synthesis with ${dinnerProtein}, a hearty side of carbohydrate-dense ${dinnerCarb}, fiber from ${dinnerVeg}, and ${dinnerFat}.`;
  } else if (isHeartHealth || hasHypertension) {
    dinnerDesc = `A heart-supporting, low-sodium evening meal combining cardioprotective ${dinnerProtein} with fiber-rich ${dinnerCarb}, vascular-clearing ${dinnerVeg}, and a heart-healthy drizzle of ${dinnerFat}.`;
  } else if (isBloodSugarControl || hasDiabetes) {
    dinnerDesc = `A glucose-stabilizing dinner aligning lean ${dinnerProtein} with slow-burning, high-fiber ${dinnerCarb}, steamed ${dinnerVeg}, and healthy lipid barriers from ${dinnerFat}.`;
  } else if (hasGastro) {
    dinnerDesc = `A soothing, easily-digestible dinner featuring warm ${dinnerProtein} served over stomach-friendly ${dinnerCarb}, tender steamed ${dinnerVeg}, and light ${dinnerFat} to prevent overnight reflux.`;
  }

  rawHealthyCombinations.push({
    id: 'comb-dinner',
    title: dinnerTitle,
    description: dinnerDesc,
    badge: 'Evening Restorative'
  });

  // D. Snack Selection
  let snackTitle = '🍏 Healthy Refreshing Snack';
  let snackDesc = 'A handful of organic pumpkin seeds and fresh cucumber slices to keep your energy steady between meals.';

  if (isKeto) {
    snackTitle = '🥑 Low-Carb Healthy Snack';
    snackDesc = allergyTreeNuts 
      ? 'Sliced cucumber and celery sticks with homemade guacamole for potassium and healthy fats.'
      : 'Crispy pumpkin seeds paired with fresh sliced avocado for clean, long-lasting energy.';
  } else if (isPaleo) {
    snackTitle = '🍓 Fresh Whole Food Snack';
    snackDesc = allergyTreeNuts
      ? 'A handful of fresh raspberries with sunflower seed spread for a simple, natural energy boost.'
      : 'A small handful of walnuts with fresh blackberries for natural vitamins and antioxidants.';
  } else if (isBloodSugarControl || hasDiabetes) {
    snackTitle = '🔋 Blood Sugar Friendly Snack';
    snackDesc = 'A handful of pumpkin seeds paired with fresh cucumber slices. Pumpkin seeds provide magnesium to help manage blood sugar, while cucumbers offer refreshing hydration with zero sugar.';
  } else if (isHeartHealth || hasHypertension || hasCholesterol) {
    snackTitle = '❤️ Heart-Smart Snack';
    snackDesc = allergyTreeNuts
      ? 'Toasted pumpkin seeds and fresh blueberries, providing plant sterols and soluble fiber to support healthy blood vessels.'
      : 'A small handful of walnuts paired with fresh blackberries, providing plant-based omega-3s to support healthy cholesterol.';
  } else if (hasGastro) {
    snackTitle = '🌱 Gentle Stomach-Friendly Snack';
    snackDesc = 'Warm baked apple slices sprinkled with a light pinch of cinnamon. Soft-cooked apples are easy on the stomach and provide soothing natural fiber without irritation.';
  } else if (isWeightLoss) {
    snackTitle = '📉 Satisfying Low-Calorie Snack';
    snackDesc = 'Fresh sliced celery and bell pepper strips with a few spoonfuls of hummus, delivering satisfying crunch and hydration with minimal calories.';
  } else if (isMuscleGain || isWeightGain) {
    snackTitle = '💪 Protein Recovery Snack';
    if (isVegan || allergyDairy) {
      snackDesc = allergyTreeNuts
        ? 'A high-protein pea protein shake mixed with oat milk and a banana to quickly replenish tired muscles.'
        : 'A bowl of coconut yogurt topped with sliced banana, hemp seeds, and a drizzle of sunflower seed spread for wholesome calories.';
    } else {
      snackDesc = allergyTreeNuts
        ? 'Organic plain Greek yogurt topped with pumpkin seeds, hemp hearts, and a sliced banana, delivering over 20g of protein to rebuild muscles.'
        : 'Organic plain Greek yogurt topped with walnuts, hemp hearts, and a sliced banana, delivering over 20g of protein to rebuild muscles.';
    }
  }

  rawHealthyCombinations.push({
    id: 'comb-snack',
    title: snackTitle,
    description: snackDesc,
    badge: 'Glycemic Balance'
  });

  // Goal-specific nutrition pairings
  if (isMuscleGain) {
    rawHealthyCombinations.push({
      id: 'comb-carb-protein-mg',
      title: 'High-GI Fruit or Carb + High Biological Value Protein',
      description: 'Pair grass-fed beef or tempeh with sweet potatoes, or a banana with high-protein Greek yogurt. The carbs prompt a controlled insulin response that drives amino acids directly into depleted skeletal muscles, maximizing protein synthesis.',
      badge: 'Anabolic Synergy'
    });
  } else if (isWeightGain) {
    rawHealthyCombinations.push({
      id: 'comb-density-gain',
      title: 'Healthy Monounsaturated Fats + Energetic Starches',
      description: 'Pair sliced avocado or cashew butter with warm oatmeal or sweet potato. This maximizes caloric intake with clean, non-inflammatory macronutrients that protect digestive health.',
      badge: 'Clean Surplus'
    });
  } else if (isHeartHealth) {
    rawHealthyCombinations.push({
      id: 'comb-omega3-lycopene-hh',
      title: 'Cooked Tomatoes + Cold-Pressed Olive Oil',
      description: 'Lycopene is a powerful heart-healthy antioxidant found in tomatoes, whose absorption is boosted by 400% when heated and paired with olive oil lipids, protecting blood vessels from oxidative stress.',
      badge: 'Vascular Longevity'
    });
  } else if (!hasDiabetes && bmiValue < 25 && !isWeightLoss && !isBloodSugarControl) {
    // Normal weight whole food synthesis
    rawHealthyCombinations.push({
      id: 'comb-amino-synthesis',
      title: 'Whole Grains + Clean Legumes',
      description: 'Pairing complete complex grains (like brown rice or quinoa) with organic legumes (like black beans or lentils) complements matching amino acids, forming a clean protein equivalent to animal tissues.',
      badge: 'Complete Protein'
    });
  }

  // Vascular Synergy (Fresh herbs & mild citrus for renal protection when applicable)
  if ((hasHypertension || hasHeart) && hasKidney) {
    rawHealthyCombinations.push({
      id: 'comb-kidney-safe-flavour',
      title: 'Fresh Citrus Juices + Low-Potassium Herbs',
      description: 'Squeeze a touch of fresh lemon juice and blend with fresh cilantro or garlic over your meals. This maximizes vascular dilation and adds rich flavor without utilizing sodium-heavy table salt or risky potassium-salt alternatives.',
      badge: 'Renal-Safe Vascular Synergy'
    });
  }

  // Lipid Binding Combination (Excellent for Cholesterol management)
  if (hasCholesterol) {
    rawHealthyCombinations.push({
      id: 'comb-fiber-sterols',
      title: 'Soluble Beta-Glucans + Heart-Healthy Lipids',
      description: 'Pair soluble oat bran or chia seeds with monounsaturated healthy fats (like sliced avocados or a drizzle of olive oil). The beta-glucans trap biliary cholesterol in the bowel, while olive oil encourages synthesis of cardioprotective HDL particles.',
      badge: 'Lipid Balancing Synergy'
    });
  }

  // Gastrokinetic Comfort Combination (Excellent for GI/Reflux/IBS issues)
  if (hasGastro) {
    rawHealthyCombinations.push({
      id: 'comb-ginger-steamed',
      title: 'Warm Steamed Low-FODMAP Veggies + Grated Ginger',
      description: 'Combine cooked, peeled zucchini or soft carrots with grated fresh ginger root. The cooked structure spares weak intestinal walls from digestion strain, while ginger accelerates gastric flow, preventing reflux build-ups.',
      badge: 'Gastric Comfort Synergy'
    });
  }

  // Filter Combinations based on Allergies and Diet Preferences
  const uniqueCombMap = new Map<string, RecommendationItem>();
  const seenCombTitles = new Set<string>();

  rawHealthyCombinations.forEach(item => {
    const normTitle = item.title.toLowerCase().trim();
    if (!uniqueCombMap.has(item.id) && !seenCombTitles.has(normTitle)) {
      const isSafe = isAllergySafe(item.title, item.description, item.badge || '', normAllergies);
      const isFriendly = isDietaryFriendly(item.title, item.description, diet);
      if (isSafe && isFriendly) {
        seenCombTitles.add(normTitle);
        uniqueCombMap.set(item.id, item);
      }
    }
  });
  const healthyCombinations = Array.from(uniqueCombMap.values());


  // 6. Water Intake Recommendation (Math-based Formula using age, weight and activity level)
  let waterMultiplier = 35; // default clinical factor
  if (age < 30) {
    waterMultiplier = 40;
  } else if (age >= 30 && age <= 55) {
    waterMultiplier = 35;
  } else if (age > 55 && age <= 75) {
    waterMultiplier = 30;
  } else if (age > 75) {
    waterMultiplier = 25;
  }

  let baseWaterMl = weight * waterMultiplier;
  if (baseWaterMl === 0) {
    // Standard baseline default if weight is unspecified, adjusted by age
    if (age < 30) baseWaterMl = 2500;
    else if (age <= 55) baseWaterMl = 2200;
    else baseWaterMl = 2000;
  }

  // Activity Adjustments
  let activityModifier = 0;
  if (activity === 'Lightly Active') activityModifier = 300;
  else if (activity === 'Moderately Active') activityModifier = 600;
  else if (activity === 'Very Active') activityModifier = 1000;

  // Satiety/Weight Loss Booster & Hydration targets
  let goalModifier = 0;
  if (isWeightLoss) {
    goalModifier = 250; // Extra hydration to support stomach volume and fat breakdown flushing
  } else if (isMuscleGain || isWeightGain) {
    goalModifier = 300; // Extra hydration to support increased protein assimilation and heavy digestion workloads
  } else if (isBloodSugarControl) {
    goalModifier = 200; // Extra fluid to facilitate efficient glucose clearing by the kidneys
  }

  // Gender Muscle Mass Modifier
  let genderModifier = 0;
  if (isMale) {
    genderModifier = 200; // Males typically require higher cellular water due to muscular mass coefficients
  }

  let totalWaterMl = baseWaterMl + activityModifier + goalModifier + genderModifier;

  // Critical Safety Guard: Kidney Disease Limits Hydration
  let totalWaterLiters = parseFloat((totalWaterMl / 1000).toFixed(1));
  let isKidneyRestricted = false;

  if (hasKidney) {
    totalWaterLiters = 1.8; // Safe, strictly controlled medical threshold to avoid fluid overload
    isKidneyRestricted = true;
  }

  const totalWaterCups = Math.round((totalWaterLiters * 1000) / 250); // 250ml per cup

  let waterDescription = `Your customized daily clinical hydration target is set at exactly ${totalWaterLiters} Liters.`;
  if (isKidneyRestricted) {
    waterDescription = `CRITICAL renal target: Due to compromised kidney filtration, your hydration is capped at a safe ${totalWaterLiters} Liters maximum. This avoids dangerous fluid retention in the lungs and extremities. Coordinate with your physician.`;
  } else if (activity === 'Very Active') {
    waterDescription = `Increased physical output: Your water requirement is adjusted upwards to ${totalWaterLiters} Liters to safely compensate for intense fluid loss and secure optimal cardiac output.`;
  }

  const waterTips = [
    'Drink 250ml of warm water immediately upon waking to flush liver byproducts and rehydrate vascular organs.',
    'Sip fluids gradually throughout the day. Drinking huge volumes at once overloads the urinary filters and can cause rapid electrolyte loss.',
    'Regularly inspect urine color: aim for a light straw hue. If it is crystal clear, you are flushing minerals. If it is dark amber, you are dehydrated.'
  ];

  if (isKidneyRestricted) {
    waterTips.push('Measure your daily urine output. It must match your fluid intake to prevent swelling.');
  }
  if (activity === 'Very Active') {
    waterTips.push('Add a small pinch of mineral sea salt and a squeeze of fresh lemon to your exercise bottle to maintain proper sodium channels.');
  }


  // 7. Exercise Routine Configuration
  const estimateCaloriesBurned = (met: number, weightKg: number, durationMins: number): number => {
    const actualWeight = weightKg > 0 ? weightKg : 70;
    const caloriesPerMin = met * 3.5 * actualWeight / 200;
    return Math.round(caloriesPerMin * durationMins);
  };

  const hasArthritis = normConditions.some(c => c.includes('arthritis') || c.includes('joint') || c.includes('gout') || c.includes('osteoarthritis'));

  let exerciseType = 'Balanced Conditioning';
  let exerciseFreq = '3-4 Days / Week';
  let exerciseDur = '30-45 Minutes';
  let exerciseInt = 'Moderate';
  let exerciseDesc = 'A low-impact physical maintenance framework promoting metabolic flexibility.';

  // Determine durations and intensities dynamically
  let baseDurationMins = 30;
  if (activity === 'Sedentary') baseDurationMins = 20;
  else if (activity === 'Lightly Active') baseDurationMins = 25;
  else if (activity === 'Moderately Active') baseDurationMins = 35;
  else if (activity === 'Very Active') baseDurationMins = 45;

  if (age > 65) {
    baseDurationMins = Math.min(baseDurationMins, 30);
  }
  if (bmiCategory === 'Underweight') {
    baseDurationMins = Math.min(baseDurationMins, 25);
  }
  if (bmiCategory === 'Obese') {
    baseDurationMins = Math.min(baseDurationMins, 30);
  }

  let calculatedFreq = '3-4 Days / Week';
  if (activity === 'Sedentary') calculatedFreq = '3 Days / Week';
  else if (activity === 'Lightly Active') calculatedFreq = '3-4 Days / Week';
  else if (activity === 'Moderately Active') calculatedFreq = '4 Days / Week';
  else if (activity === 'Very Active') calculatedFreq = '4-5 Days / Week';

  if (age > 70) {
    calculatedFreq = '3 Days / Week';
  }

  let calculatedIntensity = 'Moderate';
  if (hasHypertension || hasHeart) {
    calculatedIntensity = 'Controlled Low';
  } else if (hasArthritis || age > 65) {
    calculatedIntensity = 'Low to Moderate';
  } else {
    if (activity === 'Sedentary') calculatedIntensity = 'Low';
    else if (activity === 'Lightly Active') calculatedIntensity = 'Low to Moderate';
    else if (activity === 'Moderately Active') calculatedIntensity = 'Moderate';
    else if (activity === 'Very Active') {
      calculatedIntensity = isMuscleGain || isWeightLoss ? 'Moderate to High' : 'Moderate';
    }
  }

  exerciseFreq = calculatedFreq;
  exerciseDur = `${baseDurationMins} Minutes`;
  exerciseInt = calculatedIntensity;

  const exercisesToRecommend: any[] = [];

  // Exercise 1: Cardiovascular / Aerobic
  if (hasHeart || hasHypertension) {
    exerciseType = 'Heart-Friendly Walking & Gentle Cardio';
    exerciseDesc = 'Gentle aerobic activities that strengthen your heart and improve circulation safely without sudden spikes in blood pressure.';
    exercisesToRecommend.push({
      name: 'Steady-State Flat Cardio Walk',
      met: 3.3,
      duration: `${baseDurationMins} minutes`,
      frequency: '4 days/week',
      intensity: 'Low',
      safetyNotes: 'Breathe naturally and comfortably. Wear supportive walking shoes, and stick to even, flat paths.'
    });
  } else if (hasArthritis) {
    exerciseType = 'Low-Impact, Joint-Friendly Exercise';
    exerciseDesc = 'Smooth movements that keep your heart healthy and muscles active without putting stressful pressure on your joints.';
    exercisesToRecommend.push({
      name: 'Water Laps or Deep Water Walking',
      met: 4.0,
      duration: `${baseDurationMins} minutes`,
      frequency: '3 days/week',
      intensity: 'Low to Moderate',
      safetyNotes: 'The water gently supports your weight, easing pressure on your knees and hips while you move.'
    });
  } else if (hasAsthma) {
    exerciseType = 'Gentle Indoor Cardio & Breathing-Safe Exercise';
    exerciseDesc = 'Steady activities that gently build lung capacity while keeping your breathing calm and comfortable.';
    exercisesToRecommend.push({
      name: 'Humidified Indoor Cycling',
      met: 5.0,
      duration: `${baseDurationMins} minutes`,
      frequency: '3 days/week',
      intensity: 'Moderate',
      safetyNotes: 'Cycle at a comfortable pace where you can easily speak. Exercise in a warm room, and keep your rescue inhaler close by.'
    });
  } else if (isWeightLoss) {
    exerciseType = 'Active Cardio & Fat-Burning Circuit';
    exerciseDesc = 'Fun, active routines designed to burn calories, boost daily energy, and keep your muscles toned.';
    exercisesToRecommend.push({
      name: 'Interval Cycling or Power Walking',
      met: 6.0,
      duration: `${baseDurationMins + 5} minutes`,
      frequency: '4 days/week',
      intensity: 'Moderate to High',
      safetyNotes: 'Walk or pedal faster for 1 minute, then slow down for 2 minutes to catch your breath. Drink water throughout.'
    });
  } else if (isMuscleGain || isWeightGain) {
    exerciseType = isMuscleGain ? 'Strength Building & Muscle Conditioning' : 'Muscle-Building Resistance Routine';
    exerciseDesc = isMuscleGain ? 'A progressive routine designed to build muscle, tone your body, and gain healthy strength.' : 'A muscle-building routine using resistance to support steady, healthy weight gain.';
    exercisesToRecommend.push({
      name: 'Low-Impact Resistance Rower Warm-up',
      met: 4.5,
      duration: '15 minutes',
      frequency: '3 days/week',
      intensity: 'Low to Moderate',
      safetyNotes: 'Push with your legs first before pulling with your arms, and keep your back straight to protect your lower back.'
    });
  } else {
    exercisesToRecommend.push({
      name: 'Brisk Walk or Light Stationary Cycle',
      met: 4.0,
      duration: `${baseDurationMins} minutes`,
      frequency: '3-4 days/week',
      intensity: 'Moderate',
      safetyNotes: 'Walk or cycle at a steady pace where you can easily talk. Keep your shoulders relaxed and stand or sit tall.'
    });
  }

  // Exercise 2: Strength / Resistance Training (Tailored to avoid unsafe weightlifting/overload)
  if (hasHeart || hasHypertension) {
    exercisesToRecommend.push({
      name: 'Unloaded Elastic Band Chest Press & Row',
      met: 2.8,
      duration: '15 minutes (2 sets of 12 reps)',
      frequency: '3 days/week',
      intensity: 'Low',
      safetyNotes: 'Breathe out when pushing or pulling and never hold your breath. Move slowly with steady control.'
    });
  } else if (hasArthritis) {
    exercisesToRecommend.push({
      name: 'Supported Wall Sits & Leg Extensions',
      met: 2.5,
      duration: '15 minutes (hold sits for 20-30s)',
      frequency: '3 days/week',
      intensity: 'Low to Moderate',
      safetyNotes: 'Keep your back flat against the wall and your feet firmly planted. Stop right away if you feel any knee pain.'
    });
  } else if (hasKidney) {
    exercisesToRecommend.push({
      name: 'Moderate Resistance Band Dumbbell Circuit',
      met: 3.5,
      duration: '20 minutes (2 sets of 10 reps, high rest)',
      frequency: '3 days/week',
      intensity: 'Low to Moderate',
      safetyNotes: 'Take plenty of rest between sets and stop before you feel exhausted. Do not push to muscle failure.'
    });
  } else if (isWeightLoss) {
    exercisesToRecommend.push({
      name: 'Full-Body Resistance Circuit (Squats, Push-ups, Rows)',
      met: 5.0,
      duration: '25 minutes (3 circuits)',
      frequency: '3 days/week',
      intensity: 'Moderate',
      safetyNotes: 'Breathe out as you lift or push, and keep your stomach muscles gently tight to protect your back.'
    });
  } else if (isMuscleGain || isWeightGain) {
    if (age > 60) {
      exercisesToRecommend.push({
        name: 'Dumbbell Goblet Squats with Chair Support',
        met: 4.5,
        duration: '20 minutes (3 sets of 8 reps)',
        frequency: '3 days/week',
        intensity: 'Moderate',
        safetyNotes: 'Keep your chest up and sit back gently toward the chair. Make sure the chair is steady and right behind you.'
      });
    } else {
      exercisesToRecommend.push({
        name: 'Hypertrophic Resistance Training (Squats & Dumbbell Presses)',
        met: 5.5,
        duration: '35 minutes (3 sets of 8-10 reps)',
        frequency: '3 days/week',
        intensity: 'High',
        safetyNotes: 'Lower weights slowly with control. Avoid locking your knees or elbows, and keep your back straight.'
      });
    }
  } else {
    exercisesToRecommend.push({
      name: 'Bodyweight Squats & Floor Glute Bridges',
      met: 3.5,
      duration: '20 minutes (3 sets of 12 reps)',
      frequency: '3 days/week',
      intensity: 'Moderate',
      safetyNotes: 'Keep your feet flat on the floor. Squeeze your hips at the top of the bridge without arching your lower back.'
    });
  }

  // Exercise 3: Balance, Core & Mobility (Great for recovery and tailored heavily for age/conditions)
  if (age > 60) {
    exercisesToRecommend.push({
      name: 'Tandem Balance Walks & Single-Leg Holds',
      met: 2.0,
      duration: '15 minutes',
      frequency: 'Daily',
      intensity: 'Low',
      safetyNotes: 'Practice right next to a sturdy counter or handrail so you can hold on if needed. Look straight ahead.'
    });
  } else if (hasHeart || hasHypertension) {
    exercisesToRecommend.push({
      name: 'Slow Deep Breathing Relaxation',
      met: 1.5,
      duration: '10 minutes',
      frequency: 'Daily (preferably post-exercise)',
      intensity: 'Gentle',
      safetyNotes: 'Breathe in through your nose for 4 seconds, pause for 2, then breathe out slowly for 6 seconds to relax your body.'
    });
  } else if (hasArthritis) {
    exercisesToRecommend.push({
      name: 'Chair Yoga & Gentle Hamstring/Hip Stretches',
      met: 2.2,
      duration: '20 minutes',
      frequency: '4 days/week',
      intensity: 'Low',
      safetyNotes: 'Never force a stretch to the point of pain. Stretch gently and stop when you feel mild tension in the muscle.'
    });
  } else if (isMuscleGain || isWeightGain) {
    exercisesToRecommend.push({
      name: 'Planks & Bird-Dog Core Stability',
      met: 3.0,
      duration: '15 minutes (holds of 20-30s)',
      frequency: '3 days/week',
      intensity: 'Moderate',
      safetyNotes: 'Keep your body in a straight line without letting your hips sag, and look at the floor to keep your neck comfortable.'
    });
  } else {
    exercisesToRecommend.push({
      name: 'Dynamic Vinyasa Yoga Flow',
      met: 2.8,
      duration: '20 minutes',
      frequency: '2-3 days/week',
      intensity: 'Low to Moderate',
      safetyNotes: 'Match your breathing to each gentle movement. Rest in a comfortable seated position whenever you need a break.'
    });
  }

  const exerciseRoutines: string[] = [];
  for (const ex of exercisesToRecommend) {
    const cal = estimateCaloriesBurned(ex.met, weight, parseInt(ex.duration) || 20);
    exerciseRoutines.push(JSON.stringify({
      name: ex.name,
      duration: ex.duration,
      frequency: ex.frequency,
      intensity: ex.intensity,
      caloriesBurned: cal,
      safetyNotes: ex.safetyNotes
    }));
  }

  // Precaution configuration
  const exercisePrecautions: string[] = [];
  if (hasHypertension || hasHeart) {
    exercisePrecautions.push(
      'Never hold your breath while lifting or straining, as this can suddenly spike your blood pressure. Always breathe out during effort.',
      'If you encounter sudden chest tightness, jaw or arm pain, cold sweat, or extreme dizziness, stop exercise immediately and call emergency services.',
      'Avoid exercises where your head is lower than your heart (such as steep decline presses or inverted yoga poses).'
    );
  }
  if (hasAsthma) {
    exercisePrecautions.push(
      'Always keep your prescribed rescue inhaler right next to you whenever you exercise.',
      'Take 10 to 15 minutes to warm up gently at an easy pace so your airways adjust comfortably.',
      'If exercising outdoors in cold weather, wear a scarf or light mask over your mouth to warm and humidify the air.'
    );
  }
  if (hasArthritis) {
    exercisePrecautions.push(
      'Avoid high-impact running, heavy lunges, or jumping, which can put hard shock on sensitive joints.',
      'Take 10 minutes to warm up with gentle arm and leg circles to loosen your joints before exercising.',
      'If any joint feels hot, swollen, or experiences sharp pain, stop right away and apply a cold compress.'
    );
  }
  if (hasKidney) {
    exercisePrecautions.push(
      'Avoid pushing yourself to extreme exhaustion or severe muscle fatigue, and take restful breaks whenever needed.',
      'Drink water regularly during workouts unless your doctor has given you a specific fluid restriction.'
    );
  }
  if (age > 60) {
    exercisePrecautions.push(
      'Prioritize balance training and steady, controlled movements over heavy weights to stay safe and steady on your feet.',
      'Always ensure you have a sturdy wall, countertop, or heavy chair within arm\'s reach when performing balance movements.'
    );
  }
  if (exercisePrecautions.length === 0) {
    exercisePrecautions.push(
      'Include a 5 to 10 minute gentle warmup and light stretching session before each workout.',
      'Track your resting pulse weekly as an easy way to check how well your body recovers from exercise.',
      'Drink water regularly and never exercise through sharp joint pain.'
    );
  }


  // 8. Generate Lifestyle Recommendations
  const lifestyleTips: RecommendationItem[] = [];

  // Parse sleep and stress from tags or direct fields
  const rawConditionsList = profile.healthConditions || [];
  let userSleep = profile.sleepDuration;
  if (!userSleep) {
    if (rawConditionsList.includes('sleep_less_6')) userSleep = 'Less than 6 hours';
    else if (rawConditionsList.includes('sleep_8_plus')) userSleep = 'More than 8 hours';
    else userSleep = '6 to 8 hours';
  }

  let userStress = profile.stressLevel;
  if (!userStress) {
    if (rawConditionsList.includes('stress_low')) userStress = 'Low';
    else if (rawConditionsList.includes('stress_high')) userStress = 'High';
    else userStress = 'Moderate';
  }

  // A. Personalized Sleep Recommendation
  if (userSleep === 'Less than 6 hours') {
    let sleepDesc = "Getting under 6 hours of sleep can raise stress hormones and blood sugar. Try to aim for 7 to 8 hours of sleep each night.";
    if (hasDiabetes || isBloodSugarControl) {
      sleepDesc += " Good sleep helps your body use insulin more effectively and keep glucose steady.";
    }
    if (hasHypertension) {
      sleepDesc += " Quality sleep also allows your blood pressure to lower naturally overnight.";
    }
    sleepDesc += " A short 20-minute afternoon rest and turning off bright screens by 8:30 PM can help your body unwind.";
    
    lifestyleTips.push({
      id: 'life-sleep-deficit',
      title: 'Restful Sleep & Evening Unwind',
      description: sleepDesc,
      badge: 'Sleep Recovery'
    });
  } else if (userSleep === 'More than 8 hours') {
    lifestyleTips.push({
      id: 'life-sleep-excess',
      title: 'Morning Sunshine & Wake-Up Routine',
      description: 'Sleeping more than 8 hours can sometimes leave you feeling groggy. Getting out of bed when you first wake up helps you feel refreshed. Step outside for 10 to 15 minutes of natural morning sunlight to reset your body clock and boost daytime alertness.',
      badge: 'Morning Energy'
    });
  } else {
    let sleepDesc = "Your 6 to 8 hours of sleep is a great foundation. Keep your bedroom cool and dark so your body can rest deeply through the night.";
    if (hasGastro) {
      sleepDesc += " Sleeping on your left side also helps keep stomach acid down and prevents nighttime heartburn.";
    }
    sleepDesc += " A quiet, dark room or sleep mask helps you wake up feeling recharged and clear-headed.";
    
    lifestyleTips.push({
      id: 'life-sleep-optimal',
      title: 'Deep, Restful Sleep Habits',
      description: sleepDesc,
      badge: 'Sleep Quality'
    });
  }

  // B. Personalized Stress Management
  if (userStress === 'High') {
    let stressDesc = "High stress can affect your digestion, heart, and daily energy.";
    if (hasGastro) {
      stressDesc += " High stress can upset your stomach and worsen heartburn. Taking slow, deep breaths before meals helps your stomach relax.";
    }
    if (hasHypertension || hasHeart) {
      stressDesc += " Calm breathing helps relax your blood vessels and keep blood pressure steady.";
    }
    stressDesc += " Try slow breathing: take a deep breath in through your nose, a quick second sip of air, then a long, slow exhale through your mouth. Repeat 5 times to quickly calm your body and mind.";
    
    lifestyleTips.push({
      id: 'life-stress-high',
      title: 'Daily Stress Relief & Calming Breath',
      description: stressDesc,
      badge: 'Stress Relief'
    });
  } else if (userStress === 'Moderate') {
    lifestyleTips.push({
      id: 'life-stress-moderate',
      title: 'Mindful Breaks & Outdoor Walks',
      description: 'Keep everyday stress under control with a 10-minute walk outside or a quiet break away from phones and screens. Eating foods rich in magnesium—like spinach, pumpkin seeds, and almonds—also helps your body stay relaxed.',
      badge: 'Stress Balance'
    });
  } else {
    lifestyleTips.push({
      id: 'life-stress-low',
      title: 'Maintain Healthy Balance & Recovery',
      description: 'Your low stress level is a wonderful asset for your health. Maintain this positive balance by taking regular downtime, enjoying relaxing hobbies, and balancing busy days with gentle walks or light stretching.',
      badge: 'Daily Balance'
    });
  }

  // C. Physical Activity Strategy
  if (profile.activityLevel === 'Sedentary') {
    lifestyleTips.push({
      id: 'life-activity-sedentary',
      title: 'Hourly Movement Breaks',
      description: 'Sitting for long hours slows circulation and metabolism. Stand up once every hour for a 2-minute walk or 10 gentle squats. These quick movement breaks keep your blood flowing and help your body process meals efficiently.',
      badge: 'Daily Movement'
    });
  } else if (profile.activityLevel === 'Lightly Active') {
    lifestyleTips.push({
      id: 'life-activity-light',
      title: 'Brisk Daily Walks for Heart Health',
      description: 'Your light activity is a wonderful foundation. Try adding brisk walking or easy cycling at a pace where you can comfortably talk. Aim for about 150 minutes across the week to strengthen your heart and build stamina.',
      badge: 'Heart Stamina'
    });
  } else if (profile.activityLevel === 'Moderately Active') {
    lifestyleTips.push({
      id: 'life-activity-moderate',
      title: 'Balanced Weekly Fitness Routine',
      description: 'With regular exercise, balance is key to avoiding fatigue. Try pairing 3 days of strength exercises to build tone and muscle with 2 days of cardio like walking or cycling for heart endurance.',
      badge: 'Balanced Fitness'
    });
  } else {
    lifestyleTips.push({
      id: 'life-activity-heavy',
      title: 'Active Recovery & Proper Fueling',
      description: 'Staying very active is fantastic for your health, but your body needs rest to rebuild. Make sure to eat enough protein and healthy carbs, drink plenty of water, and take rest days so your muscles fully recover.',
      badge: 'Active Recovery'
    });
  }

  // D. Smoking Status Strategy
  if (profile.smokingStatus === 'Active smoker' || profile.smokingStatus === 'Yes') {
    lifestyleTips.push({
      id: 'life-smoking-active',
      title: 'Protect Heart & Lung Health',
      description: 'Smoking places extra strain on your heart, blood vessels, and lungs. Eating antioxidant-rich foods like blueberries and leafy greens helps protect your cells, and speaking with your doctor can give you personalized support to cut back or quit.',
      badge: 'Heart Protection'
    });
  } else if (profile.smokingStatus === 'Former smoker') {
    lifestyleTips.push({
      id: 'life-smoking-former',
      title: 'Keep Your Lungs Healthy & Strong',
      description: 'Congratulations on quitting smoking! Support your continued lung recovery with slow, deep breathing exercises each day. Eating plenty of vegetables like broccoli and Brussels sprouts also helps your body stay clean and healthy.',
      badge: 'Lung Health'
    });
  }

  // E. Alcohol Consumption Strategy
  if (profile.alcoholConsumption === 'Heavy' || profile.alcoholConsumption === 'Regularly') {
    lifestyleTips.push({
      id: 'life-alcohol-heavy',
      title: 'Cut Back to Protect Liver & Sleep',
      description: 'Frequent alcohol makes it harder for your liver to process fats and prevents deep, restful sleep. Gradually reducing your intake will quickly boost your energy, improve sleep quality, and protect your liver.',
      badge: 'Liver & Sleep'
    });
  } else if (profile.alcoholConsumption === 'Moderate' || profile.alcoholConsumption === 'Socially') {
    lifestyleTips.push({
      id: 'life-alcohol-moderate',
      title: 'Drink Water & Finish Drinks Early',
      description: 'Alcohol close to bedtime raises your sleeping heart rate and disrupts deep rest. Enjoy drinks earlier in the evening and finish at least 3 to 4 hours before bed so your body can rest and recover overnight.',
      badge: 'Sleep Defense'
    });
  } else if (profile.alcoholConsumption === 'Light' || profile.alcoholConsumption === 'Rarely') {
    lifestyleTips.push({
      id: 'life-alcohol-light',
      title: 'Stay Hydrated with Occasional Drinks',
      description: 'Your light or occasional alcohol intake is well-balanced. When you do enjoy a drink, have a glass of water alongside it to keep yourself well hydrated and energized.',
      badge: 'Hydration Buffer'
    });
  }

  // F. Additional Highly Conditional Lifestyle Hacks (Diabetes, Gastro, Heart Health)
  if (hasDiabetes || isBloodSugarControl || bmiValue >= 25) {
    lifestyleTips.push({
      id: 'life-postmeal-walk',
      title: '10-Minute Walk After Meals',
      description: 'A light 10-minute walk right after your main meal helps muscles absorb sugar from your food naturally, keeping your blood sugar steady and aiding smooth digestion.',
      badge: 'Blood Sugar'
    });
  }

  if (hasGastro) {
    lifestyleTips.push({
      id: 'life-gastro-chewing-hack',
      title: 'Chew Food Thoroughly',
      description: 'Take time to chew each bite well before swallowing. Chewing thoroughly breaks food down with saliva, which eases the work on your stomach and helps prevent acid reflux and bloating.',
      badge: 'Easy Digestion'
    });
    lifestyleTips.push({
      id: 'life-gastro-spacing-hack',
      title: 'Finish Eating 3 Hours Before Bed',
      description: 'Finish dinner or snacks at least 3 hours before lying down to sleep. Giving your stomach time to empty helps prevent nighttime acid reflux and heartburn.',
      badge: 'Reflux Relief'
    });
  }

  if (isWeightLoss) {
    lifestyleTips.push({
      id: 'life-weightloss-satiety',
      title: 'Balanced Plate & Water Before Meals',
      description: 'Fill half your plate with colorful vegetables, a quarter with lean protein, and a quarter with whole grains. Drinking a glass of water 15 minutes before eating helps you feel comfortably satisfied.',
      badge: 'Portion Balance'
    });
  }
  if (isWeightGain) {
    lifestyleTips.push({
      id: 'life-weightgain-meal-freq',
      title: 'Enjoy 5 to 6 Smaller Meals',
      description: 'Instead of having 3 heavy meals that leave you uncomfortably full, eat smaller nutritious meals or snacks every 3 hours. This makes it easy to get enough calories without bloating.',
      badge: 'Healthy Energy'
    });
  }

  // Prepend region-specific recommendations if applicable
  let finalFoodsToEat = [...foodsToEat];
  let finalCombinations = [...healthyCombinations];

  const rawRegion = profile.countryOrRegion || (profile.healthConditions || []).find((c) => c && c.startsWith('region:'))?.replace('region:', '') || 'Global/Other';

  if (rawRegion && rawRegion !== 'Global/Other') {
    const regional = getRegionalRecommendations(rawRegion, profile, bmiValue, bmiCategory);
    if (regional) {
      if (regional.foodsToEat && regional.foodsToEat.length > 0) {
        finalFoodsToEat = [...regional.foodsToEat, ...foodsToEat];
      }
      if (regional.healthyCombinations && regional.healthyCombinations.length > 0) {
        finalCombinations = [...regional.healthyCombinations, ...healthyCombinations];
      }
    }
  }

  // Deduplicate and filter foods to avoid
  const uniqueAvoids = Array.from(new Map(foodsToAvoid.map(item => [item.title, item])).values());

  return {
    bmiValue,
    bmiCategory,
    foodsToEat: finalFoodsToEat,
    foodsToAvoid: uniqueAvoids,
    healthyCombinations: finalCombinations,
    waterIntake: {
      liters: totalWaterLiters,
      cups: totalWaterCups,
      description: waterDescription,
      tips: waterTips
    },
    exercise: {
      type: exerciseType,
      frequency: exerciseFreq,
      duration: exerciseDur,
      intensity: exerciseInt,
      description: exerciseDesc,
      routine: exerciseRoutines,
      precautions: exercisePrecautions
    },
    lifestyleTips
  };
}

function getRegionalRecommendations(
  region: string,
  profile: HealthProfile,
  bmiValue: number,
  bmiCategory: string
): { foodsToEat: RecommendationItem[]; healthyCombinations: RecommendationItem[] } | null {
  const goal = profile.healthGoal || 'Improve Overall Health';
  const conditions = (profile.healthConditions || []).map(c => c.toLowerCase());
  const allergies = (profile.foodAllergies || []).map(a => a.toLowerCase());
  const diet = profile.dietaryPreference || 'None';

  const isWeightLoss = goal === 'Weight Loss' || goal === 'Lose Weight';
  const isWeightGain = goal === 'Weight Gain' || goal === 'Gain Weight';
  const isMuscleGain = goal === 'Muscle Gain';
  const isHeartHealth = goal === 'Heart Health';
  const isBloodSugarControl = goal === 'Blood Sugar Control';

  const hasDiabetes = conditions.includes('diabetes');
  const hasHypertension = conditions.includes('hypertension');
  const hasCholesterol = conditions.includes('cholesterol');
  const hasHeart = conditions.includes('heart');
  const hasKidney = conditions.includes('kidney');
  const hasAsthma = conditions.includes('asthma');
  const hasGastro = conditions.includes('gastro');

  const isVeg = diet === 'Vegetarian' || diet === 'Vegan';
  const isVegan = diet === 'Vegan';
  const isKeto = diet === 'Keto';
  const isPaleo = diet === 'Paleo';

  // Generate personalized medical rationale sentence for food explanation
  let rationale = '';
  if (hasDiabetes || isBloodSugarControl) {
    rationale = 'its low-glycemic nature assists in preventing sharp blood glucose surges and moderates insulin spikes.';
  } else if (hasHypertension || hasHeart || isHeartHealth) {
    rationale = 'it has natural cardioprotective minerals, is low in sodium, and optimizes vascular elasticity and circulation.';
  } else if (hasCholesterol) {
    rationale = 'it is rich in soluble fibers/healthy lipids that actively bind and help clear excessive circulating LDL cholesterol.';
  } else if (isWeightLoss) {
    rationale = 'its high nutrient density and low glycemic load support healthy caloric deficits while preserving lean tissues.';
  } else if (isMuscleGain || isWeightGain) {
    rationale = 'its clean amino acid structure and calorie-efficient density promote lean tissue protein synthesis and energy recovery.';
  } else if (hasGastro) {
    rationale = 'it is extremely soothing, low in gastrointestinal irritants, and highly easy to digest, preserving intestinal integrity.';
  } else if (hasKidney) {
    rationale = 'its balanced micro-mineral profile is safe for renal filtration, limiting unnecessary nitrogenous waste load.';
  } else {
    rationale = 'it is loaded with essential bioavailable micronutrients, reinforcing antioxidant defense and physical vitality.';
  }

  // Define database of regional foods with optional categories and tags for profile mapping
  const regionalDatabase: Record<string, { 
    foods: { id: string; title: string; desc: string; badge: string; tags: string[]; category?: 'Breakfast' | 'Lunch' | 'Dinner' | 'Healthy Snacks' | 'Drinks' }[]; 
    combos: { id: string; title: string; desc: string; badge: string; tags: string[] }[] 
  }> = {
    'Nigeria': {
      foods: [
        // Breakfast items (converted into complete meal plans)
        {
          id: 'ng-meal-moinmoin-koko',
          title: 'Steamed Honey-Bean Moin Moin with Warm Spiced Millet Koko',
          desc: 'A complete protein-spiced breakfast plan. Savory steamed honey-bean pudding made with red bell peppers and onions, paired with a hot cup of probiotic fermented millet porridge infused with fresh ginger and cloves.',
          badge: 'Satiety & Gut Care',
          tags: ['vegan', 'veg', 'non-keto', 'non-paleo', 'blood-sugar', 'low-glycemic', 'weight-loss', 'heart-health', 'soluble-fiber', 'gastro-safe', 'kidney-safe'],
          category: 'Breakfast'
        },
        {
          id: 'ng-meal-tombrown-soy',
          title: 'Tom Brown Multi-Grain Porridge topped with Ground Almonds',
          desc: 'A nutrient-dense restorative porridge made of roasted local guinea corn, yellow millet, and yellow corn, fortified with high-protein soybeans and topped with a light sprinkle of crushed almonds.',
          badge: 'B-Vitamin & Protein Boost',
          tags: ['vegan', 'veg', 'non-keto', 'non-paleo', 'weight-gain', 'blood-sugar', 'low-glycemic', 'gastro-safe', 'high-protein'],
          category: 'Breakfast'
        },
        {
          id: 'ng-meal-akara-pap',
          title: 'Oven-Baked Akara (Bean Cakes) served with Date-Sweetened Pap',
          desc: 'A healthy twist on a Nigerian classic. Light, airy honey-bean cakes baked with minimal oil to preserve cardiovascular health, served with fresh unrefined corn custard sweetened naturally with date powder.',
          badge: 'Cardiac Safe Classic',
          tags: ['vegan', 'veg', 'non-keto', 'non-paleo', 'blood-sugar', 'low-glycemic', 'heart-health', 'weight-loss'],
          category: 'Breakfast'
        },
        {
          id: 'ng-meal-gardenegg-eggwhites',
          title: 'Steamed Garden Eggs with Herb-Scrambled Egg Whites & Sautéed Ugu',
          desc: 'A low-calorie, low-glycemic fat-burning plate. Tender steamed native green garden eggs sliced thin, accompanied by fluffy scrambled egg whites seasoned with local herbs and a side of quick-sautéed fluted pumpkin leaves (Ugu).',
          badge: 'Low-Carb Metabolic Starter',
          tags: ['non-vegan', 'veg', 'keto', 'paleo', 'weight-loss', 'blood-sugar', 'low-glycemic', 'heart-health', 'kidney-safe'],
          category: 'Breakfast'
        },
        // Lunch items (converted into complete meal plans)
        {
          id: 'ng-meal-ofada-eforiro',
          title: 'Unpolished Ofada Brown Rice served with Rich Efo Riro Spinach Stew',
          desc: 'Bran-fiber rich local wild brown Ofada rice paired with a savory, low-oil stew of sautéed local spinach, fluted pumpkin leaves (Ugu), onions, and bell peppers, topped with slow-grilled mackerel or high-protein organic tofu.',
          badge: 'Vascular Cleansing Plate',
          tags: ['keto', 'paleo', 'heart-health', 'blood-sugar', 'low-glycemic', 'weight-loss', 'weight-gain', 'high-protein', 'low-sodium'],
          category: 'Lunch'
        },
        {
          id: 'ng-meal-oatswallow-ewedu',
          title: 'Fiber-Rich Oat Swallow served with Slippery Ewedu Soup & Tilapia Stew',
          desc: 'A perfect glycemic buffer meal. Smooth whole-grain oat swallow fufu paired with slippery, vitamin-dense Ewedu (jute leaves) soup and grilled lake tilapia or tofu stewed in a mild tomato-capsicum reduction.',
          badge: 'Glycemic Shield Swallow',
          tags: ['vegan', 'veg', 'non-keto', 'non-paleo', 'blood-sugar', 'low-glycemic', 'heart-health', 'gastro-safe', 'weight-loss'],
          category: 'Lunch'
        },
        {
          id: 'ng-meal-okrasoup-oatfufu',
          title: 'Prebiotic Okra Ila Alasepo with Oat Swallow & Herb-Grilled Chicken',
          desc: 'A digestive-friendly lunch plan. Freshly chopped okra pods simmered with fermented locust beans (iru), fish, and prawns, paired with a portion of fiber-heavy oat swallow fufu and tender grilled skinless chicken breast.',
          badge: 'Gut Prebiotic Mucilage',
          tags: ['non-vegan', 'non-veg', 'keto', 'paleo', 'gastro-safe', 'blood-sugar', 'low-glycemic', 'heart-health', 'weight-loss', 'high-protein'],
          category: 'Lunch'
        },
        {
          id: 'ng-meal-gbegiri-ewedu-ofada',
          title: 'Creamy Gbegiri Bean Soup & Ewedu Layer over unpolished Ofada Rice',
          desc: 'A complete plant-powered Yoruba culinary plan. Smooth, slow-simmered cream of peeled honey beans (gbegiri) layered over slippery Ewedu jute leaves, served with unpolished local Ofada brown rice for long-lasting energy.',
          badge: 'Digestive Relief & Satiety',
          tags: ['vegan', 'veg', 'non-keto', 'non-paleo', 'gastro-safe', 'weight-loss', 'blood-sugar', 'low-glycemic', 'heart-health'],
          category: 'Lunch'
        },
        // Dinner items (converted into complete meal plans)
        {
          id: 'ng-meal-catfish-peppersoup',
          title: 'Aromatic Catfish Pepper Soup with Boiled Green Plantains & Scent Leaves',
          desc: 'A restorative, high-protein evening plan. Fresh catfish simmered in a warm, medicinal pepper broth spiced with ginger, garlic, calabash nutmeg, and fresh scent leaves, paired with slow-burning boiled unripe green plantains.',
          badge: 'Endothelial Activation',
          tags: ['non-vegan', 'non-veg', 'keto', 'paleo', 'heart-health', 'weight-loss', 'low-glycemic', 'high-protein', 'spicy'],
          category: 'Dinner'
        },
        {
          id: 'ng-meal-grilledtilapia-ugu',
          title: 'Lemon-Grilled Lake Tilapia with Steamed Ugu Greens & Sweet Potato',
          desc: 'An excellent recovery dinner. Whole fresh tilapia rubbed with garlic, ginger, and scent leaves, grilled cleanly and paired with steamed fluted pumpkin leaves (Ugu) and baked unpeeled orange sweet potato wedges.',
          badge: 'Cardiac Omega-3 Recovery',
          tags: ['non-vegan', 'non-veg', 'keto', 'paleo', 'heart-health', 'blood-sugar', 'low-glycemic', 'weight-loss', 'high-protein'],
          category: 'Dinner'
        },
        {
          id: 'ng-meal-plantainporridge-mackerel',
          title: 'Unripe Green Plantain Porridge slow-cooked with Flaked Mackerel',
          desc: 'A savory, iron-loaded one-pot meal. Diced green plantains simmered with onions, fresh tomatoes, scent leaves, ground crayfish, and pieces of flaked wild mackerel for healthy cardiovascular fats and steady energy.',
          badge: 'Vascular Tone & Iron Load',
          tags: ['non-vegan', 'non-veg', 'non-keto', 'non-paleo', 'blood-sugar', 'low-glycemic', 'heart-health'],
          category: 'Dinner'
        },
        {
          id: 'ng-meal-bitterleaf-goat',
          title: 'Thoroughly Washed Bitterleaf Soup (Ofe Onugbu) with Lean Goat Meat',
          desc: 'A cellular-detox dinner plan. Deeply nutritive local bitterleaf leaves thoroughly washed to maintain a pleasant sweet-savory herbal finish, slow-boiled with lean goat meat and fermented locust beans (iru), served with a side of steamed vegetables.',
          badge: 'Hepatic Cleanse & Iron',
          tags: ['non-vegan', 'non-veg', 'keto', 'paleo', 'blood-sugar', 'low-glycemic', 'heart-health', 'high-protein'],
          category: 'Dinner'
        },
        // Healthy Snacks items (converted into complete meal plans)
        {
          id: 'ng-meal-gardeneggs-peanutpaste',
          title: 'Crispy Sliced Garden Eggs with Pure Unsweetened Peanut Paste',
          desc: 'A fiber-rich satiety booster snack. Fresh organic green garden eggs sliced into wheels, served with a clean spread of pure, stone-ground unsweetened roasted peanut butter for healthy monounsaturated fats.',
          badge: 'Satiety & Lipid Control',
          tags: ['vegan', 'veg', 'keto', 'paleo', 'weight-loss', 'blood-sugar', 'low-glycemic', 'heart-health'],
          category: 'Healthy Snacks'
        },
        {
          id: 'ng-meal-sweetpotato-avocado',
          title: 'Steam-Baked Sweet Potato Wedges with Creamy Avocado-Scent Leaf Dip',
          desc: 'A vitamin-heavy snack combination. Steam-baked unpeeled sweet potato wedges served with a fresh dip of mashed avocado, lemon juice, and finely chopped scent leaves (African basil) for cardiovascular health.',
          badge: 'Beta-Carotene Fuel',
          tags: ['vegan', 'veg', 'non-keto', 'non-paleo', 'weight-gain', 'gastro-safe', 'heart-health'],
          category: 'Healthy Snacks'
        },
        {
          id: 'ng-meal-tigernuts-coconut',
          title: 'Raw Tiger Nuts (Ofio) mixed with Shaved Coconut Flakes',
          desc: 'A prebiotic digestive support snack. A simple, crunchy mixture of raw organic tiger nuts and fresh shaved coconut meat, offering exceptional levels of gut-healthy resistant starch, vitamin E, and dietary fiber.',
          badge: 'Prebiotic Resistant Starch',
          tags: ['vegan', 'veg', 'non-keto', 'non-paleo', 'blood-sugar', 'low-glycemic', 'weight-loss', 'heart-health'],
          category: 'Healthy Snacks'
        },
        // Drinks items (converted into complete meal plans)
        {
          id: 'ng-meal-zobo-ginger',
          title: 'Unsweetened Red Hibiscus Zobo Infused with Ginger & Date Purée',
          desc: 'A cold-brewed vascular health tonic. Deep-red Hibiscus sabdariffa sepals simmered with freshly crushed ginger root, cloves, and sweetened lightly with a touch of date fruit purée. Supports natural blood pressure relaxation.',
          badge: 'Cardiac ACE Relaxer',
          tags: ['vegan', 'veg', 'keto', 'paleo', 'heart-health', 'blood-sugar', 'low-glycemic', 'weight-loss', 'low-sodium'],
          category: 'Drinks'
        },
        {
          id: 'ng-meal-kununaya-coconut',
          title: 'Kunun Aya (Tiger Nut Coconut Milk) fortified with dates',
          desc: 'A rich, lactose-free plant milk plan. Creamy beverage made by cold-pressing soaked tiger nuts, fresh coconut meat, and dried dates. Extremely soothing for gastrointestinal lining and packed with prebiotic lipids.',
          badge: 'Dairy-Free Digestive Cream',
          tags: ['vegan', 'veg', 'non-keto', 'non-paleo', 'gastro-safe', 'weight-gain', 'heart-health'],
          category: 'Drinks'
        },
        {
          id: 'ng-meal-scentleaf-ginger-tea',
          title: 'Warm Scent Leaf (Efinrin) & Crushed Ginger Anti-Bloat Tea',
          desc: 'A restorative herbal digestive tea plan. Freshly plucked scent leaves and ginger root steeped in hot water, releasing essential eugenols that immediately soothe intestinal bloating and support liver recovery.',
          badge: 'Intestinal Anti-Bloat Infusion',
          tags: ['vegan', 'veg', 'keto', 'paleo', 'gastro-safe', 'low-glycemic', 'heart-health', 'low-sodium'],
          category: 'Drinks'
        }
      ],
      combos: [
        {
          id: 'ng-comb-ewedu',
          title: 'Oat Fufu served with Ewedu Jute Leaves & Fish Stew',
          desc: 'Finely milled oats fufu with dynamic slippery Ewedu soup. Ewedu is high in vitamins A, C, and E, which perfectly slows down digestion and binds bile acids.',
          badge: 'Glycemic Buffer',
          tags: ['non-vegan', 'non-veg', 'non-keto', 'non-paleo']
        },
        {
          id: 'ng-comb-jollof',
          title: 'Brown Rice Jollof served with Sautéed Ugu Leaves & Grilled Chicken/Tofu',
          desc: 'Sustained-energy brown rice cooked with tomato-pepper blend, served with iron-rich fluted pumpkin leaves and clean proteins.',
          badge: 'Complete Nutrient Meal',
          tags: ['non-keto', 'non-paleo']
        }
      ]
    },
    'Ghana': {
      foods: [
        {
          id: 'gh-red-red',
          title: 'Red Red (Slow-Simmered Cowpea Stew)',
          desc: 'Nutty black-eyed peas stewed with tomatoes, ginger, and garlic, served with baked plantain slices.',
          badge: 'Satiety Powerhouse',
          tags: ['vegan', 'veg', 'non-keto', 'non-paleo']
        },
        {
          id: 'gh-kontomire',
          title: 'Kontomire Stew (Cocoyam Leaf Stew)',
          desc: 'Highly alkaline leafy cocoyam greens cooked with onions, peppers, and clean mackerel or tofu.',
          badge: 'Alkaline Green',
          tags: ['keto', 'paleo']
        },
        {
          id: 'gh-garden-egg',
          title: 'Garden Egg Stew',
          desc: 'Local Ghanaian baby eggplants stewed with onions, fresh tomatoes, and ginger.',
          badge: 'High Soluble Fiber',
          tags: ['vegan', 'veg', 'keto', 'paleo']
        },
        {
          id: 'gh-millet-koko',
          title: 'Spiced Millet Porridge (Hausa Koko)',
          desc: 'Fermented whole grain millet porridge spiced with ginger and cloves, supporting gut microflora.',
          badge: 'Digestive Comfort',
          tags: ['vegan', 'veg', 'non-keto', 'non-paleo']
        }
      ],
      combos: [
        {
          id: 'gh-comb-plantain',
          title: 'Boiled Unripe Plantain paired with Kontomire & Egg Whites/Tofu',
          desc: 'Slow-burning carbohydrate starch from unripe plantains matched with iron-dense cocoyam leaves and lean protein.',
          badge: 'Fat-Burning Synergy',
          tags: ['non-keto', 'non-paleo']
        },
        {
          id: 'gh-comb-waakye',
          title: 'Brown Waakye with Sorghum Leaves & Steamed Tofu/Fish',
          desc: 'Traditional rice and black-eyed beans cooked with red sorghum leaf sheaths for a high load of active polyphenols.',
          badge: 'Polyphenol Recovery',
          tags: ['non-keto', 'non-paleo']
        }
      ]
    },
    'Kenya': {
      foods: [
        {
          id: 'ke-sukuma',
          title: 'Sukuma Wiki (Sautéed Collard Greens)',
          desc: 'Finely sliced local collard greens quickly sautéed with fresh tomatoes, garlic, onions, and cold-pressed oils.',
          badge: 'Lutein Protective',
          tags: ['vegan', 'veg', 'keto', 'paleo']
        },
        {
          id: 'ke-githeri',
          title: 'Githeri (Traditional Maize & Bean Stew)',
          desc: 'A simple, nutrient-dense blend of soft dry corn kernels and red kidney beans simmered in a light vegetable broth.',
          badge: 'Fiber Heavyweight',
          tags: ['vegan', 'veg', 'non-keto', 'non-paleo']
        },
        {
          id: 'ke-tilapia',
          title: 'Oven-Grilled Fresh Lake Tilapia',
          desc: 'Whole tilapia seasoned with minced ginger, garlic, and fresh lemon juice, grilled cleanly to retain essential fatty acids.',
          badge: 'Cardio Lipid Aid',
          tags: ['non-vegan', 'non-veg', 'keto', 'paleo']
        },
        {
          id: 'ke-irio',
          title: 'Irio (Mashed Potatoes, Peas & Sweet Corn)',
          desc: 'Comforting mash of sweet green peas, skin-on sweet potatoes, and organic corn kernels.',
          badge: 'Mineral Fuel',
          tags: ['vegan', 'veg', 'non-keto', 'non-paleo']
        }
      ],
      combos: [
        {
          id: 'ke-comb-ugali',
          title: 'Whole Wheat Ugali paired with Sukuma Wiki & Grilled Tilapia/Tofu',
          desc: 'A classic Kenyan power meal. The high fiber of Sukuma Wiki regulates the glycemic release of Whole grain Ugali.',
          badge: 'Kenyan Power Plate',
          tags: ['non-keto', 'non-paleo']
        }
      ]
    },
    'South Africa': {
      foods: [
        {
          id: 'za-biltong',
          title: 'Lean Beef Biltong (Coriander & Vinegar Cured)',
          desc: 'Premium lean grass-fed beef air-dried with sea salt, vinegar, and ground coriander, providing clean proteins.',
          badge: 'High-Density Protein',
          tags: ['non-vegan', 'non-veg', 'keto', 'paleo']
        },
        {
          id: 'za-chakalaka',
          title: 'Spicy Vegetable Chakalaka',
          desc: 'Relish made of carrots, green peppers, onions, baked beans, chili, and anti-inflammatory turmeric.',
          badge: 'Turmeric Enhanced',
          tags: ['vegan', 'veg', 'non-keto', 'non-paleo']
        },
        {
          id: 'za-sweetpotato',
          title: 'Savoury Baked Sweet Potato Mash',
          desc: 'Savoury baked sweet potato mash loaded with vitamin A, manganese, and potassium.',
          badge: 'Antioxidant Carb',
          tags: ['vegan', 'veg', 'non-keto', 'non-paleo']
        },
        {
          id: 'za-kingklip',
          title: 'Pan-Seared Lean Kingklip Fish',
          desc: 'Native wild white fish, incredibly clean and tender, seasoned with fresh parsley and lemon.',
          badge: 'Hypoallergenic Marine',
          tags: ['non-vegan', 'non-veg', 'keto', 'paleo']
        }
      ],
      combos: [
        {
          id: 'za-comb-bobotie',
          title: 'Lentil Bobotie served with Yellow Basmati Brown Rice',
          desc: 'A healthy plant-based take on the South African classic, baked with lentils, raisins, curry spices, and savory turmeric.',
          badge: 'Synergistic Cardio Plate',
          tags: ['vegan', 'veg', 'non-keto', 'non-paleo']
        }
      ]
    },
    'USA': {
      foods: [
        {
          id: 'us-salmon',
          title: 'Wild-Caught Pacific Salmon',
          desc: 'Cold-water salmon loaded with marine Omega-3 fatty acids (EPA/DHA) and high-density proteins.',
          badge: 'Omega-3 Power',
          tags: ['non-vegan', 'non-veg', 'keto', 'paleo']
        },
        {
          id: 'us-chicken',
          title: 'Herb-Grilled Chicken Breast',
          desc: 'Lean pasture-raised chicken breast marinated in rosemary, oregano, garlic, and fresh olive oil.',
          badge: 'Thermogenic Protein',
          tags: ['non-vegan', 'non-veg', 'keto', 'paleo']
        },
        {
          id: 'us-quinoa',
          title: 'Multi-Color Quinoa & Avocado Salad',
          desc: 'Gluten-free organic quinoa tossed with fresh cucumbers, cherry tomatoes, and diced avocados.',
          badge: 'Supergrain Amino',
          tags: ['vegan', 'veg', 'non-keto', 'non-paleo']
        },
        {
          id: 'us-squash',
          title: 'Roasted Spaghetti Squash',
          desc: 'Fibers of spaghetti squash baked and pulled, rich in vitamins C and B6 with minimal carb load.',
          badge: 'Low-Carb Fiber',
          tags: ['vegan', 'veg', 'keto', 'paleo']
        },
        {
          id: 'us-oats',
          title: 'Steel-Cut Oats with Berries',
          desc: 'Slow-cooked whole steel-cut oats rich in beta-glucan fibers, topped with fresh blackberries.',
          badge: 'Beta-Glucan Cleanse',
          tags: ['vegan', 'veg', 'non-keto', 'non-paleo']
        }
      ],
      combos: [
        {
          id: 'us-comb-fitness',
          title: 'Grilled Salmon paired with Steamed Asparagus & Quinoa Bowl',
          desc: 'Provides a spectacular blend of cardiovascular lipids, vascular minerals, and complete proteins for cellular performance.',
          badge: 'Clean Cardio Plate',
          tags: ['non-vegan', 'non-veg', 'non-keto', 'non-paleo']
        }
      ]
    },
    'UK': {
      foods: [
        {
          id: 'uk-cod',
          title: 'Oven-Baked Cod Fillet',
          desc: 'Fresh Atlantic cod fillet baked clean with lemon juice, fresh dill, and cracked black pepper.',
          badge: 'Iodine Protective',
          tags: ['non-vegan', 'non-veg', 'keto', 'paleo']
        },
        {
          id: 'uk-barley',
          title: 'Scotch Barley & Root Vegetable Broth',
          desc: 'A slow-cooked pearl barley soup with parsnips, leeks, carrots, and sweet garden peas.',
          badge: 'Soluble Beta-Glucan',
          tags: ['vegan', 'veg', 'non-keto', 'non-paleo']
        },
        {
          id: 'uk-shepherds',
          title: 'Lean Turkey Shepherd\'s Pie',
          desc: 'Ground lean turkey and garden herbs topped with an elegant mashed sweet potato cover.',
          badge: 'Active Glycemic Fuel',
          tags: ['non-vegan', 'non-veg', 'non-keto', 'non-paleo']
        },
        {
          id: 'uk-mackerel',
          title: 'Steamed Smoked Mackerel',
          desc: 'Sustainably caught cold-water oily mackerel, loaded with bone-supportive Vitamin D and Omega-3 lipids.',
          badge: 'Vascular Joint Guard',
          tags: ['non-vegan', 'non-veg', 'keto', 'paleo']
        }
      ],
      combos: [
        {
          id: 'uk-comb-cod',
          title: 'Baked Cod served with Minted Mushy Peas & Steamed Asparagus',
          desc: 'Combines thyroid-supportive lean marine proteins with gut-protective peas and active kidney filtration minerals.',
          badge: 'British Clean Plate',
          tags: ['non-vegan', 'non-veg', 'keto', 'paleo']
        }
      ]
    },
    'Canada': {
      foods: [
        {
          id: 'ca-salmon',
          title: 'Wild Maple-Glazed Salmon Fillet',
          desc: 'Fresh caught salmon baked with a light glaze of pure Canadian maple syrup and coarse sea salt.',
          badge: 'Heart-Healthy Fats',
          tags: ['non-vegan', 'non-veg', 'non-keto', 'non-paleo']
        },
        {
          id: 'ca-wildrice',
          title: 'Savoury Wild Rice Pilaf',
          desc: 'Canadian wild long grain rice slow-simmered with organic portobello mushrooms, onions, and parsley.',
          badge: 'Zinc and Iron Rich',
          tags: ['vegan', 'veg', 'non-keto', 'non-paleo']
        },
        {
          id: 'ca-bison',
          title: 'Grilled Bison Tenderloin Strips',
          desc: 'Ultra-lean, organic Canadian bison meat, packed with bioavailable iron, B12, and lean structural proteins.',
          badge: 'Iron Supercharge',
          tags: ['non-vegan', 'non-veg', 'keto', 'paleo']
        },
        {
          id: 'ca-splitpea',
          title: 'Comforting Split Yellow Pea Soup',
          desc: 'Thick yellow split pea soup cooked slow with leeks, carrots, and celery, providing high soluble fibers.',
          badge: 'Soluble Satiety',
          tags: ['vegan', 'veg', 'non-keto', 'non-paleo']
        }
      ],
      combos: [
        {
          id: 'ca-comb-bison',
          title: 'Grilled Bison Fillet served with Wild Rice Pilaf & Brussels Sprouts',
          desc: 'Delivers massive cellular restoration, high-purity minerals, and sustained glucose releasing starches.',
          badge: 'Canadian Recovery Plate',
          tags: ['non-vegan', 'non-veg', 'non-keto', 'non-paleo']
        }
      ]
    },
    'India': {
      foods: [
        {
          id: 'in-dal',
          title: 'Yellow Dal Palak (Lentil Spinach Soup)',
          desc: 'Split yellow mung lentils cooked with fresh spinach, active turmeric (curcumin), fresh ginger, and garlic.',
          badge: 'Curcumin Infused',
          tags: ['vegan', 'veg', 'non-keto', 'non-paleo']
        },
        {
          id: 'in-baingan',
          title: 'Baingan Bharta (Smoked Eggplant Mash)',
          desc: 'Clay-oven smoked eggplants cooked clean with tomatoes, onions, green chilies, and fresh coriander leaves.',
          badge: 'High Cellular Antioxidant',
          tags: ['vegan', 'veg', 'keto', 'paleo']
        },
        {
          id: 'in-tandoori',
          title: 'Tandoori-Style Skinless Chicken Breast',
          desc: 'Lean chicken breast marinated in yogurt and aromatic Indian spices, grilled cleanly with coriander.',
          badge: 'Anabolic Herb Protein',
          tags: ['non-vegan', 'non-veg', 'keto', 'paleo']
        },
        {
          id: 'in-paneer',
          title: 'Seasoned Tofu or Paneer Bhurji',
          desc: 'Scrambled organic tofu or paneer tossed with turmeric, ginger, onions, tomatoes, and bell peppers.',
          badge: 'Clean Calcium Source',
          tags: ['veg', 'keto']
        },
        {
          id: 'in-khichdi',
          title: 'Moong Dal Khichdi with Brown Rice',
          desc: 'A light, extremely comforting porridge of yellow mung dal and brown rice, ideal for gastro comfort.',
          badge: 'Gastro Soother',
          tags: ['vegan', 'veg', 'non-keto', 'non-paleo']
        }
      ],
      combos: [
        {
          id: 'in-comb-dal',
          title: 'Yellow Moong Dal paired with Cauliflower Sabzi & Brown Rice',
          desc: 'Provides a clean complete vegetarian amino-acid matrix alongside liver-supportive cruciferous nutrients.',
          badge: 'Classic Ayurvedic Plate',
          tags: ['vegan', 'veg', 'non-keto', 'non-paleo']
        }
      ]
    },
    'China': {
      foods: [
        {
          id: 'cn-bass',
          title: 'Steamed Sea Bass with Scallion & Ginger',
          desc: 'Fresh sea bass steamed gently with fresh scallions, slivered ginger root, and a splash of light soy sauce.',
          badge: 'Thyroid Selenium Aid',
          tags: ['non-vegan', 'non-veg', 'keto', 'paleo']
        },
        {
          id: 'cn-bokchoy',
          title: 'Stir-Fried Garlic Baby Bok Choy',
          desc: 'Crispy baby bok choy quickly stir-fried with fresh minced garlic, scallions, and high-purity sesame oil.',
          badge: 'Calcium Dense Leafy',
          tags: ['vegan', 'veg', 'keto', 'paleo']
        },
        {
          id: 'cn-mapotofu',
          title: 'Mapo Tofu (Vegetarian Silken Style)',
          desc: 'Silken tofu cubes simmered in a spiced black bean and pepper sauce, garnished with scallions.',
          badge: 'Isoflavone Protection',
          tags: ['vegan', 'veg', 'non-keto', 'non-paleo']
        },
        {
          id: 'cn-congee',
          title: 'Soothing Millet or Brown Rice Congee',
          desc: 'Very slow simmered rice congee cooked with ginger, serving as an exceptional gastrointestinal cushion.',
          badge: 'GI Mucosa Support',
          tags: ['vegan', 'veg', 'non-keto', 'non-paleo']
        }
      ],
      combos: [
        {
          id: 'cn-comb-bass',
          title: 'Steamed Sea Bass with Garlic Bok Choy & Jasmine Brown Rice',
          desc: 'Combines iodine-dense sea fish with calcium-dense bok choy greens over slow-release complex brown rice starch.',
          badge: 'Eastern Longevity Plate',
          tags: ['non-vegan', 'non-veg', 'non-keto', 'non-paleo']
        }
      ]
    },
    'Australia': {
      foods: [
        {
          id: 'au-barramundi',
          title: 'Grilled Barramundi Fillet',
          desc: 'Barramundi grilled to absolute perfection, packed with clean cardiovascular Omega-3 fatty acids.',
          badge: 'Coastal Marine Protein',
          tags: ['non-vegan', 'non-veg', 'keto', 'paleo']
        },
        {
          id: 'au-kangaroo',
          title: 'Lean Grilled Kangaroo Fillet',
          desc: 'Ultra-lean native Australian red meat, exceptionally high in iron and energy-regulating CLA lipids.',
          badge: 'Ultra-Lean Iron Source',
          tags: ['non-vegan', 'non-veg', 'keto', 'paleo']
        },
        {
          id: 'au-sourdough',
          title: 'Smashed Avocado on Fermented Sourdough',
          desc: 'Creamy smashed fresh avocado seasoned with lemon juice and parsley, served over toasted organic sourdough.',
          badge: 'Healthy Monounsaturated Fats',
          tags: ['vegan', 'veg', 'non-keto', 'non-paleo']
        },
        {
          id: 'au-beetroot',
          title: 'Macadamia and Roasted Beetroot Salad',
          desc: 'Nitrate-rich roasted red beetroots tossed with baby spinach leaves and native roasted macadamia nuts.',
          badge: 'Nitric Oxide Booster',
          tags: ['vegan', 'veg', 'paleo']
        }
      ],
      combos: [
        {
          id: 'au-comb-barramundi',
          title: 'Grilled Barramundi served with Warrigal Greens & Sautéed Pumpkin',
          desc: 'A nutrient-loaded coastal plate that delivers complete physical replenishment and supports vascular integrity.',
          badge: 'Australian Bush Power',
          tags: ['non-vegan', 'non-veg', 'non-keto', 'non-paleo']
        }
      ]
    },
    'Brazil': {
      foods: [
        {
          id: 'br-moqueca',
          title: 'Moqueca de Peixe (Bahian Fish Stew)',
          desc: 'Sustainable fish fillets stewed in coconut milk, fresh garlic, sliced tomatoes, onions, coriander, and yellow peppers.',
          badge: 'Brazilian Coastal Stew',
          tags: ['non-vegan', 'non-veg', 'keto', 'paleo']
        },
        {
          id: 'br-feijoada',
          title: 'Feijoada Light (Black Bean Stew)',
          desc: 'Lean black beans stewed slowly with lean pork loin chops, bay leaves, fresh garlic, and spring onion.',
          badge: 'Iron & Fiber Rich',
          tags: ['non-vegan', 'non-veg', 'non-keto', 'non-paleo']
        },
        {
          id: 'br-couve',
          title: 'Couve a Mineira (Sautéed Garlic Collard Greens)',
          desc: 'Very finely shredded collard greens flash-fried with roasted golden garlic cloves and a dash of olive oil.',
          badge: 'Vitamins K & C Heavyweight',
          tags: ['vegan', 'veg', 'keto', 'paleo']
        },
        {
          id: 'br-acai',
          title: 'Pure Unsweetened Organic Açaí Bowl',
          desc: 'Antioxidant-dense unsweetened premium açaí pulp blended with banana and topped with raw seeds.',
          badge: 'Anthocyanin Shield',
          tags: ['vegan', 'veg', 'non-keto', 'non-paleo']
        }
      ],
      combos: [
        {
          id: 'br-comb-feijoada',
          title: 'Feijoada Light with Sautéed Couve & Toasted Cassava Flour (Farofa)',
          desc: 'Combines iron-heavy slow-burning black beans with calcium-dense collards and prebiotic cassava fiber.',
          badge: 'Samba Glycemic Control',
          tags: ['non-vegan', 'non-veg', 'non-keto', 'non-paleo']
        }
      ]
    }
  };

  const db = regionalDatabase[region];
  if (!db) return null;

  const rawFoods: any[] = [];
  const rawCombos: any[] = [];

  // Helper to filter and format item
  const processItem = (item: { id: string; title: string; desc: string; badge: string; tags: string[]; category?: string }, isCombo: boolean) => {
    // Check allergy safety using robust filter
    if (!isAllergySafe(item.title, item.desc, item.badge || '', allergies)) {
      return null;
    }

    // Check dietary constraints
    if (!isDietaryFriendly(item.title, item.desc, diet)) {
      return null;
    }

    const titleLower = item.title.toLowerCase();
    const descLower = item.desc.toLowerCase();

    for (const allergy of allergies) {
      if (allergy === 'none') continue;
      if (allergy === 'peanuts' && (titleLower.includes('peanut') || descLower.includes('peanut') || titleLower.includes('groundnut') || descLower.includes('groundnut'))) return null;
      if (allergy === 'gluten' && (titleLower.includes('sourdough') || titleLower.includes('wheat') || titleLower.includes('rye') || titleLower.includes('barley') || descLower.includes('sourdough') || descLower.includes('wheat') || descLower.includes('rye') || descLower.includes('barley'))) return null;
      if (allergy === 'dairy' && (titleLower.includes('paneer') || titleLower.includes('cheese') || titleLower.includes('yogurt') || titleLower.includes('milk') || titleLower.includes('butter') || titleLower.includes('cream') || descLower.includes('paneer') || descLower.includes('cheese') || descLower.includes('yogurt') || descLower.includes('milk') || descLower.includes('butter') || descLower.includes('cream'))) return null;
      if (allergy === 'soy' && (titleLower.includes('tofu') || titleLower.includes('tempeh') || titleLower.includes('soy') || descLower.includes('tofu') || descLower.includes('tempeh') || descLower.includes('soy'))) return null;
      if (allergy === 'shellfish' && (titleLower.includes('shrimp') || titleLower.includes('shellfish') || titleLower.includes('crab') || titleLower.includes('lobster') || titleLower.includes('prawn') || titleLower.includes('oyster') || titleLower.includes('periwinkle') || descLower.includes('shrimp') || descLower.includes('shellfish') || descLower.includes('crab') || descLower.includes('lobster') || descLower.includes('prawn') || descLower.includes('oyster') || descLower.includes('periwinkle'))) return null;
      if (allergy === 'tree_nuts' && (titleLower.includes('macadamia') || titleLower.includes('nut') || titleLower.includes('almond') || titleLower.includes('walnut') || titleLower.includes('cashew') || descLower.includes('macadamia') || descLower.includes('nut') || descLower.includes('almond') || descLower.includes('walnut') || descLower.includes('cashew'))) return null;
      if (allergy === 'eggs' && (titleLower.includes('egg') || descLower.includes('egg'))) return null;
    }

    // Check dietary constraints
    if (isVegan) {
      if (item.tags.includes('non-vegan')) return null;
      if (titleLower.includes('chicken') || titleLower.includes('turkey') || titleLower.includes('beef') || titleLower.includes('pork') || titleLower.includes('bison') || titleLower.includes('fish') || titleLower.includes('salmon') || titleLower.includes('cod') || titleLower.includes('mackerel') || titleLower.includes('bass') || titleLower.includes('tilapia') || titleLower.includes('barramundi') || titleLower.includes('kingklip') || titleLower.includes('egg') || titleLower.includes('paneer') || titleLower.includes('yogurt') || titleLower.includes('milk') || titleLower.includes('butter') || titleLower.includes('broth') || titleLower.includes('collagen') || titleLower.includes('goat')) return null;
      if (descLower.includes('chicken') || descLower.includes('turkey') || descLower.includes('beef') || descLower.includes('pork') || descLower.includes('bison') || descLower.includes('fish') || descLower.includes('salmon') || descLower.includes('cod') || descLower.includes('mackerel') || descLower.includes('bass') || descLower.includes('tilapia') || descLower.includes('barramundi') || descLower.includes('kingklip') || descLower.includes('egg') || descLower.includes('paneer') || descLower.includes('yogurt') || descLower.includes('milk') || descLower.includes('butter') || descLower.includes('broth') || descLower.includes('collagen') || descLower.includes('goat')) return null;
    } else if (isVeg) {
      if (item.tags.includes('non-veg')) return null;
      if (titleLower.includes('chicken') || titleLower.includes('turkey') || titleLower.includes('beef') || titleLower.includes('pork') || titleLower.includes('bison') || titleLower.includes('fish') || titleLower.includes('salmon') || titleLower.includes('cod') || titleLower.includes('mackerel') || titleLower.includes('bass') || titleLower.includes('tilapia') || titleLower.includes('barramundi') || titleLower.includes('kingklip') || titleLower.includes('broth') || titleLower.includes('collagen') || titleLower.includes('goat')) return null;
      if (descLower.includes('chicken') || descLower.includes('turkey') || descLower.includes('beef') || descLower.includes('pork') || descLower.includes('bison') || descLower.includes('fish') || descLower.includes('salmon') || descLower.includes('cod') || descLower.includes('mackerel') || descLower.includes('bass') || descLower.includes('tilapia') || descLower.includes('barramundi') || descLower.includes('kingklip') || descLower.includes('broth') || descLower.includes('collagen') || descLower.includes('goat')) return null;
    }

    if (isKeto) {
      if (item.tags.includes('non-keto')) return null;
    }

    if (isPaleo) {
      if (item.tags.includes('non-paleo')) return null;
    }

    const tags = item.tags || [];

    // Core Medical Exclusions (Safe Foods Only!)
    if (hasDiabetes || isBloodSugarControl) {
      if (tags.includes('high-glycemic')) return null;
    }
    if (hasGastro) {
      if (tags.includes('spicy') || tags.includes('irritant') || tags.includes('heavy-fat')) return null;
    }
    if (hasKidney) {
      if (tags.includes('high-potassium') || tags.includes('high-protein-renal-risk')) return null;
    }
    if (hasHypertension || hasCholesterol || isHeartHealth) {
      if (tags.includes('high-sodium') || tags.includes('trans-fat')) return null;
    }

    // Suitability scoring
    let score = 2; // Baseline score
    
    if (isWeightLoss || bmiCategory === 'Obese' || bmiCategory === 'Overweight') {
      if (tags.includes('weight-loss')) score += 3;
      if (tags.includes('high-calorie') || tags.includes('high-glycemic')) score -= 2;
    }
    
    if (isWeightGain || isMuscleGain || bmiCategory === 'Underweight') {
      if (tags.includes('weight-gain') || tags.includes('high-protein')) score += 3;
      if (tags.includes('very-low-calorie')) score -= 1;
    }
    
    if (hasDiabetes || isBloodSugarControl) {
      if (tags.includes('blood-sugar') || tags.includes('low-glycemic')) score += 3;
    }
    
    if (hasHypertension || hasCholesterol || isHeartHealth) {
      if (tags.includes('heart-health') || tags.includes('low-sodium') || tags.includes('soluble-fiber')) score += 3;
    }
    
    if (hasGastro) {
      if (tags.includes('gastro-safe')) score += 3;
    }
    
    if (hasKidney) {
      if (tags.includes('kidney-safe')) score += 2;
    }

    // Assemble final explanation describing why it is recommended for that user's health profile
    let finalDescription = '';
    if (region === 'Nigeria') {
      const condList = (profile.healthConditions || []).filter((c: string) => c && c.toLowerCase() !== 'none');
      const allergyList = (profile.foodAllergies || []).filter((a: string) => a && a.toLowerCase() !== 'none').map((a: string) => a.replace('_', ' '));
      
      let explanationParts: string[] = [];

      // Health conditions clause
      if (condList.length > 0) {
        const condsUpper = condList.map((c: string) => c.charAt(0).toUpperCase() + c.slice(1)).join(', ');
        if (condList.some((c: string) => ['diabetes', 'blood sugar'].includes(c.toLowerCase()))) {
          explanationParts.push(`In managing your ${condsUpper}, this complete meal combination's low-glycemic structure is specifically safe to maintain glycemic stability, reducing insulin strain.`);
        } else if (condList.some((c: string) => ['hypertension', 'cholesterol', 'heart'].includes(c.toLowerCase()))) {
          explanationParts.push(`To protect your cardiovascular health and address ${condsUpper}, this combination is high in natural potassium, low in sodium, and loaded with soluble fibers to aid LDL cholesterol clearance.`);
        } else if (condList.some((c: string) => ['gastro', 'stomach', 'acid', 'digestive'].includes(c.toLowerCase()))) {
          explanationParts.push(`For your sensitive digestion and ${condsUpper} conditions, this meal leverages highly soothing, non-irritant ingredients to prevent GI inflammation.`);
        } else if (condList.some((c: string) => ['kidney', 'renal'].includes(c.toLowerCase()))) {
          explanationParts.push(`Considering your ${condsUpper} conditions, this meal utilizes balanced mineral loads and high-quality, controlled proteins to reduce unnecessary renal filtration strain.`);
        } else {
          explanationParts.push(`Perfectly calibrated to be fully compatible with your registered health indicators (${condsUpper}) for cellular repair and metabolic safety.`);
        }
      } else {
        explanationParts.push("Formulated with therapeutic-grade, anti-inflammatory whole foods to support robust daily metabolic baseline levels.");
      }

      // Goal and BMI clause
      if (isWeightLoss || bmiCategory === 'Obese' || bmiCategory === 'Overweight') {
        explanationParts.push(`Given your BMI of ${bmiValue} (${bmiCategory}) and goal of ${goal}, this nutrient-dense meal plan encourages fat oxidation while offering exceptional satiety to sustain a healthy caloric deficit.`);
      } else if (isWeightGain || isMuscleGain || bmiCategory === 'Underweight') {
        explanationParts.push(`In support of your BMI of ${bmiValue} (${bmiCategory}) and focus on ${goal}, this provides calorie-efficient, highly bioavailable proteins to accelerate muscle synthesis and energy recovery.`);
      } else {
        explanationParts.push(`Perfectly aligned with your goal of ${goal} and optimal healthy BMI of ${bmiValue}, this meal helps sustain physical performance and structural muscle tone.`);
      }

      // Dietary Preference and Allergens clause
      if (diet !== 'None' || allergyList.length > 0) {
        let dText = diet !== 'None' ? `your ${diet} dietary strategy` : '';
        let aText = allergyList.length > 0 ? `the complete omission of your flagged allergens (${allergyList.join(', ')})` : '';
        let joining = (dText && aText) ? ' and ' : '';
        explanationParts.push(`It strictly respects ${dText}${joining}${aText} for complete peace of mind.`);
      }

      finalDescription = `${item.desc}\n\n• Clinical Reason: ${explanationParts.join(' ')}`;
    } else {
      finalDescription = `${item.desc} Highly recommended for your health profile because ${rationale}`;
    }

    return {
      id: item.id,
      title: item.title,
      description: finalDescription,
      badge: item.badge,
      category: item.category,
      score: score
    };
  };

  db.foods.forEach(f => {
    const processed = processItem(f, false);
    if (processed) rawFoods.push(processed);
  });

  db.combos.forEach(c => {
    const processed = processItem(c, true);
    if (processed) rawCombos.push(processed);
  });

  let selectedFoods: RecommendationItem[] = [];

  if (region === 'Nigeria') {
    // Group by category and sort to find the absolute most appropriate safe recommendations!
    const categories: ('Breakfast' | 'Lunch' | 'Dinner' | 'Healthy Snacks' | 'Drinks')[] = ['Breakfast', 'Lunch', 'Dinner', 'Healthy Snacks', 'Drinks'];
    categories.forEach(cat => {
      const catFoods = rawFoods.filter(f => f.category === cat);
      // Sort by computed suitability score descending
      catFoods.sort((a, b) => (b.score || 0) - (a.score || 0));
      // Squeeze results down to the top suitable items: 2 for Snacks and Drinks, 3 for meals
      const limit = (cat === 'Healthy Snacks' || cat === 'Drinks') ? 2 : 3;
      const topFoods = catFoods.slice(0, limit).map(({ score, ...rest }) => rest);
      selectedFoods.push(...topFoods);
    });
  } else {
    // For other countries/regions, map processed foods without score
    selectedFoods = rawFoods.map(({ score, ...rest }) => rest);
  }

  const selectedCombos = rawCombos.map(({ score, ...rest }) => rest);

  return { foodsToEat: selectedFoods, healthyCombinations: selectedCombos };
}
