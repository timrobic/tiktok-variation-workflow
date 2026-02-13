'use client';

import { ToneConfig } from '@/lib/types';

interface ToneSelectorProps {
  config: ToneConfig;
  onChange: (config: ToneConfig) => void;
  disabled?: boolean;
}

export default function ToneSelector({ config, onChange, disabled }: ToneSelectorProps) {
  const handleTypeChange = (type: 'matched' | 'custom') => {
    onChange({
      ...config,
      type,
    });
  };

  const handleCustomInputChange = (customInput: string) => {
    onChange({
      ...config,
      customInput,
    });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
      <h3 className="font-semibold text-gray-800 mb-3">Tone</h3>
      
      {/* Detected Tone */}
      <div className="mb-4">
        <span className="text-xs font-medium text-gray-500">Detected:</span>
        <p className="text-sm text-gray-700 mt-1 italic">&ldquo;{config.detectedDescription}&rdquo;</p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {/* Match Original */}
        <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
          <input
            type="radio"
            name="tone"
            checked={config.type === 'matched'}
            onChange={() => handleTypeChange('matched')}
            disabled={disabled}
            className="mt-0.5 text-blue-600"
          />
          <div>
            <span className="text-sm font-medium text-gray-800">Match original slideshow</span>
            <p className="text-xs text-gray-500 mt-0.5">Use the detected tone from analysis</p>
          </div>
        </label>

        {/* Custom Tone */}
        <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
          <input
            type="radio"
            name="tone"
            checked={config.type === 'custom'}
            onChange={() => handleTypeChange('custom')}
            disabled={disabled}
            className="mt-0.5 text-blue-600"
          />
          <div className="flex-1">
            <span className="text-sm font-medium text-gray-800">Custom tone</span>
            <p className="text-xs text-gray-500 mt-0.5 mb-2">Define your own tone for variations</p>
            {config.type === 'custom' && (
              <textarea
                value={config.customInput || ''}
                onChange={(e) => handleCustomInputChange(e.target.value)}
                placeholder="e.g., Direct, no-fluff, expert mom who's been through it"
                disabled={disabled}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            )}
          </div>
        </label>
      </div>
    </div>
  );
}
