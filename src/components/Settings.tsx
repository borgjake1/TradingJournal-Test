import React, { useState } from 'react';
import { Download, Upload, Plus, X } from 'lucide-react';
import { useTradeStore } from '../store/useTradeStore';
import { Trade } from '../types/trade';

export function Settings() {
  const { trades, importTrades, predefinedTags, predefinedSetups, addPredefinedTag, removePredefinedTag, addPredefinedSetup, removePredefinedSetup } = useTradeStore();
  const [newTag, setNewTag] = useState('');
  const [newSetup, setNewSetup] = useState('');

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(trades, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const exportFileDefaultName = 'trading-journal-export.json';

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.style.display = 'none';
      document.body.appendChild(linkElement);

      linkElement.click();

      document.body.removeChild(linkElement);
      alert('Your file has been successfully downloaded.');
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('There was an error when downloading the file.');
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedTrades = JSON.parse(e.target?.result as string) as Trade[];

        // Extract unique tags and setups from imported trades
        const newTags = new Set<string>();
        const newSetups = new Set<string>();
        importedTrades.forEach((trade) => {
          trade.tags.forEach((tag) => newTags.add(tag));
          if (trade.setup) newSetups.add(trade.setup);
        });

        // Add new tags and setups to predefined lists if they don't already exist
        newTags.forEach((tag) => {
          if (!predefinedTags.includes(tag)) {
            addPredefinedTag(tag);
          }
        });
        newSetups.forEach((setup) => {
          if (!predefinedSetups.includes(setup)) {
            addPredefinedSetup(setup);
          }
        });

        importTrades(importedTrades);
      } catch (error) {
        console.error('Error importing trades:', error);
        alert('Error importing trades. Please make sure the file is valid JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTag.trim() && !predefinedTags.includes(newTag.trim())) {
      addPredefinedTag(newTag.trim());
      setNewTag('');
    }
  };

  const handleAddSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSetup.trim() && !predefinedSetups.includes(newSetup.trim())) {
      addPredefinedSetup(newSetup.trim());
      setNewSetup('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>

      <div className="bg-white shadow-sm rounded-lg divide-y divide-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Predefined Tags</h3>
          <form onSubmit={handleAddTag} className="flex gap-2 mb-4">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Enter new tag"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-5 w-5" />
            </button>
          </form>
          <div className="flex flex-wrap gap-2">
            {predefinedTags.map((tag) => (
              <div
                key={tag}
                className="inline-flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1"
              >
                <span>{tag}</span>
                <button
                  onClick={() => removePredefinedTag(tag)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Predefined Setups</h3>
          <form onSubmit={handleAddSetup} className="flex gap-2 mb-4">
            <input
              type="text"
              value={newSetup}
              onChange={(e) => setNewSetup(e.target.value)}
              placeholder="Enter new setup"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-5 w-5" />
            </button>
          </form>
          <div className="flex flex-wrap gap-2">
            {predefinedSetups.map((setup) => (
              <div
                key={setup}
                className="inline-flex items-center bg-green-100 text-green-800 rounded-full px-3 py-1"
              >
                <span>{setup}</span>
                <button
                  onClick={() => removePredefinedSetup(setup)}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Data Management</h3>
          <div className="space-y-4">
            <button
              onClick={handleExport}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Download className="h-5 w-5 mr-2" />
              Export Trades
            </button>
            <div>
              <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                <Upload className="h-5 w-5 mr-2" />
                Import Trades
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
