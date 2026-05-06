import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Globe,
  Clock,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Maximize2,
  X,
  ShieldCheck,
  Zap,
  Filter
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line } from 'recharts';

interface MarketAsset {
  symbol: string;
  name: string;
  price: string;
  change: string;
  isUp: boolean;
  vol: string;
  market: 'crypto' | 'stocks' | 'commodities';
  history: { time: string; value: number; ma?: number }[];
}

const generateHistory = (base: number, count: number) => {
  return Array.from({ length: count }, (_, i) => {
    const val = base + Math.random() * (base * 0.05);
    return { 
      time: `${i}:00`, 
      value: val,
      ma: base + (Math.random() * (base * 0.02)) // Simulated MA
    };
  });
};

const WATCHLIST: MarketAsset[] = [
  { 
    symbol: 'BTC/USDT', 
    name: 'Bitcoin', 
    price: '64,231.50', 
    change: '+2.4%', 
    isUp: true, 
    vol: '1.2B',
    market: 'crypto',
    history: generateHistory(64000, 24)
  },
  { 
    symbol: 'ETH/USDT', 
    name: 'Ethereum', 
    price: '3,452.12', 
    change: '+1.8%', 
    isUp: true, 
    vol: '850M',
    market: 'crypto',
    history: generateHistory(3400, 24)
  },
  { 
    symbol: 'BNB/USDT', 
    name: 'Binance Coin', 
    price: '584.20', 
    change: '+0.5%', 
    isUp: true, 
    vol: '120M',
    market: 'crypto',
    history: generateHistory(580, 24)
  },
  { 
    symbol: 'SOL/USDT', 
    name: 'Solana', 
    price: '145.67', 
    change: '-3.2%', 
    isUp: false, 
    vol: '210M',
    market: 'crypto',
    history: generateHistory(145, 24)
  },
  { 
    symbol: 'XRP/USDT', 
    name: 'Ripple', 
    price: '0.62', 
    change: '+1.2%', 
    isUp: true, 
    vol: '45M',
    market: 'crypto',
    history: generateHistory(0.6, 24)
  },
  { 
    symbol: 'DOGE/USDT', 
    name: 'Dogecoin', 
    price: '0.184', 
    change: '-2.1%', 
    isUp: false, 
    vol: '32M',
    market: 'crypto',
    history: generateHistory(0.18, 24)
  },
  { 
    symbol: 'ADA/USDT', 
    name: 'Cardano', 
    price: '0.45', 
    change: '+0.8%', 
    isUp: true, 
    vol: '15M',
    market: 'crypto',
    history: generateHistory(0.45, 24)
  },
  { 
    symbol: 'DOT/USDT', 
    name: 'Polkadot', 
    price: '7.12', 
    change: '+1.5%', 
    isUp: true, 
    vol: '8M',
    market: 'crypto',
    history: generateHistory(7, 24)
  },
  { 
    symbol: 'LINK/USDT', 
    name: 'Chainlink', 
    price: '14.25', 
    change: '-0.5%', 
    isUp: false, 
    vol: '11M',
    market: 'crypto',
    history: generateHistory(14, 24)
  },
  { 
    symbol: 'S&P 500', 
    name: 'US 500 Index', 
    price: '5,241.10', 
    change: '+0.5%', 
    isUp: true, 
    vol: '12B',
    market: 'stocks',
    history: generateHistory(5241, 24)
  },
  { 
    symbol: 'NASDAQ 100', 
    name: 'US Tech 100', 
    price: '18,340.20', 
    change: '+1.2%', 
    isUp: true, 
    vol: '8.4B',
    market: 'stocks',
    history: generateHistory(18340, 24)
  },
  { 
    symbol: 'EUR/USD', 
    name: 'Euro / US Dollar', 
    price: '1.0842', 
    change: '+0.15%', 
    isUp: true, 
    vol: '5.2T',
    market: 'stocks',
    history: generateHistory(1.08, 24)
  },
  { 
    symbol: 'GBP/USD', 
    name: 'Pound / US Dollar', 
    price: '1.2654', 
    change: '-0.21%', 
    isUp: false, 
    vol: '2.1T',
    market: 'stocks',
    history: generateHistory(1.26, 24)
  },
  { 
    symbol: 'GOLD/USD', 
    name: 'Gold Spot', 
    price: '2,341.20', 
    change: '-0.1%', 
    isUp: false, 
    vol: '4.5B',
    market: 'commodities',
    history: generateHistory(2341, 24)
  },
  { 
    symbol: 'SILVER/USD', 
    name: 'Silver Spot', 
    price: '27.45', 
    change: '+2.1%', 
    isUp: true, 
    vol: '850M',
    market: 'commodities',
    history: generateHistory(27, 24)
  },
  { 
    symbol: 'CRUDE/USD', 
    name: 'WTI Oil', 
    price: '82.45', 
    change: '-1.4%', 
    isUp: false, 
    vol: '1.1B',
    market: 'commodities',
    history: generateHistory(82, 24)
  },
];

export default function MarketView() {
  const [selectedAsset, setSelectedAsset] = useState(WATCHLIST[0]);
  const [timeframe, setTimeframe] = useState<'1D' | '5D' | '1M' | '6M' | '1Y'>('1D');
  const [showMA, setShowMA] = useState(false);
  const [marketFilter, setMarketFilter] = useState<'all' | 'crypto' | 'stocks' | 'commodities'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [tradeModal, setTradeModal] = useState<{ isOpen: boolean; asset: MarketAsset | null; type: 'buy' | 'sell' }>({
    isOpen: false,
    asset: null,
    type: 'buy'
  });
  const [tradeAmount, setTradeAmount] = useState('100');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleTradeAction = (asset: MarketAsset, type: 'buy' | 'sell') => {
    setTradeModal({ isOpen: true, asset, type });
    setIsSuccess(false);
  };

  const executeTrade = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        setTradeModal({ isOpen: false, asset: null, type: 'buy' });
        setIsSuccess(false);
      }, 2000);
    }, 1500);
  };

  return (
    <div className="space-y-8 pb-16" id="market-terminal">
      {/* Trading Modal */}
      <AnimatePresence>
        {tradeModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTradeModal({ ...tradeModal, isOpen: false })}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#0d121b] border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 relative z-50 shadow-2xl overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 ${tradeModal.type === 'buy' ? 'bg-emerald-500/10' : 'bg-red-500/10'} rounded-full blur-3xl pointer-events-none`} />
              
              <div className="flex items-center justify-between mb-8 relative">
                 <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl ${tradeModal.type === 'buy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-500'}`}>
                      {tradeModal.type === 'buy' ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">إتمام عملية {tradeModal.type === 'buy' ? 'شراء' : 'بيع'}</h3>
                      <p className="text-neutral-500 text-xs">{tradeModal.asset?.symbol} - سعر السوق الحالي</p>
                    </div>
                 </div>
                 <button 
                  onClick={() => setTradeModal({ ...tradeModal, isOpen: false })}
                  className="p-2 hover:bg-white/5 rounded-full text-neutral-500 hover:text-white transition-all"
                 >
                   <X size={20} />
                 </button>
              </div>

              {isSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 text-center space-y-4"
                >
                  <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="text-emerald-400 w-10 h-10" />
                  </div>
                  <h4 className="text-2xl font-bold text-white">تم تنفيذ العملية!</h4>
                  <p className="text-neutral-400 text-sm">عملية الـ {tradeModal.type === 'buy' ? 'شراء' : 'بيع'} بقيمة ${tradeAmount} قيد المعالجة الآن.</p>
                </motion.div>
              ) : (
                <div className="space-y-8 relative">
                   <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-4">
                      <div className="flex justify-between items-center pr-2">
                        <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">المبلغ المستثمر (USD)</label>
                        <span className="text-2xl font-bold text-white font-mono">${tradeAmount}</span>
                      </div>
                      <input 
                        type="range"
                        min="10"
                        max="5000"
                        step="10"
                        value={tradeAmount}
                        onChange={(e) => setTradeAmount(e.target.value)}
                        className={`w-full h-2 bg-white/5 rounded-full appearance-none cursor-pointer ${tradeModal.type === 'buy' ? 'accent-emerald-500' : 'accent-red-500'}`}
                      />
                      <div className="flex justify-between text-[9px] text-neutral-600 font-bold uppercase tracking-tighter">
                        <span>MIN $10</span>
                        <span>MAX $5,000</span>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <TradeInfoItem label="السعر" value={`$${tradeModal.asset?.price}`} />
                      <TradeInfoItem label="الرسوم" value="0.01%" />
                      <TradeInfoItem label="الرافعة" value="X20" />
                      <TradeInfoItem label="التنفيذ" value="فوري" />
                   </div>

                   <div className="pt-4">
                      <button 
                        onClick={executeTrade}
                        disabled={isProcessing}
                        className={`w-full py-4 rounded-2xl font-bold text-black transition-all flex items-center justify-center gap-3 group disabled:opacity-50 ${
                          tradeModal.type === 'buy' ? 'bg-emerald-400 hover:bg-emerald-300' : 'bg-red-400 hover:bg-red-300'
                        }`}
                      >
                        {isProcessing ? (
                          <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                        ) : (
                          <>
                            تأكيد الـ {tradeModal.type === 'buy' ? 'شراء' : 'بيع'}
                            <Zap size={18} className="group-hover:scale-125 transition-transform" />
                          </>
                        )}
                      </button>
                   </div>

                   <p className="text-center text-[10px] text-neutral-600 font-bold uppercase tracking-[0.2em]">S E C U R E • T E R M I N A L</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header & Market Filters */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Globe className="text-cyan-400 w-7 h-7" />
            تداولات البورصة والأسواق
          </h2>
          <p className="text-neutral-500 text-xs mt-1">بث مباشر للأسعار والرسوم البيانية من أقوى المنصات العالمية</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-white/5 p-1.5 rounded-2xl border border-white/5">
          {(['all', 'crypto', 'stocks', 'commodities'] as const).map((market) => (
            <button
              key={market}
              onClick={() => setMarketFilter(market)}
              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${
                marketFilter === market 
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' 
                  : 'text-neutral-500 hover:text-white'
              }`}
            >
              {market === 'all' ? 'الكل' : market === 'crypto' ? 'كريبتو' : market === 'stocks' ? 'أسهم' : 'سلع'}
            </button>
          ))}
        </div>
        
        <div className="relative group flex items-center">
          <Search className="absolute right-4 text-neutral-500 group-hover:text-cyan-400 transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="بحث عن عملة أو سوق..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-2xl py-3 pr-12 pl-12 text-xs text-white focus:outline-none focus:border-cyan-500/50 transition-all w-full md:w-64"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute left-4 p-1 hover:bg-white/10 rounded-lg text-neutral-500 hover:text-white transition-all scale-90"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Chart Area */}
        <div className="lg:col-span-3 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0d121b] border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col h-[600px] shadow-2xl relative"
          >
            {/* Chart Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
               <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center font-black text-cyan-400">
                      {selectedAsset.symbol.split('/')[0].substring(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">{selectedAsset.symbol}</h3>
                      <p className="text-[10px] text-neutral-500 uppercase tracking-widest">{selectedAsset.name}</p>
                    </div>
                  </div>
                  
                  <div className="hidden sm:flex border-r border-white/10 h-10 mx-2" />
                  
                  <div className="hidden sm:grid grid-cols-2 gap-x-8 gap-y-1">
                     <span className="text-[10px] text-neutral-500 uppercase font-black">السعر</span>
                     <span className="text-[10px] text-neutral-500 uppercase font-black">التغيير</span>
                     <span className="text-sm font-mono font-bold text-white">${selectedAsset.price}</span>
                     <span className={`text-sm font-mono font-bold ${selectedAsset.isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                       {selectedAsset.change}
                     </span>
                  </div>
               </div>

               <div className="flex items-center gap-3">
                  <button className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                    <Maximize2 size={16} className="text-white" />
                  </button>
                  <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">LIVE</span>
                  </div>
               </div>
            </div>

            {/* Interactive Chart Container */}
            <div className="flex-1 bg-[#131722] relative p-4">
              <div className="absolute top-4 left-6 z-10 flex gap-2">
                {['1D', '5D', '1M', '6M', '1Y'].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf as any)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${
                      timeframe === tf 
                        ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' 
                        : 'bg-white/5 text-neutral-500 hover:text-white'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
                <div className="w-[1px] h-6 bg-white/10 mx-2" />
                <button
                  onClick={() => setShowMA(!showMA)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${
                    showMA 
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                      : 'bg-white/5 text-neutral-500 hover:text-white'
                  }`}
                >
                  MA (20)
                </button>
              </div>

              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={selectedAsset.history} margin={{ top: 60, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={selectedAsset.isUp ? "#10b981" : "#ef4444"} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={selectedAsset.isUp ? "#10b981" : "#ef4444"} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    hide 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={['auto', 'auto']} 
                    orientation="right" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#404040', fontSize: 10, fontFamily: 'monospace' }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0d121b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                    labelStyle={{ display: 'none' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke={selectedAsset.isUp ? "#10b981" : "#ef4444"} 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                    animationDuration={1500}
                  />
                  {showMA && (
                    <Area
                      type="monotone"
                      dataKey="ma"
                      stroke="#f59e0b"
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      fill="transparent"
                      animationDuration={1500}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
              
              {/* Overlay Info */}
              <div className="absolute bottom-6 left-6 flex gap-3 pointer-events-none">
                 <div className="px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl text-[10px] text-white font-bold border border-white/10">RSI: 45.2</div>
                 <div className="px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl text-[10px] text-white font-bold border border-white/10">MACD: 0.122</div>
                 {showMA && <div className="px-4 py-2 bg-amber-500/10 backdrop-blur-md rounded-xl text-[10px] text-amber-500 font-bold border border-amber-500/20">MA ACTIVE</div>}
              </div>
            </div>
          </motion.div>

          {/* Market Sentiment Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SentimentCard title="المشاعر العامة" value="Greed" score={72} color="text-amber-400" />
            <SentimentCard title="هيمنة BTC" value="52.4%" score={52} color="text-cyan-400" />
            <SentimentCard title="معدل التقلب" value="Low" score={24} color="text-emerald-400" />
          </div>

          {/* New: Quick Order Panel (Under Charts) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0a0d14] border border-white/5 rounded-[2rem] p-8"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1 w-full space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-white font-bold text-sm flex items-center gap-2">
                    <Zap size={16} className="text-cyan-400" />
                    تنفيذ طلب سريع: {selectedAsset.symbol}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-neutral-500 font-bold uppercase">الرصيد المتاح:</span>
                    <span className="text-xs font-mono font-black text-cyan-400">$12,450.00</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col gap-2">
                    <span className="text-[9px] text-neutral-500 font-black uppercase tracking-widest">المبلغ (USD)</span>
                    <input 
                      type="number" 
                      value={tradeAmount}
                      onChange={(e) => setTradeAmount(e.target.value)}
                      className="bg-transparent border-none text-xl font-bold text-white focus:outline-none placeholder:text-neutral-700"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="flex-1 p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col gap-2">
                    <span className="text-[9px] text-neutral-500 font-black uppercase tracking-widest">الرافعة المالية</span>
                    <select defaultValue="Cross X20" className="bg-transparent border-none text-sm font-bold text-white focus:outline-none cursor-pointer">
                      <option className="bg-[#0d121b]" value="Isolated X10">Isolated X10</option>
                      <option className="bg-[#0d121b]" value="Cross X20">Cross X20</option>
                      <option className="bg-[#0d121b]" value="Cross X50">Cross X50</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex w-full md:w-auto gap-4">
                <button 
                  onClick={() => handleTradeAction(selectedAsset, 'buy')}
                  className="flex-1 md:w-48 py-5 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                  Buy / شراء
                </button>
                <button 
                  onClick={() => handleTradeAction(selectedAsset, 'sell')}
                  className="flex-1 md:w-48 py-5 bg-red-500 hover:bg-red-400 text-black font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-red-500/20 active:scale-95"
                >
                  Sell / بيع
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar Watchlist */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#0a0d14] border border-white/5 rounded-[2.5rem] p-8 h-full"
          >
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-white font-bold flex items-center gap-2">
                 <Eye size={18} className="text-neutral-500" />
                 قائمة المراقبة
               </h3>
               <span className="text-[9px] text-neutral-600 font-black tracking-widest">{WATCHLIST.length} ASSETS</span>
            </div>

            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
              {WATCHLIST
                .filter(a => marketFilter === 'all' || a.market === marketFilter)
                .filter(a => 
                  searchQuery === '' || 
                  a.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  a.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((asset) => (
                <div 
                  key={asset.symbol} 
                  onClick={() => setSelectedAsset(asset)}
                  className={`group bg-white/[0.02] border rounded-2xl p-4 transition-all cursor-pointer ${
                    selectedAsset.symbol === asset.symbol ? 'border-cyan-500/30 bg-cyan-500/5' : 'border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px] ${
                        selectedAsset.symbol === asset.symbol ? 'bg-cyan-500 text-black' : 'bg-neutral-800 text-white'
                      }`}>
                        {asset.symbol.split('/')[0].substring(0, 2)}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">{asset.symbol}</span>
                        <span className="text-[9px] text-neutral-600 font-mono">{asset.vol} VOL</span>
                      </div>
                    </div>

                    <div className="text-left flex flex-col items-end">
                      <span className="text-xs font-mono font-bold text-neutral-200">${asset.price}</span>
                      <div className="flex items-center gap-1">
                        {asset.isUp ? <ArrowUpRight size={10} className="text-emerald-500" /> : <ArrowDownRight size={10} className="text-red-500" />}
                        <span className={`text-[10px] font-bold font-mono ${asset.isUp ? 'text-emerald-500' : 'text-red-500'}`}>
                          {asset.change}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-8 opacity-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={asset.history}>
                          <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke={asset.isUp ? '#10b981' : '#ef4444'} 
                            fill={asset.isUp ? '#10b98122' : '#ef444422'} 
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="flex gap-2 min-w-[140px]">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTradeAction(asset, 'buy');
                        }}
                        className="flex-1 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[8px] font-black text-emerald-400 uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all"
                      >
                        BUY
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTradeAction(asset, 'sell');
                        }}
                        className="flex-1 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-[8px] font-black text-red-500 uppercase tracking-widest hover:bg-red-500 hover:text-black transition-all"
                      >
                        SELL
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-white/5">
               <div className="bg-gradient-to-br from-cyan-500/10 to-transparent p-5 rounded-2xl border border-cyan-500/10 text-right">
                  <Clock className="text-cyan-400 mb-3" size={16} />
                  <h4 className="text-[11px] font-bold text-white mb-1 uppercase tracking-tight">جلسة نيويورك مفتوحة</h4>
                  <p className="text-[9px] text-neutral-500 font-medium leading-relaxed">
                    سيولة عالية متوقعة في الأزواج المرتبطة بالـ USD خلال الـ 4 ساعات القادمة.
                  </p>
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function SentimentCard({ title, value, score, color }: { title: string, value: string, score: number, color: string }) {
  return (
    <div className="bg-[#0a0d14] border border-white/5 p-6 rounded-[2rem] flex flex-col justify-between group hover:border-white/10 transition-all">
       <div className="flex justify-between items-start mb-6">
          <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">{title}</span>
          {score > 50 ? <TrendingUp size={16} className="text-emerald-400" /> : <TrendingDown size={16} className="text-red-400" />}
       </div>
       <div>
          <span className={`text-2xl font-black ${color} block`}>{value}</span>
          <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${score}%` }}
               transition={{ duration: 1.5, ease: "easeOut" }}
               className={`h-full ${score > 50 ? 'bg-emerald-500' : 'bg-cyan-500'}`} 
             />
          </div>
       </div>
    </div>
  );
}

function TradeInfoItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 p-3 rounded-2xl flex flex-col items-center">
       <span className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest mb-1">{label}</span>
       <span className="text-[11px] text-white font-mono font-black">{value}</span>
    </div>
  );
}
