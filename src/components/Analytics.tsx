import React, { useState, useMemo } from 'react';
import { useTradeStore } from '../store/useTradeStore';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { isWithinInterval, parseISO } from 'date-fns';
import { TradeFilter, FilterOptions } from './TradeFilter';
import { Trade } from '../types/trade';

type ProfitabilityMetric = {
  value: string;
  profitLoss: number;
  tradeCount: number;
};

type CombinedMetric = {
  instrument: string;
  direction: string;
  setup: string;
  tag: string;
  profitLoss: number;
  tradeCount: number;
};

export function Analytics() {
  const trades = useTradeStore((state) => state.trades);
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

  // Calculate metrics
  const winningTrades = filteredTrades.filter((trade) => trade.profitLoss > 0);
  const losingTrades = filteredTrades.filter((trade) => trade.profitLoss < 0);
  const winRate = filteredTrades.length > 0 ? (winningTrades.length / filteredTrades.length) * 100 : 0;
  const profitFactor = Math.abs(
    winningTrades.reduce((sum, trade) => sum + trade.profitLoss, 0) /
    losingTrades.reduce((sum, trade) => sum + trade.profitLoss, 0) || 0
  );

  // Calculate most profitable metrics
  const calculateMetrics = (trades: Trade[], groupBy: keyof Trade | 'tags'): ProfitabilityMetric[] => {
    const metrics = trades.reduce((acc, trade) => {
      const values = groupBy === 'tags' ? trade.tags : [trade[groupBy] as string];
      values.forEach(value => {
        if (!acc[value]) {
          acc[value] = { profitLoss: 0, tradeCount: 0 };
        }
        acc[value].profitLoss += trade.profitLoss;
        acc[value].tradeCount += 1;
      });
      return acc;
    }, {} as Record<string, { profitLoss: number; tradeCount: number }>);

    return Object.entries(metrics)
      .map(([value, { profitLoss, tradeCount }]) => ({
        value,
        profitLoss,
        tradeCount,
      }))
      .sort((a, b) => b.profitLoss - a.profitLoss);
  };

  const mostProfitableInstruments = calculateMetrics(filteredTrades, 'instrument');
  const mostProfitableDirections = calculateMetrics(filteredTrades, 'direction');
  const mostProfitableSetups = calculateMetrics(filteredTrades, 'setup');
  const mostProfitableTags = calculateMetrics(filteredTrades, 'tags');

  // Calculate least profitable metrics
  const calculateLeastProfitableMetrics = (trades: Trade[], groupBy: keyof Trade | 'tags'): ProfitabilityMetric[] => {
    const metrics = trades.reduce((acc, trade) => {
      const values = groupBy === 'tags' ? trade.tags : [trade[groupBy] as string];
      values.forEach(value => {
        if (!acc[value]) {
          acc[value] = { profitLoss: 0, tradeCount: 0 };
        }
        acc[value].profitLoss += trade.profitLoss;
        acc[value].tradeCount += 1;
      });
      return acc;
    }, {} as Record<string, { profitLoss: number; tradeCount: number }>);

    return Object.entries(metrics)
      .map(([value, { profitLoss, tradeCount }]) => ({
        value,
        profitLoss,
        tradeCount,
      }))
      .sort((a, b) => a.profitLoss - b.profitLoss);
  };

  const leastProfitableInstruments = calculateLeastProfitableMetrics(filteredTrades, 'instrument');
  const leastProfitableDirections = calculateLeastProfitableMetrics(filteredTrades, 'direction');
  const leastProfitableSetups = calculateLeastProfitableMetrics(filteredTrades, 'setup');
  const leastProfitableTags = calculateLeastProfitableMetrics(filteredTrades, 'tags');

  // Calculate most profitable combinations
  const calculateCombinations = (trades: Trade[]): CombinedMetric[] => {
    const combinations = trades.reduce((acc, trade) => {
      trade.tags.forEach(tag => {
        const key = `${trade.instrument}|${trade.direction}|${trade.setup}|${tag}`;
        if (!acc[key]) {
          acc[key] = {
            instrument: trade.instrument,
            direction: trade.direction,
            setup: trade.setup,
            tag,
            profitLoss: 0,
            tradeCount: 0,
          };
        }
        acc[key].profitLoss += trade.profitLoss;
        acc[key].tradeCount += 1;
      });
      return acc;
    }, {} as Record<string, CombinedMetric>);

    return Object.values(combinations).sort((a, b) => b.profitLoss - a.profitLoss);
  };

  // Calculate least profitable combinations
  const calculateLeastProfitableCombinations = (trades: Trade[]): CombinedMetric[] => {
    const combinations = trades.reduce((acc, trade) => {
      trade.tags.forEach(tag => {
        const key = `${trade.instrument}|${trade.direction}|${trade.setup}|${tag}`;
        if (!acc[key]) {
          acc[key] = {
            instrument: trade.instrument,
            direction: trade.direction,
            setup: trade.setup,
            tag,
            profitLoss: 0,
            tradeCount: 0,
          };
        }
        acc[key].profitLoss += trade.profitLoss;
        acc[key].tradeCount += 1;
      });
      return acc;
    }, {} as Record<string, CombinedMetric>);

    return Object.values(combinations).sort((a, b) => a.profitLoss - b.profitLoss);
  };

  const profitableCombinations = calculateCombinations(filteredTrades);
  const leastProfitableCombinations = calculateLeastProfitableCombinations(filteredTrades);

  // Prepare chart data
  const profitByInstrument = filteredTrades.reduce((acc, trade) => {
    acc[trade.instrument] = (acc[trade.instrument] || 0) + trade.profitLoss;
    return acc;
  }, {} as Record<string, number>);

  const instrumentChartData = Object.entries(profitByInstrument).map(([instrument, pnl]) => ({
    instrument,
    pnl,
  }));

  const winLossData = [
    { name: 'Winning', value: winningTrades.length },
    { name: 'Losing', value: losingTrades.length },
  ];

  const COLORS = ['#16a34a', '#dc2626'];

  const MetricCard = ({ title, metric }: { title: string; metric: ProfitabilityMetric }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h4>
      <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
        {metric.value} (${metric.profitLoss.toFixed(2)})
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{metric.tradeCount} trades</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <TradeFilter filters={filters} onFilterChange={setFilters} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Win Rate</h3>
          <p className="mt-2 text-3xl font-semibold text-blue-600">{winRate.toFixed(1)}%</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Profit Factor</h3>
          <p className="mt-2 text-3xl font-semibold text-blue-600">{profitFactor.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Trades</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{filteredTrades.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Most Profitable</h3>
          <div className="grid grid-cols-1 gap-4">
            {mostProfitableInstruments[0] && (
              <MetricCard title="Top Instrument" metric={mostProfitableInstruments[0]} />
            )}
            {mostProfitableDirections[0] && (
              <MetricCard title="Top Direction" metric={mostProfitableDirections[0]} />
            )}
            {mostProfitableSetups[0] && (
              <MetricCard title="Top Setup" metric={mostProfitableSetups[0]} />
            )}
            {mostProfitableTags[0] && (
              <MetricCard title="Top Tag" metric={mostProfitableTags[0]} />
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Most Profitable Combination</h3>
          {profitableCombinations[0] && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Instrument</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {profitableCombinations[0].instrument}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Direction</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {profitableCombinations[0].direction}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Setup</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {profitableCombinations[0].setup}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tag</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {profitableCombinations[0].tag}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total P&L</p>
                <p className="text-2xl font-semibold text-blue-600">
                  ${profitableCombinations[0].profitLoss.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {profitableCombinations[0].tradeCount} trades
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Least Profitable</h3>
          <div className="grid grid-cols-1 gap-4">
            {leastProfitableInstruments[0] && (
              <MetricCard title="Bottom Instrument" metric={leastProfitableInstruments[0]} />
            )}
            {leastProfitableDirections[0] && (
              <MetricCard title="Bottom Direction" metric={leastProfitableDirections[0]} />
            )}
            {leastProfitableSetups[0] && (
              <MetricCard title="Bottom Setup" metric={leastProfitableSetups[0]} />
            )}
            {leastProfitableTags[0] && (
              <MetricCard title="Bottom Tag" metric={leastProfitableTags[0]} />
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Least Profitable Combination</h3>
          {leastProfitableCombinations[0] && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Instrument</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {leastProfitableCombinations[0].instrument}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Direction</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {leastProfitableCombinations[0].direction}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Setup</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {leastProfitableCombinations[0].setup}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tag</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {leastProfitableCombinations[0].tag}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total P&L</p>
                <p className="text-2xl font-semibold text-red-600">
                  ${leastProfitableCombinations[0].profitLoss.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {leastProfitableCombinations[0].tradeCount} trades
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">P&L by Instrument</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={instrumentChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="instrument" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="pnl" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Win/Loss Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={winLossData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {winLossData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
