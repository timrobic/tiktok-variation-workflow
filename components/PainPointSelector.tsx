'use client';

import { useState } from 'react';
import { PainPointConfig } from '@/lib/types';

interface PainPointSelectorProps {
  config: PainPointConfig;
  alternatives: string[];
  onChange: (config: PainPointConfig) => void;
  disabled?: boolean;
}

export default function PainPointSelector({ config, alternatives, onChange, disabled }: PainPointSelectorProps) {
  const [customInput, setCustomInput] = useState('');

  const handleSelect = (value: string, isCustom: boolean = false) => {
    onChange({
      ...config,
      selected: value,
      isCustom,
    });
  };

  const handleCustomSubmit = () => {
    if (customInput.trim()) {
      handleSelect(customInput.trim(), true);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
      <h3 className="font-semibold text-gray-800 mb-3">Pain Point / Audience</h3>
      
      {/* Current Selection */}
      <div className="mb-4">
        <span className="text-xs font-medium text-gray-500">Current:</span>
        <p className="text-sm font-medium text-gray-800 mt-1">&ldquo;{config.original}&rdquo;</p>
      </div>

      {/* Selected (if different) */}
      {config.selected !== config.original && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <span className="text-xs font-medium text-blue-600">Selected:</span>
          <p className="text-sm font-medium text-blue-800 mt-1">&ldquo;{config.selected}&rdquo;</p>
        </div>
      )}

      {/* Alternatives */}
      <div className="space-y-2 mb-4">
        <span className="text-xs font-medium text-gray-500">Suggested alternatives:</span>
        <div className="space-y-1">
          {/* Original option */}
          <label className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer">
            <input
              type="radio"
              name="painPoint"
              checked={config.selected === config.original && !config.isCustom}
              onChange={() => handleSelect(config.original, false)}
              disabled={disabled}
              className="text-blue-600"
            />
            <span className="text-sm text-gray-700">{config.original} (original)</span>
          </label>
          
          {alternatives.map((alt, index) => (
            <label key={index} className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="painPoint"
                checked={config.selected === alt && !config.isCustom}
                onChange={() => handleSelect(alt, false)}
                disabled={disabled}
                className="text-blue-600"
              />
              <span className="text-sm text-gray-700">{alt}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Custom Input */}
      <div className="space-y-2">
        <span className="text-xs font-medium text-gray-500">Or enter custom:</span>
        <div className="flex gap-2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Enter custom pain point..."
            disabled={disabled}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleCustomSubmit}
            disabled={disabled || !customInput.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Set
          </button>
        </div>
      </div>
    </div>
  );
}
