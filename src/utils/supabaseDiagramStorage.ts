import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

// Table suggestion:
// create table process_diagrams (
//   id text primary key,
//   project_id text not null,
//   name text,
//   xml text not null,
//   svg text,
//   updated_at timestamptz default now()
// );
// create index on process_diagrams(project_id);

export type DiagramRecord = {
  id: string;
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
  async load(_projectId, diagramId) {
    // Be tolerant of schema differences: just load by id
    const { data, error } = await supabase
      .from('process_diagrams')
      .select('*')
      .eq('id', diagramId)
      .maybeSingle();

    if (error) throw error;
    return data as any;
  },

  async save(rec) {
    // Try with project_id first
    let { error } = await supabase
      .from('process_diagrams')
      .upsert({
        id: rec.id,
        project_id: rec.projectId,
        name: rec.name ?? null,
        xml: rec.xml,
        svg: rec.svg ?? null,
        updated_at: rec.updatedAt ?? new Date().toISOString(),
      });

    if (error) {
      // Fallback: use projectId column if schema differs
      const resp = await supabase
        .from('process_diagrams')
        .upsert({
          id: rec.id,
          projectId: rec.projectId,
          name: rec.name ?? null,
          xml: rec.xml,
          svg: rec.svg ?? null,
          updated_at: rec.updatedAt ?? new Date().toISOString(),
        });
      if (resp.error) throw resp.error;
      return;
    }
  }
};
