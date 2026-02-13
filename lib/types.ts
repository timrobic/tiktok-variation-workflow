// Slide data from Step 1 extraction
export interface SlideData {
  slide_number: number;
  extracted_text: string;
  role: 'HOOK' | 'TIP' | 'APP_MENTION' | 'EMOTIONAL_CLOSE' | 'OTHER';
  contains_brand_mention: boolean;
  brand_mentioned: string | null;
}

// Analysis result from Step 2
export interface FormatAnalysis {
  hook_type: string;
  emotional_arc: string;
  target_pain_point: string;
  conversion_strategy: string;
}

export interface ToneAnalysis {
  description: string;
  key_markers: string[];
}

export interface SlideAnalysis {
  slide_number: number;
  role: string;
  what_makes_it_work: string;
  risk_if_varied: 'LOW' | 'MEDIUM' | 'HIGH';
  variation_approaches: string;
}

export interface AnalysisResult {
  format_analysis: FormatAnalysis;
  tone_analysis: ToneAnalysis;
  slide_analysis: SlideAnalysis[];
  pain_point_alternatives: string[];
}

// User configuration for each slide
export type SlideDecision = 'KEEP' | 'VARY' | 'VARY_WITH_PAIN_POINT';

export interface ConfiguredSlide extends SlideData {
  decision: SlideDecision;
  analysis?: SlideAnalysis;
}

// Pain point configuration
export interface PainPointConfig {
  original: string;
  selected: string;
  isCustom: boolean;
}

// Tone configuration
export interface ToneConfig {
  type: 'matched' | 'custom';
  detectedDescription: string;
  customInput?: string;
}

// Main workflow state
export interface WorkflowState {
  step: 1 | 2 | 3;
  images: string[]; // base64 encoded images
  slides: ConfiguredSlide[];
  analysis: AnalysisResult | null;
  painPoint: PainPointConfig;
  tone: ToneConfig;
  brand: string;
  variationCount: number;
  compiledPrompt: string | null;
  isLoading: boolean;
  error: string | null;
}

// API request/response types
export interface ExtractRequest {
  images: string[]; // base64 encoded
}

export interface ExtractResponse {
  slides: SlideData[];
}

export interface AnalyzeRequest {
  slides: SlideData[];
}

export interface AnalyzeResponse {
  analysis: AnalysisResult;
}

export interface CompileRequest {
  slides: ConfiguredSlide[];
  originalPainPoint: string;
  newPainPoint: string;
  brand: string;
  tone: {
    type: 'matched' | 'custom';
    description: string;
  };
  variationCount: number;
}

export interface CompileResponse {
  prompt: string;
}
