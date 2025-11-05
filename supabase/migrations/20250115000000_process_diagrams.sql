/*
  # Process Diagrams Table

  1. New Table
    - `process_diagrams` - Store user's BPMN process diagrams
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text, diagram name)
      - `xml_content` (text, BPMN XML content)
      - `svg_content` (text, SVG representation for preview)
      - `thumbnail` (text, base64 thumbnail image)
      - `created_at` (timestamptz, creation time)
      - `updated_at` (timestamptz, last update time)

  2. Security
    - Enable RLS on process_diagrams table
    - Add policies for authenticated users to manage their own diagrams

  3. Indexes
    - Add performance indexes for common queries
*/

-- Create process_diagrams table
CREATE TABLE IF NOT EXISTS public.process_diagrams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  xml_content text NOT NULL,
  svg_content text,
  thumbnail text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.process_diagrams ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for process_diagrams
CREATE POLICY "Users can manage their own process diagrams"
  ON public.process_diagrams
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_process_diagrams_user_id ON public.process_diagrams(user_id);
CREATE INDEX IF NOT EXISTS idx_process_diagrams_created_at ON public.process_diagrams(created_at);
CREATE INDEX IF NOT EXISTS idx_process_diagrams_updated_at ON public.process_diagrams(updated_at);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER set_updated_at_process_diagrams
  BEFORE UPDATE ON public.process_diagrams
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();



























