import { AnalysisResult, ConfiguredSlide, PainPointConfig, ToneConfig } from './types';

export interface SavedProject {
  id: string;
  user_id: string;
  name: string;
  images: string[]; // base64 encoded images
  slides: ConfiguredSlide[];
  analysis: AnalysisResult;
  brand: string;
  pain_point: PainPointConfig;
  tone: ToneConfig;
  variation_count: number;
  created_at: string;
  updated_at: string;
}

export interface SavedPrompt {
  id: string;
  user_id: string;
  project_id: string | null;
  project_name: string;
  prompt_text: string;
  created_at: string;
}

export interface CreateProjectData {
  name: string;
  images: string[];
  slides: ConfiguredSlide[];
  analysis: AnalysisResult;
  brand: string;
  pain_point: PainPointConfig;
  tone: ToneConfig;
  variation_count: number;
}

export interface CreatePromptData {
  project_id: string | null;
  project_name: string;
  prompt_text: string;
}
