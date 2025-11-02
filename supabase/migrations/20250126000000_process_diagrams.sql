-- Create process_diagrams table for storing BPMN diagrams
CREATE TABLE IF NOT EXISTS public.process_diagrams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Untitled Diagram',
    xml_content TEXT NOT NULL,
    svg_content TEXT,
    thumbnail TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_process_diagrams_user_id ON public.process_diagrams(user_id);
CREATE INDEX IF NOT EXISTS idx_process_diagrams_updated_at ON public.process_diagrams(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE public.process_diagrams ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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





















