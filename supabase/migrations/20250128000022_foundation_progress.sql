-- Create foundation_progress table for tracking sequential Foundation completion
CREATE TABLE IF NOT EXISTS public.foundation_progress (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    step_completed text NOT NULL, -- e.g., 'cluster-1', 'cluster-1-quiz', 'cluster-2', etc.
    completed_at timestamptz DEFAULT now(),
    quiz_score integer, -- for quiz steps (0-100)
    task_data jsonb, -- for storing task results/answers
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    -- Ensure one record per user per step
    UNIQUE(user_id, step_completed)
);

-- Create indexes for performance
CREATE INDEX idx_foundation_progress_user_id ON public.foundation_progress(user_id);
CREATE INDEX idx_foundation_progress_step ON public.foundation_progress(step_completed);
CREATE INDEX idx_foundation_progress_completed_at ON public.foundation_progress(completed_at DESC);

-- Enable Row Level Security
ALTER TABLE public.foundation_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies with proper user isolation
CREATE POLICY "Users can view their own foundation progress" ON public.foundation_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own foundation progress" ON public.foundation_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own foundation progress" ON public.foundation_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own foundation progress" ON public.foundation_progress
    FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_foundation_progress_updated_at 
    BEFORE UPDATE ON public.foundation_progress 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
