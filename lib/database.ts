import { createClient } from './supabase';
import { SavedProject, SavedPrompt, CreateProjectData, CreatePromptData } from './storage-types';

// Projects
export async function saveProject(data: CreateProjectData): Promise<SavedProject | null> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      ...data,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving project:', error);
    throw error;
  }

  return project;
}

export async function getProjects(): Promise<SavedProject[]> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }

  return projects || [];
}

export async function getProject(id: string): Promise<SavedProject | null> {
  const supabase = createClient();
  
  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching project:', error);
    return null;
  }

  return project;
}

export async function updateProject(id: string, data: Partial<CreateProjectData>): Promise<SavedProject | null> {
  const supabase = createClient();
  
  const { data: project, error } = await supabase
    .from('projects')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating project:', error);
    throw error;
  }

  return project;
}

export async function deleteProject(id: string): Promise<boolean> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting project:', error);
    return false;
  }

  return true;
}

// Prompts
export async function savePrompt(data: CreatePromptData): Promise<SavedPrompt | null> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: prompt, error } = await supabase
    .from('prompts')
    .insert({
      user_id: user.id,
      ...data,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving prompt:', error);
    throw error;
  }

  return prompt;
}

export async function getPrompts(): Promise<SavedPrompt[]> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: prompts, error } = await supabase
    .from('prompts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching prompts:', error);
    return [];
  }

  return prompts || [];
}

export async function deletePrompt(id: string): Promise<boolean> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('prompts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting prompt:', error);
    return false;
  }

  return true;
}
