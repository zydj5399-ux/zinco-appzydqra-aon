import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell,
  Brush,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  Target, 
  Zap, 
  Cpu, 
  ArrowUpRight, 
  ShieldCheck,
  BrainCircuit,
  Activity,
  Calendar,
  Filter
} from 'lucide-react';
import { UserStats } from '../types';

interface Props {
  stats: UserStats;
}

const PERFORMANCE_DATA = [
  { date: '2026-01-01', name: 'Jan', profit: 400, accuracy: 85, vol: 120 },
  { date: '2026-01-15', name: 'Jan 15', profit: 600, accuracy: 86, vol: 140 },
  { date: '2026-02-01', name: 'Feb', profit: 1200, accuracy: 88, vol: 200 },
  { date: '2026-02-15', name: 'Feb 15', profit: 1000, accuracy: 87, vol: 180 },
  { date: '2026-03-01', name: 'Mar', profit: 900, accuracy: 92, vol: 220 },
  { date: '2026-03-15', name: 'Mar 15', profit: 1400, accuracy: 93, vol: 250 },
  { date: '2026-04-01', name: 'Apr', profit: 1800, accuracy: 94, vol: 300 },
  { date: '2026-04-15', name: 'Apr 15', profit: 2100, accuracy: 95, vol: 320 },
  { date: '2026-05-01', name: 'May', profit: 2400, accuracy: 96, vol: 400 },
  { date: '2026-05-05', name: 'May 5', profit: 2650, accuracy: 97, vol: 420 },
];

const ASSET_DISTRIBUTION = [
  { name: 'BTC/USD', value: 45, color: '#06b6d4' },
  { name: 'ETH/USD', value: 25, color: '#10b981' },
  { name: 'XAU/USD', value: 20, color: '#f59e0b' },
  { name: 'Other', value: 10, color: '#6366f1' },
];

const generatePerfData = (count: number, baseProfit: number, baseBalance: number, metric: 'profit' | 'accuracy' | 'vol', level: string) => {
  const levelMultipliers = {
    'باقة البداية الذكية': 0.8,
    'باقة الاحتراف المتقدم': 1.1,
    'باقة النخبة المؤسسية': 1.5,
    'Trial': 0.5
  };
  const multiplier = levelMultipliers[level as keyof typeof levelMultipliers] || 1;

  return Array.from({ length: count }, (_, i) => {
    const progress = i / count;
    
    // Profit curve: starts from 0 or small, trends towards current totalProfit
    const profit = Math.max(0, Math.floor(baseProfit * (0.2 + progress * 0.8) + Math.sin(i * 0.5) * (baseProfit * 0.05)));
    
    // Accuracy: trends up with level influence
    const baseAccuracy = 85 + (multiplier * 5);
    const accuracy = Math.min(99.9, baseAccuracy + Math.sin(i * 0.8) * 2 + progress * 2);
    
    // Volume: based on balance
    const vol = Math.floor((baseBalance * 0.1) + i * (baseBalance * 0.01) + Math.random() * (baseBalance * 0.02));
    
    return {
      name: `${i}:00`,
      profit: profit,
      accuracy: parseFloat(accuracy.toFixed(1)),
      vol: parseFloat((vol / 1000).toFixed(1)), // In K
    };
  });
};

const STRATEGY_DATA = (level: string) => {
  const isWhale = level === 'باقة النخبة المؤسسية';
  return [
    { name: 'Scalping (AI-Fast)', performance: isWhale ? 98 : 92, risk: 'Low', allocation: 40 },
    { name: 'Smart Arbitrage', performance: isWhale ? 94 : 88, risk: 'Minimal', allocation: 30 },
    { name: 'Trend Following', performance: isWhale ? 97 : 95, risk: 'Medium', allocation: 20 },
    { name: 'Mean Reversion', performance: isWhale ? 89 : 84, risk: 'Low', allocation: 10 },
  ];
};

export default function AIStats({ stats }: Props) {
  const [timeRange, setTimeRange] = useState<'1H' | '4H' | '1D' | '1W' | '1M'>('1D');
  const [activeMetric, setActiveMetric] = useState<'profit' | 'accuracy' | 'vol'>('profit');

  // Derive dynamic stats based on level
  const derivedStats = useMemo(() => {
    const isWhale = stats.level === 'باقة النخبة المؤسسية';
    const isPro = stats.level === 'باقة الاحتراف المتقدم';
    
    return {
      predictionAccuracy: isWhale ? '99.4%' : isPro ? '96.8%' : '94.2%',
      executionSpeed: isWhale ? '0.04ms' : isPro ? '0.08ms' : '0.12ms',
      successRate: isWhale ? '98.5%' : isPro ? '93.4%' : '88.5%',
      processingPower: isWhale ? '4.8T' : isPro ? '2.1T' : '1.2T'
    };
  }, [stats.level]);

  // Real-time chart data state
  const [realTimeData, setRealTimeData] = useState<{ time: string, trades: number, status: number }[]>([]);

  // Initialize and update real-time data
  useEffect(() => {
    // Generate initial data for the last 60 minutes
    const initialData = Array.from({ length: 60 }, (_, i) => {
      const time = new Date(Date.now() - (59 - i) * 60000);
      return {
        time: time.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        trades: Math.max(0, stats.activeTrades + Math.floor(Math.random() * 5) - 2),
        status: stats.aiStatus === 'idle' ? 0 : stats.aiStatus === 'active' ? 2 : 1
      };
    });
    setRealTimeData(initialData);

    const interval = setInterval(() => {
      setRealTimeData(prev => {
        const newData = [...prev.slice(1)];
        const now = new Date();
        newData.push({
          time: now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          trades: Math.max(0, stats.activeTrades + Math.floor(Math.random() * 3) - 1),
          status: stats.aiStatus === 'idle' ? 0 : stats.aiStatus === 'active' ? 2 : 1
        });
        return newData;
      });
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [stats.activeTrades, stats.aiStatus]);

  const filteredData = useMemo(() => {
    const counts = { '1H': 12, '4H': 24, '1D': 30, '1W': 50, '1M': 100 };
    return generatePerfData(counts[timeRange], stats.totalProfit, stats.balance, activeMetric, stats.level);
  }, [timeRange, activeMetric, stats.totalProfit, stats.balance, stats.level]);

  const metricColors = {
    profit: '#06b6d4',
    accuracy: '#10b981',
    vol: '#f59e0b'
  };

  const metricLabels = {
    profit: 'الأرباح ($)',
    accuracy: 'الدقة (%)',
    vol: 'حجم التداول'
  };

  return (
    <div className="space-y-8 pb-12" id="ai-stats-container">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <BrainCircuit className="text-cyan-400 w-7 h-7" />
            تحليلات الذكاء الاصطناعي العميقة
          </h2>
          <p className="text-neutral-500 text-xs mt-1">نظرة ثاقبة على أداء الخوارزمية وكفاءة التداول</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-white/5 p-1.5 rounded-2xl border border-white/5">
          {(['1H', '4H', '1D', '1W', '1M'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${
                timeRange === range 
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' 
                  : 'text-neutral-500 hover:text-white'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Target className="text-cyan-400" />} 
          label="دقة التنبؤ بالأسعار" 
          value={derivedStats.predictionAccuracy} 
          trend="+2.1%"
          bg="bg-cyan-500/5"
        />
        <StatCard 
          icon={<Zap className="text-amber-400" />} 
          label="سرعة تنفيذ الصفقات" 
          value={derivedStats.executionSpeed} 
          trend="أسرع بـ 15%"
          bg="bg-amber-500/5"
        />
        <StatCard 
          icon={<ShieldCheck className="text-emerald-400" />} 
          label="معدل نجاح الصفقات" 
          value={derivedStats.successRate} 
          trend="+5.4%"
          bg="bg-emerald-500/5"
        />
        <StatCard 
          icon={<Cpu className="text-purple-400" />} 
          label="القدرة المعالجة" 
          value={derivedStats.processingPower} 
          trend="عملية/ثانية"
          bg="bg-purple-500/5"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Performance Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 bg-[#0d121b] border border-white/5 p-8 rounded-[2.5rem] space-y-6 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-cyan-400" />
              <div>
                <h3 className="text-lg font-bold text-white">تحليل مؤشرات الأداء</h3>
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-0.5">مراقبة حية للمقاييس الـ 10 الأخيرة</p>
              </div>
            </div>
            
            <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
              {(['profit', 'accuracy', 'vol'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setActiveMetric(m)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all ${
                    activeMetric === m ? 'bg-white/10 text-white' : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  {m === 'profit' ? 'الربح' : m === 'accuracy' ? 'الدقة' : 'الحجم'}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-[350px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredData}>
                <defs>
                  <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={metricColors[activeMetric]} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={metricColors[activeMetric]} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#525252" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="#525252" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => activeMetric === 'profit' ? `$${val}` : `${val}`}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#0d121b] border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-xl">
                          <p className="text-[10px] text-neutral-500 font-bold mb-2 uppercase tracking-widest">{payload[0].payload.name}</p>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-8">
                              <span className="text-[11px] text-neutral-400">الربح الصافي:</span>
                              <span className="text-sm font-black text-emerald-400">${payload[0].payload.profit}</span>
                            </div>
                            <div className="flex items-center justify-between gap-8">
                              <span className="text-[11px] text-neutral-400">دقة الخوارزمية:</span>
                              <span className="text-sm font-black text-cyan-400">{payload[0].payload.accuracy}%</span>
                            </div>
                            <div className="flex items-center justify-between gap-8">
                              <span className="text-[11px] text-neutral-400">حجم التداول:</span>
                              <span className="text-sm font-black text-amber-400">{payload[0].payload.vol}K</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                  cursor={{ stroke: metricColors[activeMetric], strokeWidth: 1, strokeDasharray: '5 5' }}
                />
                <Legend iconType="circle" />
                <Area 
                  type="monotone" 
                  name={metricLabels[activeMetric]}
                  dataKey={activeMetric} 
                  stroke={metricColors[activeMetric]} 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#activeGradient)" 
                  animationDuration={1000}
                />
                <Brush 
                  dataKey="name" 
                  height={30} 
                  stroke="#ffffff10" 
                  fill="#000" 
                  gap={10}
                  travellerWidth={10}
                >
                  <AreaChart>
                    <Area dataKey={activeMetric} fill={metricColors[activeMetric]} stroke="none" fillOpacity={0.2} />
                  </AreaChart>
                </Brush>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Info Column */}
        <div className="space-y-8">
           {/* Asset Distribution */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#0d121b] border border-white/5 p-8 rounded-[2.5rem] flex flex-col items-center justify-center relative shadow-xl h-full"
          >
            <div className="text-right w-full mb-6">
               <h3 className="text-lg font-bold text-white flex items-center gap-3">
                <Activity className="text-emerald-400" />
                توزيع الأصول
              </h3>
            </div>
            
            <div className="h-[220px] w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ASSET_DISTRIBUTION}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {ASSET_DISTRIBUTION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0d121b', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="absolute flex flex-col items-center pointer-events-none">
                <span className="text-[9px] text-neutral-500 uppercase font-black tracking-widest">موثوقية</span>
                <span className="text-2xl font-bold text-white">99%</span>
              </div>
            </div>

            <div className="w-full space-y-3 mt-6">
              {ASSET_DISTRIBUTION.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[11px] text-neutral-400 font-medium">{item.name}</span>
                  </div>
                  <span className="text-[11px] text-white font-bold">{item.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Real-time Monitoring Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0d121b] border border-white/5 p-8 rounded-[3rem] relative overflow-hidden shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
              <Activity className="text-cyan-400 w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">مراقبة حية للنشاط (آخر 60 دقيقة)</h3>
              <p className="text-neutral-500 text-xs mt-0.5">تتبع عدد الصفقات النشطة وحالة معالجة الذكاء الاصطناعي في الوقت الفعلي</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">الصفقات النشطة</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">حالة الذكاء الاصطناعي</span>
            </div>
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={realTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis 
                dataKey="time" 
                fontSize={10} 
                stroke="#525252" 
                axisLine={false} 
                tickLine={false}
                interval={9}
              />
              <YAxis 
                yAxisId="left"
                fontSize={10} 
                stroke="#525252" 
                axisLine={false} 
                tickLine={false}
                domain={[0, 'dataMax + 2']}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                fontSize={10} 
                stroke="#525252" 
                axisLine={false} 
                tickLine={false}
                domain={[0, 3]}
                ticks={[0, 1, 2]}
                tickFormatter={(val) => val === 0 ? 'خامل' : val === 1 ? 'تحسين' : 'نشط'}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#0a0d14] border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-md">
                        <p className="text-[10px] text-neutral-500 font-bold mb-2">{payload[0].payload.time}</p>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-6">
                            <span className="text-[11px] text-neutral-400">الصفقات:</span>
                            <span className="text-xs font-bold text-cyan-400">{payload[0].value}</span>
                          </div>
                          <div className="flex items-center justify-between gap-6">
                            <span className="text-[11px] text-neutral-400">الحالة:</span>
                            <span className="text-xs font-bold text-purple-400">
                              {payload[1]?.value === 0 ? 'خامل (Idle)' : payload[1]?.value === 1 ? 'تحسين (Optimizing)' : 'نشط (Active)'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="trades" 
                stroke="#06b6d4" 
                strokeWidth={3} 
                dot={false}
                isAnimationActive={false}
              />
              <Line 
                yAxisId="right"
                type="stepAfter" 
                dataKey="status" 
                stroke="#a855f7" 
                strokeWidth={2} 
                strokeDasharray="5 5"
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Strategy Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           className="bg-[#0b0f17] border border-white/5 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
              <Zap className="text-indigo-400 w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">تحليل استراتيجيات التداول</h3>
              <p className="text-neutral-500 text-xs mt-0.5">توزيع رأس المال وكفاءة كل خوارزمية فرعية</p>
            </div>
          </div>

          <div className="space-y-6">
            {STRATEGY_DATA(stats.level).map((strategy) => (
              <div key={strategy.name} className="space-y-2">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-sm font-bold text-white">{strategy.name}</span>
                    <span className="text-[10px] text-neutral-500 ml-2">Risk: {strategy.risk}</span>
                  </div>
                  <span className="text-sm font-black text-indigo-400">{strategy.performance}% Success</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${strategy.performance}%` }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full"
                  />
                </div>
                <div className="flex justify-between text-[9px] text-neutral-600 font-bold uppercase tracking-wider">
                  <span>Allocation: {strategy.allocation}%</span>
                  <span>Accuracy Optimized</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#0b0f17] border border-white/5 p-8 rounded-[3rem] shadow-2xl flex flex-col justify-between"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                <BrainCircuit className="text-emerald-400 w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">الذكاء الاصطناعي التوليدي (V3.5)</h3>
                <p className="text-neutral-500 text-xs mt-0.5">إصدار النموذج الحالي وقوة المعالجة</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-center">
                <p className="text-neutral-500 text-[10px] font-bold uppercase mb-1">Model Accuracy</p>
                <p className="text-2xl font-black text-white">99.98%</p>
              </div>
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-center">
                <p className="text-neutral-500 text-[10px] font-bold uppercase mb-1">Neural Latency</p>
                <p className="text-2xl font-black text-emerald-400">0.03ms</p>
              </div>
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-center">
                <p className="text-neutral-500 text-[10px] font-bold uppercase mb-1">Data Points/Sec</p>
                <p className="text-2xl font-black text-white">4.2M</p>
              </div>
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-center">
                <p className="text-neutral-500 text-[10px] font-bold uppercase mb-1">Safety Protocols</p>
                <p className="text-2xl font-black text-cyan-400">Active</p>
              </div>
            </div>

            <div className="p-5 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
              <div className="flex items-center gap-3 mb-2">
                <ShieldCheck className="text-indigo-400 w-4 h-4" />
                <span className="text-[10px] text-white font-bold uppercase tracking-widest">ميزة الحماية العميقة</span>
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                يقوم النظام تلقائياً بتفعيل "وضع التحوط" عند اكتشاف تذبذب غير طبيعي في السيولة العالمية، مما يضمن تقليل التراجع (Drawdown) إلى أقل من 2%.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Accuracy Breakdown & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden"
        >
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px]" />
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-400/10 rounded-2xl">
                <ArrowUpRight className="text-emerald-400 w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">ثبات دقة التنبؤ</h3>
                <p className="text-neutral-500 text-xs">تحليل مدى موثوقية القرارات في ظروف السوق المتقلبة</p>
              </div>
            </div>

            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" fontSize={10} stroke="#525252" axisLine={false} tickLine={false} />
                  <YAxis hide domain={[80, 100]} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    contentStyle={{ backgroundColor: '#0d121b', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  />
                  <Bar 
                    dataKey="accuracy" 
                    fill="#10b981" 
                    radius={[8, 8, 0, 0]} 
                    barSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-start gap-4">
              <ShieldCheck className="text-emerald-400 shrink-0 w-5 h-5 mt-0.5" />
              <p className="text-[11px] text-neutral-400 leading-relaxed italic">
                رصد تحسن بنسبة 12.5% في قدرة النظام على التعامل مع 'الحركات الوهمية' بفضل وحدة المعالجة المركزية (V2.1).
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#0a0d14] border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden flex flex-col justify-center"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-400/10 rounded-2xl">
                <Filter className="text-amber-400 w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">تصفية ذكية متقدمة</h3>
                <p className="text-neutral-500 text-xs">نظام استبعاد الصفقات ذات الخطورة العالية</p>
              </div>
            </div>

            <div className="space-y-4">
               <InsightRow label="صفقات مفلترة" value="5,234" color="text-amber-400" />
               <InsightRow label="خسائر تم تجنبها" value="$241,090" color="text-emerald-400" />
               <InsightRow label="وقت تحليل السوق" value="0.003s" color="text-cyan-400" />
            </div>

            <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2">
              <Calendar size={14} />
              عرض التقرير المفصل الكامل
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function InsightRow({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5 group hover:border-white/10 transition-all">
      <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">{label}</span>
      <span className={`text-lg font-bold ${color}`}>{value}</span>
    </div>
  );
}

function StatCard({ icon, label, value, trend, bg }: { icon: React.ReactNode, label: string, value: string, trend: string, bg: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={`p-6 rounded-[2rem] border border-white/5 space-y-4 transition-all hover:bg-white/[0.04] ${bg}`}
    >
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block mb-1">{label}</span>
        <span className="text-2xl font-bold text-white block">{value}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-emerald-400 font-bold">{trend}</span>
        <span className="text-[10px] text-neutral-600">هذا الشهر</span>
      </div>
    </motion.div>
  );
}
