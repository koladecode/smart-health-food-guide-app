import { getSupabaseAdminClient } from './supabase';
import { PersonalizedRecommendations, HealthProfile } from '../types';
import { generateRecommendations } from '../utils/recommendationEngine';

function getFoodCategory(title: string, badge?: string): 'Breakfast' | 'Lunch' | 'Dinner' | 'Healthy Snacks' | 'Drinks' | undefined {
  const t = title.toLowerCase();
  const b = badge ? badge.toLowerCase() : '';
  
  if (
    b.includes('breakfast') || 
    t.includes('moin moin') || 
    t.includes('akara') || 
    t.includes('koko') || 
    t.includes('porridge') || 
    t.includes('oat') || 
    t.includes('egg') || 
    t.includes('pancake') ||
    b.includes('metabolic starter') ||
    b.includes('vitamin boost')
  ) {
    return 'Breakfast';
  }
  if (
    b.includes('lunch') || 
    t.includes('efo riro') || 
    t.includes('ofada') || 
    t.includes('jollof') || 
    t.includes('rice') || 
    t.includes('fufu') || 
    t.includes('ewedu') || 
    t.includes('egusi') || 
    t.includes('okra') || 
    t.includes('gbegiri') || 
    t.includes('amala') ||
    b.includes('glycemic shield') ||
    b.includes('prebiotic mucilage') ||
    b.includes('smooth digestion') ||
    b.includes('satiety champion')
  ) {
    return 'Lunch';
  }
  if (
    b.includes('dinner') || 
    t.includes('pepper soup') || 
    t.includes('tilapia') || 
    t.includes('mackerel') || 
    t.includes('sea bass') || 
    t.includes('fish') || 
    t.includes('cod') || 
    t.includes('chicken') || 
    t.includes('turkey') || 
    t.includes('bison') || 
    t.includes('broth') || 
    t.includes('soup') || 
    t.includes('stew') ||
    b.includes('liver cleanser') ||
    b.includes('cardiac omega') ||
    b.includes('vascular tone') ||
    b.includes('thyroid selenium')
  ) {
    return 'Dinner';
  }
  if (
    b.includes('snack') || 
    t.includes('garden egg') || 
    t.includes('corn') || 
    t.includes('coconut') || 
    t.includes('groundnut') || 
    t.includes('peanut') || 
    t.includes('cashew') || 
    t.includes('tiger nut') || 
    t.includes('biltong') || 
    t.includes('avocado') || 
    t.includes('salad') ||
    t.includes('apple') ||
    t.includes('agbalumo') ||
    t.includes('soursop') ||
    b.includes('satiety core') ||
    b.includes('beta-carotene fuel') ||
    b.includes('resistant starch') ||
    b.includes('vitamin c shield')
  ) {
    return 'Healthy Snacks';
  }
  if (
    b.includes('drink') || 
    b.includes('beverage') || 
    t.includes('zobo') || 
    t.includes('kunun') || 
    t.includes('tea') || 
    t.includes('juice') || 
    t.includes('drink') || 
    t.includes('infusion') ||
    b.includes('ace inhibitor') ||
    b.includes('dairy-free cream') ||
    b.includes('bloating relief') ||
    b.includes('inflammation shield')
  ) {
    return 'Drinks';
  }
  return undefined;
}

/**
 * Service for managing recommendations in Supabase PostgreSQL
 */
export class RecommendationService {
  /**
   * Retrieves the most recent recommendation cached for a specified user ID.
   */
  public static async getRecommendations(userId: string): Promise<PersonalizedRecommendations | null> {
    const supabase = getSupabaseAdminClient();

    // Retrieve latest recommendation metadata
    const { data: recs, error } = await supabase
      .from('recommendations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    if (!recs || recs.length === 0) {
      return null;
    }

    const rec = recs[0];

    // Clean up extra recommendation records for this user if duplicate rows exist
    if (recs.length > 1) {
      const extraIds = recs.slice(1).map((r) => r.id);
      supabase.from('recommendations').delete().in('id', extraIds).then(({ error: delErr }) => {
        if (delErr) console.warn('[RECOMMENDATION_SERVICE] Error cleaning up duplicate recommendations:', delErr);
      });
    }

    // Fetch related exercise routine
    const { data: exercise, error: exError } = await supabase
      .from('exercises')
      .select('*')
      .eq('recommendation_id', rec.id)
      .maybeSingle();

    if (exError) throw exError;

    // If exercise record is missing for some reason, return null so it can be re-generated
    if (!exercise) {
      return null;
    }

    // Fetch associated food items (eat, avoid, combination, lifestyle)
    const { data: foods, error: foodsError } = await supabase
      .from('foods')
      .select('*')
      .eq('recommendation_id', rec.id);

    if (foodsError) throw foodsError;

    const foodsToEat = foods
      ?.filter((f) => f.type === 'eat')
      .map((f) => ({ 
        id: f.id, 
        title: f.title, 
        description: f.description, 
        badge: f.badge || undefined,
        category: getFoodCategory(f.title, f.badge || undefined)
      })) || [];

    const foodsToAvoid = foods
      ?.filter((f) => f.type === 'avoid')
      .map((f) => ({ id: f.id, title: f.title, description: f.description, badge: f.badge || undefined })) || [];

    const healthyCombinations = foods
      ?.filter((f) => f.type === 'combination')
      .map((f) => ({ id: f.id, title: f.title, description: f.description, badge: f.badge || undefined })) || [];

    const lifestyleTips = foods
      ?.filter((f) => f.type === 'lifestyle')
      .map((f) => ({ id: f.id, title: f.title, description: f.description, badge: f.badge || undefined })) || [];

    return {
      bmiValue: Number(rec.bmi_value),
      bmiCategory: rec.bmi_category,
      foodsToEat,
      foodsToAvoid,
      healthyCombinations,
      waterIntake: {
        liters: Number(rec.water_liters),
        cups: Number(rec.water_cups),
        description: rec.water_description || '',
        tips: (() => {
          const tipsList = [
            'Drink 250ml of warm water immediately upon waking to trigger kidney filtration.',
            'Sip fluid gradually throughout the day.',
            'Monitor urine color: it should resemble light straw.'
          ];
          const descLower = (rec.water_description || '').toLowerCase();
          if (descLower.includes('renal') || descLower.includes('kidney') || descLower.includes('restricted')) {
            tipsList.push('Measure your daily urine output. It must match your fluid intake to prevent swelling.');
          }
          if (descLower.includes('active') || descLower.includes('exercise') || descLower.includes('output')) {
            tipsList.push('Add a small pinch of mineral sea salt and a squeeze of fresh lemon to your exercise bottle to maintain proper sodium channels.');
          }
          return tipsList;
        })(),
      },
      exercise: {
        type: exercise.type || 'Cardiovascular',
        frequency: exercise.frequency || '3-5 days/week',
        duration: exercise.duration || '30 mins/day',
        intensity: exercise.intensity || 'Moderate',
        description: exercise.description || '',
        routine: exercise.routine || [],
        precautions: exercise.precautions || [],
      },
      lifestyleTips,
      createdAt: new Date(rec.created_at),
    };
  }

  /**
   * Saves a structured recommendation set in the database, wrapping exercise and food inserts
   */
  public static async saveRecommendation(
    userId: string,
    recs: Omit<PersonalizedRecommendations, 'createdAt'>
  ): Promise<PersonalizedRecommendations> {
    const supabase = getSupabaseAdminClient();

    // Check if an existing recommendation already exists for this user
    const { data: existingRecs, error: findError } = await supabase
      .from('recommendations')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (findError) {
      throw findError;
    }

    let rec: any;

    if (existingRecs && existingRecs.length > 0) {
      const existingId = existingRecs[0].id;

      // Clean up other legacy/extra records for this user if any exist
      if (existingRecs.length > 1) {
        const extraIds = existingRecs.slice(1).map(r => r.id);
        const { error: cleanupError } = await supabase
          .from('recommendations')
          .delete()
          .in('id', extraIds);
        if (cleanupError) {
          console.warn('[RECOMMENDATION_SERVICE] Failed to clean up extra recommendations:', cleanupError);
        }
      }

      // Update the base recommendation
      const { data: updatedRec, error: updateError } = await supabase
        .from('recommendations')
        .update({
          bmi_value: recs.bmiValue,
          bmi_category: recs.bmiCategory,
          water_liters: recs.waterIntake.liters,
          water_cups: recs.waterIntake.cups,
          water_description: recs.waterIntake.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingId)
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      rec = updatedRec;

      // Delete old exercises and foods associated with this recommendation_id to avoid unique constraints and duplicates
      const { error: delExError } = await supabase
        .from('exercises')
        .delete()
        .eq('recommendation_id', existingId);
      if (delExError) {
        throw delExError;
      }

      const { error: delFoodsError } = await supabase
        .from('foods')
        .delete()
        .eq('recommendation_id', existingId);
      if (delFoodsError) {
        throw delFoodsError;
      }
    } else {
      const { data: insertedRec, error: insertError } = await supabase
        .from('recommendations')
        .insert({
          user_id: userId,
          bmi_value: recs.bmiValue,
          bmi_category: recs.bmiCategory,
          water_liters: recs.waterIntake.liters,
          water_cups: recs.waterIntake.cups,
          water_description: recs.waterIntake.description,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      rec = insertedRec;
    }

    // 2. Insert exercises
    const { error: exError } = await supabase.from('exercises').insert({
      recommendation_id: rec.id,
      type: recs.exercise.type || 'Cardiovascular',
      frequency: recs.exercise.frequency || '3-5 days/week',
      duration: recs.exercise.duration || '30 mins/day',
      intensity: recs.exercise.intensity || 'Moderate',
      description: recs.exercise.description || '',
      routine: recs.exercise.routine || [],
      precautions: recs.exercise.precautions || [],
    });

    if (exError) {
      throw exError;
    }

    // 3. Collect foods records
    const foodRecords: any[] = [];

    (recs.foodsToEat || []).forEach((food) => {
      foodRecords.push({
        recommendation_id: rec.id,
        title: food.title,
        description: food.description,
        badge: food.badge || null,
        type: 'eat',
      });
    });

    (recs.foodsToAvoid || []).forEach((food) => {
      foodRecords.push({
        recommendation_id: rec.id,
        title: food.title,
        description: food.description,
        badge: food.badge || null,
        type: 'avoid',
      });
    });

    (recs.healthyCombinations || []).forEach((food) => {
      foodRecords.push({
        recommendation_id: rec.id,
        title: food.title,
        description: food.description,
        badge: food.badge || null,
        type: 'combination',
      });
    });

    (recs.lifestyleTips || []).forEach((food) => {
      foodRecords.push({
        recommendation_id: rec.id,
        title: food.title,
        description: food.description,
        badge: food.badge || null,
        type: 'lifestyle',
      });
    });

    if (foodRecords.length > 0) {
      const { error: foodsError } = await supabase.from('foods').insert(foodRecords);
      if (foodsError) {
        throw foodsError;
      }
    }

    return {
      ...recs,
      createdAt: new Date(rec.created_at),
    };
  }

  /**
   * Helper utility to calculate and store recommendation directly from a Health Profile
   */
  public static async generateAndSave(userId: string, profile: HealthProfile): Promise<PersonalizedRecommendations> {
    console.log('[DEBUG_LOG] [GENERATE_AND_SAVE] Calculating recommendations from profile for user:', userId);
    const calculated = generateRecommendations(profile);
    console.log('[DEBUG_LOG] [GENERATE_AND_SAVE] Recommendations calculated successfully. Invoking saveRecommendation()...');
    return await this.saveRecommendation(userId, calculated);
  }
}
