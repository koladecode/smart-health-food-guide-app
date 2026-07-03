import React, { createContext, useContext, useState, useEffect } from 'react';
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
}

const HealthProfileContext = createContext<HealthProfileContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'smart_health_guide_profile';

export function HealthProfileProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, fetchWithAuth } = useAuth();
  const [loadingProfile, setLoadingProfile] = useState<boolean>(false);
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
    if (!isAuthenticated) return;
    try {
      setLoadingProfile(true);
      const response = await fetchWithAuth('/api/profile');
      if (response.ok) {
        const result = await response.json();
        if (result.status === 'success' && result.data?.profile) {
          const fetchedProfile: HealthProfile = {
            fullName: result.data.profile.fullName || '',
            age: result.data.profile.age || '',
            gender: result.data.profile.gender || 'Other',
            height: result.data.profile.height || '',
            weight: result.data.profile.weight || '',
            activityLevel: result.data.profile.activityLevel || 'Sedentary',
            healthGoal: result.data.profile.healthGoal || 'Improve Overall Health',
            healthConditions: result.data.profile.healthConditions || [],
            foodAllergies: result.data.profile.foodAllergies || [],
            dietaryPreference: result.data.profile.dietaryPreference || 'None',
            currentMedications: result.data.profile.currentMedications || '',
            smokingStatus: result.data.profile.smokingStatus || 'Never',
            alcoholConsumption: result.data.profile.alcoholConsumption || 'None',
          };
          setProfile(fetchedProfile);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fetchedProfile));
        } else {
          // If profile is null, make sure we reflect that
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error('Error fetching profile from server:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    } else {
      setProfile(null);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [isAuthenticated]);

  const saveProfile = async (newProfile: HealthProfile) => {
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
        if (!response.ok) {
          throw new Error('Failed to save health profile to backend database.');
        }
        const result = await response.json();
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
        }
      } catch (err) {
        console.error('Error syncing saved profile with server:', err);
      } finally {
        setLoadingProfile(false);
      }
    }
  };

  const clearProfile = () => {
    setProfile(null);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      console.error('Error clearing health profile from localStorage:', e);
    }
  };

  return (
    <HealthProfileContext.Provider
      value={{ profile, saveProfile, clearProfile, loadingProfile, fetchProfile }}
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
