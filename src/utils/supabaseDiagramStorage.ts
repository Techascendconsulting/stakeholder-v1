import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export type DiagramRecord = {
  id: string;
  userId: string;
  projectId: string;
  name?: string;
  xml: string;
  svg?: string;
  updatedAt?: string;
};

export type DiagramStorage = {
  load: (projectId: string, diagramId: string) => Promise<DiagramRecord | null>;
  save: (rec: DiagramRecord) => Promise<void>;
};

export const supabaseDiagramStorage: DiagramStorage = {
  async load(projectId, diagramId) {
    try {
      const { data, error } = await supabase
        .from('process_diagrams')
        .select('*')
        .eq('id', diagramId)
        .eq('project_id', projectId)
        .maybeSingle();

      if (error) {
        // If table doesn't exist, return null (will create new diagram)
        if (error.code === '42P01') { // undefined_table
          console.warn('process_diagrams table does not exist yet. Please run the SQL setup script.');
          return null;
        }
        throw error;
      }
      
      if (data) {
        // Map the database fields to our expected format
        return {
          id: data.id,
          userId: data.user_id,
          projectId: data.project_id,
          name: data.name,
          xml: data.xml,
          svg: data.svg,
          updatedAt: data.updated_at
        };
      }
      
      return null;
    } catch (error: any) {
      // If table doesn't exist, return null (will create new diagram)
      if (error.code === '42P01') { // undefined_table
        console.warn('process_diagrams table does not exist yet. Please run the SQL setup script.');
        return null;
      }
      console.error('Failed to load diagram:', error);
      return null;
    }
  },

  async save(rec) {
    try {
      console.log('💾 supabaseDiagramStorage: Saving diagram:', rec.id, 'for project:', rec.projectId);
      
      const { error } = await supabase
        .from('process_diagrams')
        .upsert({
          id: rec.id,
          user_id: rec.userId,
          project_id: rec.projectId,
          name: rec.name || 'Untitled Diagram',
          xml: rec.xml,
          svg: rec.svg || null,
          updated_at: rec.updatedAt || new Date().toISOString(),
        });

      if (error) {
        console.error('💾 supabaseDiagramStorage: Save error:', error);
        // If table doesn't exist, log warning but don't crash
        if (error.code === '42P01') { // undefined_table
          console.warn('process_diagrams table does not exist yet. Diagram changes will not be saved. Please run the SQL setup script.');
          return;
        }
        throw error;
      }
      
      console.log('✅ supabaseDiagramStorage: Diagram saved successfully:', rec.id);
    } catch (error: any) {
      console.error('💾 supabaseDiagramStorage: Save exception:', error);
      // If table doesn't exist, log warning but don't crash
      if (error.code === '42P01') { // undefined_table
        console.warn('process_diagrams table does not exist yet. Diagram changes will not be saved. Please run the SQL setup script.');
        return;
      }
      console.error('Failed to save diagram:', error);
      throw error;
    }
  }
};
