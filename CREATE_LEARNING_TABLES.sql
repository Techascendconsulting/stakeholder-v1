-- Create learning_progress table
CREATE TABLE IF NOT EXISTS learning_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    module TEXT NOT NULL,
    section_id INTEGER NOT NULL,
    is_complete BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, module, section_id)
);

-- Create learning_reflections table
CREATE TABLE IF NOT EXISTS learning_reflections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    module TEXT NOT NULL,
    section_id INTEGER NOT NULL,
    notes TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, module, section_id)
);

-- Enable RLS
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_reflections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for learning_progress
CREATE POLICY "Users can view their own learning progress" ON learning_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own learning progress" ON learning_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning progress" ON learning_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for learning_reflections
CREATE POLICY "Users can view their own learning reflections" ON learning_reflections
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own learning reflections" ON learning_reflections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning reflections" ON learning_reflections
    FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_learning_progress_user_module ON learning_progress(user_id, module);
CREATE INDEX IF NOT EXISTS idx_learning_reflections_user_module ON learning_reflections(user_id, module);






















