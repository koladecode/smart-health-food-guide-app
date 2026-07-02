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

export function generateRecommendations(profile: HealthProfile): PersonalizedRecommendations {
  const weight = Number(profile.weight) || 0;
  const height = Number(profile.height) || 0;
  const age = Number(profile.age) || 30;
  const activity = profile.activityLevel || 'Moderately Active';
  const goal = profile.healthGoal || 'Improve Overall Health';
  const conditions = profile.healthConditions || ['none'];
  const allergies = profile.foodAllergies || ['none'];
  const diet = profile.dietaryPreference || 'None';

  // 1. BMI Calculation
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

  // 2. Resolve Dietary Filter Flags
  const isVeg = diet === 'Vegetarian' || diet === 'Vegan';
  const isVegan = diet === 'Vegan';
  const isKeto = diet === 'Keto';
  const isPaleo = diet === 'Paleo';

  // Helper flags for health conditions
  const hasDiabetes = conditions.includes('diabetes');
  const hasHypertension = conditions.includes('hypertension');
  const hasCholesterol = conditions.includes('cholesterol');
  const hasHeart = conditions.includes('heart');
  const hasKidney = conditions.includes('kidney');
  const hasAsthma = conditions.includes('asthma');
  const hasGastro = conditions.includes('gastro');

  // Helper flags for food allergies
  const allergyPeanuts = allergies.includes('peanuts');
  const allergyGluten = allergies.includes('gluten');
  const allergyDairy = allergies.includes('dairy');
  const allergySoy = allergies.includes('soy');
  const allergyShellfish = allergies.includes('shellfish');
  const allergyTreeNuts = allergies.includes('tree_nuts');
  const allergyEggs = allergies.includes('eggs');

  // 3. Generate "Foods to Eat" List (Filtering based on Allergies and Dietary preferences)
  const foodsToEat: RecommendationItem[] = [];

  // Base suggestions adjusted by diet preference
  if (isVegan) {
    foodsToEat.push({
      id: 'eat-tempeh',
      title: 'Organic Tempeh & Extra Firm Tofu',
      description: 'Excellent sources of clean plant protein and prebiotics, rich in calcium and iron.',
      badge: 'Protein Source'
    });
    foodsToEat.push({
      id: 'eat-quinoa',
      title: 'Quinoa & Amaranth grains',
      description: 'Gluten-free complete protein sources containing all nine essential amino acids.',
      badge: 'Whole Grain'
    });
  } else if (isVeg) {
    foodsToEat.push({
      id: 'eat-eggs',
      title: 'Pasture-Raised Eggs',
      description: 'Rich in choline, high-quality protein, and healthy fats. Excellent for breakfast satiety.',
      badge: 'Protein Source'
    });
    foodsToEat.push({
      id: 'eat-lentils',
      title: 'Red and Brown Lentils',
      description: 'High in iron, folate, and soluble fiber to stabilize digestion.',
      badge: 'Legumes'
    });
  } else if (isKeto) {
    foodsToEat.push({
      id: 'eat-salmon',
      title: 'Wild-Caught Salmon & Mackerel',
      description: 'Loaded with healthy anti-inflammatory Omega-3 fats (EPA & DHA) and high-quality protein.',
      badge: 'Healthy Fats & Protein'
    });
    foodsToEat.push({
      id: 'eat-avocados',
      title: 'Avocados & Extra Virgin Olive Oil',
      description: 'Perfect source of monounsaturated fats and essential potassium, which helps limit Keto flu.',
      badge: 'Monounsaturated Fats'
    });
  } else if (isPaleo) {
    foodsToEat.push({
      id: 'eat-beef',
      title: 'Grass-Fed Beef & Bison',
      description: 'Pure bioavailable iron, zinc, and B vitamins, free from modern agricultural additives.',
      badge: 'Pure Protein'
    });
    foodsToEat.push({
      id: 'eat-berries',
      title: 'Wild Blackberries & Blueberries',
      description: 'High in antioxidants and phytonutrients with a low glycemic load.',
      badge: 'Antioxidants'
    });
  } else {
    // Standard Balanced
    foodsToEat.push({
      id: 'eat-poultry',
      title: 'Skinless Chicken or Turkey Breast',
      description: 'Lean protein to assist in physical repair, thermogenesis, and satiety.',
      badge: 'Lean Protein'
    });
    foodsToEat.push({
      id: 'eat-salmon-standard',
      title: 'Cold-water Fatty Fish',
      description: 'Salmon or sardines consumed 2x weekly supplies crucial cardiovascular support.',
      badge: 'Omega-3 rich'
    });
  }

  // Goal-driven additions
  if (goal === 'Lose Weight') {
    foodsToEat.push({
      id: 'eat-cruciferous',
      title: 'Cruciferous Vegetables',
      description: 'Broccoli, cauliflower, and Brussels sprouts offer massive volume, fiber, and micronutrients with minimal calorie density.',
      badge: 'Weight Deficit Support'
    });
    foodsToEat.push({
      id: 'eat-chia',
      title: 'Chia & Flax Seeds',
      description: 'Excellent soluble fiber that swells in the stomach to trigger stretch receptors and induce lasting fullness.',
      badge: 'High Satiety'
    });
  } else if (goal === 'Gain Weight') {
    foodsToEat.push({
      id: 'eat-nut-butter',
      title: 'Natural Almond & Peanut Butter',
      description: 'Highly caloric-dense and nutritious. Provides healthy fats and proteins for a clean surplus.',
      badge: 'Caloric Density'
    });
    foodsToEat.push({
      id: 'eat-sweet-potato',
      title: 'Roasted Sweet Potatoes',
      description: 'Rich in complex carbohydrates to replenish glycogen reserves and support muscular growth.',
      badge: 'Complex Carbohydrates'
    });
  } else if (goal === 'Improve Overall Health') {
    foodsToEat.push({
      id: 'eat-fermented',
      title: 'Unsweetened Kefir or Sauerkraut',
      description: 'Dose your digestive system with beneficial probiotics to reinforce gut-barrier integrity.',
      badge: 'Microbiome Support'
    });
    foodsToEat.push({
      id: 'eat-greens',
      title: 'Dark Leafy Greens (Spinach & Kale)',
      description: 'Abundant in non-heme iron, calcium, magnesium, and Vitamin K for skeletal and vascular protection.',
      badge: 'Phytonutrients'
    });
  }

  // Condition-driven additions (Logical merge, avoiding conflicts)
  if (hasDiabetes) {
    foodsToEat.push({
      id: 'eat-cinnamon',
      title: 'Ceylon Cinnamon & Apple Cider Vinegar',
      description: 'Assists in reducing postprandial glucose excursions by improving insulin sensitivity.',
      badge: 'Glycemic Regulator'
    });
    // Ensure we suggest magnesium-rich foods as diabetics tend to excrete more magnesium
    foodsToEat.push({
      id: 'eat-pumpkin-seeds',
      title: 'Raw Pumpkin Seeds',
      description: 'High in elemental magnesium, which acts as a key co-factor for carbohydrate metabolism.',
      badge: 'Magnesium Booster'
    });
  }

  if (hasHypertension || hasHeart) {
    foodsToEat.push({
      id: 'eat-garlic',
      title: 'Aged Garlic Extract & Celery',
      description: 'Contains natural vasodilating compounds (nitrates & active phthalides) to promote blood flow efficiency.',
      badge: 'Endothelial Support'
    });
    // Beetroot is great, unless they have kidney stones/kidney disease! High in oxalates.
    if (!hasKidney) {
      foodsToEat.push({
        id: 'eat-beetroot',
        title: 'Steamed Beetroot',
        description: 'Rich in inorganic nitrates which convert directly to nitric oxide, promoting arterial relaxation.',
        badge: 'Cardiovascular Aid'
      });
    }
  }

  if (hasCholesterol) {
    foodsToEat.push({
      id: 'eat-oat-bran',
      title: 'Oat Bran or Beta-Glucan Oats',
      description: 'Form soluble gels in the intestines that bind bile acids and drag excessive circulating LDL cholesterol out of the body.',
      badge: 'LDL Binding Fiber'
    });
  }

  if (hasKidney) {
    // Kidney friendly: lower phosphorus/potassium if severe, but keep basic clean protein
    foodsToEat.push({
      id: 'eat-blueberries',
      title: 'Fresh Blueberries & Cranberries',
      description: 'Low in potassium, phosphorus, and sodium, but packed with antioxidants that limit renal oxidative stress.',
      badge: 'Kidney Protective'
    });
  }

  if (hasGastro) {
    foodsToEat.push({
      id: 'eat-ginger',
      title: 'Fresh Ginger Root tea',
      description: 'Accelerates gastric emptying and eases digestive motility issues or mild acid reflux.',
      badge: 'Digestive Comfort'
    });
  }

  // Age-based adjustments
  if (age > 50) {
    foodsToEat.push({
      id: 'eat-collagen',
      title: 'Bone Broth or Collagen Peptides',
      description: 'Supplies amino acids like glycine and proline to maintain joint cartilage matrix and gut barrier lining.',
      badge: 'Structural Joint Care'
    });
  }

  // Strictly filter out allergen items from Foods to Eat
  let filteredFoodsToEat = foodsToEat.filter(item => {
    const titleLower = item.title.toLowerCase();
    const descLower = item.description.toLowerCase();
    const badgeLower = (item.badge || '').toLowerCase();

    if (allergyPeanuts && (titleLower.includes('peanut') || descLower.includes('peanut'))) return false;
    if (allergyTreeNuts && (titleLower.includes('almond') || descLower.includes('almond') || titleLower.includes('walnut') || descLower.includes('walnut') || titleLower.includes('nut ') || descLower.includes('nut '))) return false;
    if (allergyGluten && (titleLower.includes('oat') || descLower.includes('oat') || titleLower.includes('wheat') || descLower.includes('wheat') || titleLower.includes('bran') || descLower.includes('bran'))) {
      // Gluten-free oats are okay but let's be safe and exclude wheat/bran
      if (titleLower.includes('wheat') || titleLower.includes('bran')) return false;
    }
    if (allergyDairy && (titleLower.includes('kefir') || descLower.includes('kefir') || titleLower.includes('yogurt') || descLower.includes('yogurt') || titleLower.includes('dairy') || descLower.includes('dairy'))) return false;
    if (allergySoy && (titleLower.includes('tofu') || descLower.includes('tofu') || titleLower.includes('tempeh') || descLower.includes('tempeh') || titleLower.includes('soy') || descLower.includes('soy'))) return false;
    if (allergyEggs && (titleLower.includes('egg') || descLower.includes('egg'))) return false;
    if (allergyShellfish && (titleLower.includes('shrimp') || descLower.includes('shrimp') || titleLower.includes('shellfish') || descLower.includes('shellfish'))) return false;
    
    return true;
  });

  // Ensure Vegetarian/Vegan is respected in Foods to Eat
  if (isVegan) {
    filteredFoodsToEat = filteredFoodsToEat.filter(item => {
      const text = (item.title + ' ' + item.description).toLowerCase();
      return !text.includes('chicken') && !text.includes('turkey') && !text.includes('beef') && !text.includes('fish') && !text.includes('salmon') && !text.includes('egg') && !text.includes('kefir') && !text.includes('bison') && !text.includes('broth') && !text.includes('collagen');
    });
  } else if (isVeg) {
    filteredFoodsToEat = filteredFoodsToEat.filter(item => {
      const text = (item.title + ' ' + item.description).toLowerCase();
      return !text.includes('chicken') && !text.includes('turkey') && !text.includes('beef') && !text.includes('fish') && !text.includes('salmon') && !text.includes('bison') && !text.includes('broth') && !text.includes('collagen');
    });
  }

  // 4. Generate "Foods to Avoid" List
  const foodsToAvoid: RecommendationItem[] = [];

  // Base unhealthy foods
  foodsToAvoid.push({
    id: 'avoid-refined',
    title: 'Refined Sugar & High-Fructose Corn Syrup',
    description: 'Triggers systemic inflammation, increases liver fat deposition, and causes steep insulin spikes.',
    badge: 'Inflammatory'
  });
  foodsToAvoid.push({
    id: 'avoid-trans-fats',
    title: 'Hydrogenated & Trans-Fats',
    description: 'Found in heavily fried goods and cheap margarine; heavily elevates atherogenic LDL cholesterol.',
    badge: 'Arterial Hazard'
  });

  // Goal-driven avoid foods
  if (goal === 'Lose Weight') {
    foodsToAvoid.push({
      id: 'avoid-liquid-calories',
      title: 'Sweetened Fruit Juices & Sodas',
      description: 'Contains high caloric density without any dietary fiber, easily bypassing satiety signals.',
      badge: 'Caloric density'
    });
  } else if (goal === 'Gain Weight') {
    foodsToAvoid.push({
      id: 'avoid-empty-junk',
      title: 'Processed Fast Foods',
      description: 'While high in calories, they lack the dense micronutrients, minerals, and clean proteins required for lean muscle gains.',
      badge: 'Low Micronutrients'
    });
  }

  // Condition-driven avoids (Merge logically!)
  if (hasDiabetes) {
    foodsToAvoid.push({
      id: 'avoid-white-carbs',
      title: 'White Bread, Rice & Refined Pasta',
      description: 'High-glycemic processed starches that quickly break down into simple glucose, causing excessive glucose peaks.',
      badge: 'High Glycemic Load'
    });
    foodsToAvoid.push({
      id: 'avoid-dried-fruit',
      title: 'Dried Fruit with Added Glazing',
      description: 'Contains highly concentrated simple fructose which rapidly impacts liver metabolism and elevates blood sugar.',
      badge: 'Fructose Bomb'
    });
  }

  if (hasHypertension || hasHeart) {
    foodsToAvoid.push({
      id: 'avoid-cured-meats',
      title: 'Cured Meats & Sodium-dense Broths',
      description: 'Packed with added nitrites and extreme sodium content that triggers vascular fluid retention and drives blood pressure upwards.',
      badge: 'Sodium Alert'
    });
    foodsToAvoid.push({
      id: 'avoid-table-salt',
      title: 'Excessive Refined Table Salt',
      description: 'Avoid adding raw salt to pre-cooked meals. Replace with potassium chloride, lemon, or mineral herbs.',
      badge: 'Fluid Balance'
    });
  }

  if (hasCholesterol || hasHeart) {
    foodsToAvoid.push({
      id: 'avoid-packaged-pastries',
      title: 'Packaged Pastries & Ultra-Processed Snacks',
      description: 'A deadly combination of saturated fats and refined sugars that triggers high hepatic VLDL cholesterol synthesis.',
      badge: 'Vascular Blockages'
    });
  }

  if (hasKidney) {
    foodsToAvoid.push({
      id: 'avoid-high-oxalate',
      title: 'Excessive High-Oxalate Greens (Raw Spinach)',
      description: 'When renal filtration is reduced, high oxalate absorption can crystallize and trigger painful calcium oxalate stones.',
      badge: 'Renal Oxalates'
    });
    foodsToAvoid.push({
      id: 'avoid-excess-potassium',
      title: 'Concentrated Potassium Salts',
      description: 'Avoid synthetic "lite salt" alternatives that utilize potassium chloride, as compromised kidneys struggle to eliminate excess potassium.',
      badge: 'Potassium Regulation'
    });
  }

  if (hasGastro) {
    foodsToAvoid.push({
      id: 'avoid-citrus-spicy',
      title: 'Spicy Spices, Peppermint, & Citrus Juices',
      description: 'Relaxes the lower esophageal sphincter, allowing highly acidic gastric juices to leak back and burn esophageal walls.',
      badge: 'Acidic Triggers'
    });
    foodsToAvoid.push({
      id: 'avoid-carbonated',
      title: 'Carbonated Drinks & Artificial Polyols',
      description: 'Releases high gas volume in the stomach, worsening bloating, gut spasms, and lower abdominal pain.',
      badge: 'Intestinal Gas'
    });
  }

  // Add severe allergens to "Foods to Avoid" list absolutely!
  if (allergyPeanuts) {
    foodsToAvoid.push({
      id: 'avoid-peanuts',
      title: 'Peanuts & Peanut Oils',
      description: 'Strict avoidance required. Double-check all processing lines and packaging labels for "may contain peanuts" flags.',
      badge: 'Critical Allergen'
    });
  }
  if (allergyGluten) {
    foodsToAvoid.push({
      id: 'avoid-gluten',
      title: 'Wheat, Barley, Rye & Standard Spelt',
      description: 'Eliminate gluten protein. Replaces with safe alternatives like certified gluten-free oats, quinoa, or buckwheat.',
      badge: 'Gluten Intolerance'
    });
  }
  if (allergyDairy) {
    foodsToAvoid.push({
      id: 'avoid-dairy',
      title: 'Cow Milk, Whey, Cheese & Heavy Cream',
      description: 'Dairy sugars (lactose) or proteins (casein) will trigger gastrointestinal distress or immune flares. Use almond or oat milk instead.',
      badge: 'Dairy Allergen'
    });
  }
  if (allergySoy) {
    foodsToAvoid.push({
      id: 'avoid-soy',
      title: 'Soy Sauce, Soy Protein Isolate & Edamame',
      description: 'Avoid foods containing soy emulsifiers (such as soy lecithin) or texturized soy, which can trigger immunological cascades.',
      badge: 'Soy Allergen'
    });
  }
  if (allergyShellfish) {
    foodsToAvoid.push({
      id: 'avoid-shellfish',
      title: 'Shrimp, Lobster, Crabs & Oysters',
      description: 'Highly reactive shellfish proteins must be excluded completely to prevent severe systemic respiratory reactions.',
      badge: 'Severe Shellfish Allergen'
    });
  }
  if (allergyTreeNuts) {
    foodsToAvoid.push({
      id: 'avoid-tree-nuts',
      title: 'Walnuts, Almonds, Cashews, Macadamias',
      description: 'Check bakery and sauce ingredients thoroughly. Keep emergency Epinephrine nearby if accidentally exposed.',
      badge: 'Tree Nut Allergen'
    });
  }
  if (allergyEggs) {
    foodsToAvoid.push({
      id: 'avoid-eggs',
      title: 'Eggs & Egg Albumen powders',
      description: 'Avoid baked goods glazed with egg-wash, mayonnaise, or protein bars that utilize egg white solids.',
      badge: 'Egg Allergen'
    });
  }

  // Deduplicate avoids
  const uniqueAvoids: RecommendationItem[] = [];
  const avoidIds = new Set<string>();
  foodsToAvoid.forEach(item => {
    if (!avoidIds.has(item.id)) {
      avoidIds.add(item.id);
      uniqueAvoids.push(item);
    }
  });

  // 5. Generate "Healthy Food Combinations" (Based on goals & conditions)
  const healthyCombinations: RecommendationItem[] = [];

  // Default pairs
  healthyCombinations.push({
    id: 'comb-iron-vitc',
    title: 'Plant Iron + Vitamin C',
    description: 'Pair non-heme iron sources (like steamed lentils or raw pumpkin seeds) with active Vitamin C (like freshly squeezed lemon or bell peppers). Vitamin C converts iron into a highly soluble ferrous state, boosting absorption by up to 300%.',
    badge: 'Absorption Booster'
  });

  if (hasDiabetes || goal === 'Lose Weight' || bmiValue >= 25) {
    healthyCombinations.push({
      id: 'comb-carb-fiber-protein',
      title: 'Carbohydrates + High Fiber + Lean Protein',
      description: 'Never consume a "naked" carb (like an apple or piece of toast) alone. Always pair it with healthy fats or proteins (e.g., apple slices paired with pumpkin seeds, or toast with hard-boiled eggs). This dramatically slows gastric emptying, ensuring blood sugar rises as a gentle hill rather than a spike.',
      badge: 'Glycemic Buffer'
    });
  } else {
    // Normal / underweight whole grain pairing
    healthyCombinations.push({
      id: 'comb-grains-legumes',
      title: 'Whole Grains + Legumes',
      description: 'Pairing brown rice with black beans or quinoa with lentils creates a complete amino acid profile, mimicking the protein utility of meat.',
      badge: 'Amino Complement'
    });
  }

  if (hasHypertension || hasHeart) {
    healthyCombinations.push({
      id: 'comb-potassium-magnesium',
      title: 'Potassium + Magnesium Duo',
      description: 'Combine potassium-rich foods (like sliced banana or avocado) with high-magnesium foods (like pumpkin seeds or organic cacao). These minerals work together as a cellular pump, flushing sodium out and dropping peripheral blood vessel tension.',
      badge: 'Vascular Synergy'
    });
  }

  if (hasCholesterol) {
    healthyCombinations.push({
      id: 'comb-phytosterols-soluble-fiber',
      title: 'Soluble Fiber + Healthy Plant Fats',
      description: 'Combine a soluble fiber (such as oats or chia seeds) with extra virgin olive oil or walnuts. The fiber sweeps up intestinal cholesterol, while healthy monounsaturated fats encourage hepatic synthesis of HDL (good) cholesterol.',
      badge: 'Lipid Balance'
    });
  }

  if (hasGastro) {
    healthyCombinations.push({
      id: 'comb-cooked-fats',
      title: 'Cooked Vegetables + Sourdough or Pure Oil',
      description: 'Avoid raw cold vegetable salads which exhaust weak digestive tracts. Instead, consume warm steamed or pureed carrots, zucchini, and squash paired with a drizzle of olive oil, easing bloating.',
      badge: 'Digestive Ease'
    });
  }

  // Filter food combinations to respect severe allergies
  const filteredCombinations = healthyCombinations.filter(item => {
    const text = (item.title + ' ' + item.description).toLowerCase();
    if (allergyPeanuts && text.includes('peanut')) return false;
    if (allergyTreeNuts && (text.includes('almond') || text.includes('walnut') || text.includes('nut'))) return false;
    if (allergyDairy && (text.includes('yogurt') || text.includes('cheese') || text.includes('dairy') || text.includes('whey'))) return false;
    if (allergyGluten && (text.includes('wheat') || text.includes('barley') || text.includes('toast'))) return false;
    if (allergyEggs && text.includes('egg')) return false;
    return true;
  });

  // 6. Water Intake Recommendation (Math-based formula)
  let baseWaterMl = weight * 35; // 35ml per kg is standard clinical baseline
  if (baseWaterMl === 0) baseWaterMl = 2200; // fallback if weight is unentered

  // Adjust for activity level
  let activityAdjustment = 0;
  if (activity === 'Lightly Active') activityAdjustment = 300;
  else if (activity === 'Moderately Active') activityAdjustment = 600;
  else if (activity === 'Very Active') activityAdjustment = 1000;

  const totalWaterMl = baseWaterMl + activityAdjustment;
  const totalWaterLiters = parseFloat((totalWaterMl / 1000).toFixed(1));
  const totalWaterCups = Math.round(totalWaterMl / 250); // 250ml per standard glass

  let waterDescription = `Your clinical hydration baseline is calculated at approximately ${totalWaterLiters} Liters daily.`;
  if (hasKidney) {
    waterDescription = `Your compromised renal filtration indicates a controlled hydration target of ${Math.min(2.0, totalWaterLiters)} Liters daily to prevent fluid retention. Adjust strictly according to your nephrologist's fluid prescription cards.`;
  } else if (activity === 'Very Active') {
    waterDescription = `Due to intense physical activity levels, your recommended fluid throughput is increased to ${totalWaterLiters} Liters to safely compensate for sweat loss and prevent electrolyte collapse.`;
  }

  const waterTips = [
    'Drink 250ml of warm water immediately upon waking to trigger kidney filtration and rehydrate your cerebral tissue.',
    'Sip fluid gradually throughout the day. Rapidly downing liters of water exhausts urinary excretion and causes sodium dilutional drops.',
    'Monitor urine color: it should resemble light straw. If it is crystal clear, you may be flushing minerals. If it is amber, you are clinically dehydrated.'
  ];
  if (hasKidney) {
    waterTips.push('Measure your daily urinary output to ensure fluid intake is matching output coefficients.');
  }
  if (activity === 'Very Active') {
    waterTips.push('During extended sessions over 60 mins, add a pinch of mineral sea salt and lemon or clean electrolytes to your bottle.');
  }

  // 7. Exercise Routine Configuration
  let exerciseType = 'Balanced Conditioning';
  let exerciseFreq = '3-4 Days / Week';
  let exerciseDur = '30-45 Minutes';
  let exerciseInt = 'Moderate';
  let exerciseDesc = 'A low-impact physical maintenance framework promoting metabolic flexibility.';
  
  const exerciseRoutines: string[] = [];
  const exercisePrecautions: string[] = [];

  // Goal & Activity mapping
  if (activity === 'Sedentary') {
    exerciseType = 'Low-Intensity Metabolic Activation';
    exerciseFreq = '3 Days / Week';
    exerciseDur = '20-30 Minutes';
    exerciseInt = 'Gentle / Low';
    exerciseDesc = 'Focuses on breaking sedentary vascular stagnation and restoring skeletal mobility.';
    exerciseRoutines.push(
      'Joint Decompression: Gentle pelvic tilts, shoulder rolls, and hamstring dynamic stretches (5 mins).',
      'Metabolic Walking: 20 minutes of steady outdoor walking at a conversational pace (Zone 1).',
      'Wall Squats & Assisted Glute Bridges: 2 sets of 10 slow reps to wake up lower body muscle fibers.'
    );
    exercisePrecautions.push(
      'Avoid high-impact jumping or intense sprinting until muscle fibers and connective tissues adapt.',
      'Take regular micro-breaks: stand up and perform 2 minutes of light walking for every 60 minutes seated.'
    );
  } else if (activity === 'Very Active' || goal === 'Gain Weight') {
    exerciseType = 'Hypertrophy & High-Capacity Resistance Conditioning';
    exerciseFreq = '4-5 Days / Week';
    exerciseDur = '45-60 Minutes';
    exerciseInt = 'High / Vigorous';
    exerciseDesc = 'An intense, structured progressive overload framework to stimulate muscular development or support sports goals.';
    exerciseRoutines.push(
      'Dynamic Mobility: Arm swings, lunges, and light activation of rotator cuffs (8 mins).',
      'Progressive Compound Lifting: Deadlifts, bench press, overhead press, or weighted pull-ups (3-4 sets, 6-12 reps near failure).',
      'Interval Cardiovascular Finishers: 2 days of high-intensity kettlebell swings or rowing machine bursts (10 mins).'
    );
    exercisePrecautions.push(
      'Ensure proper lifting form to prevent spinal hyperextension during axial loads.',
      'Allow at least 48 hours of recovery between the same muscle groups to prevent overreaching syndromes.'
    );
  } else {
    // Lightly / Moderately Active, Lose Weight / Maintain
    exerciseType = 'Aerobic Efficiency & Resistance Circuit';
    exerciseFreq = '4 Days / Week';
    exerciseDur = '40-50 Minutes';
    exerciseInt = 'Moderate (Zone 2)';
    exerciseDesc = 'Optimizes calorie burn, improves cardiovascular endurance, and enhances insulin sensitivity.';
    exerciseRoutines.push(
      'Warm-up: Light jumping jacks, cat-cow stretch, thoracic mobility (5 mins).',
      'Zone 2 Cardiovascular Training: Brisk uphill walking, rowing, or steady cycling maintaining 60-70% Max Heart Rate (25 mins).',
      'Satiety Resistance Circuit: Bodyweight push-ups, air squats, reverse lunges, and hollow-body planks (3 sets, 12-15 reps).'
    );
    exercisePrecautions.push(
      'Track heart rate to ensure you stay in Zone 2 to maximize lipid fat oxidation over glycogen depletion.',
      'Wear supportive footwear to prevent joint and tendon strain.'
    );
  }

  // Adjust exercise routines if clinical conditions exist
  if (hasHypertension || hasHeart) {
    exerciseType = 'Cardioprotective Low-Resistance Conditioning';
    exerciseInt = 'Low to Moderate';
    exerciseDesc = 'Fosters cardiac stroke volume and arterial elasticity while strictly avoiding dangerous pressure spikes.';
    exerciseRoutines.length = 0; // replace with safe routines
    exerciseRoutines.push(
      'Aerobic Base Development: Steady, rhythmic walking, elliptical trainer, or water aerobics (30 mins at 50-60% Max HR).',
      'Low-Resistance High-Rep Dynamics: Light elastic bands, bicep curls, or wall push-ups (no heavy lifting or isometric straining).',
      'Deep Vagal Decompression: 5 minutes of slow diaphragmatic breathing to settle sympathetic vascular tone.'
    );
    exercisePrecautions.push(
      'STRICTLY AVOID the Valsalva maneuver (holding your breath while lifting), as this triggers dangerous acute arterial blood pressure spikes.',
      'If you experience sudden chest pressure, jaw pain, or severe lightheadedness, terminate the workout immediately and seek medical assessment.'
    );
  }

  if (hasAsthma) {
    exercisePrecautions.push(
      'Keep your emergency rescue inhaler (Bronchodilator) nearby during all workouts.',
      'Warm up longer (10-15 mins) with low intensity to allow airway capillaries to adapt and prevent exercise-induced bronchospasms.'
    );
  }

  if (hasKidney) {
    exercisePrecautions.push(
      'Avoid high-intensity exhaustive exercise that causes severe muscle breakdown (Rhabdomyolysis), as myoglobin release strains compromised renal filters.'
    );
  }

  // 8. Generate Lifestyle Tips
  const lifestyleTips: RecommendationItem[] = [];

  // Base sleep tip
  lifestyleTips.push({
    id: 'life-sleep',
    title: 'Prioritize Deep Circadian Sleep Anchors',
    description: 'Aim for 7.5 to 8.5 hours of sleep. Go to bed and wake up at the exact same time daily to synchronize biological clock genes, boosting leptin (fullness hormone) and normalizing insulin.',
    badge: 'Circadian Biology'
  });

  // Goal & Social habits tips
  if (profile.smokingStatus === 'Active smoker') {
    lifestyleTips.push({
      id: 'life-smoking',
      title: 'Mitigate Endothelial Vascular Damage',
      description: 'Smoking directly damages blood vessel linings and worsens hypertension. Discuss nicotine replacement therapy or stress management with your doctor.',
      badge: 'Critical Cessation'
    });
  }

  if (profile.alcoholConsumption && profile.alcoholConsumption !== 'None') {
    lifestyleTips.push({
      id: 'life-alcohol',
      title: 'Regulate Hepatic Stress',
      description: 'Alcohol stalls lipid oxidation, disrupts deep REM sleep, and exacerbates GERD symptoms. Limit intake to a maximum of 2 units weekly.',
      badge: 'Toxicology'
    });
  }

  if (hasDiabetes || bmiValue >= 25) {
    lifestyleTips.push({
      id: 'life-timing',
      title: 'Implement 10-Minute Post-Meal Walks',
      description: 'Perform a light 10-minute stroll immediately following your largest meal. This activates glucose transporters (GLUT-4) in leg muscles, drawing sugars directly out of blood vessels without relying heavily on insulin production.',
      badge: 'Metabolic Hack'
    });
  }

  if (hasGastro) {
    lifestyleTips.push({
      id: 'life-gastro-chewing',
      title: 'Practice Mindful 30-Chew Mastification',
      description: 'Chew each mouthful of food at least 30 times. Saliva contains amylase enzymes that kickstart digestive breakups, taking massive workload off weak gastric acid layers and eliminating GERD flares.',
      badge: 'Gastrokinetic Relief'
    });
    lifestyleTips.push({
      id: 'life-gastro-spacing',
      title: 'Fast 3 Hours Before Sleep',
      description: 'Ensure your last calorie is consumed at least 180 minutes before lying flat to prevent mechanical backflow of stomach acids.',
      badge: 'Reflux Prevention'
    });
  }

  return {
    bmiValue,
    bmiCategory,
    foodsToEat: filteredFoodsToEat,
    foodsToAvoid: uniqueAvoids,
    healthyCombinations: filteredCombinations,
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
