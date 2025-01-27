import React, { useState } from 'react';
import { useTradeStore } from '../store/useTradeStore';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface FilterOptions {
  dateRange: {
    start: string;
    end: string;
  };
  instrument: string;
  direction: string;
  tags: string[];
  setup: string;
}

interface TradeFilterProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
}

export function TradeFilter({ filters, onFilterChange }: TradeFilterProps) {
  const trades = useTradeStore((state) => state.trades);
  const [isExpanded, setIsExpanded] = useState(false);

  // Get unique values for select options
  const instruments = Array.from(new Set(trades.map((trade) => trade.instrument)));
  const setups = Array.from(new Set(trades.map((trade) => trade.setup)));
  const tags = Array.from(new Set(trades.flatMap((trade) => trade.tags)));

  const handleChange = (field: keyof FilterOptions, value: any) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full"
      >
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filters</h3>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        )}
      </button>
      
      {isExpanded && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date Range</label>
              <div className="mt-1 space-y-2">
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) =>
                    handleChange('dateRange', { ...filters.dateRange, start: e.target.value })
                  }
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) =>
                    handleChange('dateRange', { ...filters.dateRange, end: e.target.value })
                  }
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Instrument</label>
              <select
                value={filters.instrument}
                onChange={(e) => handleChange('instrument', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All</option>
                {instruments.map((instrument) => (
                  <option key={instrument} value={instrument}>
                    {instrument}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Direction</label>
              <select
                value={filters.direction}
                onChange={(e) => handleChange('direction', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="LONG">Long</option>
                <option value="SHORT">Short</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tags</label>
              <select
                multiple
                value={filters.tags}
                onChange={(e) =>
                  handleChange(
                    'tags',
                    Array.from(e.target.selectedOptions, (option) => option.value)
                  )
                }
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {tags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Setup</label>
              <select
                value={filters.setup}
                onChange={(e) => handleChange('setup', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All</option>
                {setups.map((setup) => (
                  <option key={setup} value={setup}>
                    {setup}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
