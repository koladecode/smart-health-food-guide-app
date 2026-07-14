import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

export interface HealthProfile {
  fullName: string;
  age: number | '';
  gender: string;
  height: number | '';
  weight: number | '';
  activityLevel: 'Sedentary' | 'Lightly Active' | 'Moderately Active' | 'Very Active';
  healthGoal: 'Lose Weight' | 'Maintain Weight' | 'Gain Weight' | 'Improve Overall Health';
  healthConditions: string[];
  foodAllergies: string[];
  dietaryPreference: string;
  currentMedications?: string;
  smokingStatus?: string;
  alcoholConsumption?: string;
}

interface HealthProfileContextType {
  profile: HealthProfile | null;
  saveProfile: (newProfile: HealthProfile) => Promise<void>;
  clearProfile: () => void;
  loadingProfile: boolean;
  fetchProfile: () => Promise<void>;
  isProfileFetched: boolean;
}

const HealthProfileContext = createContext<HealthProfileContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'smart_health_guide_profile';

export function HealthProfileProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, token, fetchWithAuth } = useAuth();
  const [loadingProfile, setLoadingProfile] = useState<boolean>(false);
  const [isProfileFetched, setIsProfileFetched] = useState<boolean>(false);
  const isFetchingRef = useRef(false);
  const [profile, setProfile] = useState<HealthProfile | null>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error('Error reading health profile from localStorage:', e);
      return null;
    }
  });

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
          const fetchedProfile: HealthProfile = {
            fullName: profileData.fullName || profileData.full_name || '',
            age: profileData.age !== undefined && profileData.age !== null ? Number(profileData.age) : '',
            gender: profileData.gender || 'Other',
            height: profileData.height !== undefined && profileData.height !== null ? Number(profileData.height) : '',
            weight: profileData.weight !== undefined && profileData.weight !== null ? Number(profileData.weight) : '',
            activityLevel: profileData.activityLevel || profileData.activity_level || 'Sedentary',
            healthGoal: profileData.healthGoal || profileData.health_goal || 'Improve Overall Health',
            healthConditions: profileData.healthConditions || profileData.medicalConditions || [],
            foodAllergies: profileData.foodAllergies || profileData.allergies || [],
            dietaryPreference: profileData.dietaryPreference || profileData.dietary_preference || 'None',
            currentMedications: profileData.currentMedications || profileData.current_medications || '',
            smokingStatus: profileData.smokingStatus || profileData.smoking_status || 'Never',
            alcoholConsumption: profileData.alcoholConsumption || profileData.alcohol_consumption || 'None',
          };
          console.log('[DEBUG_FRONTEND] fetchProfile mapping success. Setting profile state to:', JSON.stringify(fetchedProfile, null, 2));
          setProfile(fetchedProfile);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fetchedProfile));
        } else {
          console.log('[DEBUG_FRONTEND] fetchProfile result did not have status success or profile data. Setting profile to null.');
          setProfile(null);
        }
      } else {
        console.log('[DEBUG_FRONTEND] fetchProfile response.ok is false. Status:', response.status);
        if (response.status === 404) {
          setProfile(null);
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
          const mappedProfile: HealthProfile = {
            fullName: profileData.fullName || profileData.full_name || '',
            age: profileData.age !== undefined && profileData.age !== null ? Number(profileData.age) : '',
            gender: profileData.gender || 'Other',
            height: profileData.height !== undefined && profileData.height !== null ? Number(profileData.height) : '',
            weight: profileData.weight !== undefined && profileData.weight !== null ? Number(profileData.weight) : '',
            activityLevel: profileData.activityLevel || profileData.activity_level || 'Sedentary',
            healthGoal: profileData.healthGoal || profileData.health_goal || 'Improve Overall Health',
            healthConditions: profileData.healthConditions || profileData.medicalConditions || [],
            foodAllergies: profileData.foodAllergies || profileData.allergies || [],
            dietaryPreference: profileData.dietaryPreference || profileData.dietary_preference || 'None',
            currentMedications: profileData.currentMedications || profileData.current_medications || '',
            smokingStatus: profileData.smokingStatus || profileData.smoking_status || 'Never',
            alcoholConsumption: profileData.alcoholConsumption || profileData.alcohol_consumption || 'None',
          };
          setProfile(mappedProfile);
          setIsProfileFetched(true);
          hasCache = true;
        }
      } catch (e) {
        console.error('Error loading cached profile:', e);
      }
      if (!hasCache) {
        setIsProfileFetched(false);
      }
      fetchProfile();
    } else if (!isAuthenticated) {
      setProfile(null);
      setIsProfileFetched(true);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [isAuthenticated, token]);

  const saveProfile = async (newProfile: HealthProfile) => {
    const previousProfile = profile;
    // Optimistic UI update
    setProfile(newProfile);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newProfile));
    } catch (e) {
      console.error('Error saving health profile to localStorage:', e);
    }

    if (isAuthenticated) {
      try {
        setLoadingProfile(true);
        const response = await fetchWithAuth('/api/profile', {
          method: 'POST',
          body: JSON.stringify(newProfile),
        });
        let result: any;
        try {
          result = await response.json();
        } catch (e) {
          // ignore
        }
        if (!response.ok) {
          throw new Error(result?.message || 'Failed to save health profile to backend database.');
        }
        if (result.status === 'success' && result.data?.profile) {
          const savedDbProfile: HealthProfile = {
            fullName: result.data.profile.fullName || newProfile.fullName,
            age: result.data.profile.age || newProfile.age,
            gender: result.data.profile.gender || newProfile.gender || 'Other',
            height: result.data.profile.height || newProfile.height,
            weight: result.data.profile.weight || newProfile.weight,
            activityLevel: result.data.profile.activityLevel || newProfile.activityLevel,
            healthGoal: result.data.profile.healthGoal || newProfile.healthGoal,
            healthConditions: result.data.profile.healthConditions || newProfile.healthConditions,
            foodAllergies: result.data.profile.foodAllergies || newProfile.foodAllergies,
            dietaryPreference: result.data.profile.dietaryPreference || newProfile.dietaryPreference,
            currentMedications: result.data.profile.currentMedications || newProfile.currentMedications,
            smokingStatus: result.data.profile.smokingStatus || newProfile.smokingStatus,
            alcoholConsumption: result.data.profile.alcoholConsumption || newProfile.alcoholConsumption,
          };
          setProfile(savedDbProfile);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedDbProfile));
        } else {
          throw new Error(result.message || 'Failed to save health profile to backend database.');
        }
      } catch (err) {
        console.error('Error syncing saved profile with server:', err);
        // Rollback optimistic update on failure to maintain integrity
        setProfile(previousProfile);
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
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      console.error('Error clearing health profile from localStorage:', e);
    }
  };

  return (
    <HealthProfileContext.Provider
      value={{ profile, saveProfile, clearProfile, loadingProfile, fetchProfile, isProfileFetched }}
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
