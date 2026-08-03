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
    
    // Fetch profile(s) for user_id ordered by updated_at desc
    const { data: profiles, error } = await supabase
      .from('health_profiles')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    if (!profiles || profiles.length === 0) {
      return null;
    }

    const profile = profiles[0];

    // Clean up duplicate profiles if any exist for this user_id
    if (profiles.length > 1) {
      const extraIds = profiles.slice(1).map((p) => p.id);
      supabase.from('health_profiles').delete().in('id', extraIds).then(({ error: delErr }) => {
        if (delErr) console.warn('[HEALTH_PROFILE_SERVICE] Error cleaning up duplicate profiles:', delErr);
      });
    }

    // Fetch conditions and allergies associated with this specific profile_id
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
      // Upsert by user_id to ensure single record per user
      const res = await supabase
        .from('health_profiles')
        .upsert(dbPayload, { onConflict: 'user_id' })
        .select()
        .single();

      if (res.error) throw res.error;
      profile = res.data;
    } catch (err: any) {
      if (err.message && err.message.includes('gender')) {
        console.warn('[HEALTH_PROFILE_SERVICE] Gender column issue. Retrying insert without gender.');
        delete dbPayload.gender;
        const res = await supabase
          .from('health_profiles')
          .upsert(dbPayload, { onConflict: 'user_id' })
          .select()
          .single();

        if (res.error) throw res.error;
        profile = res.data;
      } else {
        throw err;
      }
    }

    // Clear old conditions for this profile_id before inserting new ones
    await supabase.from('health_conditions').delete().eq('profile_id', profile.id);

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
      const res = await supabase
        .from('health_conditions')
        .insert(conditionRecords);

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

    // Retrieve profile first to get ID for this user_id
    const { data: existingProfiles, error: findError } = await supabase
      .from('health_profiles')
      .select('id')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (findError) throw findError;

    if (!existingProfiles || existingProfiles.length === 0) {
      // If profile doesn't exist, route to createProfile
      return this.createProfile(userId, profileData);
    }

    const existingId = existingProfiles[0].id;

    // Clean extra profile records for this user if duplicate rows exist
    if (existingProfiles.length > 1) {
      const extraIds = existingProfiles.slice(1).map((p) => p.id);
      await supabase.from('health_profiles').delete().in('id', extraIds);
    }

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
      const res = await supabase
        .from('health_profiles')
        .update(dbPayload)
        .eq('id', existingId)
        .eq('user_id', userId)
        .select()
        .single();

      if (res.error) throw res.error;
      updated = res.data;
    } catch (err: any) {
      if (err.message && err.message.includes('gender')) {
        delete dbPayload.gender;
        const res = await supabase
          .from('health_profiles')
          .update(dbPayload)
          .eq('id', existingId)
          .eq('user_id', userId)
          .select()
          .single();

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
      // Clear old health_conditions specifically for this profile_id
      const deleteRes = await supabase
        .from('health_conditions')
        .delete()
        .eq('profile_id', existingId);

      if (deleteRes.error) throw deleteRes.error;

      const conditionRecords: any[] = [];
      const activeConditions = healthConditions || [];
      const activeAllergies = foodAllergies || [];

      activeConditions.forEach((cond: string) => {
        if (cond && cond !== 'none' && !cond.startsWith('region:')) {
          conditionRecords.push({
            profile_id: existingId,
            name: cond,
            type: 'condition',
          });
        }
      });

      const selectedRegion = profileData.countryOrRegion || 'Global/Other';
      conditionRecords.push({
        profile_id: existingId,
        name: `region:${selectedRegion}`,
        type: 'condition',
      });

      activeAllergies.forEach((allergy: string) => {
        if (allergy && allergy !== 'none') {
          conditionRecords.push({
            profile_id: existingId,
            name: allergy,
            type: 'allergy',
          });
        }
      });

      if (conditionRecords.length > 0) {
        const insertRes = await supabase
          .from('health_conditions')
          .insert(conditionRecords);

        if (insertRes.error) throw insertRes.error;
      }
    }

    return this.getProfile(userId);
  }

  /**
   * Deletes a user's health profile and associated data (health_conditions, recommendations, exercises)
   * while preserving the auth account and public.users row.
   */
  public static async deleteProfile(userId: string): Promise<boolean> {
    const supabase = getSupabaseAdminClient();

    // 1. Get all health profile IDs for this user
    const { data: profiles, error: findError } = await supabase
      .from('health_profiles')
      .select('id')
      .eq('user_id', userId);

    if (findError) throw findError;

    if (profiles && profiles.length > 0) {
      const profileIds = profiles.map((p) => p.id);

      // Delete health_conditions associated with these profile IDs
      await supabase
        .from('health_conditions')
        .delete()
        .in('profile_id', profileIds);

      // Delete health_profiles row(s) for this user
      const { error: deleteProfErr } = await supabase
        .from('health_profiles')
        .delete()
        .eq('user_id', userId);

      if (deleteProfErr) throw deleteProfErr;
    }

    // Delete user's generated recommendations & exercises associated with this user
    await supabase
      .from('recommendations')
      .delete()
      .eq('user_id', userId);

    await supabase
      .from('exercises')
      .delete()
      .eq('user_id', userId);

    return true;
  }
}
