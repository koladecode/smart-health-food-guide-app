-- Create trigger function to handle updated_at column updates automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. USERS TABLE
-- Maps local user identities (for future integration with Supabase auth.users or standalone auth)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 2. HEALTH PROFILES TABLE
-- Stores clinical biological parameters for users
CREATE TABLE IF NOT EXISTS public.health_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age > 0 AND age < 150),
    weight NUMERIC(5, 2) NOT NULL CHECK (weight > 0), -- weight in kilograms
    height NUMERIC(5, 2) NOT NULL CHECK (height > 0), -- height in centimeters
    activity_level TEXT NOT NULL, -- Sedentary, Lightly Active, Moderately Active, Very Active
    health_goal TEXT NOT NULL, -- Lose Weight, Gain Weight, Improve Overall Health, Blood Glucose Regulation, etc.
    dietary_preference TEXT DEFAULT 'None' NOT NULL, -- None, Vegetarian, Vegan, Keto, Paleo, etc.
    smoking_status TEXT DEFAULT 'Never' NOT NULL, -- Never, Former smoker, Active smoker
    alcohol_consumption TEXT DEFAULT 'None' NOT NULL, -- None, Light, Moderate, Heavy
    current_medications TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    CONSTRAINT unique_user_profile UNIQUE (user_id)
);

CREATE TRIGGER update_health_profiles_updated_at
    BEFORE UPDATE ON public.health_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 3. RECOMMENDATIONS TABLE
-- Caches generated high-level wellness indicators and baseline summaries
CREATE TABLE IF NOT EXISTS public.recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    bmi_value NUMERIC(4, 2) NOT NULL,
    bmi_category TEXT NOT NULL,
    water_liters NUMERIC(3, 1) NOT NULL,
    water_cups INTEGER NOT NULL,
    water_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TRIGGER update_recommendations_updated_at
    BEFORE UPDATE ON public.recommendations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. EXERCISES TABLE
-- Stores specific cardiac and resistance programs tied to a recommendation
CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recommendation_id UUID NOT NULL REFERENCES public.recommendations(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    frequency TEXT NOT NULL,
    duration TEXT NOT NULL,
    intensity TEXT NOT NULL,
    description TEXT,
    routine TEXT[] NOT NULL DEFAULT '{}',
    precautions TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    CONSTRAINT unique_recommendation_exercise UNIQUE (recommendation_id)
);

CREATE TRIGGER update_exercises_updated_at
    BEFORE UPDATE ON public.exercises
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. FOODS TABLE
-- Stores recommended components split by type (eat, avoid, or combinations)
CREATE TABLE IF NOT EXISTS public.foods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recommendation_id UUID NOT NULL REFERENCES public.recommendations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    badge TEXT,
    type TEXT NOT NULL CHECK (type IN ('eat', 'avoid', 'combination', 'lifestyle')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TRIGGER update_foods_updated_at
    BEFORE UPDATE ON public.foods
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. HEALTH CONDITIONS & ALLERGIES TABLE
-- Stores individual flags (many-to-one health profiles relation)
CREATE TABLE IF NOT EXISTS public.health_conditions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.health_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('condition', 'allergy')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    CONSTRAINT unique_profile_condition_allergy UNIQUE (profile_id, name, type)
);

CREATE TRIGGER update_health_conditions_updated_at
    BEFORE UPDATE ON public.health_conditions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add Indexes for performant foreign key lookups
CREATE INDEX IF NOT EXISTS idx_health_profiles_user_id ON public.health_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON public.recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_exercises_recommendation_id ON public.exercises(recommendation_id);
CREATE INDEX IF NOT EXISTS idx_foods_recommendation_id ON public.foods(recommendation_id);
CREATE INDEX IF NOT EXISTS idx_health_conditions_profile_id ON public.health_conditions(profile_id);
