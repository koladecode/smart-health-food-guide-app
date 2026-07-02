import React, { createContext, useContext, useState, useEffect } from 'react';

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
  saveProfile: (newProfile: HealthProfile) => void;
  clearProfile: () => void;
}

const HealthProfileContext = createContext<HealthProfileContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'smart_health_guide_profile';

export function HealthProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<HealthProfile | null>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error('Error reading health profile from localStorage:', e);
      return null;
    }
  });

  const saveProfile = (newProfile: HealthProfile) => {
    setProfile(newProfile);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newProfile));
    } catch (e) {
      console.error('Error saving health profile to localStorage:', e);
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
    <HealthProfileContext.Provider value={{ profile, saveProfile, clearProfile }} id="health-profile-provider-wrapper">
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
