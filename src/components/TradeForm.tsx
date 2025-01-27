import React, { useState, useEffect } from 'react';
import { useTradeStore } from '../store/useTradeStore';
import { X, Plus, Trash2 } from 'lucide-react';
import { Trade } from '../types/trade';

interface TradeFormProps {
  onClose: () => void;
  editingTradeId?: string | null;
}

export function TradeForm({ onClose, editingTradeId }: TradeFormProps) {
  const { addTrade, updateTrade, trades, predefinedTags, predefinedSetups } = useTradeStore();
  const [formData, setFormData] = useState({
    entryDate: '',
    exitDate: '',
    instrument: '',
    direction: 'LONG',
    entryPrice: '',
    exitPrice: '',
    stopLoss: '',
    takeProfit: '',
    positionSize: '',
    profit: '',
    commissions: '0',
    swapsFees: '0',
    tags: '',
    setup: '',
    notes: '',
    screenshots: [] as string[],
  });
  const [newScreenshot, setNewScreenshot] = useState('');

  useEffect(() => {
    if (editingTradeId) {
      const trade = trades.find(t => t.id === editingTradeId);
      if (trade) {
        setFormData({
          entryDate: trade.entryDate || '',
          exitDate: trade.exitDate || '',
          instrument: trade.instrument || '',
          direction: trade.direction || 'LONG',
          entryPrice: trade.entryPrice?.toString() || '',
          exitPrice: trade.exitPrice?.toString() || '',
          stopLoss: trade.stopLoss?.toString() || '',
          takeProfit: trade.takeProfit?.toString() || '',
          positionSize: trade.positionSize?.toString() || '',
          profit: trade.profit?.toString() || '',
          commissions: trade.commissions?.toString() || '0',
          swapsFees: trade.swapsFees?.toString() || '0',
          tags: Array.isArray(trade.tags) ? trade.tags.join(', ') : '',
          setup: trade.setup || '',
          notes: trade.notes || '',
          screenshots: Array.isArray(trade.screenshots) ? trade.screenshots : [],
        });
      }
    }
  }, [editingTradeId, trades]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tradeData = {
      ...formData,
      entryPrice: Number(formData.entryPrice) || 0,
      exitPrice: Number(formData.exitPrice) || 0,
      stopLoss: Number(formData.stopLoss) || 0,
      takeProfit: Number(formData.takeProfit) || 0,
      positionSize: Number(formData.positionSize) || 0,
      profit: Number(formData.profit) || 0,
      commissions: Number(formData.commissions) || 0,
      swapsFees: Number(formData.swapsFees) || 0,
      tags: formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      screenshots: formData.screenshots,
    };

    if (editingTradeId) {
      updateTrade(editingTradeId, tradeData);
    } else {
      addTrade(tradeData);
    }
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const addScreenshot = () => {
    if (newScreenshot && newScreenshot.startsWith('http')) {
      setFormData({
        ...formData,
        screenshots: [...formData.screenshots, newScreenshot],
      });
      setNewScreenshot('');
    }
  };

  const removeScreenshot = (index: number) => {
    setFormData({
      ...formData,
      screenshots: formData.screenshots.filter((_, i) => i !== index),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto">
      <div className="flex justify-between items-center sticky top-0 bg-white z-10 pb-4">
        <h3 className="text-lg font-medium text-gray-900">
          {editingTradeId ? 'Edit Trade' : 'Add New Trade'}
        </h3>
        <button type="button" onClick={onClose}>
          <X className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Entry Date/Time</label>
          <input
            type="datetime-local"
            name="entryDate"
            value={formData.entryDate}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Exit Date/Time</label>
          <input
            type="datetime-local"
            name="exitDate"
            value={formData.exitDate}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Instrument/Asset</label>
          <input
            type="text"
            name="instrument"
            placeholder="e.g., EUR/USD, AAPL"
            value={formData.instrument}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Position Type</label>
          <select
            name="direction"
            value={formData.direction}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="LONG">Long</option>
            <option value="SHORT">Short</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Entry Price</label>
          <input
            type="number"
            step="any"
            name="entryPrice"
            value={formData.entryPrice}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Exit Price</label>
          <input
            type="number"
            step="any"
            name="exitPrice"
            value={formData.exitPrice}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Quantity/Lot Size</label>
          <input
            type="number"
            step="any"
            name="positionSize"
            value={formData.positionSize}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Stop Loss Price</label>
          <input
            type="number"
            step="any"
            name="stopLoss"
            value={formData.stopLoss}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Take Profit Price</label>
          <input
            type="number"
            step="any"
            name="takeProfit"
            value={formData.takeProfit}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Profit</label>
          <input
            type="number"
            step="any"
            name="profit"
            value={formData.profit}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Commissions</label>
          <input
            type="number"
            step="any"
            name="commissions"
            value={formData.commissions}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Swaps/Fees</label>
          <input
            type="number"
            step="any"
            name="swapsFees"
            value={formData.swapsFees}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Setup/Strategy</label>
          <select
            name="setup"
            value={formData.setup}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select a setup</option>
            {predefinedSetups.map((setup) => (
              <option key={setup} value={setup}>
                {setup}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Tags</label>
          <select
            name="tags"
            multiple
            value={formData.tags.split(',').map(t => t.trim()).filter(Boolean)}
            onChange={(e) => {
              const selectedTags = Array.from(e.target.selectedOptions, option => option.value);
              setFormData({
                ...formData,
                tags: selectedTags.join(', '),
              });
            }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {predefinedTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Screenshots</label>
        <div className="mt-1 flex space-x-2">
          <input
            type="url"
            value={newScreenshot}
            onChange={(e) => setNewScreenshot(e.target.value)}
            placeholder="Enter screenshot URL"
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={addScreenshot}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-2 space-y-2">
          {formData.screenshots.map((url, index) => (
            <div key={index} className="flex items-center space-x-2">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 truncate flex-1"
              >
                {url}
              </a>
              <button
                type="button"
                onClick={() => removeScreenshot(index)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Notes/Comments</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Record your thoughts or observations about the trade..."
        />
      </div>

      <div className="flex justify-end space-x-3 sticky bottom-0 bg-white pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          {editingTradeId ? 'Update Trade' : 'Save Trade'}
        </button>
      </div>
    </form>
  );
}
