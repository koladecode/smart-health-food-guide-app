import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

export interface HealthProfile {
  fullName: string;
  age: number | '';
  gender: string;
  height: number | '';
  weight: number | '';
  activityLevel: 'Sedentary' | 'Lightly Active' | 'Moderately Active' | 'Very Active';
  healthGoal: 'Weight Loss' | 'Weight Gain' | 'Muscle Gain' | 'Improve Overall Health' | 'Heart Health' | 'Blood Sugar Control' | 'Lose Weight' | 'Maintain Weight' | 'Gain Weight';
  healthConditions: string[];
  foodAllergies: string[];
  dietaryPreference: string;
  currentMedications?: string;
  smokingStatus?: string;
  alcoholConsumption?: string;
  sleepDuration?: 'Less than 6 hours' | '6 to 8 hours' | 'More than 8 hours';
  stressLevel?: 'Low' | 'Moderate' | 'High';
  countryOrRegion?: string;
}

function decodeProfile(profileData: any): HealthProfile {
  const rawConditions = profileData.healthConditions || profileData.medicalConditions || [];
  
  let sleepDuration = profileData.sleepDuration || profileData.sleep_duration;
  if (!sleepDuration) {
    if (rawConditions.includes('sleep_less_6')) sleepDuration = 'Less than 6 hours';
    else if (rawConditions.includes('sleep_6_8')) sleepDuration = '6 to 8 hours';
    else if (rawConditions.includes('sleep_8_plus')) sleepDuration = 'More than 8 hours';
    else sleepDuration = '6 to 8 hours';
  }

  let stressLevel = profileData.stressLevel || profileData.stress_level;
  if (!stressLevel) {
    if (rawConditions.includes('stress_low')) stressLevel = 'Low';
    else if (rawConditions.includes('stress_moderate')) stressLevel = 'Moderate';
    else if (rawConditions.includes('stress_high')) stressLevel = 'High';
    else stressLevel = 'Moderate';
  }

  let countryOrRegion = profileData.countryOrRegion || profileData.country_or_region;
  if (!countryOrRegion) {
    const regionCond = rawConditions.find((c: string) => c && c.startsWith('region:'));
    if (regionCond) {
      countryOrRegion = regionCond.replace('region:', '');
    } else {
      countryOrRegion = 'Global/Other';
    }
  }

  const filteredConditions = rawConditions.filter((c: string) => !c.startsWith('sleep_') && !c.startsWith('stress_') && !c.startsWith('region:'));

  return {
    fullName: profileData.fullName || profileData.full_name || '',
    age: profileData.age !== undefined && profileData.age !== null ? Number(profileData.age) : '',
    gender: profileData.gender || 'Other',
    height: profileData.height !== undefined && profileData.height !== null ? Number(profileData.height) : '',
    weight: profileData.weight !== undefined && profileData.weight !== null ? Number(profileData.weight) : '',
    activityLevel: profileData.activityLevel || profileData.activity_level || 'Sedentary',
    healthGoal: profileData.healthGoal || profileData.health_goal || 'Improve Overall Health',
    healthConditions: filteredConditions,
    foodAllergies: profileData.foodAllergies || profileData.allergies || [],
    dietaryPreference: profileData.dietaryPreference || profileData.dietary_preference || 'None',
    currentMedications: profileData.currentMedications || profileData.current_medications || '',
    smokingStatus: profileData.smokingStatus || profileData.smoking_status || 'Never',
    alcoholConsumption: profileData.alcoholConsumption || profileData.alcohol_consumption || 'None',
    sleepDuration,
    stressLevel,
    countryOrRegion,
  };
}

interface HealthProfileContextType {
  profile: HealthProfile | null;
  saveProfile: (newProfile: HealthProfile) => Promise<void>;
  clearProfile: () => void;
  loadingProfile: boolean;
  fetchProfile: () => Promise<void>;
  isProfileFetched: boolean;
  recsExist: boolean | null;
  justCreatedProfile: boolean;
  setJustCreatedProfile: (val: boolean) => void;
  checkRecommendationsExist: () => Promise<boolean>;
  isProfileSynced: boolean;
}

const HealthProfileContext = createContext<HealthProfileContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'smart_health_guide_profile';

export function HealthProfileProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, token, fetchWithAuth } = useAuth();
  const [loadingProfile, setLoadingProfile] = useState<boolean>(false);
  const [isProfileFetched, setIsProfileFetched] = useState<boolean>(false);
  const [syncedToken, setSyncedToken] = useState<string | null>(null);
  const isFetchingRef = useRef(false);
  const [recsExist, setRecsExist] = useState<boolean | null>(null);
  const [justCreatedProfile, setJustCreatedProfile] = useState<boolean>(false);
  const [profile, setProfile] = useState<HealthProfile | null>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return decodeProfile(parsed);
      }
      return null;
    } catch (e) {
      console.error('Error reading health profile from localStorage:', e);
      return null;
    }
  });

  const checkRecommendationsExist = async (): Promise<boolean> => {
    if (!isAuthenticated) return false;
    try {
      const response = await fetchWithAuth('/api/recommendations?check=true');
      if (response.ok) {
        const result = await response.json();
        const exists = !!result.exists;
        setRecsExist(exists);
        return exists;
      }
    } catch (err) {
      console.error('Error checking recommendations existence:', err);
    }
    return false;
  };

  const fetchProfile = async () => {
    if (!isAuthenticated) {
      console.log('[DEBUG_FRONTEND] fetchProfile called but isAuthenticated is false. Returning.');
      return;
    }
    if (isFetchingRef.current) {
      console.log('[DEBUG_FRONTEND] fetchProfile: fetch already in progress, skipping concurrent call.');
      return;
    }
    try {
      isFetchingRef.current = true;
      setLoadingProfile(true);
      console.log('[DEBUG_FRONTEND] fetchProfile: starting GET /api/profile request...');
      const response = await fetchWithAuth('/api/profile');
      console.log('[DEBUG_FRONTEND] fetchProfile response status:', response.status);
      if (response.ok) {
        const result = await response.json();
        console.log('[DEBUG_FRONTEND] fetchProfile response JSON result:', JSON.stringify(result, null, 2));
        if (result.status === 'success' && result.data?.profile) {
          const profileData = result.data.profile;
          const fetchedProfile = decodeProfile(profileData);
          console.log('[DEBUG_FRONTEND] fetchProfile mapping success. Setting profile state to:', JSON.stringify(fetchedProfile, null, 2));
          setProfile(fetchedProfile);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fetchedProfile));
          await checkRecommendationsExist();
        } else {
          console.log('[DEBUG_FRONTEND] fetchProfile result did not have status success or profile data. Setting profile to null.');
          setProfile(null);
          setRecsExist(false);
        }
      } else {
        console.log('[DEBUG_FRONTEND] fetchProfile response.ok is false. Status:', response.status);
        if (response.status === 404) {
          setProfile(null);
          setRecsExist(false);
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      }
    } catch (err) {
      console.error('[DEBUG_FRONTEND] Error fetching profile from server:', err);
    } finally {
      isFetchingRef.current = false;
      setLoadingProfile(false);
      setIsProfileFetched(true);
      console.log('[DEBUG_FRONTEND] fetchProfile complete. loadingProfile set to false, isProfileFetched set to true.');
    }
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      let hasCache = false;
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          const profileData = JSON.parse(stored);
          const mappedProfile = decodeProfile(profileData);
          setProfile(mappedProfile);
          setIsProfileFetched(true);
          hasCache = true;
          fetchWithAuth('/api/recommendations?check=true')
            .then(res => res.json())
            .then(result => {
              setRecsExist(!!result.exists);
            })
            .catch(() => setRecsExist(false));
        }
      } catch (e) {
        console.error('Error loading cached profile:', e);
      }
      if (!hasCache) {
        setIsProfileFetched(false);
      }
      fetchProfile().then(() => {
        setSyncedToken(token);
      });
    } else if (!isAuthenticated) {
      setProfile(null);
      setIsProfileFetched(true);
      setRecsExist(false);
      setJustCreatedProfile(false);
      setSyncedToken(null);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [isAuthenticated, token]);

  const saveProfile = async (newProfile: HealthProfile) => {
    console.log('[INSTRUMENT_WEIGHT] [saveProfile] Method saveProfile called with newProfile weight:', newProfile.weight);
    const previousProfile = profile;
    const isNew = !profile;

    if (isNew) {
      setJustCreatedProfile(true);
    }

    // Encode sleep and stress into health conditions before saving to DB
    const sleepTag = newProfile.sleepDuration === 'Less than 6 hours' ? 'sleep_less_6' 
      : newProfile.sleepDuration === 'More than 8 hours' ? 'sleep_8_plus' : 'sleep_6_8';
    
    const stressTag = newProfile.stressLevel === 'Low' ? 'stress_low'
      : newProfile.stressLevel === 'High' ? 'stress_high' : 'stress_moderate';
    
    const baseConditions = (newProfile.healthConditions || []).filter(c => !c.startsWith('sleep_') && !c.startsWith('stress_'));
    
    const profileToSave = {
      ...newProfile,
      healthConditions: [...baseConditions, sleepTag, stressTag]
    };

    console.log('[INSTRUMENT_WEIGHT] [saveProfile] profileToSave constructed. weight:', profileToSave.weight);

    // Optimistic UI update using decodeProfile(profileToSave) to make sure state is formatted identically
    const decodedOptimisticProfile = decodeProfile(profileToSave);
    console.log('[INSTRUMENT_WEIGHT] [saveProfile] decodedOptimisticProfile constructed. weight:', decodedOptimisticProfile.weight);
    setProfile(decodedOptimisticProfile);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(decodedOptimisticProfile));
    } catch (e) {
      console.error('Error saving health profile to localStorage:', e);
    }

    if (isAuthenticated) {
      try {
        setLoadingProfile(true);
        console.log('[INSTRUMENT_WEIGHT] [saveProfile] Immediately before fetchWithAuth POST /api/profile. Payload weight:', profileToSave.weight);
        const response = await fetchWithAuth('/api/profile', {
          method: 'POST',
          body: JSON.stringify(profileToSave),
        });
        console.log('[INSTRUMENT_WEIGHT] [saveProfile] fetchWithAuth POST completed. response status:', response.status);
        let result: any;
        try {
          result = await response.json();
          console.log('[INSTRUMENT_WEIGHT] [saveProfile] Response body received. Result status:', result.status, 'Result weight:', result.data?.profile?.weight);
        } catch (e) {
          // ignore
        }
        if (!response.ok) {
          throw new Error(result?.message || 'Failed to save health profile to backend database.');
        }
        if (result.status === 'success' && result.data?.profile) {
          const savedDbProfile = decodeProfile(result.data.profile);
          console.log('[INSTRUMENT_WEIGHT] [saveProfile] Setting state with decoded backend returned profile. weight:', savedDbProfile.weight);
          setProfile(savedDbProfile);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedDbProfile));
          setRecsExist(true); // Generated automatically on save
        } else {
          throw new Error(result.message || 'Failed to save health profile to backend database.');
        }
      } catch (err) {
        console.error('Error syncing saved profile with server:', err);
        // Rollback optimistic update on failure to maintain integrity
        setProfile(previousProfile);
        setJustCreatedProfile(false);
        try {
          if (previousProfile) {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(previousProfile));
          } else {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
          }
        } catch (e) {
          console.error('Error rolling back localStorage:', e);
        }
        throw err;
      } finally {
        setLoadingProfile(false);
      }
    }
  };

  const clearProfile = () => {
    setProfile(null);
    setIsProfileFetched(true);
    setRecsExist(false);
    setJustCreatedProfile(false);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      console.error('Error clearing health profile from localStorage:', e);
    }
  };

  const isProfileSynced = isAuthenticated ? (syncedToken === token && !loadingProfile && isProfileFetched) : true;

  return (
    <HealthProfileContext.Provider
      value={{
        profile,
        saveProfile,
        clearProfile,
        loadingProfile,
        fetchProfile,
        isProfileFetched,
        recsExist,
        justCreatedProfile,
        setJustCreatedProfile,
        checkRecommendationsExist,
        isProfileSynced
      }}
      id="health-profile-provider-wrapper"
    >
      {children}
    </HealthProfileContext.Provider>
  );
}

export function useHealthProfile() {
  const context = useContext(HealthProfileContext);
  if (!context) {
    throw new Error('useHealthProfile must be used within a HealthProfileProvider');
  }
  return context;
}
