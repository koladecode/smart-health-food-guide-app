-- -------------------------------------------------------------
-- Production-Ready PostgreSQL Schema for Smart Health & Food Guide
-- (Idempotent - Safe to run multiple times)
-- -------------------------------------------------------------

-- Create trigger function to handle updated_at column updates automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================================
-- STEP 1: TABLE CREATION (No external dependencies)
-- =============================================================

-- 1. USERS TABLE
-- Maps local user identities linked directly to Supabase auth.users
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'user' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 2. HEALTH PROFILES TABLE
-- Stores clinical biological parameters for users
CREATE TABLE IF NOT EXISTS public.health_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    full_name TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age > 0 AND age < 150),
    gender TEXT DEFAULT 'Other' NOT NULL,
    weight NUMERIC(5, 2) NOT NULL CHECK (weight > 0), -- weight in kilograms
    height NUMERIC(5, 2) NOT NULL CHECK (height > 0), -- height in centimeters
    activity_level TEXT NOT NULL, -- Sedentary, Lightly Active, Moderately Active, Very Active
    health_goal TEXT NOT NULL, -- Lose Weight, Gain Weight, Improve Overall Health, Blood Glucose Regulation, etc.
    dietary_preference TEXT DEFAULT 'None' NOT NULL, -- None, Vegetarian, Vegan, Keto, Paleo, etc.
    smoking_status TEXT DEFAULT 'Never' NOT NULL, -- Never, Former smoker, Active smoker
    alcohol_consumption TEXT DEFAULT 'None' NOT NULL, -- None, Light, Moderate, Heavy
    current_medications TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 3. HEALTH CONDITIONS & ALLERGIES TABLE
-- Stores individual flags (many-to-one health profiles relation)
CREATE TABLE IF NOT EXISTS public.health_conditions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('condition', 'allergy')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 4. RECOMMENDATIONS TABLE
-- Caches generated high-level wellness indicators and baseline summaries
CREATE TABLE IF NOT EXISTS public.recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    bmi_value NUMERIC(4, 2) NOT NULL,
    bmi_category TEXT NOT NULL,
    water_liters NUMERIC(3, 1) NOT NULL,
    water_cups INTEGER NOT NULL,
    water_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 5. EXERCISES TABLE
-- Stores specific cardiac and resistance programs tied to a recommendation
CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recommendation_id UUID NOT NULL,
    type TEXT NOT NULL,
    frequency TEXT NOT NULL,
    duration TEXT NOT NULL,
    intensity TEXT NOT NULL,
    description TEXT,
    routine TEXT[] NOT NULL DEFAULT '{}',
    precautions TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 6. FOODS TABLE
-- Stores recommended components split by type (eat, avoid, or combinations)
CREATE TABLE IF NOT EXISTS public.foods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recommendation_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    badge TEXT,
    type TEXT NOT NULL CHECK (type IN ('eat', 'avoid', 'combination', 'lifestyle')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- =============================================================
-- STEP 2: UNIQUE AND FOREIGN KEY CONSTRAINTS (Idempotent using DO blocks)
-- =============================================================

-- Users Constraints
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'users_email_key') THEN
        ALTER TABLE public.users ADD CONSTRAINT users_email_key UNIQUE (email);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'users_id_fkey') THEN
        ALTER TABLE public.users ADD CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Health Profiles Constraints
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'unique_user_profile') THEN
        ALTER TABLE public.health_profiles ADD CONSTRAINT unique_user_profile UNIQUE (user_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'health_profiles_user_id_fkey') THEN
        ALTER TABLE public.health_profiles ADD CONSTRAINT health_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Health Conditions Constraints
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'unique_profile_condition_allergy') THEN
        ALTER TABLE public.health_conditions ADD CONSTRAINT unique_profile_condition_allergy UNIQUE (profile_id, name, type);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'health_conditions_profile_id_fkey') THEN
        ALTER TABLE public.health_conditions ADD CONSTRAINT health_conditions_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.health_profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Recommendations Constraints
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'recommendations_user_id_fkey') THEN
        ALTER TABLE public.recommendations ADD CONSTRAINT recommendations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Exercises Constraints
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'unique_recommendation_exercise') THEN
        ALTER TABLE public.exercises ADD CONSTRAINT unique_recommendation_exercise UNIQUE (recommendation_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'exercises_recommendation_id_fkey') THEN
        ALTER TABLE public.exercises ADD CONSTRAINT exercises_recommendation_id_fkey FOREIGN KEY (recommendation_id) REFERENCES public.recommendations(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Foods Constraints
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'foods_recommendation_id_fkey') THEN
        ALTER TABLE public.foods ADD CONSTRAINT foods_recommendation_id_fkey FOREIGN KEY (recommendation_id) REFERENCES public.recommendations(id) ON DELETE CASCADE;
    END IF;
END $$;

-- =============================================================
-- STEP 3: INDEXES
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_health_profiles_user_id ON public.health_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON public.recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_exercises_recommendation_id ON public.exercises(recommendation_id);
CREATE INDEX IF NOT EXISTS idx_foods_recommendation_id ON public.foods(recommendation_id);
CREATE INDEX IF NOT EXISTS idx_health_conditions_profile_id ON public.health_conditions(profile_id);

-- =============================================================
-- STEP 4: TRIGGERS FOR updated_at COLUMNS (Idempotent - DROP IF EXISTS first)
-- =============================================================
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_health_profiles_updated_at ON public.health_profiles;
CREATE TRIGGER update_health_profiles_updated_at
    BEFORE UPDATE ON public.health_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_health_conditions_updated_at ON public.health_conditions;
CREATE TRIGGER update_health_conditions_updated_at
    BEFORE UPDATE ON public.health_conditions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_recommendations_updated_at ON public.recommendations;
CREATE TRIGGER update_recommendations_updated_at
    BEFORE UPDATE ON public.recommendations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_exercises_updated_at ON public.exercises;
CREATE TRIGGER update_exercises_updated_at
    BEFORE UPDATE ON public.exercises
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_foods_updated_at ON public.foods;
CREATE TRIGGER update_foods_updated_at
    BEFORE UPDATE ON public.foods
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================
-- STEP 5: ENABLE ROW LEVEL SECURITY (RLS)
-- =============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;

-- =============================================================
-- STEP 6: RLS POLICIES (Idempotent - DROP IF EXISTS first)
-- =============================================================

-- 1. Users policies
DROP POLICY IF EXISTS users_owner_select ON public.users;
CREATE POLICY users_owner_select ON public.users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS users_owner_insert ON public.users;
CREATE POLICY users_owner_insert ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS users_owner_update ON public.users;
CREATE POLICY users_owner_update ON public.users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS users_owner_delete ON public.users;
CREATE POLICY users_owner_delete ON public.users FOR DELETE USING (auth.uid() = id);

-- 2. Health Profiles policies
DROP POLICY IF EXISTS health_profiles_owner_select ON public.health_profiles;
CREATE POLICY health_profiles_owner_select ON public.health_profiles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS health_profiles_owner_insert ON public.health_profiles;
CREATE POLICY health_profiles_owner_insert ON public.health_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS health_profiles_owner_update ON public.health_profiles;
CREATE POLICY health_profiles_owner_update ON public.health_profiles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS health_profiles_owner_delete ON public.health_profiles;
CREATE POLICY health_profiles_owner_delete ON public.health_profiles FOR DELETE USING (auth.uid() = user_id);

-- 3. Health Conditions policies (relies on health_profiles ownership)
DROP POLICY IF EXISTS health_conditions_owner_select ON public.health_conditions;
CREATE POLICY health_conditions_owner_select ON public.health_conditions FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.health_profiles
        WHERE public.health_profiles.id = public.health_conditions.profile_id
        AND public.health_profiles.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS health_conditions_owner_insert ON public.health_conditions;
CREATE POLICY health_conditions_owner_insert ON public.health_conditions FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.health_profiles
        WHERE public.health_profiles.id = profile_id
        AND public.health_profiles.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS health_conditions_owner_update ON public.health_conditions;
CREATE POLICY health_conditions_owner_update ON public.health_conditions FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.health_profiles
        WHERE public.health_profiles.id = public.health_conditions.profile_id
        AND public.health_profiles.user_id = auth.uid()
    )
) WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.health_profiles
        WHERE public.health_profiles.id = profile_id
        AND public.health_profiles.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS health_conditions_owner_delete ON public.health_conditions;
CREATE POLICY health_conditions_owner_delete ON public.health_conditions FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM public.health_profiles
        WHERE public.health_profiles.id = public.health_conditions.profile_id
        AND public.health_profiles.user_id = auth.uid()
    )
);

-- 4. Recommendations policies
DROP POLICY IF EXISTS recommendations_owner_select ON public.recommendations;
CREATE POLICY recommendations_owner_select ON public.recommendations FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS recommendations_owner_insert ON public.recommendations;
CREATE POLICY recommendations_owner_insert ON public.recommendations FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS recommendations_owner_update ON public.recommendations;
CREATE POLICY recommendations_owner_update ON public.recommendations FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS recommendations_owner_delete ON public.recommendations;
CREATE POLICY recommendations_owner_delete ON public.recommendations FOR DELETE USING (auth.uid() = user_id);

-- 5. Exercises policies (relies on recommendations ownership)
DROP POLICY IF EXISTS exercises_owner_select ON public.exercises;
CREATE POLICY exercises_owner_select ON public.exercises FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.recommendations
        WHERE public.recommendations.id = public.exercises.recommendation_id
        AND public.recommendations.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS exercises_owner_insert ON public.exercises;
CREATE POLICY exercises_owner_insert ON public.exercises FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.recommendations
        WHERE public.recommendations.id = recommendation_id
        AND public.recommendations.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS exercises_owner_update ON public.exercises;
CREATE POLICY exercises_owner_update ON public.exercises FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.recommendations
        WHERE public.recommendations.id = public.exercises.recommendation_id
        AND public.recommendations.user_id = auth.uid()
    )
) WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.recommendations
        WHERE public.recommendations.id = recommendation_id
        AND public.recommendations.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS exercises_owner_delete ON public.exercises;
CREATE POLICY exercises_owner_delete ON public.exercises FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM public.recommendations
        WHERE public.recommendations.id = public.exercises.recommendation_id
        AND public.recommendations.user_id = auth.uid()
    )
);

-- 6. Foods policies (relies on recommendations ownership)
DROP POLICY IF EXISTS foods_owner_select ON public.foods;
CREATE POLICY foods_owner_select ON public.foods FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.recommendations
        WHERE public.recommendations.id = public.foods.recommendation_id
        AND public.recommendations.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS foods_owner_insert ON public.foods;
CREATE POLICY foods_owner_insert ON public.foods FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.recommendations
        WHERE public.recommendations.id = recommendation_id
        AND public.recommendations.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS foods_owner_update ON public.foods;
CREATE POLICY foods_owner_update ON public.foods FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.recommendations
        WHERE public.recommendations.id = public.foods.recommendation_id
        AND public.recommendations.user_id = auth.uid()
    )
) WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.recommendations
        WHERE public.recommendations.id = recommendation_id
        AND public.recommendations.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS foods_owner_delete ON public.foods;
CREATE POLICY foods_owner_delete ON public.foods FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM public.recommendations
        WHERE public.recommendations.id = public.foods.recommendation_id
        AND public.recommendations.user_id = auth.uid()
    )
);

-- =============================================================
-- STEP 7: AUTO-SYNC TRIGGER FROM auth.users TO public.users
-- =============================================================

-- Create trigger function
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email)
    VALUES (NEW.id, NEW.email)
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_auth_user();
