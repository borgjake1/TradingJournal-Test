import React from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { TradeLog } from './components/TradeLog';
import { Analytics } from './components/Analytics';
import { Settings } from './components/Settings';
import { useState } from 'react';

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'trades' | 'analytics' | 'settings'>('dashboard');

  return (
    <Layout>
      <nav className="flex space-x-4 mb-8">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'dashboard'
              ? 'bg-blue-500 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('trades')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'trades'
              ? 'bg-blue-500 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Trade Log
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'analytics'
              ? 'bg-blue-500 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Analytics
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'settings'
              ? 'bg-blue-500 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Settings
        </button>
      </nav>

      <main className="flex-1">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'trades' && <TradeLog />}
        {activeTab === 'analytics' && <Analytics />}
        {activeTab === 'settings' && <Settings />}
      </main>
    </Layout>
  );
}

export default App;
