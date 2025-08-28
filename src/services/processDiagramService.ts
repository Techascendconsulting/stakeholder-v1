import { supabase } from '../lib/supabase';

export interface ProcessDiagram {
  id: string;
  name: string;
  xml_content: string;
  svg_content?: string;
  thumbnail?: string;
  created_at: string;
  updated_at: string;
}

export interface ProcessDiagramInput {
  name: string;
  xml_content: string;
  svg_content?: string;
  thumbnail?: string;
}

class ProcessDiagramService {
  private static instance: ProcessDiagramService;
  private databaseAvailable: boolean = true;
  private databaseChecked: boolean = false;

  private constructor() {}

  public static getInstance(): ProcessDiagramService {
    if (!ProcessDiagramService.instance) {
      ProcessDiagramService.instance = new ProcessDiagramService();
    }
    return ProcessDiagramService.instance;
  }

  private setDatabaseUnavailable() {
    this.databaseAvailable = false;
    this.databaseChecked = true;
    console.log('Database disabled for this session - using localStorage only');
  }

  // Get all diagrams for the current user
  async getUserDiagrams(): Promise<ProcessDiagram[]> {
    if (!this.databaseAvailable && this.databaseChecked) {
      console.log('📋 Using localStorage fallback for getUserDiagrams');
      return this.getFromLocalStorage();
    }

    try {
      const { data, error } = await supabase
        .from('process_diagrams')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        // Only log the error once, not repeatedly
        if (error.code === '42P01') {
          console.log('Database table not found - using localStorage fallback');
          this.setDatabaseUnavailable();
          return this.getFromLocalStorage();
        } else {
          console.error('Error fetching user diagrams:', error);
        }
        throw error;
      }

      return data || [];
    } catch (error) {
      // Don't log the same error repeatedly
      if (error && typeof error === 'object' && 'code' in error && error.code !== '42P01') {
        console.error('Error in getUserDiagrams:', error);
      }
      console.log('📋 Falling back to localStorage');
      return this.getFromLocalStorage();
    }
  }

  // LocalStorage fallback for getUserDiagrams
  private getFromLocalStorage(): ProcessDiagram[] {
    try {
      const key = 'process_diagrams';
      const stored = localStorage.getItem(key);
      if (!stored) {
        console.log('📋 localStorage: No diagrams found');
        return [];
      }

      const diagrams = JSON.parse(stored);
      console.log('📋 localStorage: Found', diagrams.length, 'diagrams');
      return diagrams;
    } catch (error) {
      console.error('📋 localStorage: Error getting diagrams:', error);
      return [];
    }
  }

  // Save a new diagram
  async saveDiagram(diagram: ProcessDiagramInput): Promise<ProcessDiagram | null> {
    if (!this.databaseAvailable && this.databaseChecked) {
      console.log('💾 Using localStorage fallback for saveDiagram');
      return this.saveToLocalStorage(diagram);
    }

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No authenticated user - using localStorage fallback');
        this.setDatabaseUnavailable();
        return this.saveToLocalStorage(diagram);
      }

      const { data, error } = await supabase
        .from('process_diagrams')
        .insert([{ ...diagram, user_id: user.id }])
        .select()
        .single();

      if (error) {
        // Only log the error once, not repeatedly
        if (error.code === '42P01') {
          console.log('Database table not found - using localStorage fallback');
          this.setDatabaseUnavailable();
          return this.saveToLocalStorage(diagram);
        } else if (error.code === '42501') {
          console.log('RLS policy violation - using localStorage fallback');
          this.setDatabaseUnavailable();
          return this.saveToLocalStorage(diagram);
        } else {
          console.error('Error saving diagram:', error);
        }
        throw error;
      }

      return data;
    } catch (error) {
      // Don't log the same error repeatedly
      if (error && typeof error === 'object' && 'code' in error && error.code !== '42P01' && error.code !== '42501') {
        console.error('Error in saveDiagram:', error);
      }
      console.log('💾 Falling back to localStorage');
      return this.saveToLocalStorage(diagram);
    }
  }

  // LocalStorage fallback for saveDiagram
  private saveToLocalStorage(diagram: ProcessDiagramInput): ProcessDiagram | null {
    try {
      const key = 'process_diagrams';
      const stored = localStorage.getItem(key);
      const diagrams = stored ? JSON.parse(stored) : [];
      
      const newDiagram: ProcessDiagram = {
        id: crypto.randomUUID(),
        ...diagram,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      diagrams.push(newDiagram);
      localStorage.setItem(key, JSON.stringify(diagrams));
      
      console.log('💾 localStorage: Diagram saved successfully');
      return newDiagram;
    } catch (error) {
      console.error('💾 localStorage: Error saving diagram:', error);
      return null;
    }
  }

  // Update an existing diagram
  async updateDiagram(id: string, updates: Partial<ProcessDiagramInput>): Promise<ProcessDiagram | null> {
    console.log('✏️ Service: updateDiagram called with id:', id);
    console.log('✏️ Service: updates:', updates);
    console.log('✏️ Service: databaseAvailable:', this.databaseAvailable, 'databaseChecked:', this.databaseChecked);
    
    if (!this.databaseAvailable && this.databaseChecked) {
      console.log('✏️ Using localStorage fallback for updateDiagram');
      return this.updateInLocalStorage(id, updates);
    }

    try {
      const { data, error } = await supabase
        .from('process_diagrams')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === '42P01') {
          console.log('Database table not found - using localStorage fallback');
          this.setDatabaseUnavailable();
          return this.updateInLocalStorage(id, updates);
        } else if (error.code === '42501') {
          console.log('RLS policy violation - using localStorage fallback');
          this.setDatabaseUnavailable();
          return this.updateInLocalStorage(id, updates);
        } else {
          console.error('Error updating diagram:', error);
        }
        throw error;
      }

      return data;
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code !== '42P01' && error.code !== '42501') {
        console.error('Error in updateDiagram:', error);
      }
      console.log('✏️ Falling back to localStorage');
      return this.updateInLocalStorage(id, updates);
    }
  }

  // LocalStorage fallback for updateDiagram
  private updateInLocalStorage(id: string, updates: Partial<ProcessDiagramInput>): ProcessDiagram | null {
    try {
      const key = 'process_diagrams';
      const stored = localStorage.getItem(key);
      if (!stored) {
        console.log('✏️ localStorage: No diagrams found');
        return null;
      }

      const diagrams = JSON.parse(stored);
      const index = diagrams.findIndex((d: any) => d.id === id);
      
      if (index === -1) {
        console.log('✏️ localStorage: Diagram not found');
        return null;
      }

      diagrams[index] = {
        ...diagrams[index],
        ...updates,
        updated_at: new Date().toISOString()
      };

      localStorage.setItem(key, JSON.stringify(diagrams));
      console.log('✏️ localStorage: Diagram updated successfully');
      return diagrams[index];
    } catch (error) {
      console.error('✏️ localStorage: Error updating diagram:', error);
      return null;
    }
  }

  // Delete a diagram
  async deleteDiagram(id: string): Promise<boolean> {
    console.log('🗑️ Service: deleteDiagram called with id:', id);
    console.log('🗑️ Service: databaseAvailable:', this.databaseAvailable, 'databaseChecked:', this.databaseChecked);
    
    if (!this.databaseAvailable && this.databaseChecked) {
      console.log('🗑️ Service: Using localStorage fallback for delete');
      return this.deleteFromLocalStorage(id);
    }

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('🗑️ Service: No authenticated user - using localStorage fallback');
        this.setDatabaseUnavailable();
        return this.deleteFromLocalStorage(id);
      }

      console.log('🗑️ Service: Attempting database delete...');
      const { error } = await supabase
        .from('process_diagrams')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Only delete user's own diagrams

      if (error) {
        console.log('🗑️ Service: Database error:', error);
        if (error.code === '42P01') {
          console.log('Database table not found - using localStorage fallback');
          this.setDatabaseUnavailable();
          return this.deleteFromLocalStorage(id);
        } else if (error.code === '42501') {
          console.log('RLS policy violation - using localStorage fallback');
          this.setDatabaseUnavailable();
          return this.deleteFromLocalStorage(id);
        } else {
          console.error('Error deleting diagram:', error);
        }
        throw error;
      }

      console.log('🗑️ Service: Delete successful');
      return true;
    } catch (error) {
      console.log('🗑️ Service: Caught error:', error);
      if (error && typeof error === 'object' && 'code' in error && error.code !== '42P01' && error.code !== '42501') {
        console.error('Error in deleteDiagram:', error);
      }
      // Fallback to localStorage on any error
      console.log('🗑️ Service: Falling back to localStorage');
      return this.deleteFromLocalStorage(id);
    }
  }

  // LocalStorage fallback for delete
  private deleteFromLocalStorage(id: string): boolean {
    try {
      const key = 'process_diagrams';
      const stored = localStorage.getItem(key);
      if (!stored) {
        console.log('🗑️ localStorage: No diagrams found');
        return false;
      }

      const diagrams = JSON.parse(stored);
      const filtered = diagrams.filter((d: any) => d.id !== id);
      
      if (filtered.length === diagrams.length) {
        console.log('🗑️ localStorage: Diagram not found');
        return false;
      }

      localStorage.setItem(key, JSON.stringify(filtered));
      console.log('🗑️ localStorage: Diagram deleted successfully');
      return true;
    } catch (error) {
      console.error('🗑️ localStorage: Error deleting diagram:', error);
      return false;
    }
  }

  // Get a single diagram by ID
  async getDiagram(id: string): Promise<ProcessDiagram | null> {
    try {
      const { data, error } = await supabase
        .from('process_diagrams')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching diagram:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getDiagram:', error);
      return null;
    }
  }

  // Generate thumbnail from SVG
  async generateThumbnail(svgContent: string): Promise<string | null> {
    try {
      // Create a canvas to render the SVG
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // Create an image from SVG
      const img = document.createElement('img') as HTMLImageElement;
      const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      return new Promise((resolve) => {
        img.onload = () => {
          try {
            // Set canvas size for thumbnail (smaller size)
            const maxSize = 200;
            const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;

            // Draw image on canvas
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Convert to base64
            const thumbnail = canvas.toDataURL('image/png', 0.8);
            resolve(thumbnail);
          } catch (error) {
            console.error('Error generating thumbnail:', error);
            resolve(null);
          } finally {
            URL.revokeObjectURL(url);
          }
        };

        img.onerror = () => {
          URL.revokeObjectURL(url);
          resolve(null);
        };

        img.src = url;
      });
    } catch (error) {
      console.error('Error in generateThumbnail:', error);
      return null;
    }
  }
}

export const processDiagramService = ProcessDiagramService.getInstance();
