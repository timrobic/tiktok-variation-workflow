'use client';

interface VariationCountProps {
  count: number;
  onChange: (count: number) => void;
  disabled?: boolean;
}

export default function VariationCount({ count, onChange, disabled }: VariationCountProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
      <h3 className="font-semibold text-gray-800 mb-3">Variation Count</h3>
      
      <div className="flex items-center gap-4">
        <input
          type="range"
          min="1"
          max="20"
          value={count}
          onChange={(e) => onChange(parseInt(e.target.value))}
          disabled={disabled}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            max="20"
            value={count}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (val >= 1 && val <= 20) {
                onChange(val);
              }
            }}
            disabled={disabled}
            className="w-16 px-2 py-1 border border-gray-300 rounded-lg text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-500">variations</span>
        </div>
      </div>
      
      <p className="text-xs text-gray-500 mt-2">
        Generate between 1 and 20 unique variations
      </p>
    </div>
  );
}
