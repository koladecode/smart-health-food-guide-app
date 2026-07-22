import { getSupabaseAdminClient } from './supabase';

/**
 * Service handling database access and synchronization for Health Profiles
 */
export class HealthProfileService {
  /**
   * Helper to map database structure to response format
   */
  public static mapDbProfileToResponse(profile: any, conditions: any[]): any {
    console.log('[INSTRUMENT_WEIGHT] [healthProfileService.mapDbProfileToResponse] Received raw row profile object. Raw weight field is:', profile.weight);
    const regionCond = conditions?.find((c) => c.type === 'condition' && c.name && c.name.startsWith('region:'));
    const countryOrRegion = regionCond ? regionCond.name.replace('region:', '') : 'Global/Other';

    const healthConditions = conditions
      ?.filter((c) => c.type === 'condition' && c.name && !c.name.startsWith('region:'))
      .map((c) => c.name) || [];
    const foodAllergies = conditions
      ?.filter((c) => c.type === 'allergy')
      .map((c) => c.name) || [];

    const weight = Number(profile.weight);
    const height = Number(profile.height);
    console.log('[INSTRUMENT_WEIGHT] [healthProfileService.mapDbProfileToResponse] Parsed numeric weight:', weight, 'height:', height);
    
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
      countryOrRegion: countryOrRegion,
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

    console.log('[INSTRUMENT_WEIGHT] [healthProfileService.createProfile] dbPayload.weight before database insert:', dbPayload.weight);

    if (profileData.gender !== undefined) {
      dbPayload.gender = profileData.gender;
    }

    let profile;
    try {
      console.log('[DEBUG_LOG] Preparing to insert health_profiles with payload:', JSON.stringify(dbPayload, null, 2));
      const res = await supabase
        .from('health_profiles')
        .insert(dbPayload)
        .select()
        .single();

      console.log('[DEBUG_LOG] Supabase insert response (health_profiles):', JSON.stringify({ data: res.data, error: res.error }, null, 2));

      if (res.error) throw res.error;
      profile = res.data;
    } catch (err: any) {
      console.error('[DEBUG_LOG] Exception caught during health_profiles insert:', err);
      if (err.message && err.message.includes('gender')) {
        console.warn('[HEALTH_PROFILE_SERVICE] Gender column does not exist in DB. Retrying insert without gender.');
        delete dbPayload.gender;
        console.log('[DEBUG_LOG] Retrying insert health_profiles with payload:', JSON.stringify(dbPayload, null, 2));
        const res = await supabase
          .from('health_profiles')
          .insert(dbPayload)
          .select()
          .single();

        console.log('[DEBUG_LOG] Supabase retry insert response (health_profiles):', JSON.stringify({ data: res.data, error: res.error }, null, 2));
        if (res.error) throw res.error;
        profile = res.data;
      } else {
        throw err;
      }
    }

    // Insert associated conditions and allergies in health_conditions table
    const conditionRecords: any[] = [];
    const healthConditions = profileData.healthConditions || profileData.medicalConditions || [];
    const foodAllergies = profileData.foodAllergies || profileData.allergies || [];

    healthConditions.forEach((cond: string) => {
      if (cond && cond !== 'none' && !cond.startsWith('region:')) {
        conditionRecords.push({
          profile_id: profile.id,
          name: cond,
          type: 'condition',
        });
      }
    });

    if (profileData.countryOrRegion) {
      conditionRecords.push({
        profile_id: profile.id,
        name: `region:${profileData.countryOrRegion}`,
        type: 'condition',
      });
    }

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
      console.log('[DEBUG_LOG] Preparing to insert health_conditions records:', JSON.stringify(conditionRecords, null, 2));
      const res = await supabase
        .from('health_conditions')
        .insert(conditionRecords);

      console.log('[DEBUG_LOG] Supabase insert response (health_conditions):', JSON.stringify({ error: res.error }, null, 2));
      if (res.error) throw res.error;
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
    console.log('[DEBUG_LOG] Retrieving health profile ID for user_id:', userId);
    const { data: existing, error: findError } = await supabase
      .from('health_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    console.log('[DEBUG_LOG] Retrieve profile ID response:', JSON.stringify({ data: existing, error: findError }, null, 2));

    if (findError) throw findError;

    const dbPayload: any = {};
    if (profileData.fullName !== undefined) dbPayload.full_name = profileData.fullName;
    if (profileData.age !== undefined) dbPayload.age = Number(profileData.age);
    if (profileData.weight !== undefined) dbPayload.weight = Number(profileData.weight);
    if (profileData.height !== undefined) dbPayload.height = Number(profileData.height);

    console.log('[INSTRUMENT_WEIGHT] [healthProfileService.updateProfile] dbPayload.weight before database update:', dbPayload.weight);
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
      console.log('[DEBUG_LOG] Preparing to update health_profiles with payload:', JSON.stringify(dbPayload, null, 2), 'for profile id:', existing.id);
      const res = await supabase
        .from('health_profiles')
        .update(dbPayload)
        .eq('id', existing.id)
        .select()
        .single();

      console.log('[DEBUG_LOG] Supabase update response (health_profiles):', JSON.stringify({ data: res.data, error: res.error }, null, 2));

      if (res.error) throw res.error;
      updated = res.data;
    } catch (err: any) {
      console.error('[DEBUG_LOG] Exception caught during health_profiles update:', err);
      if (err.message && err.message.includes('gender')) {
        console.warn('[HEALTH_PROFILE_SERVICE] Gender column does not exist in DB. Retrying update without gender.');
        delete dbPayload.gender;
        console.log('[DEBUG_LOG] Retrying update health_profiles with payload:', JSON.stringify(dbPayload, null, 2));
        const res = await supabase
          .from('health_profiles')
          .update(dbPayload)
          .eq('id', existing.id)
          .select()
          .single();

        console.log('[DEBUG_LOG] Supabase retry update response (health_profiles):', JSON.stringify({ data: res.data, error: res.error }, null, 2));
        if (res.error) throw res.error;
        updated = res.data;
      } else {
        throw err;
      }
    }

    // Synchronize conditions and allergies if supplied
    const healthConditions = profileData.healthConditions || profileData.medicalConditions;
    const foodAllergies = profileData.foodAllergies || profileData.allergies;

    if (healthConditions !== undefined || foodAllergies !== undefined || profileData.countryOrRegion !== undefined) {
      // Clear old health_conditions
      console.log('[DEBUG_LOG] Preparing to delete existing health_conditions for profile_id:', existing.id);
      const deleteRes = await supabase
        .from('health_conditions')
        .delete()
        .eq('profile_id', existing.id);

      console.log('[DEBUG_LOG] Supabase delete response (health_conditions):', JSON.stringify({ error: deleteRes.error }, null, 2));

      if (deleteRes.error) throw deleteRes.error;

      const conditionRecords: any[] = [];
      const activeConditions = healthConditions || [];
      const activeAllergies = foodAllergies || [];

      activeConditions.forEach((cond: string) => {
        if (cond && cond !== 'none' && !cond.startsWith('region:')) {
          conditionRecords.push({
            profile_id: existing.id,
            name: cond,
            type: 'condition',
          });
        }
      });

      const selectedRegion = profileData.countryOrRegion || 'Global/Other';
      conditionRecords.push({
        profile_id: existing.id,
        name: `region:${selectedRegion}`,
        type: 'condition',
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
        console.log('[DEBUG_LOG] Preparing to insert health_conditions records:', JSON.stringify(conditionRecords, null, 2));
        const insertRes = await supabase
          .from('health_conditions')
          .insert(conditionRecords);

        console.log('[DEBUG_LOG] Supabase insert response (health_conditions):', JSON.stringify({ error: insertRes.error }, null, 2));
        if (insertRes.error) throw insertRes.error;
      }
    }

    return this.getProfile(userId);
  }
}
