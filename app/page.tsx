'use client';

import { useState, useCallback } from 'react';
import SlideUploader from '@/components/SlideUploader';
import SlideCard from '@/components/SlideCard';
import PainPointSelector from '@/components/PainPointSelector';
import ToneSelector from '@/components/ToneSelector';
import VariationCount from '@/components/VariationCount';
import PromptOutput from '@/components/PromptOutput';
import UserMenu from '@/components/UserMenu';
import AuthModal from '@/components/AuthModal';
import LoadProjectButton from '@/components/LoadProjectButton';
import SaveProjectButton from '@/components/SaveProjectButton';
import SavedPromptsList from '@/components/SavedPromptsList';
import CodeGate from '@/components/CodeGate';
import { savePrompt } from '@/lib/database';
import { SavedProject } from '@/lib/storage-types';
import {
  WorkflowState,
  SlideData,
  AnalysisResult,
  ConfiguredSlide,
  SlideDecision,
  PainPointConfig,
  ToneConfig,
} from '@/lib/types';

const initialState: WorkflowState = {
  step: 1,
  images: [],
  slides: [],
  analysis: null,
  painPoint: {
    original: '',
    selected: '',
    isCustom: false,
  },
  tone: {
    type: 'matched',
    detectedDescription: '',
    customInput: '',
  },
  brand: '',
  variationCount: 3,
  compiledPrompt: null,
  isLoading: false,
  error: null,
};

export default function Home() {
  const [state, setState] = useState<WorkflowState>(initialState);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPromptsModal, setShowPromptsModal] = useState(false);
  const [currentProjectName, setCurrentProjectName] = useState('');

  // Step 1: Extract slides from images
  const handleExtract = useCallback(async () => {
    if (state.images.length === 0) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: state.images }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to extract slides');
      }

      const { slides } = await response.json();

      // Now analyze the slides
      const analyzeResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slides }),
      });

      if (!analyzeResponse.ok) {
        const error = await analyzeResponse.json();
        throw new Error(error.error || 'Failed to analyze slides');
      }

      const { analysis }: { analysis: AnalysisResult } = await analyzeResponse.json();

      // Detect brand from slides
      const brandSlide = slides.find((s: SlideData) => s.contains_brand_mention);
      const detectedBrand = brandSlide?.brand_mentioned || '';

      // Configure slides with default decisions based on analysis
      const configuredSlides: ConfiguredSlide[] = slides.map((slide: SlideData) => {
        const slideAnalysis = analysis.slide_analysis.find(
          (a) => a.slide_number === slide.slide_number
        );
        // Default: KEEP for APP_MENTION (high risk), VARY for others
        const defaultDecision: SlideDecision =
          slide.role === 'APP_MENTION' || slideAnalysis?.risk_if_varied === 'HIGH'
            ? 'KEEP'
            : 'VARY';

        return {
          ...slide,
          decision: defaultDecision,
          analysis: slideAnalysis,
        };
      });

      setState((prev) => ({
        ...prev,
        step: 2,
        slides: configuredSlides,
        analysis,
        brand: detectedBrand,
        painPoint: {
          original: analysis.format_analysis.target_pain_point,
          selected: analysis.format_analysis.target_pain_point,
          isCustom: false,
        },
        tone: {
          type: 'matched',
          detectedDescription: analysis.tone_analysis.description,
          customInput: '',
        },
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
    }
  }, [state.images]);

  // Step 3: Compile prompt
  const handleCompile = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const toneDescription =
        state.tone.type === 'matched'
          ? state.tone.detectedDescription
          : state.tone.customInput || state.tone.detectedDescription;

      const response = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slides: state.slides,
          originalPainPoint: state.painPoint.original,
          newPainPoint: state.painPoint.selected,
          brand: state.brand,
          tone: {
            type: state.tone.type,
            description: toneDescription,
          },
          variationCount: state.variationCount,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to compile prompt');
      }

      const { prompt } = await response.json();

      setState((prev) => ({
        ...prev,
        step: 3,
        compiledPrompt: prompt,
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
    }
  }, [state.slides, state.painPoint, state.brand, state.tone, state.variationCount]);

  // Update handlers
  const handleImagesChange = useCallback((images: string[]) => {
    setState((prev) => ({ ...prev, images }));
  }, []);

  const handleSlideDecisionChange = useCallback(
    (slideNumber: number, decision: SlideDecision) => {
      setState((prev) => ({
        ...prev,
        slides: prev.slides.map((slide) =>
          slide.slide_number === slideNumber ? { ...slide, decision } : slide
        ),
      }));
    },
    []
  );

  const handlePainPointChange = useCallback((painPoint: PainPointConfig) => {
    setState((prev) => ({ ...prev, painPoint }));
  }, []);

  const handleToneChange = useCallback((tone: ToneConfig) => {
    setState((prev) => ({ ...prev, tone }));
  }, []);

  const handleVariationCountChange = useCallback((variationCount: number) => {
    setState((prev) => ({ ...prev, variationCount }));
  }, []);

  const handleBrandChange = useCallback((brand: string) => {
    setState((prev) => ({ ...prev, brand }));
  }, []);

  const handleReset = useCallback(() => {
    setState(initialState);
  }, []);

  const handleBackToConfig = useCallback(() => {
    setState((prev) => ({ ...prev, step: 2, compiledPrompt: null }));
  }, []);

  const handleLoadProject = useCallback((project: SavedProject) => {
    setCurrentProjectName(project.name);
    setState((prev) => ({
      ...prev,
      step: 2,
      images: project.images,
      slides: project.slides,
      analysis: project.analysis,
      brand: project.brand,
      painPoint: project.pain_point,
      tone: project.tone,
      variationCount: project.variation_count,
    }));
  }, []);

  const handleSavePrompt = useCallback(async (promptText: string) => {
    const projectName = currentProjectName || `Prompt ${new Date().toLocaleDateString()}`;
    await savePrompt({
      project_id: null,
      project_name: projectName,
      prompt_text: promptText,
    });
  }, [currentProjectName]);

  return (
    <CodeGate>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              TikTok Content Variation Workflow
            </h1>
            <p className="text-gray-600 mt-1">
              Transform your TikTok slideshow content into production-ready copy variations
            </p>
          </div>
          <UserMenu onAuthClick={() => setShowAuthModal(true)} />
        </div>
      </header>

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
      />
      <SavedPromptsList
        isOpen={showPromptsModal}
        onClose={() => setShowPromptsModal(false)}
      />

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Upload Slides' },
              { num: 2, label: 'Configure' },
              { num: 3, label: 'Generate Prompt' },
            ].map((step, index) => (
              <div key={step.num} className="flex items-center">
                <div
                  className={`
                    flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                    ${state.step >= step.num
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'}
                  `}
                >
                  {step.num}
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${
                    state.step >= step.num ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </span>
                {index < 2 && (
                  <div
                    className={`w-24 h-0.5 mx-4 ${
                      state.step > step.num ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Error Display */}
        {state.error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{state.error}</p>
            <button
              onClick={() => setState((prev) => ({ ...prev, error: null }))}
              className="mt-2 text-sm text-red-600 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Step 1: Upload */}
        {state.step === 1 && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Step 1: Upload Your Slides
              </h2>
              <p className="text-gray-600 mb-6">
                Upload 3-10 slide images from your TikTok slideshow. We&apos;ll extract the text
                and analyze the content structure.
              </p>
              <SlideUploader
                images={state.images}
                onImagesChange={handleImagesChange}
                disabled={state.isLoading}
              />
            </div>

            <div className="flex justify-between">
              <LoadProjectButton onLoad={handleLoadProject} />
              <button
                onClick={handleExtract}
                disabled={state.images.length === 0 || state.isLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {state.isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  <>
                    Extract & Analyze
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Configure */}
        {state.step === 2 && (
          <div className="space-y-6">
            {/* Slide Cards */}
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Step 2: Configure Your Variations
                  </h2>
                </div>
                {state.analysis && (
                  <SaveProjectButton
                    data={{
                      images: state.images,
                      slides: state.slides,
                      analysis: state.analysis,
                      brand: state.brand,
                      pain_point: state.painPoint,
                      tone: state.tone,
                      variation_count: state.variationCount,
                    }}
                    onSaved={() => {}}
                  />
                )}
              </div>
              <p className="text-gray-600">
                Choose which slides to keep fixed and which to vary. Slides marked as high risk
                are defaulted to &quot;Keep Fixed&quot;.
              </p>

              {state.slides.map((slide) => (
                <SlideCard
                  key={slide.slide_number}
                  slide={slide}
                  analysis={slide.analysis}
                  onDecisionChange={(decision) =>
                    handleSlideDecisionChange(slide.slide_number, decision)
                  }
                  disabled={state.isLoading}
                />
              ))}
            </div>

            {/* Configuration Options */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Pain Point Selector */}
              {state.analysis && (
                <PainPointSelector
                  config={state.painPoint}
                  alternatives={state.analysis.pain_point_alternatives}
                  onChange={handlePainPointChange}
                  disabled={state.isLoading}
                />
              )}

              {/* Tone Selector */}
              <ToneSelector
                config={state.tone}
                onChange={handleToneChange}
                disabled={state.isLoading}
              />
            </div>

            {/* Brand Input */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-3">Brand Name</h3>
              <input
                type="text"
                value={state.brand}
                onChange={(e) => handleBrandChange(e.target.value)}
                placeholder="Enter brand name..."
                disabled={state.isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {state.brand && (
                <p className="text-xs text-gray-500 mt-2">
                  Detected from slides: {state.brand}
                </p>
              )}
            </div>

            {/* Variation Count */}
            <VariationCount
              count={state.variationCount}
              onChange={handleVariationCountChange}
              disabled={state.isLoading}
            />

            {/* Actions */}
            <div className="flex justify-between">
              <button
                onClick={handleReset}
                disabled={state.isLoading}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Start Over
              </button>
              <button
                onClick={handleCompile}
                disabled={state.isLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {state.isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Compiling...
                  </>
                ) : (
                  <>
                    Generate Prompt
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Output */}
        {state.step === 3 && state.compiledPrompt && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Step 3: Your Compiled Prompt
                </h2>
                <p className="text-gray-600">
                  Copy this prompt and use it with Claude or any AI assistant to generate your
                  content variations.
                </p>
              </div>
              <button
                onClick={() => setShowPromptsModal(true)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                View Saved Prompts
              </button>
            </div>

            <PromptOutput
              prompt={state.compiledPrompt}
              onSave={handleSavePrompt}
            />

            {/* Actions */}
            <div className="flex justify-between">
              <button
                onClick={handleBackToConfig}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                ← Back to Configuration
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900"
              >
                Start New Project
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-auto">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-500">
            TikTok Content Variation Workflow • Powered by Claude API
          </p>
        </div>
      </footer>
    </div>
    </CodeGate>
  );
}
