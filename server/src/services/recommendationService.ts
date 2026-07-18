import { getSupabaseAdminClient } from './supabase';
import { PersonalizedRecommendations, HealthProfile } from '../types';
import { generateRecommendations } from '../utils/recommendationEngine';

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
    const { data: rec, error } = await supabase
      .from('recommendations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No cached recommendation found
        return null;
      }
      throw error;
    }

    // Fetch related exercise routine
    const { data: exercise, error: exError } = await supabase
      .from('exercises')
      .select('*')
      .eq('recommendation_id', rec.id)
      .single();

    if (exError) throw exError;

    // Fetch associated food items (eat, avoid, combination, lifestyle)
    const { data: foods, error: foodsError } = await supabase
      .from('foods')
      .select('*')
      .eq('recommendation_id', rec.id);

    if (foodsError) throw foodsError;

    const foodsToEat = foods
      ?.filter((f) => f.type === 'eat')
      .map((f) => ({ id: f.id, title: f.title, description: f.description, badge: f.badge || undefined })) || [];

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
        tips: [
          'Drink 250ml of warm water immediately upon waking to trigger kidney filtration.',
          'Sip fluid gradually throughout the day.',
          'Monitor urine color: it should resemble light straw.'
        ],
      },
      exercise: {
        type: exercise.type,
        frequency: exercise.frequency,
        duration: exercise.duration,
        intensity: exercise.intensity,
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
    console.log('[DEBUG_LOG] [SAVE_RECOMMENDATION] Attempting to upsert recommendation for user:', userId);

    // Check if an existing recommendation already exists for this user
    const { data: existingRecs, error: findError } = await supabase
      .from('recommendations')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (findError) {
      console.error('[DEBUG_LOG] [SAVE_RECOMMENDATION] Failed to query existing recommendations:', findError);
      throw findError;
    }

    let rec: any;

    if (existingRecs && existingRecs.length > 0) {
      const existingId = existingRecs[0].id;
      console.log('[DEBUG_LOG] [SAVE_RECOMMENDATION] Found existing recommendation ID:', existingId, 'for user:', userId);

      // Clean up other legacy/extra records for this user if any exist
      if (existingRecs.length > 1) {
        console.log('[DEBUG_LOG] [SAVE_RECOMMENDATION] Cleaning up', existingRecs.length - 1, 'legacy extra rows for user:', userId);
        const extraIds = existingRecs.slice(1).map(r => r.id);
        const { error: cleanupError } = await supabase
          .from('recommendations')
          .delete()
          .in('id', extraIds);
        if (cleanupError) {
          console.warn('[DEBUG_LOG] [SAVE_RECOMMENDATION] Failed to clean up extra recommendations:', cleanupError);
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
        .select()
        .single();

      if (updateError) {
        console.error('[DEBUG_LOG] [SAVE_RECOMMENDATION] Failed to update base recommendation:', updateError);
        throw updateError;
      }

      rec = updatedRec;

      // Delete old exercises and foods associated with this recommendation_id to avoid unique constraints and duplicates
      console.log('[DEBUG_LOG] [SAVE_RECOMMENDATION] Cleaning up existing exercises and foods for recommendation ID:', existingId);
      const { error: delExError } = await supabase
        .from('exercises')
        .delete()
        .eq('recommendation_id', existingId);
      if (delExError) {
        console.error('[DEBUG_LOG] [SAVE_RECOMMENDATION] Failed to delete existing exercises:', delExError);
        throw delExError;
      }

      const { error: delFoodsError } = await supabase
        .from('foods')
        .delete()
        .eq('recommendation_id', existingId);
      if (delFoodsError) {
        console.error('[DEBUG_LOG] [SAVE_RECOMMENDATION] Failed to delete existing foods:', delFoodsError);
        throw delFoodsError;
      }
    } else {
      console.log('[DEBUG_LOG] [SAVE_RECOMMENDATION] No existing recommendation found. Inserting new one for user:', userId);
      
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
        console.error('[DEBUG_LOG] [SAVE_RECOMMENDATION] Failed to insert new recommendation:', insertError);
        throw insertError;
      }

      rec = insertedRec;
    }

    console.log('[DEBUG_LOG] [SAVE_RECOMMENDATION] Base recommendation row prepared. ID:', rec.id);

    // 2. Insert exercises
    console.log('[DEBUG_LOG] [SAVE_RECOMMENDATION] Attempting to insert exercises for recommendation_id:', rec.id);
    const { error: exError } = await supabase.from('exercises').insert({
      recommendation_id: rec.id,
      type: recs.exercise.type,
      frequency: recs.exercise.frequency,
      duration: recs.exercise.duration,
      intensity: recs.exercise.intensity,
      description: recs.exercise.description,
      routine: recs.exercise.routine,
      precautions: recs.exercise.precautions,
    });

    if (exError) {
      console.error('[DEBUG_LOG] [SAVE_RECOMMENDATION] Failed to insert exercises:', exError);
      throw exError;
    }

    console.log('[DEBUG_LOG] [SAVE_RECOMMENDATION] Exercises inserted successfully.');

    // 3. Collect foods records
    const foodRecords: any[] = [];

    recs.foodsToEat.forEach((food) => {
      foodRecords.push({
        recommendation_id: rec.id,
        title: food.title,
        description: food.description,
        badge: food.badge || null,
        type: 'eat',
      });
    });

    recs.foodsToAvoid.forEach((food) => {
      foodRecords.push({
        recommendation_id: rec.id,
        title: food.title,
        description: food.description,
        badge: food.badge || null,
        type: 'avoid',
      });
    });

    recs.healthyCombinations.forEach((food) => {
      foodRecords.push({
        recommendation_id: rec.id,
        title: food.title,
        description: food.description,
        badge: food.badge || null,
        type: 'combination',
      });
    });

    recs.lifestyleTips.forEach((food) => {
      foodRecords.push({
        recommendation_id: rec.id,
        title: food.title,
        description: food.description,
        badge: food.badge || null,
        type: 'lifestyle',
      });
    });

    if (foodRecords.length > 0) {
      console.log('[DEBUG_LOG] [SAVE_RECOMMENDATION] Attempting to insert food records:', foodRecords.length);
      const { error: foodsError } = await supabase.from('foods').insert(foodRecords);
      if (foodsError) {
        console.error('[DEBUG_LOG] [SAVE_RECOMMENDATION] Failed to insert food records:', foodsError);
        throw foodsError;
      }
      console.log('[DEBUG_LOG] [SAVE_RECOMMENDATION] Food records inserted successfully.');
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
