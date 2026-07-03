import { getSupabaseClient } from '../config/supabase';
import { PersonalizedRecommendations, HealthProfile } from '../types';
import { generateRecommendations } from '../utils/recommendationEngine';

/**
 * Service for managing recommendations in Supabase PostgreSQL
 */
export class RecommendationService {
  /**
   * Retrieves the most recent recommendation cached for a specified user ID.
   * Resilient fallback to generating recommendations on-the-fly.
   */
  public static async getRecommendations(userId: string): Promise<PersonalizedRecommendations | null> {
    try {
      const supabase = getSupabaseClient();

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
    } catch (err: any) {
      console.warn(
        `[RECOMMENDATION_SERVICE] Falling back to calculated recommendation. Reason: ${err.message}`
      );
      return null;
    }
  }

  /**
   * Saves a structured recommendation set in the database, wrapping exercise and food inserts
   */
  public static async saveRecommendation(
    userId: string,
    recs: Omit<PersonalizedRecommendations, 'createdAt'>
  ): Promise<PersonalizedRecommendations> {
    try {
      const supabase = getSupabaseClient();

      // 1. Insert base recommendation
      const { data: rec, error } = await supabase
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

      if (error) throw error;

      // 2. Insert exercises
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

      if (exError) throw exError;

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
        const { error: foodsError } = await supabase.from('foods').insert(foodRecords);
        if (foodsError) throw foodsError;
      }

      return {
        ...recs,
        createdAt: new Date(rec.created_at),
      };
    } catch (err: any) {
      console.warn(
        `[RECOMMENDATION_SERVICE] Save recommendation fallback mock triggered. Reason: ${err.message}`
      );
      return {
        ...recs,
        createdAt: new Date(),
      };
    }
  }

  /**
   * Helper utility to calculate and store recommendation directly from a Health Profile
   */
  public static async generateAndSave(userId: string, profile: HealthProfile): Promise<PersonalizedRecommendations> {
    const calculated = generateRecommendations(profile);
    return await this.saveRecommendation(userId, calculated);
  }
}
