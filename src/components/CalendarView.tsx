import React, { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Trade } from '../types/trade';

type MetricType = 'pnl' | 'rr';

interface CalendarViewProps {
  trades: Trade[];
  metricType: MetricType;
}

export function CalendarView({ trades, metricType }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getDayMetrics = (date: Date) => {
    const dayTrades = trades.filter((trade) =>
      isSameDay(new Date(trade.exitDate), date)
    );

    if (dayTrades.length === 0) return null;

    const pnl = dayTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
    const rr =
      dayTrades.reduce((sum, trade) => {
        const risk = Math.abs(trade.entryPrice - trade.stopLoss);
        const reward = Math.abs(trade.takeProfit - trade.entryPrice);
        return sum + reward / risk;
      }, 0) / dayTrades.length;

    return {
      pnl,
      rr,
      tradeCount: dayTrades.length,
    };
  };

  const getMetricColor = (metrics: { pnl: number; rr: number; tradeCount: number } | null) => {
    if (!metrics) return 'bg-gray-50 dark:bg-gray-700';

    const value = metricType === 'pnl' ? metrics.pnl : metrics.rr;

    if (metricType === 'pnl') {
      if (value > 0) return 'bg-green-100 hover:bg-green-200 dark:bg-green-700 dark:hover:bg-green-600';
      if (value < 0) return 'bg-red-100 hover:bg-red-200 dark:bg-red-700 dark:hover:bg-red-600';
      return 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500';
    } else {
      if (value >= 2) return 'bg-green-100 hover:bg-green-200 dark:bg-green-700 dark:hover:bg-green-600';
      if (value >= 1) return 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-700 dark:hover:bg-blue-600';
      return 'bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-700 dark:hover:bg-yellow-600';
    }
  };

  const formatMetric = (metrics: { pnl: number; rr: number; tradeCount: number } | null) => {
    if (!metrics) return '';

    if (metricType === 'pnl') {
      return `$${metrics.pnl.toFixed(2)}`;
    } else {
      return `${metrics.rr.toFixed(2)}R`;
    }
  };

  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPreviousMonth}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={goToNextMonth}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2"
          >
            {day}
          </div>
        ))}

        {days.map((day) => {
          const metrics = getDayMetrics(day);
          const isCurrentMonth = isWithinInterval(day, { start: monthStart, end: monthEnd });
          return (
            <div
              key={day.toISOString()}
              className={`aspect-square p-2 rounded-lg ${getMetricColor(metrics)} transition-colors ${
                isCurrentMonth ? '' : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              <div className="text-xs">{format(day, 'd')}</div>
              {metrics && (
                <>
                  <div className="text-sm font-medium">{formatMetric(metrics)}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {metrics.tradeCount} trade{metrics.tradeCount !== 1 ? 's' : ''}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
