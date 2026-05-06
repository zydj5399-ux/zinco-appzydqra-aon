import { InvestmentLevel } from './types';

export const INVESTMENT_LEVELS: InvestmentLevel[] = [
  {
    id: 'starter',
    name: 'باقة البداية الذكية',
    minAmount: 100,
    maxAmount: 400,
    monthlyProfitRatio: 1.75,
    color: 'neutral',
    minDeposit: 100,
    expectedMonthlyReturn: 'Up to 5%',
    support: 'Email Only',
    maxActiveTrades: 5
  },
  {
    id: 'pro',
    name: 'باقة الاحتراف المتقدم',
    minAmount: 401,
    maxAmount: 1500,
    monthlyProfitRatio: 2.15,
    color: 'cyan',
    minDeposit: 500,
    expectedMonthlyReturn: '15-20%',
    support: 'Priority Support',
    maxActiveTrades: 15
  },
  {
    id: 'whale',
    name: 'باقة النخبة المؤسسية',
    minAmount: 1501,
    maxAmount: 50000,
    monthlyProfitRatio: 3.5,
    color: 'amber',
    minDeposit: 2000,
    expectedMonthlyReturn: '25-45%',
    support: '24/7 Dedicated Manager',
    maxActiveTrades: 50
  }
];
