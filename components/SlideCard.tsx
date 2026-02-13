'use client';

import { ConfiguredSlide, SlideDecision, SlideAnalysis } from '@/lib/types';

interface SlideCardProps {
  slide: ConfiguredSlide;
  analysis?: SlideAnalysis;
  onDecisionChange: (decision: SlideDecision) => void;
  disabled?: boolean;
}

const roleColors: Record<string, string> = {
  HOOK: 'bg-purple-100 text-purple-800',
  TIP: 'bg-blue-100 text-blue-800',
  APP_MENTION: 'bg-green-100 text-green-800',
  EMOTIONAL_CLOSE: 'bg-pink-100 text-pink-800',
  OTHER: 'bg-gray-100 text-gray-800',
};

const riskColors: Record<string, string> = {
  LOW: 'text-green-600',
  MEDIUM: 'text-yellow-600',
  HIGH: 'text-red-600',
};

export default function SlideCard({ slide, analysis, onDecisionChange, disabled }: SlideCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700">Slide {slide.slide_number}</span>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${roleColors[slide.role] || roleColors.OTHER}`}>
            {slide.role.replace('_', ' ')}
          </span>
          {slide.contains_brand_mention && (
            <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 font-medium">
              Brand: {slide.brand_mentioned}
            </span>
          )}
        </div>
        {analysis && (
          <span className={`text-xs font-medium ${riskColors[analysis.risk_if_varied]}`}>
            Risk: {analysis.risk_if_varied}
          </span>
        )}
      </div>

      {/* Extracted Text */}
      <div className="bg-gray-50 rounded p-3 mb-4">
        <p className="text-sm text-gray-700 italic">&ldquo;{slide.extracted_text}&rdquo;</p>
      </div>

      {/* Analysis (if available) */}
      {analysis && (
        <div className="mb-4 space-y-2">
          <div>
            <span className="text-xs font-medium text-gray-500">What makes it work:</span>
            <p className="text-sm text-gray-700">{analysis.what_makes_it_work}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-gray-500">Variation approach:</span>
            <p className="text-sm text-gray-700">{analysis.variation_approaches}</p>
          </div>
        </div>
      )}

      {/* Decision Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => onDecisionChange('KEEP')}
          disabled={disabled}
          className={`
            flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors
            ${slide.decision === 'KEEP'
              ? 'bg-gray-800 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          Keep Fixed
        </button>
        <button
          onClick={() => onDecisionChange('VARY')}
          disabled={disabled}
          className={`
            flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors
            ${slide.decision === 'VARY'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          Vary
        </button>
        <button
          onClick={() => onDecisionChange('VARY_WITH_PAIN_POINT')}
          disabled={disabled}
          className={`
            flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors
            ${slide.decision === 'VARY_WITH_PAIN_POINT'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          Vary + Pain Point
        </button>
      </div>
    </div>
  );
}
