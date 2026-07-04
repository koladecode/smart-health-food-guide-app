import { getSupabaseAdminClient } from './supabase';

/**
 * Service handling database access and synchronization for Health Profiles
 */
export class HealthProfileService {
  /**
   * Helper to map database structure to response format
   */
  public static mapDbProfileToResponse(profile: any, conditions: any[]): any {
    const healthConditions = conditions
      ?.filter((c) => c.type === 'condition')
      .map((c) => c.name) || [];
    const foodAllergies = conditions
      ?.filter((c) => c.type === 'allergy')
      .map((c) => c.name) || [];

    const weight = Number(profile.weight);
    const height = Number(profile.height);
    
    // BMI calculation
    let bmi = 0;
    if (weight > 0 && height > 0) {
      const heightInMeters = height / 100;
      bmi = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
    }

    // Water Goal calculation (weight in kg * 33 ml/kg / 1000 to get Litres)
    let waterGoal = parseFloat((weight * 0.033).toFixed(1));
    if (waterGoal <= 0) waterGoal = 2.5;

    return {
      id: profile.id,
      userId: profile.user_id,
      fullName: profile.full_name || '',
      age: Number(profile.age),
      gender: profile.gender || 'Other',
      height: height,
      weight: weight,
      bmi: bmi,
      BMI: bmi,
      activityLevel: profile.activity_level,
      healthGoal: profile.health_goal,
      healthGoals: profile.health_goal,
      dietaryPreference: profile.dietary_preference || 'None',
      allergies: foodAllergies,
      foodAllergies: foodAllergies,
      medicalConditions: healthConditions,
      healthConditions: healthConditions,
      smoking: profile.smoking_status || 'Never',
      smokingStatus: profile.smoking_status || 'Never',
      alcoholConsumption: profile.alcohol_consumption || 'None',
      waterGoal: waterGoal,
      currentMedications: profile.current_medications || '',
      createdAt: new Date(profile.created_at),
      updatedAt: new Date(profile.updated_at),
    };
  }

  /**
   * Retrieves a Health Profile for a specified user ID.
   */
  public static async getProfile(userId: string): Promise<any | null> {
    const supabase = getSupabaseAdminClient();
    
    const { data: profile, error } = await supabase
      .from('health_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Profile not found
        return null;
      }
      throw error;
    }

    // Fetch conditions and allergies associated with this profile
    const { data: conditions, error: condError } = await supabase
      .from('health_conditions')
      .select('name, type')
      .eq('profile_id', profile.id);

    if (condError) throw condError;

    return this.mapDbProfileToResponse(profile, conditions || []);
  }

  /**
   * Creates a brand new health profile for a user
   */
  public static async createProfile(
    userId: string,
    profileData: any
  ): Promise<any> {
    const supabase = getSupabaseAdminClient();

    const dbPayload: any = {
      user_id: userId,
      full_name: profileData.fullName || '',
      age: Number(profileData.age),
      weight: Number(profileData.weight),
      height: Number(profileData.height),
      activity_level: profileData.activityLevel || 'Moderately Active',
      health_goal: profileData.healthGoal || profileData.healthGoals || 'Improve Overall Health',
      dietary_preference: profileData.dietaryPreference || 'None',
      smoking_status: profileData.smokingStatus || profileData.smoking || 'Never',
      alcohol_consumption: profileData.alcoholConsumption || 'None',
      current_medications: profileData.currentMedications || null,
    };

    if (profileData.gender !== undefined) {
      dbPayload.gender = profileData.gender;
    }

    let profile;
    try {
      const { data, error } = await supabase
        .from('health_profiles')
        .insert(dbPayload)
        .select()
        .single();

      if (error) throw error;
      profile = data;
    } catch (err: any) {
      if (err.message && err.message.includes('gender')) {
        console.warn('[HEALTH_PROFILE_SERVICE] Gender column does not exist in DB. Retrying insert without gender.');
        delete dbPayload.gender;
        const { data, error } = await supabase
          .from('health_profiles')
          .insert(dbPayload)
          .select()
          .single();
        if (error) throw error;
        profile = data;
      } else {
        throw err;
      }
    }

    // Insert associated conditions and allergies in health_conditions table
    const conditionRecords: any[] = [];
    const healthConditions = profileData.healthConditions || profileData.medicalConditions || [];
    const foodAllergies = profileData.foodAllergies || profileData.allergies || [];

    healthConditions.forEach((cond: string) => {
      if (cond && cond !== 'none') {
        conditionRecords.push({
          profile_id: profile.id,
          name: cond,
          type: 'condition',
        });
      }
    });

    foodAllergies.forEach((allergy: string) => {
      if (allergy && allergy !== 'none') {
        conditionRecords.push({
          profile_id: profile.id,
          name: allergy,
          type: 'allergy',
        });
      }
    });

    if (conditionRecords.length > 0) {
      const { error: condError } = await supabase
        .from('health_conditions')
        .insert(conditionRecords);
      if (condError) throw condError;
    }

    return this.getProfile(userId);
  }

  /**
   * Updates an existing health profile, cleaning and updating associated relational keys
   */
  public static async updateProfile(
    userId: string,
    profileData: any
  ): Promise<any> {
    const supabase = getSupabaseAdminClient();

    // Retrieve profile first to get ID
    const { data: existing, error: findError } = await supabase
      .from('health_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (findError) throw findError;

    const dbPayload: any = {};
    if (profileData.fullName !== undefined) dbPayload.full_name = profileData.fullName;
    if (profileData.age !== undefined) dbPayload.age = Number(profileData.age);
    if (profileData.weight !== undefined) dbPayload.weight = Number(profileData.weight);
    if (profileData.height !== undefined) dbPayload.height = Number(profileData.height);
    if (profileData.activityLevel !== undefined) dbPayload.activity_level = profileData.activityLevel;
    if (profileData.healthGoal !== undefined || profileData.healthGoals !== undefined) {
      dbPayload.health_goal = profileData.healthGoal || profileData.healthGoals;
    }
    if (profileData.dietaryPreference !== undefined) dbPayload.dietary_preference = profileData.dietaryPreference;
    if (profileData.smokingStatus !== undefined || profileData.smoking !== undefined) {
      dbPayload.smoking_status = profileData.smokingStatus || profileData.smoking;
    }
    if (profileData.alcoholConsumption !== undefined) dbPayload.alcohol_consumption = profileData.alcoholConsumption;
    if (profileData.currentMedications !== undefined) dbPayload.current_medications = profileData.currentMedications || null;
    if (profileData.gender !== undefined) dbPayload.gender = profileData.gender;

    let updated;
    try {
      const { data, error } = await supabase
        .from('health_profiles')
        .update(dbPayload)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      updated = data;
    } catch (err: any) {
      if (err.message && err.message.includes('gender')) {
        console.warn('[HEALTH_PROFILE_SERVICE] Gender column does not exist in DB. Retrying update without gender.');
        delete dbPayload.gender;
        const { data, error } = await supabase
          .from('health_profiles')
          .update(dbPayload)
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        updated = data;
      } else {
        throw err;
      }
    }

    // Synchronize conditions and allergies if supplied
    const healthConditions = profileData.healthConditions || profileData.medicalConditions;
    const foodAllergies = profileData.foodAllergies || profileData.allergies;

    if (healthConditions !== undefined || foodAllergies !== undefined) {
      // Clear old health_conditions
      const { error: deleteError } = await supabase
        .from('health_conditions')
        .delete()
        .eq('profile_id', existing.id);

      if (deleteError) throw deleteError;

      const conditionRecords: any[] = [];
      const activeConditions = healthConditions || [];
      const activeAllergies = foodAllergies || [];

      activeConditions.forEach((cond: string) => {
        if (cond && cond !== 'none') {
          conditionRecords.push({
            profile_id: existing.id,
            name: cond,
            type: 'condition',
          });
        }
      });

      activeAllergies.forEach((allergy: string) => {
        if (allergy && allergy !== 'none') {
          conditionRecords.push({
            profile_id: existing.id,
            name: allergy,
            type: 'allergy',
          });
        }
      });

      if (conditionRecords.length > 0) {
        const { error: insertError } = await supabase
          .from('health_conditions')
          .insert(conditionRecords);
        if (insertError) throw insertError;
      }
    }

    return this.getProfile(userId);
  }
}
