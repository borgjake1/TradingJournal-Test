export type TradeDirection = 'LONG' | 'SHORT';

export interface Trade {
  id: string;
  entryDate: string;
  exitDate: string;
  instrument: string;
  direction: TradeDirection;
  entryPrice: number;
  exitPrice: number;
  stopLoss: number;
  takeProfit: number;
  positionSize: number;
  profit: number;
  profitLoss: number;
  profitLossPercentage: number;
  commissions: number;
  swapsFees: number;
  setup: string;
  tags: string[];
  notes: string;
  screenshots: string[];
}
