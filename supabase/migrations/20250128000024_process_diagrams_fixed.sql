-- Fix process_diagrams table schema to match ProcessMapper expectations
-- Drop existing table and recreate with correct schema

DROP TABLE IF EXISTS public.process_diagrams CASCADE;

CREATE TABLE public.process_diagrams (
    id TEXT PRIMARY KEY, -- Use TEXT for UUID strings
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, -- Add user_id for proper isolation
    project_id TEXT NOT NULL, -- Add project_id column
    name TEXT,
    xml TEXT NOT NULL, -- Rename from xml_content
    svg TEXT, -- Rename from svg_content
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_process_diagrams_user_id ON public.process_diagrams(user_id);
CREATE INDEX idx_process_diagrams_project_id ON public.process_diagrams(project_id);
CREATE INDEX idx_process_diagrams_updated_at ON public.process_diagrams(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE public.process_diagrams ENABLE ROW LEVEL SECURITY;

-- Create RLS policies with proper user isolation
CREATE POLICY "Users can view their own diagrams" ON public.process_diagrams
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own diagrams" ON public.process_diagrams
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own diagrams" ON public.process_diagrams
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own diagrams" ON public.process_diagrams
    FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_process_diagrams_updated_at 
    BEFORE UPDATE ON public.process_diagrams 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
