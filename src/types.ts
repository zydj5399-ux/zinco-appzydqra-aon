export interface Trade {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  amount: number;
  entryPrice: number;
  currentPrice: number;
  profit: number;
  timestamp: number;
  status: 'active' | 'closed';
}

export interface RiskSettings {
  stopLossEnabled: boolean;
  stopLossThreshold: number; // percentage
  automaticStopLoss: boolean;
  notificationLevel: 'silent' | 'normal' | 'urgent';
}

export interface UserStats {
  balance: number;
  totalProfit: number;
  monthlyProjected: number;
  activeTrades: number;
  totalInvested: number;
  aiStatus: 'idle' | 'active' | 'optimizing';
  level: string;
  twoFactorEnabled?: boolean;
}

export interface InvestmentLevel {
  id: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  monthlyProfitRatio: number;
  color: string;
  minDeposit: number;
  expectedMonthlyReturn: string;
  support: string;
  maxActiveTrades: number;
}
