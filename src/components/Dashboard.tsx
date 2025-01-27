import React, { useState, useMemo } from 'react';
import { useTradeStore } from '../store/useTradeStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, isWithinInterval, parseISO } from 'date-fns';
import { CalendarView } from './CalendarView';
import { TradeFilter, FilterOptions } from './TradeFilter';

export function Dashboard() {
  const trades = useTradeStore((state) => state.trades);
  const [metricType, setMetricType] = useState<'pnl' | 'rr'>('pnl');
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: {
      start: '',
      end: '',
    },
    instrument: '',
    direction: '',
    tags: [],
    setup: '',
  });

  const filteredTrades = useMemo(() => {
    return trades.filter((trade) => {
      const date = parseISO(trade.exitDate);
      const withinDateRange =
        !filters.dateRange.start ||
        !filters.dateRange.end ||
        isWithinInterval(date, {
          start: parseISO(filters.dateRange.start),
          end: parseISO(filters.dateRange.end),
        });

      const matchesInstrument = !filters.instrument || trade.instrument === filters.instrument;
      const matchesDirection = !filters.direction || trade.direction === filters.direction;
      const matchesTags =
        filters.tags.length === 0 ||
        filters.tags.some((tag) => trade.tags.includes(tag));
      const matchesSetup = !filters.setup || trade.setup === filters.setup;

      return (
        withinDateRange &&
        matchesInstrument &&
        matchesDirection &&
        matchesTags &&
        matchesSetup
      );
    });
  }, [trades, filters]);

  const totalProfitLoss = filteredTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
  const winningTrades = filteredTrades.filter((trade) => trade.profitLoss > 0);
  const winRate = filteredTrades.length > 0 ? (winningTrades.length / filteredTrades.length) * 100 : 0;

  // Calculate average risk/reward ratio
  const avgRiskReward = useMemo(() => {
    if (filteredTrades.length === 0) return 0;
    
    const totalRR = filteredTrades.reduce((sum, trade) => {
      const risk = Math.abs(trade.entryPrice - trade.stopLoss);
      const reward = Math.abs(trade.takeProfit - trade.entryPrice);
      return sum + (reward / risk);
    }, 0);
    
    return totalRR / filteredTrades.length;
  }, [filteredTrades]);

  const chartData = filteredTrades.map((trade) => ({
    date: format(new Date(trade.exitDate), 'MMM dd'),
    pnl: trade.profitLoss,
  }));

  return (
    <div className="space-y-6">
      <TradeFilter filters={filters} onFilterChange={setFilters} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Total P&L</h3>
          <p className={`mt-2 text-3xl font-semibold ${totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${totalProfitLoss.toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Risk/Reward Ratio</h3>
          <p className="mt-2 text-3xl font-semibold text-blue-600">
            {avgRiskReward.toFixed(2)}R
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Win Rate</h3>
          <p className="mt-2 text-3xl font-semibold text-blue-600">
            {winRate.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Calendar View</h3>
            <div className="flex items-center space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600"
                  name="metric"
                  value="pnl"
                  checked={metricType === 'pnl'}
                  onChange={(e) => setMetricType(e.target.value as 'pnl' | 'rr')}
                />
                <span className="ml-2">Profit/Loss</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600"
                  name="metric"
                  value="rr"
                  checked={metricType === 'rr'}
                  onChange={(e) => setMetricType(e.target.value as 'pnl' | 'rr')}
                />
                <span className="ml-2">Risk/Reward</span>
              </label>
            </div>
          </div>
          <CalendarView selectedDate={new Date()} metricType={metricType} trades={filteredTrades} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">P&L Over Time</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="pnl" stroke="#2563eb" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
