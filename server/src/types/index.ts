export interface User {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HealthProfile {
  id: string;
  userId: string;
  fullName: string;
  age: number;
  weight: number;
  height: number;
  activityLevel: 'Sedentary' | 'Lightly Active' | 'Moderately Active' | 'Very Active';
  healthGoal: 'Lose Weight' | 'Gain Weight' | 'Improve Overall Health' | 'Blood Glucose Regulation' | 'Other';
  healthConditions: string[];
  foodAllergies: string[];
  dietaryPreference: 'None' | 'Vegetarian' | 'Vegan' | 'Keto' | 'Paleo';
  smokingStatus: 'Never' | 'Former smoker' | 'Active smoker';
  alcoholConsumption: 'None' | 'Light' | 'Moderate' | 'Heavy';
  currentMedications?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecommendationItem {
  id: string;
  title: string;
  description: string;
  badge?: string;
}

export interface WaterIntakeRecommendation {
  liters: number;
  cups: number;
  description: string;
  tips: string[];
}

export interface ExerciseRecommendation {
  type: string;
  frequency: string;
  duration: string;
  intensity: string;
  description: string;
  routine: string[];
  precautions: string[];
}

export interface PersonalizedRecommendations {
  bmiValue: number;
  bmiCategory: string;
  foodsToEat: RecommendationItem[];
  foodsToAvoid: RecommendationItem[];
  healthyCombinations: RecommendationItem[];
  waterIntake: WaterIntakeRecommendation;
  exercise: ExerciseRecommendation;
  lifestyleTips: RecommendationItem[];
  createdAt: Date;
}
