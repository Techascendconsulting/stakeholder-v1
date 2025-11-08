-- Run this SQL in your Supabase SQL Editor to set up the process_diagrams table

-- Drop existing table if it exists
DROP TABLE IF EXISTS public.process_diagrams CASCADE;

-- Create the process_diagrams table with correct schema
CREATE TABLE public.process_diagrams (
    id TEXT PRIMARY KEY, -- Use TEXT for UUID strings
    project_id TEXT NOT NULL, -- Add project_id column
    name TEXT,
    xml TEXT NOT NULL, -- BPMN XML content
    svg TEXT, -- SVG export
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_process_diagrams_project_id ON public.process_diagrams(project_id);
CREATE INDEX idx_process_diagrams_updated_at ON public.process_diagrams(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE public.process_diagrams ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all authenticated users for now)
CREATE POLICY "Users can view all diagrams" ON public.process_diagrams
    FOR SELECT USING (true);

CREATE POLICY "Users can insert diagrams" ON public.process_diagrams
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update diagrams" ON public.process_diagrams
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete diagrams" ON public.process_diagrams
    FOR DELETE USING (true);

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

-- Insert a sample diagram for testing
INSERT INTO public.process_diagrams (id, project_id, name, xml, updated_at) VALUES (
    'sample-diagram-1',
    'proj-5', -- Use your actual project ID
    'Sample Process Map',
    '<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1"/>
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="180" y="160" width="36" height="36"/>
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>',
    NOW()
);























