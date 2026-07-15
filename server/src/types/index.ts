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
  gender?: string;
  weight: number;
  height: number;
  activityLevel: 'Sedentary' | 'Lightly Active' | 'Moderately Active' | 'Very Active';
  healthGoal: 'Weight Loss' | 'Weight Gain' | 'Muscle Gain' | 'Improve Overall Health' | 'Heart Health' | 'Blood Sugar Control' | 'Lose Weight' | 'Maintain Weight' | 'Gain Weight' | 'Blood Glucose Regulation' | 'Other';
  healthConditions: string[];
  foodAllergies: string[];
  dietaryPreference: 'None' | 'Vegetarian' | 'Vegan' | 'Keto' | 'Paleo';
  smokingStatus: 'Never' | 'Former smoker' | 'Active smoker';
  alcoholConsumption: 'None' | 'Light' | 'Moderate' | 'Heavy';
  currentMedications?: string;
  sleepDuration?: string;
  stressLevel?: string;
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
