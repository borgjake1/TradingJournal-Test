import { create } from 'zustand';
import { Trade } from '../types/trade';

interface TradeStore {
  trades: Trade[];
  predefinedTags: string[];
  predefinedSetups: string[];
  addTrade: (trade: Omit<Trade, 'id' | 'profitLoss' | 'profitLossPercentage'>) => void;
  updateTrade: (id: string, trade: Partial<Omit<Trade, 'id' | 'profitLoss' | 'profitLossPercentage'>>) => void;
  deleteTrade: (id: string) => void;
  importTrades: (trades: Trade[]) => void;
  addPredefinedTag: (tag: string) => void;
  removePredefinedTag: (tag: string) => void;
  addPredefinedSetup: (setup: string) => void;
  removePredefinedSetup: (setup: string) => void;
}

export const useTradeStore = create<TradeStore>((set) => ({
  trades: [],
  predefinedTags: [],
  predefinedSetups: [],
  addTrade: (trade) => {
    const { profitLoss, profitLossPercentage } = calculateProfitLoss(trade);
    const newTrade: Trade = {
      ...trade,
      id: crypto.randomUUID(),
      profitLoss,
      profitLossPercentage,
    };
    set((state) => ({ trades: [...state.trades, newTrade] }));
  },
  updateTrade: (id, trade) => {
    set((state) => ({
      trades: state.trades.map((t) =>
        t.id === id
          ? { 
              ...t, 
              ...trade, 
              ...calculateProfitLoss({ ...t, ...trade })
            }
          : t
      ),
    }));
  },
  deleteTrade: (id) => {
    set((state) => ({
      trades: state.trades.filter((t) => t.id !== id),
    }));
  },
  importTrades: (importedTrades) => {
    set({ trades: importedTrades });
  },
  addPredefinedTag: (tag) => {
    set((state) => ({
      predefinedTags: [...state.predefinedTags, tag],
    }));
  },
  removePredefinedTag: (tag) => {
    set((state) => ({
      predefinedTags: state.predefinedTags.filter((t) => t !== tag),
    }));
  },
  addPredefinedSetup: (setup) => {
    set((state) => ({
      predefinedSetups: [...state.predefinedSetups, setup],
    }));
  },
  removePredefinedSetup: (setup) => {
    set((state) => ({
      predefinedSetups: state.predefinedSetups.filter((s) => s !== setup),
    }));
  },
}));

function calculateProfitLoss(trade: Omit<Trade, 'id' | 'profitLoss' | 'profitLossPercentage'>) {
  const { profit = 0, commissions = 0, swapsFees = 0, entryPrice = 0, positionSize = 0 } = trade;
  
  const netProfitLoss = profit + commissions + swapsFees;
  const profitLossPercentage = entryPrice && positionSize 
    ? (netProfitLoss / (entryPrice * positionSize)) * 100 
    : 0;

  return {
    profitLoss: netProfitLoss,
    profitLossPercentage
  };
}
