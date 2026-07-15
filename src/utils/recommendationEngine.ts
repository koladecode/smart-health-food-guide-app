import { HealthProfile } from '../context/HealthProfileContext';

export interface RecommendationItem {
  id: string;
  title: string;
  description: string;
  badge?: string;
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
  const normAllergies = allergies.map(a => a.toLowerCase());
  const combinedText = `${title} ${description} ${badge}`.toLowerCase();

  if (normAllergies.includes('peanuts') && (combinedText.includes('peanut') || combinedText.includes('arachis'))) {
    return false;
  }
  if (normAllergies.includes('tree_nuts') && (
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
    combinedText.includes('bread')
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
    combinedText.includes('lactose')
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
    combinedText.includes('prawn')
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
  rawFoodsToEat.forEach(item => {
    // Clean up duplicates by ID
    if (!uniqueEatMap.has(item.id)) {
      const isSafe = isAllergySafe(item.title, item.description, item.badge || '', normAllergies);
      const isFriendly = isDietaryFriendly(item.title, item.description, diet);
      if (isSafe && isFriendly) {
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
  rawFoodsToAvoid.forEach(item => {
    if (!uniqueAvoidsMap.has(item.id)) {
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

  const breakfastTitle = '🌅 Synergistic Breakfast Bowl';
  let breakfastDesc = `Power your morning with a tailored combination of ${breakfastProtein} paired with ${breakfastCarb} and a base of ${breakfastBase}, finished with a sprinkle of ${breakfastFat}.`;
  
  if (isKeto) {
    breakfastDesc = `A perfect low-carb, high-fat morning start combining ${breakfastProtein} with ${breakfastCarb} cooked in cold-pressed olive oil, topped with ${breakfastFat}. This keeps your body in fat-burning ketosis and stabilizes morning energy.`;
  } else if (isWeightLoss) {
    breakfastDesc = `A nutrient-dense, calorie-controlled breakfast featuring ${breakfastProtein} alongside fiber-rich ${breakfastCarb}, served with ${breakfastBase} and topped with a portion-controlled sprinkle of ${breakfastFat} to optimize morning fullness.`;
  } else if (isMuscleGain || isWeightGain) {
    breakfastDesc = `An anabolic fueling combination containing high-quality ${breakfastProtein} paired with slow-burning ${breakfastCarb} and rich ${breakfastBase}, topped with energy-dense ${breakfastFat} to drive muscle recovery and caloric efficiency.`;
  } else if (isHeartHealth || hasHypertension) {
    breakfastDesc = `A cardioprotective, low-sodium pairing of ${breakfastProtein} (rich in omega-3) and heart-healthy ${breakfastCarb}, nested over light ${breakfastBase} and topped with vascular-friendly ${breakfastFat}.`;
  } else if (isBloodSugarControl || hasDiabetes) {
    breakfastDesc = `A glycemic-stabilizing morning bowl pairing ${breakfastProtein} with slow-release, low-glycemic ${breakfastCarb} and a base of ${breakfastBase}, sprinkled with fiber-rich ${breakfastFat} to ensure a slow, steady hill of glucose.`;
  } else if (hasGastro) {
    breakfastDesc = `An easy-to-digest, warm morning bowl combining well-cooked, non-irritating ${breakfastProtein} with soothing ${breakfastCarb} and gut-friendly ${breakfastBase}, lightly dusted with ${breakfastFat} to prevent acid reflux.`;
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

  const lunchTitle = '🥗 Macronutrient Balanced Lunch';
  let lunchDesc = `A highly satisfying, nutrient-dense lunch bowl containing ${lunchProtein} served alongside ${lunchCarb}, paired with ${lunchVeg} and drizzled with ${lunchDressing}.`;

  if (isKeto) {
    lunchDesc = `A low-glycemic ketogenic lunch consisting of ${lunchProtein} over a bed of low-carb ${lunchCarb}, served with fiber-rich ${lunchVeg} and a generous drizzle of ${lunchDressing} for optimal ketone production.`;
  } else if (isWeightLoss) {
    lunchDesc = `A portion-controlled, high-satiety lunch pairing lean ${lunchProtein} with a moderate serving of complex ${lunchCarb}, surrounded by volume-rich ${lunchVeg} and lightly dressed with ${lunchDressing}.`;
  } else if (isMuscleGain || isWeightGain) {
    lunchDesc = `A calorie-dense, anabolic lunch fueling recovery with ${lunchProtein}, a generous portion of carbohydrate-rich ${lunchCarb}, dynamic micronutrients from ${lunchVeg}, and energy-sustaining ${lunchDressing}.`;
  } else if (isHeartHealth || hasHypertension) {
    lunchDesc = `A vascular-friendly, low-sodium lunch utilizing cardioprotective ${lunchProtein} with soluble-fiber rich ${lunchCarb}, antioxidant-rich ${lunchVeg}, and healthy fats from ${lunchDressing}.`;
  } else if (isBloodSugarControl || hasDiabetes) {
    lunchDesc = `A blood-sugar stabilizing lunch aligning lean ${lunchProtein} with slow-burning ${lunchCarb} to prevent post-prandial spikes, accompanied by fiber-rich ${lunchVeg} and ${lunchDressing}.`;
  } else if (hasGastro) {
    lunchDesc = `A stomach-soothing, warm lunch pairing easily digestible ${lunchProtein} with soft, well-cooked ${lunchCarb}, non-irritating steamed ${lunchVeg}, and light ${lunchDressing}.`;
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
  let snackTitle = '🍏 Glycemic-Stabilizing Snack';
  let snackDesc = 'A handful of organic pumpkin seeds and fresh cucumber slices to support mineral levels and steady blood glucose.';

  if (isKeto) {
    snackTitle = '🥑 Ketogenic Fuel Snack';
    snackDesc = allergyTreeNuts 
      ? 'Sliced fresh cucumber and celery sticks dipped in organic fresh guacamole, providing essential potassium and healthy monounsaturated fats.'
      : 'Crispy pumpkin seeds paired with sliced avocado and a touch of sea salt (omit salt if hypertension is present) for sustained clean fats.';
  } else if (isPaleo) {
    snackTitle = '🍓 Paleo-Compliant Whole Food Snack';
    snackDesc = allergyTreeNuts
      ? 'A handful of fresh organic raspberries paired with toasted sunflower seed spread, offering clean micronutrients and healthy fats.'
      : 'Organic walnuts paired with wild blackberries, delivering high-potency antioxidants and natural cellular energy.';
  } else if (isBloodSugarControl || hasDiabetes) {
    snackTitle = '🔋 Blood Sugar Balancing Snack';
    snackDesc = 'Organic pumpkin seeds paired with fresh cucumber slices. The pumpkin seeds are rich in magnesium which improves insulin receptor sensitivity, while the cucumbers provide hydration with zero glycemic impact.';
  } else if (isHeartHealth || hasHypertension || hasCholesterol) {
    snackTitle = '❤️ Cardioprotective Heart-Smart Snack';
    snackDesc = allergyTreeNuts
      ? 'Toasted organic pumpkin seeds and fresh blueberries, which deliver potent plant sterols and soluble fiber to support arterial elasticity.'
      : 'A small handful of organic walnuts paired with fresh blackberries. Walnuts are rich in plant-based omega-3 alpha-linolenic acid (ALA), supporting healthy lipid profiles.';
  } else if (hasGastro) {
    snackTitle = '🌱 Gentle Digesting Snack';
    snackDesc = 'Warm baked apple slices sprinkled with a pinch of organic cinnamon. Apples contain gentle pectin fiber which acts as a gut prebiotic, and cooking them pre-digests the cell walls, ensuring zero gastric distress.';
  } else if (isWeightLoss) {
    snackTitle = '📉 High-Satiety Weight Loss Snack';
    snackDesc = 'Fresh sliced celery and bell pepper strips dipped in low-fat organic hummus (or sunflower seed spread if soy/sesame is an issue), delivering high-volume hydration and crunch with minimal calories.';
  } else if (isMuscleGain || isWeightGain) {
    snackTitle = '💪 Muscle Recovery Snack';
    if (isVegan || allergyDairy) {
      snackDesc = allergyTreeNuts
        ? 'High-protein organic pea protein shake mixed with oat beverage and a banana, providing immediate amino acid replenishment.'
        : 'A bowl of coconut ferment topped with sliced banana, organic hemp hearts, and a drizzle of sunflower seed spread for clean calories.';
    } else {
      snackDesc = allergyTreeNuts
        ? 'Organic plain Greek yogurt topped with pumpkin seeds, organic hemp hearts, and a sliced banana, delivering over 20g of high-biological value protein.'
        : 'Organic plain Greek yogurt topped with walnuts, organic hemp hearts, and a sliced banana, delivering over 20g of high-biological value protein.';
    }
  }

  rawHealthyCombinations.push({
    id: 'comb-snack',
    title: snackTitle,
    description: snackDesc,
    badge: 'Glycemic Balance'
  });

  // Standard Bioavailability Pairing (Excellent for women and overall vitality)
  rawHealthyCombinations.push({
    id: 'comb-iron-vitc',
    title: 'Plant-Based Iron + Active Vitamin C',
    description: 'Pair non-heme iron sources (like lentils, raw pumpkin seeds, or cooked spinach) with fresh Vitamin C (such as squeezed lemon juice, orange slices, or bell peppers). Vitamin C converts iron into a highly soluble ferrous state, raising gut absorption rates by 300%.',
    badge: 'Absorption Synergy'
  });

  // Fat Soluble Vitamin Pairing (Excellent for bone health and longevity)
  rawHealthyCombinations.push({
    id: 'comb-fat-vitamins',
    title: 'Healthy Monounsaturated Fats + Fat-Soluble Vitamins',
    description: 'Pair foods rich in Vitamin K or Vitamin D (such as steamed broccoli, kale, or eggs) with healthy fats (such as a splash of extra virgin olive oil or avocado). The lipid lipids act as transport vehicles, dramatically increasing vitamin transport across your gut barrier.',
    badge: 'Bioavailability Hack'
  });

  // Glycemic Buffer Combination (Excellent for Diabetes, Overweight, or Obese)
  if (hasDiabetes || bmiValue >= 25 || isWeightLoss || isBloodSugarControl) {
    rawHealthyCombinations.push({
      id: 'comb-carb-fiber-protein',
      title: 'Complex Carbohydrate + Plant Protein + Soluble Fiber',
      description: 'Avoid eating "naked" fast carbs (such as an apple, banana, or brown toast) on an empty stomach. Always pair them with fiber or healthy fats (e.g., apple slices with raw pumpkin seeds, or toast with avocado). This delays stomach emptying, transforming glucose spikes into a gentle, healthy curve.',
      badge: 'Glycemic Shield'
    });
  } else if (isMuscleGain) {
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
  } else {
    // Normal weight whole food synthesis
    rawHealthyCombinations.push({
      id: 'comb-amino-synthesis',
      title: 'Whole Grains + Clean Legumes',
      description: 'Pairing complete complex grains (like brown rice or quinoa) with organic legumes (like black beans or lentils) complements matching amino acids, forming a clean protein equivalent to animal tissues.',
      badge: 'Complete Protein'
    });
  }

  // Vascular Synergy (Excellent for blood pressure, unless kidney disease limits potassium)
  if (hasHypertension || hasHeart) {
    if (!hasKidney) {
      rawHealthyCombinations.push({
        id: 'comb-potassium-magnesium',
        title: 'Active Potassium + Elemental Magnesium duo',
        description: 'Combine potassium-dense foods (like fresh avocados or bananas) with foods high in magnesium (like raw pumpkin seeds or cacao nibs). Together, these minerals act as an osmotic pump, pushing excess sodium out through urination and relaxing stiff blood vessels.',
        badge: 'Cardioprotective Duo'
      });
    } else {
      rawHealthyCombinations.push({
        id: 'comb-kidney-safe-flavour',
        title: 'Fresh Citrus Juices + Low-Potassium Herbs',
        description: 'Squeeze a touch of fresh lemon juice and blend with fresh cilantro or garlic over your meals. This maximizes vascular dilation and adds rich flavor without utilizing sodium-heavy table salt or risky potassium-salt alternatives.',
        badge: 'Renal-Safe Vascular Synergy'
      });
    }
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
  rawHealthyCombinations.forEach(item => {
    if (!uniqueCombMap.has(item.id)) {
      if (item.id.startsWith('comb-breakfast') || item.id.startsWith('comb-lunch') || item.id.startsWith('comb-dinner') || item.id.startsWith('comb-snack')) {
        uniqueCombMap.set(item.id, item);
        return;
      }
      const isSafe = isAllergySafe(item.title, item.description, item.badge || '', normAllergies);
      const isFriendly = isDietaryFriendly(item.title, item.description, diet);
      if (isSafe && isFriendly) {
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
    exerciseType = 'Cardioprotective Cardiovascular Base Conditioning';
    exerciseDesc = 'Designed to foster cardiac stroke volume and vascular flexibility while strictly avoiding blood pressure peaks.';
    exercisesToRecommend.push({
      name: 'Steady-State Flat Cardio Walk',
      met: 3.3,
      duration: `${baseDurationMins} minutes`,
      frequency: '4 days/week',
      intensity: 'Low',
      safetyNotes: 'Keep breathing rhythmic and deep. Wear highly supportive athletic shoes. Stay on flat ground.'
    });
  } else if (hasArthritis) {
    exerciseType = 'Joint-Sparing Functional Cardio';
    exerciseDesc = 'Low-impact movements designed to preserve cardiovascular conditioning without stress on inflamed joints.';
    exercisesToRecommend.push({
      name: 'Water Laps or Deep Water Walking',
      met: 4.0,
      duration: `${baseDurationMins} minutes`,
      frequency: '3 days/week',
      intensity: 'Low to Moderate',
      safetyNotes: 'Water provides hydrostatic pressure to cushion joint spaces and reduce mechanical knee/hip strain.'
    });
  } else if (hasAsthma) {
    exerciseType = 'Airway-Safe Conditioning';
    exerciseDesc = 'Steady cardio designed to elevate lung capacity while minimizing airway dehydration or cold-shock spasms.';
    exercisesToRecommend.push({
      name: 'Humidified Indoor Cycling',
      met: 5.0,
      duration: `${baseDurationMins} minutes`,
      frequency: '3 days/week',
      intensity: 'Moderate',
      safetyNotes: 'Keep indoor air humid. Maintain steady conversational pace. Keep rescue inhaler within arm\'s reach.'
    });
  } else if (isWeightLoss) {
    exerciseType = 'High-Frequency Metabolic Circuit & Cardio';
    exerciseDesc = 'An active fat oxidation routine designed to maximize calorie expenditure and preserve lean body tissue.';
    exercisesToRecommend.push({
      name: 'Interval Cycling or Power Walking',
      met: 6.0,
      duration: `${baseDurationMins + 5} minutes`,
      frequency: '4 days/week',
      intensity: 'Moderate to High',
      safetyNotes: 'Alternate 1 minute of faster pace with 2 minutes of moderate recovery. Stay fully hydrated.'
    });
  } else if (isMuscleGain || isWeightGain) {
    exerciseType = isMuscleGain ? 'Progressive Strength & Hypertrophy Program' : 'Hypertrophy & High-Resistance Muscle Stimulus';
    exerciseDesc = isMuscleGain ? 'A high-stimulus program targeting progressive muscle overload.' : 'A muscle-building, progressive loading routine designed to support clean lean mass gain.';
    exercisesToRecommend.push({
      name: 'Low-Impact Resistance Rower Warm-up',
      met: 4.5,
      duration: '15 minutes',
      frequency: '3 days/week',
      intensity: 'Low to Moderate',
      safetyNotes: 'Focus on leg drive first, avoid hinging at the spine too early to prevent lower back stress.'
    });
  } else {
    exercisesToRecommend.push({
      name: 'Brisk Walk or Light Stationary Cycle',
      met: 4.0,
      duration: `${baseDurationMins} minutes`,
      frequency: '3-4 days/week',
      intensity: 'Moderate',
      safetyNotes: 'Maintain a warm conversational pace. Keep shoulders relaxed and posture tall.'
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
      safetyNotes: 'Do not hold your breath during the push or pull phase (Valsalva). Slow and controlled movements.'
    });
  } else if (hasArthritis) {
    exercisesToRecommend.push({
      name: 'Supported Wall Sits & Leg Extensions',
      met: 2.5,
      duration: '15 minutes (hold sits for 20-30s)',
      frequency: '3 days/week',
      intensity: 'Low to Moderate',
      safetyNotes: 'Keep lower back pinned completely flat to the wall. Stop immediately if there is sharp knee joint friction.'
    });
  } else if (hasKidney) {
    exercisesToRecommend.push({
      name: 'Moderate Resistance Band Dumbbell Circuit',
      met: 3.5,
      duration: '20 minutes (2 sets of 10 reps, high rest)',
      frequency: '3 days/week',
      intensity: 'Low to Moderate',
      safetyNotes: 'Avoid extreme muscular fatigue or pushing to failure to eliminate rhabdomyolysis risks.'
    });
  } else if (isWeightLoss) {
    exercisesToRecommend.push({
      name: 'Full-Body Resistance Circuit (Squats, Push-ups, Rows)',
      met: 5.0,
      duration: '25 minutes (3 circuits)',
      frequency: '3 days/week',
      intensity: 'Moderate',
      safetyNotes: 'Exhale during execution, maintain a stable core to protect your lumbar spine.'
    });
  } else if (isMuscleGain || isWeightGain) {
    if (age > 60) {
      exercisesToRecommend.push({
        name: 'Dumbbell Goblet Squats with Chair Support',
        met: 4.5,
        duration: '20 minutes (3 sets of 8 reps)',
        frequency: '3 days/week',
        intensity: 'Moderate',
        safetyNotes: 'Keep your torso upright. Sit back as if sitting into a chair. Ensure the chair is directly behind you.'
      });
    } else {
      exercisesToRecommend.push({
        name: 'Hypertrophic Resistance Training (Squats & Dumbbell Presses)',
        met: 5.5,
        duration: '35 minutes (3 sets of 8-10 reps)',
        frequency: '3 days/week',
        intensity: 'High',
        safetyNotes: 'Control the descent of weights. Do not lock out elbows or knees. Maintain a rigid neutral spine.'
      });
    }
  } else {
    exercisesToRecommend.push({
      name: 'Bodyweight Squats & Floor Glute Bridges',
      met: 3.5,
      duration: '20 minutes (3 sets of 12 reps)',
      frequency: '3 days/week',
      intensity: 'Moderate',
      safetyNotes: 'Keep feet flat. Focus on driving hips up with glutes, avoiding lower back extension.'
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
      safetyNotes: 'Perform adjacent to a sturdy countertop or handrail. Keep gaze forward to train balance receptors.'
    });
  } else if (hasHeart || hasHypertension) {
    exercisesToRecommend.push({
      name: 'Parasympathetic Deep Breathing (Vagus Activation)',
      met: 1.5,
      duration: '10 minutes',
      frequency: 'Daily (preferably post-exercise)',
      intensity: 'Gentle',
      safetyNotes: 'Inhale for 4 seconds, hold for 2, and exhale slowly for 6-8 seconds to decrease blood pressure.'
    });
  } else if (hasArthritis) {
    exercisesToRecommend.push({
      name: 'Chair Yoga & Gentle Hamstring/Hip Stretches',
      met: 2.2,
      duration: '20 minutes',
      frequency: '4 days/week',
      intensity: 'Low',
      safetyNotes: 'Never force joint limits. Focus on stretching muscle tissue, not straining tendons.'
    });
  } else if (isMuscleGain || isWeightGain) {
    exercisesToRecommend.push({
      name: 'Planks & Bird-Dog Core Stability',
      met: 3.0,
      duration: '15 minutes (holds of 20-30s)',
      frequency: '3 days/week',
      intensity: 'Moderate',
      safetyNotes: 'Do not let your hips sag. Keep head neutral and squeeze glutes to lock your spine.'
    });
  } else {
    exercisesToRecommend.push({
      name: 'Dynamic Vinyasa Yoga Flow',
      met: 2.8,
      duration: '20 minutes',
      frequency: '2-3 days/week',
      intensity: 'Low to Moderate',
      safetyNotes: 'Coordinate your breathing with each movement. Rest in Child\'s Pose if fatigue arises.'
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
      'STRICTLY AVOID the Valsalva maneuver (holding your breath during lifting or straining), as this spikes blood pressure to dangerous highs.',
      'If you encounter sudden chest tightness, jaw/shoulder pain, cold sweat, or extreme dizziness, terminate exercise immediately and call emergency services.',
      'Avoid exercises that involve your head being lower than your heart (e.g. decline press, certain yoga inversions).'
    );
  }
  if (hasAsthma) {
    exercisePrecautions.push(
      'Always keep your prescribed rescue inhaler directly adjacent to you during physical training.',
      'Double the duration of your warm-up (10-15 mins) with low intensity to allow airway capillaries to dilate slowly, preventing bronchospasms.',
      'If training outdoors in cold weather, wear a scarf or mask over your mouth to warm and humidify the air.'
    );
  }
  if (hasArthritis) {
    exercisePrecautions.push(
      'Avoid high-impact running, heavy lunges, or jumping, which apply excessive mechanical shock to sensitive joint cartilage.',
      'Perform a thorough 10-minute dynamic warm-up to lubricate the joint capsule with synovial fluid before adding load.',
      'If any joint feels hot, swollen, or experiences sharp pain, stop immediately and apply cold compression.'
    );
  }
  if (hasKidney) {
    exercisePrecautions.push(
      'Avoid extreme, muscle-damaging workouts (e.g., intensive eccentric squats to failure) to eliminate risks of rhabdomyolysis.',
      'Maintain diligent hydration during workouts, except as strictly limited by your nephrologist, to support metabolic clearing.'
    );
  }
  if (age > 60) {
    exercisePrecautions.push(
      'Prioritize balance training and functional stability over pure load lifting to protect older neural networks and prevent fall injury.',
      'Always ensure you have a wall, countertop, or heavy object within arm\'s reach when performing balance movements.'
    );
  }
  if (exercisePrecautions.length === 0) {
    exercisePrecautions.push(
      'Include a 5-10 minute dedicated dynamic warmup and dynamic stretching session before each workout.',
      'Track resting heart rate weekly as a baseline biomarker of cardiorespiratory recovery.',
      'Maintain proper hydration and do not exercise through sharp joint pain.'
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
    let sleepDesc = "You average less than 6 hours of sleep. This chronic deficit elevates morning cortisol and triggers fasting glucose spikes by impairing insulin clearance.";
    if (hasDiabetes || isBloodSugarControl) {
      sleepDesc += " For blood sugar management, even one night of restricted sleep reduces insulin sensitivity by 33%.";
    }
    if (hasHypertension) {
      sleepDesc += " Short sleep is strongly associated with elevated sympathetic vascular tone, preventing the natural nocturnal blood pressure dip.";
    }
    sleepDesc += " Target a daily 20-minute afternoon Non-Sleep Deep Rest (NSDR) or Yoga Nidra session to reset your nervous system, and strictly block blue light after 8:30 PM.";
    
    lifestyleTips.push({
      id: 'life-sleep-deficit',
      title: 'Maximize Glycemic & Cortisol Recovery',
      description: sleepDesc,
      badge: 'Sleep Deficit Protocol'
    });
  } else if (userSleep === 'More than 8 hours') {
    lifestyleTips.push({
      id: 'life-sleep-excess',
      title: 'Optimize Waking Inertia & Melatonin Anchoring',
      description: 'Averaging over 8 hours can sometimes indicate fragmented sleep or sleep inertia. Wake up immediately upon first arousal to prevent morning sluggishness. Seek direct outdoor sunlight (10,000+ lux) for 15 minutes within an hour of waking to suppress melatonin production and synchronize circadian hormone secretion.',
      badge: 'Circadian Anchoring'
    });
  } else {
    let sleepDesc = "Your sleep duration of 6 to 8 hours is moderate. To optimize sleep quality and transition to deeper REM and slow-wave stages, maintain a cool bedroom temperature (18°C / 65°F).";
    if (hasGastro) {
      sleepDesc += " Sleep on your left side to anatomically keep the gastric junction above stomach acid levels, preventing nocturnal GERD reflux.";
    }
    sleepDesc += " Ensure a completely dark room (or eye mask) to maximize pineal melatonin release, supporting blood-brain-barrier clearing during deep sleep.";
    
    lifestyleTips.push({
      id: 'life-sleep-optimal',
      title: 'Optimize Sleep Architecture & REM/Deep Phase',
      description: sleepDesc,
      badge: 'Sleep Quality'
    });
  }

  // B. Personalized Stress Management
  if (userStress === 'High') {
    let stressDesc = "Experiencing high chronic stress floods your blood with glucocorticoids, impairing digestion, raising heart rate, and stiffening arteries.";
    if (hasGastro) {
      stressDesc += " High stress stops normal gastric motility and triggers intestinal muscle spasms, exacerbating IBS and acid reflux. Practice deep breathing prior to each meal to signal safety to your enteric nervous system.";
    }
    if (hasHypertension || hasHeart) {
      stressDesc += " Elevated catecholamines from stress prevent vascular relaxation. Implement slow-paced nasal breathing to directly decrease blood pressure.";
    }
    stressDesc += " Practice the double-inhale physiological sigh: take a deep breath in through your nose, take a second micro-inhale to fully dilate the alveoli, and release a slow sigh out through your mouth. Repeat 5 times to immediately trigger the parasympathetic brake.";
    
    lifestyleTips.push({
      id: 'life-stress-high',
      title: 'Downregulate Sympathetic Overdrive',
      description: stressDesc,
      badge: 'Autonomic Balance'
    });
  } else if (userStress === 'Moderate') {
    lifestyleTips.push({
      id: 'life-stress-moderate',
      title: 'Proactive Cortisol Buffering & Stress Resiliency',
      description: 'Your moderate stress levels are manageable but require proactive cellular buffering. Incorporate a 10-minute daily silent mindfulness scan or a walk in nature without screens. Ensure adequate dietary magnesium-rich whole foods (such as spinach, pumpkin seeds, and almonds) to offset high adrenal magnesium excretion.',
      badge: 'Adrenal Resiliency'
    });
  } else {
    lifestyleTips.push({
      id: 'life-stress-low',
      title: 'Sustain Nervous System Balance & Active Recovery',
      description: 'Your low stress is a wonderful health asset. Maintain this state of nervous system balance by protecting your boundaries, pursuing creative hobbies, and ensuring you incorporate light active recovery days (like light stretching or leisure walks) to balance demanding cognitive or exercise schedules.',
      badge: 'Nervous System Health'
    });
  }

  // C. Physical Activity Strategy
  if (profile.activityLevel === 'Sedentary') {
    lifestyleTips.push({
      id: 'life-activity-sedentary',
      title: 'Break Sedentary Stagnation with "Exercise Snacks"',
      description: 'A sedentary baseline causes a rapid decline in muscle capillary density and skeletal muscle insulin sensitivity. Set a desk timer to stand up every 60 minutes and perform 10 bodyweight air squats or a 2-minute brisk corridor walk. This opens glucose transport channels (GLUT-4) without requiring insulin secretion.',
      badge: 'Metabolic Activity'
    });
  } else if (profile.activityLevel === 'Lightly Active') {
    lifestyleTips.push({
      id: 'life-activity-light',
      title: 'Build Zone 2 Aerobic Base and Capillary Density',
      description: 'Your light activity is a great starting point. Seek to build on this base by adding brisk walking or cycling at a pace where you can comfortably speak but not sing (Zone 2). Aim for 150 minutes weekly to stimulate mitochondrial biogenesis and significantly lower resting heart rate.',
      badge: 'Aerobic Base'
    });
  } else if (profile.activityLevel === 'Moderately Active') {
    lifestyleTips.push({
      id: 'life-activity-moderate',
      title: 'Structure Periodized Training & Skeletal Muscle Density',
      description: 'With a moderately active routine, balance is key to preventing overtraining. Structure your week with 3 days of progressive resistance training to build lean contractile muscle (which acts as a metabolic storage sink for glycogen) and 2 days of cardiovascular endurance workouts.',
      badge: 'Balanced Conditioning'
    });
  } else {
    lifestyleTips.push({
      id: 'life-activity-heavy',
      title: 'Support High Performance with Strategic Recovery',
      description: 'Being very active is excellent for metabolic health but requires deliberate recovery structures. Focus on glycogen replenishment with clean starches and ensure 1.6 to 2.2 grams of protein per kg of body weight. Track resting heart rate or heart rate variability (HRV) as indicators of nervous system fatigue.',
      badge: 'Performance Recovery'
    });
  }

  // D. Smoking Status Strategy
  if (profile.smokingStatus === 'Active smoker' || profile.smokingStatus === 'Yes') {
    lifestyleTips.push({
      id: 'life-smoking-active',
      title: 'Protect Vascular Endothelial Elasticity',
      description: 'Inhaling combustion products introduces heavy carbon monoxide, which binds to hemoglobin, depriving vital organs of oxygen. Smoking damages the endothelial lining, raising high-sensitivity C-reactive protein (hs-CRP). Focus on eating high-antioxidant foods (like blueberries and green tea) and consult a healthcare professional regarding structured cessation aids.',
      badge: 'Endothelial Protection'
    });
  } else if (profile.smokingStatus === 'Former smoker') {
    lifestyleTips.push({
      id: 'life-smoking-former',
      title: 'Support Pulmonary Clearance and Alveolar Repair',
      description: 'Congratulations on quitting! Your body continues to repair lung tissue. Support this repair with deep diaphragmatic yoga breathing (pranayama) to expand vital lung capacity and mobilize lower lobe cilia. Consume plenty of cruciferous vegetables (broccoli, Brussels sprouts) to assist phase II liver detoxification.',
      badge: 'Pulmonary Restoration'
    });
  } else {
    lifestyleTips.push({
      id: 'life-smoking-never',
      title: 'Preserve Mitochondrial Oxygen Delivery',
      description: 'Maintaining a smoke-free life preserves optimal oxygen transport capacity and capillary integrity. Keep avoiding secondhand vapor or smoke exposure to ensure maximum cardiovascular efficiency, preserving lung elasticity and cellular respiration as you age.',
      badge: 'Vascular Longevity'
    });
  }

  // E. Alcohol Consumption Strategy
  if (profile.alcoholConsumption === 'Heavy' || profile.alcoholConsumption === 'Regularly') {
    lifestyleTips.push({
      id: 'life-alcohol-heavy',
      title: 'Reverse Hepatic Fat and Protect Sleep Quality',
      description: 'Frequent or heavy alcohol consumption halts fatty acid oxidation in the liver, leading to hepatic fat deposits, and fragments sleep by blocking deep restorative stages. Establish a plan to taper consumption to zero. Support your liver with high-fiber grains and sulfur-rich foods (onions, garlic, eggs) to aid glutathione production.',
      badge: 'Hepatic Recovery'
    });
  } else if (profile.alcoholConsumption === 'Moderate' || profile.alcoholConsumption === 'Socially') {
    lifestyleTips.push({
      id: 'life-alcohol-moderate',
      title: 'Protect Gut Barrier & Overnight Cardiovascular Recovery',
      description: 'Even moderate or social alcohol consumption triggers minor gut permeability (leaky gut) and raises sleeping heart rate, preventing optimal cardiovascular rest. Avoid drinking alcohol within 4 hours of your bedtime to allow your autonomic nervous system to enter deep parasympathetic recovery.',
      badge: 'Gut & Sleep Defense'
    });
  } else if (profile.alcoholConsumption === 'Light' || profile.alcoholConsumption === 'Rarely') {
    lifestyleTips.push({
      id: 'life-alcohol-light',
      title: 'Safeguard Cellular Hydration and Nutrient Status',
      description: 'Your light/occasional consumption keeps toxic acetaldehyde exposure minimal. When you do choose to have a drink, consume 250ml of water containing electrolytes (sodium, potassium) alongside it to prevent mineral depletion and protect cellular hydration.',
      badge: 'Hydration Buffer'
    });
  } else {
    lifestyleTips.push({
      id: 'life-alcohol-none',
      title: 'Optimize Liver Function and Unfragmented Sleep Stages',
      description: 'Abstaining from alcohol entirely allows your liver to fully dedicate its enzymatic pathways to carbohydrate and fat metabolism, keeps your gut lining intact, and allows your sleep architecture to progress through complete, natural sleep cycles for maximum mental clarity.',
      badge: 'Toxic-Free Health'
    });
  }

  // F. Additional Highly Conditional Lifestyle Hacks (Diabetes, Gastro, Heart Health)
  if (hasDiabetes || isBloodSugarControl || bmiValue >= 25) {
    lifestyleTips.push({
      id: 'life-postmeal-walk',
      title: 'Perform 10-Minute Post-Meal Strolls',
      description: 'Walk slowly for exactly 10 minutes immediately following your largest meal. This triggers muscular glucose transporters (GLUT-4) to absorb sugars directly, sparing your pancreas from excessive insulin release.',
      badge: 'Metabolic Support'
    });
  }

  if (hasGastro) {
    lifestyleTips.push({
      id: 'life-gastro-chewing-hack',
      title: 'Implement the 30-Chew Mastification Drill',
      description: 'Force yourself to chew every bite of food at least 30 times. Salivary amylase begins carbohydrate breakdown early, sparing your stomach lining from heavy digestive work and reducing acid reflux.',
      badge: 'GI Preservation'
    });
    lifestyleTips.push({
      id: 'life-gastro-spacing-hack',
      title: 'Maintain a 3-Hour Fasting Window Before Bed',
      description: 'Complete your last calorie intake at least 180 minutes before lying down. This lets your stomach empty, mechanically preventing acid backflow and acid burn.',
      badge: 'GERD Reflux Prevention'
    });
  }

  if (isWeightLoss) {
    lifestyleTips.push({
      id: 'life-weightloss-satiety',
      title: 'Practice Mindful Plate Partitioning',
      description: 'Fill half of your plate with water-rich vegetables, a quarter with lean protein, and the remainder with complex carbs. Drink 300ml of water 15 minutes before the meal to prompt stretch receptors.',
      badge: 'Satiety Strategy'
    });
  }
  if (isWeightGain) {
    lifestyleTips.push({
      id: 'life-weightgain-meal-freq',
      title: 'Structure 5-6 Micro-Meals Daily',
      description: 'Instead of eating 3 huge meals that cause bloating and satiety fatigue, divide your caloric surplus target into smaller, calorie-dense portions spaced 3 hours apart.',
      badge: 'Surplus Efficiency'
    });
  }
  if (isMuscleGain) {
    lifestyleTips.push({
      id: 'life-musclegain-protein-timing',
      title: 'Distribute Protein Intake Evenly',
      description: 'Consume 25-35g of protein every 3-4 hours to continuously trigger muscle protein synthesis (MPS) spikes throughout the waking day, preventing muscle breakdown.',
      badge: 'Anabolic Optimization'
    });
  }
  if (isHeartHealth || hasHypertension) {
    lifestyleTips.push({
      id: 'life-hearthealth-nitric-oxide',
      title: 'Boost Vascular Nitric Oxide Biosynthesis',
      description: 'Squeeze dynamic physical activities or deep nasal breathing cycles during your day. Nasal breathing triggers systemic nitric oxide release, relaxing endothelial cells and lowering resting blood pressure.',
      badge: 'Endothelial Relaxation'
    });
  }

  return {
    bmiValue,
    bmiCategory,
    foodsToEat,
    foodsToAvoid,
    healthyCombinations,
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
