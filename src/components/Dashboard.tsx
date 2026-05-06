import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  Activity, 
  Target, 
  Cpu, 
  Zap, 
  Star, 
  Filter, 
  X, 
  Share2, 
  ExternalLink, 
  ShieldCheck,
  Search,
  LineChart,
  MessageSquare
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { UserStats, Trade, InvestmentLevel } from '../types';
import { INVESTMENT_LEVELS } from '../constants';

interface Props {
  stats: UserStats;
  recentTrades: Trade[];
  liveTrades?: { id: string; asset: string; type: 'buy' | 'sell'; profit: number; time: string }[];
  investAmount: number;
  setInvestAmount: (val: number) => void;
  onStartTrading: () => void;
  onStopTrading: () => void;
}

export default function Dashboard({ stats, recentTrades, liveTrades = [], investAmount, setInvestAmount, onStartTrading, onStopTrading }: Props) {
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'buy' | 'sell'>('all');

  const filteredTrades = useMemo(() => {
    return recentTrades.filter(trade => {
      const matchStatus = statusFilter === 'all' || trade.status === statusFilter;
      const matchType = typeFilter === 'all' || trade.type === typeFilter;
      return matchStatus && matchType;
    });
  }, [recentTrades, statusFilter, typeFilter]);

  const currentLevel = INVESTMENT_LEVELS.find(l => investAmount >= l.minAmount && investAmount <= l.maxAmount) || INVESTMENT_LEVELS[0];

  const colorClasses: Record<string, string> = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    neutral: 'text-neutral-400 bg-white/5 border-white/10'
  };

  const accentColors: Record<string, string> = {
    emerald: 'accent-emerald-500',
    cyan: 'accent-cyan-500',
    amber: 'accent-amber-500',
    neutral: 'accent-neutral-500'
  };
  
  const [isStarting, setIsStarting] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // Market Analysis State
  const [selectedAsset, setSelectedAsset] = useState('BTC/USDT');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fetchMarketAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysis(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Provide a brief, professional market analysis for the asset ${selectedAsset}. Include current sentiment, potential short-term movement, and one technical observation. Keep it under 100 words and focus on a "pro trader" tone. Use Arabic language.`,
      });
      setAnalysis(response.text || "عذراً، تعذر جلب التحليل في الوقت الحالي.");
    } catch (error) {
      console.error("Gemini Error:", error);
      setAnalysis("خطأ في الاتصال بنظام الذكاء الاصطناعي. تأكد من تفعيل الخدمة.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  React.useEffect(() => {
    // Detect if already running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsAppInstalled(true);
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show banner if not in iframe and not already installed
      const isInIframe = window.self !== window.top;
      if (!isInIframe) {
        setShowInstallBanner(true);
      }
      console.log('beforeinstallprompt event fired');
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    // Check if in iframe
    const isInIframe = window.self !== window.top;
    
    if (isInIframe) {
      const confirmOpen = confirm('⚠️ يجب فتح ZincoTrade AI في صفحة كاملة لتفعيل ميزة التثبيت المباشر بنجاح.\n\nهل تود الانتقال للرابط المباشر الآن؟');
      if (confirmOpen) {
        window.open(window.location.href, '_blank');
      }
      return;
    }

    if (isAppInstalled) {
      alert('✅ تطبيق ZincoTrade AI مثبت بالفعل على جهازك. يمكنك الوصول إليه من شاشتك الرئيسية.');
      return;
    }

    if (!deferredPrompt) {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      if (isIOS) {
        alert('📱 لتثبيت ZincoTrade AI على آيفون:\n1. اضغط على أيقونة "المشاركة" في المتصفح العلوي أو السفلي.\n2. ابحث عن خيار "إضافة إلى الشاشة الرئيسية" (Add to Home Screen).\n3. اضغط "إضافة" في الزاوية العلوية.');
      } else {
        alert('💡 ميزة التثبيت الآلي غير متوفرة حالياً في متصفحك.\n\nيمكنك تثبيته يدوياً:\n1. افتح قائمة المتصفح (⋮).\n2. اختر "تثبيت التطبيق" (Install App).');
      }
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsAppInstalled(true);
        setShowInstallBanner(false);
      }
    } catch (err) {
      console.error('Installation error:', err);
      alert('نعتذر، حدث خطأ غير متوقع. يرجى محاولة التثبيت يدوياً عبر إعدادات المتصفح.');
    }
  };

  const handleStartTrading = async () => {
    setIsStarting(true);
    // Simulate a brief delay for a "Secure Initialization" feel
    await new Promise(resolve => setTimeout(resolve, 2000));
    onStartTrading();
    setIsStarting(false);
  };

  const sharePlatform = async () => {
    const url = window.location.origin;
    const shareData = {
      title: 'Zinco AI - التداول الاحترافي الآمن',
      text: '📈 استثمر بذكاء مع Zinco AI.\n🔒 منصة موثوقة ونظام أمان متطور.',
      url: url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          try {
            await navigator.clipboard.writeText(url);
            alert('تم نسخ رابط المنصة المباشر بنجاح!');
          } catch (clipError) {
            console.error("Clipboard fallback failed", clipError);
          }
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        alert('تم نسخ رابط المنصة المباشر! يمكنك الآن إرساله لأي شخص.');
      } catch (clipError) {
        console.error("Clipboard failed", clipError);
      }
    }
  };

  return (
    <div className="space-y-8" id="dashboard-main">
      {/* Install Notification Banner */}
      {showInstallBanner && !isAppInstalled && (
        <motion.div 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-cyan-500 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_10px_40px_rgba(6,182,212,0.3)] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="flex items-center gap-3 relative z-10 text-center sm:text-right">
            <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center">
              <Cpu className="text-black w-6 h-6" />
            </div>
            <div>
              <h4 className="text-black font-black text-sm uppercase tracking-tight">إشعار: تطبيق ZincoTrade AI جاهز للتثبيت</h4>
              <p className="text-black/60 text-[10px] font-bold">قم بتحميل التطبيق الآن للوصول السريع وتجربة تداول بدون متصفح</p>
            </div>
          </div>
          <div className="flex items-center gap-2 relative z-10">
            <button 
              onClick={handleInstallClick}
              className="px-6 py-2 bg-black text-white font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-neutral-800 transition-all shadow-lg"
            >
              تثبيت الآن
            </button>
            <button 
              onClick={() => setShowInstallBanner(false)}
              className="p-2 text-black/40 hover:text-black transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </motion.div>
      )}

      {/* External Access / Share Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="flex items-center gap-4 text-center md:text-right">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center animate-bounce">
            <Wallet className="text-cyan-400 w-6 h-6" />
          </div>
          <div>
            <h3 className="text-white font-black text-lg uppercase tracking-tight">عداد شحن التداول الذكي</h3>
            <p className="text-neutral-500 text-xs mt-0.5 font-bold">راقب رصيدك وتحكم في استثماراتك بضغطة واحدة</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end px-4 border-r border-white/10 text-right">
             <div className="flex items-center gap-2 opacity-60">
                <ShieldCheck size={12} className="text-emerald-500" />
                <span className="text-[9px] font-black uppercase text-white tracking-widest">Environment: Secure App</span>
             </div>
             <span className="text-[8px] text-neutral-600 uppercase font-bold">ZincoTrade AI Private Network</span>
          </div>
          <div className="flex items-center gap-3">
             <button 
               onClick={handleInstallClick}
               className="px-6 py-3 bg-cyan-500 text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-cyan-400 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20"
             >
               <ExternalLink size={14} />
               تثبيت التطبيق الخارجي
             </button>
             <button 
               onClick={sharePlatform}
               className="px-6 py-3 bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all flex items-center gap-2"
             >
               <Share2 size={14} />
               مشاركة الرابط
             </button>
          </div>
        </div>
      </motion.div>

      {/* Immersive Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="رصيد الاستثمار المتاح" 
          value={`$${(stats.balance || 0).toLocaleString()}`} 
          icon={<Wallet className="text-cyan-400" />} 
          trend="جاهز للتداول" 
          positive={true}
          glowColor="cyan"
          isCounter={true}
        />
        <StatCard 
          title="صافي الأرباح التراكمية" 
          value={`$${(stats.totalProfit || 0).toLocaleString()}`} 
          icon={<TrendingUp className="text-emerald-400" />} 
          trend="+4.2%" 
          positive={true}
          glowColor="emerald"
        />
        <StatCard 
          title="أرباحك المتوقعة" 
          value={`$${(stats.monthlyProjected || 0).toLocaleString()}`} 
          icon={<Target className="text-purple-400" />} 
          subtext="لهذا الشهر"
          glowColor="purple"
        />
        <StatCard 
          title="حالة الذكاء الاصطناعي" 
          value={stats.aiStatus === 'active' ? 'قيد التشغيل' : 'خامل'} 
          icon={<Activity className={stats.aiStatus === 'active' ? 'text-cyan-400 animate-pulse' : 'text-neutral-600'} />} 
          subtext={stats.aiStatus === 'active' ? 'دقة تنفيذ 98.4%' : 'ينتظر تفعيل الرصيد'}
          glowColor={stats.aiStatus === 'active' ? 'cyan' : 'neutral'}
        />
      </div>

      {/* AI Market Hub Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#0d121b] to-black border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row gap-8 relative z-10">
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                <Search className="text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">الباحث الذكي والتحليل الفوري</h3>
                <p className="text-neutral-500 text-xs">احصل على نظرة معمقة لأي أصل مالي باستخدام ذكاء Zinco Pro</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block pr-2">اختر الأصل المالي</label>
                <select 
                  value={selectedAsset}
                  onChange={(e) => setSelectedAsset(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-purple-500/50 appearance-none cursor-pointer"
                >
                  <option value="BTC/USDT">بيتكوين (BTC)</option>
                  <option value="ETH/USDT">إيثيريوم (ETH)</option>
                  <option value="GOLD/USD">الذهب (XAU)</option>
                  <option value="CRUDE/USD">النفط الخام (WTI)</option>
                  <option value="EUR/USD">اليورو/دولار</option>
                  <option value="SOL/USDT">سولانا (SOL)</option>
                </select>
              </div>
              <div className="flex items-end">
                <button 
                  onClick={fetchMarketAnalysis}
                  disabled={isAnalyzing}
                  className="w-full sm:w-auto px-8 py-3 bg-purple-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-purple-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : (
                    <Zap size={16} />
                  )}
                  {isAnalyzing ? 'جاري التحليل...' : 'جلب التحليل الذكي'}
                </button>
              </div>
            </div>
          </div>

          <div className="md:w-1/2 min-h-[160px] bg-black/40 border border-white/5 rounded-3xl p-6 relative group overflow-hidden">
            <div className="absolute top-4 right-4 text-[8px] font-black text-purple-500/50 uppercase tracking-[0.3em]">AI Insight Engine</div>
            <AnimatePresence mode="wait">
              {analysis ? (
                <motion.div 
                  key="analysis"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-4"
                >
                  <div className="flex items-start gap-3">
                    <MessageSquare size={18} className="text-purple-400 mt-1 flex-shrink-0" />
                    <p className="text-neutral-300 text-sm leading-relaxed font-medium">
                      {analysis}
                    </p>
                  </div>
                </motion.div>
              ) : isAnalyzing ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <div className="flex gap-1">
                    {[1,2,3].map(i => (
                      <motion.div 
                        key={i}
                        animate={{ height: [8, 16, 8] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                        className="w-1 bg-purple-500/50 rounded-full"
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest">تحليل خوارزمي قيد التنفيذ...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full opacity-30 text-center grayscale group-hover:grayscale-0 transition-all">
                  <LineChart size={40} className="text-neutral-500 mb-3" />
                  <p className="text-xs text-neutral-500 font-bold">يرجى اختيار أصل مالي والضغط على زر التحليل</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main AI Trading Control */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-[#0d121b] border border-white/5 rounded-[2rem] p-8 relative overflow-hidden"
        >
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px]" />
          
          <div className="relative z-10 flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                    <Cpu className="text-black w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">بدء التداول الآلي</h3>
                    <p className="text-neutral-500 text-xs">حدد مبلغ الاستثمار ودع الذكاء الاصطناعي يتداول عنك</p>
                  </div>
                </div>
                {/* Level Badge */}
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${colorClasses[currentLevel.color]}`}>
                  {currentLevel.name}
                </div>
              </div>

              <div className="space-y-4 p-6 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-400 font-medium">مبلغ الاستثمار:</span>
                  <span className="text-2xl font-bold text-cyan-400 font-mono">${investAmount}</span>
                </div>
                
                <input 
                  type="range" 
                  min="100" 
                  max="800" 
                  step="10"
                  value={investAmount}
                  onChange={(e) => setInvestAmount(parseInt(e.target.value))}
                  className={`w-full h-2 bg-neutral-800 rounded-full appearance-none cursor-pointer ${accentColors[currentLevel.color]}`}
                />
                
                <div className="flex justify-between text-[10px] text-neutral-500 uppercase font-mono tracking-widest">
                  <span>الأساسي ($100)</span>
                  <span>المستثمر ($401+)</span>
                  <span>الأقصى ($800)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                  <span className="text-[10px] text-neutral-500 uppercase block mb-1">الربح الشهري المتوقع</span>
                  <span className="text-xl font-bold text-emerald-400">${Math.floor(investAmount * currentLevel.monthlyProfitRatio)}</span>
                </div>
                <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
                  <span className="text-[10px] text-neutral-500 uppercase block mb-1">نسبة الربح (Monthly)</span>
                  <span className="text-xl font-bold text-cyan-400">X{currentLevel.monthlyProfitRatio}</span>
                </div>
              </div>

              <button 
                onClick={stats.aiStatus === 'active' ? onStopTrading : handleStartTrading}
                disabled={isStarting}
                className={`w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  stats.aiStatus === 'active'
                    ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20' 
                    : 'bg-white text-black hover:scale-[1.02] active:scale-95 shadow-[0_10px_30px_rgba(255,255,255,0.1)]'
                }`}
              >
                {isStarting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    <span>جاري التفعيل...</span>
                  </div>
                ) : (
                  <>
                    <Zap className={stats.aiStatus === 'active' ? 'w-4 h-4 fill-rose-500' : 'w-4 h-4 fill-black'} />
                    {stats.aiStatus === 'active' ? 'إيقاف التداول الآلي' : 'تفعيل التداول الآن'}
                  </>
                )}
              </button>
            </div>

            <div className="md:w-64 space-y-4">
               <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">امتيازات {currentLevel.name}</div>
               <div className="space-y-3">
                  <FeatureItem text="تداول بنظام 24/7 بدون توقف" />
                  <FeatureItem text="إدارة مخاطر ذكية تلقائية" />
                  <FeatureItem text={`معدل ربح يصل إلى ${currentLevel.monthlyProfitRatio} أضعاف`} />
                  {currentLevel.id === 'premium' && <FeatureItem text="دعم فني متخصص وخبير تداول مخصص" />}
                  {currentLevel.id !== 'premium' && <FeatureItem text="سحب الأرباح في أي وقت" />}
               </div>
               
               <div className="mt-8 p-4 bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 rounded-xl relative overflow-hidden group">
                  <Star className="absolute -right-4 -bottom-4 w-16 h-16 text-cyan-500/5 group-hover:rotate-12 transition-transform" />
                  <p className="text-[11px] text-neutral-400 leading-relaxed italic relative z-10">
                    "نظام الذكاء الاصطناعي يقوم بتخصيص استراتيجيات تداول أكثر قوة كلما زاد مستوى استثمارك."
                  </p>
               </div>
            </div>
          </div>
        </motion.div>

        {/* Small Analytics Sidebar */}
        <div className="space-y-6">
          <div className="bg-[#0d121b] border border-white/5 rounded-[2rem] p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,1)]" />
              عمليات الأسواق العالمية (Live)
            </h3>
            <div className="divide-y divide-white/5">
              {liveTrades.length > 0 ? (
                liveTrades.map((trade) => (
                  <motion.div 
                    key={trade.id} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="py-3 flex items-center justify-between group cursor-default"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg transition-colors ${trade.type === 'buy' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                        {trade.type === 'buy' ? <ArrowUpRight className="w-4 h-4 text-emerald-400" /> : <ArrowDownRight className="w-4 h-4 text-red-400" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block uppercase">{trade.asset}</span>
                        <span className="text-[9px] text-neutral-500 font-mono italic">{trade.time} • AI Execution</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black block text-emerald-400">
                        +${trade.profit.toFixed(2)}
                      </span>
                      <span className="text-[8px] text-neutral-600 font-mono">ID: {trade.id}</span>
                    </div>
                  </motion.div>
                ))
              ) : recentTrades.length > 0 ? (
                recentTrades.map((trade) => (
                  <div key={trade.id} className="py-3 flex items-center justify-between group cursor-default">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg transition-colors ${trade.type === 'buy' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                        {trade.type === 'buy' ? <ArrowUpRight className="w-4 h-4 text-emerald-400" /> : <ArrowDownRight className="w-4 h-4 text-red-400" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">{trade.symbol}</span>
                        <span className="text-[9px] text-neutral-500 font-mono italic">{new Date(trade.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold block ${trade.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {trade.profit >= 0 ? '+' : ''}{trade.profit}%
                      </span>
                      <span className="text-[9px] text-neutral-600 font-mono">${trade.amount}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center">
                   <Activity size={24} className="mx-auto text-neutral-800 mb-2" />
                   <p className="text-[10px] text-neutral-600 font-bold uppercase">بانتظار تفعيل البوت...</p>
                </div>
              )}
            </div>
            <button className="w-full py-2 bg-white/5 border border-white/5 rounded-xl text-[10px] text-neutral-400 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest">عرض جميع العمليات</button>
          </div>

          <div className="bg-gradient-to-tr from-cyan-900/20 to-blue-900/20 border border-cyan-500/20 rounded-[2rem] p-6">
            <p className="text-xs text-cyan-400 font-bold mb-1">النمو التراكمي</p>
            <p className="text-[10px] text-neutral-400 mb-4">أرباح المستخدمين خلال الـ 24 ساعة الماضية</p>
            <div className="flex items-end gap-1.5 h-12">
               {[20, 45, 30, 65, 40, 80, 50].map((h, i) => (
                 <motion.div 
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: i * 0.1, duration: 1 }}
                  className={`flex-1 rounded-t-sm ${i === 5 ? 'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-cyan-500/20'}`}
                 />
               ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Trading Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#0d121b] border border-white/5 rounded-[2rem] p-8 space-y-6 shadow-2xl relative overflow-hidden"
        id="trading-activity-section"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative z-10">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <Activity className="text-cyan-400 w-6 h-6" />
              نشاط التداول المتقدم
            </h3>
            <p className="text-neutral-500 text-xs mt-1">قائمة العمليات الحالية والمكتملة بواسطة خوارزمية الذكاء الاصطناعي</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Status Filter */}
            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
              {(['all', 'active', 'closed'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${
                    statusFilter === s 
                      ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' 
                      : 'text-neutral-500 hover:text-white'
                  }`}
                >
                  {s === 'all' ? 'الكل' : s === 'active' ? 'نشطة' : 'مكتملة'}
                </button>
              ))}
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
              {(['all', 'buy', 'sell'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${
                    typeFilter === t 
                      ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' 
                      : 'text-neutral-500 hover:text-white'
                  }`}
                >
                  {t === 'all' ? 'الكل' : t === 'buy' ? 'شراء' : 'بيع'}
                </button>
              ))}
            </div>

            {(statusFilter !== 'all' || typeFilter !== 'all') && (
              <button 
                onClick={() => { setStatusFilter('all'); setTypeFilter('all'); }}
                className="p-2 text-neutral-500 hover:text-rose-500 transition-colors"
                title="إلغاء الفلاتر"
              >
                <X size={16} />
              </button>
            )}

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-black/40 border border-white/5 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
              <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">مراقبة حية للأسواق</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-right border-separate border-spacing-y-3">
            <thead>
              <tr className="text-[10px] text-neutral-500 uppercase tracking-widest font-black">
                <th className="pb-2 pr-6">الأصل الرقمي</th>
                <th className="pb-2 text-center">نوع العملية</th>
                <th className="pb-2">حجم الاستثمار</th>
                <th className="pb-2">سعر الدخول</th>
                <th className="pb-2">السعر الحالي</th>
                <th className="pb-2 text-center">الحالة</th>
                <th className="pb-2 text-left pl-6">صافي الربح</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrades.map((trade, idx) => (
                <motion.tr 
                  key={trade.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.05 }}
                  className="bg-white/5 hover:bg-white/[0.08] transition-all group cursor-pointer relative"
                >
                  <td className="py-5 pr-6 rounded-r-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-white/5 flex items-center justify-center font-black text-xs text-white group-hover:border-cyan-500/30 transition-colors">
                        {trade.symbol.split('/')[0]}
                      </div>
                      <div>
                        <span className="text-sm font-bold text-white block group-hover:text-cyan-400 transition-colors">{trade.symbol}</span>
                        <span className="text-[10px] text-neutral-500 font-mono flex items-center gap-1">
                          <Cpu size={10} className="text-cyan-500/50" />
                          {new Date(trade.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 text-center">
                    <div className="flex flex-col items-center">
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                        trade.type === 'buy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-500'
                        }`}>
                        {trade.type === 'buy' ? 'LONG / شراء' : 'SHORT / بيع'}
                        </span>
                    </div>
                  </td>
                  <td className="py-5">
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-neutral-200">${(trade.amount || 0).toLocaleString()}</span>
                        <span className="text-[9px] text-neutral-600 uppercase font-bold">Margin X10</span>
                    </div>
                  </td>
                  <td className="py-5">
                    <span className="text-sm font-mono text-neutral-400">${(trade.entryPrice || 0).toLocaleString()}</span>
                  </td>
                  <td className="py-5">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-white font-bold tracking-tighter">
                        ${(trade.currentPrice || 0).toLocaleString()}
                        </span>
                        {trade.currentPrice > trade.entryPrice ? (
                        <ArrowUpRight size={14} className="text-emerald-400 animate-bounce" />
                        ) : (
                        <ArrowDownRight size={14} className="text-red-400 animate-bounce" />
                        )}
                    </div>
                  </td>
                  <td className="py-5 text-center">
                    <div className="flex justify-center">
                        <div className={`px-3 py-1 rounded-full text-[9px] font-bold border ${
                            trade.status === 'active' 
                                ? 'bg-cyan-500/5 border-cyan-500/20 text-cyan-400' 
                                : 'bg-neutral-500/5 border-neutral-500/20 text-neutral-500'
                        }`}>
                            {trade.status === 'active' ? 'قيد التداول' : 'مكتملة'}
                        </div>
                    </div>
                  </td>
                  <td className="py-5 pl-6 text-left rounded-l-2xl">
                    <div className="flex flex-col items-end">
                        <span className={`text-base font-black ${trade.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {trade.profit >= 0 ? '+' : ''}{trade.profit}%
                        </span>
                        <span className={`text-[10px] font-bold ${trade.profit >= 0 ? 'text-emerald-500/50' : 'text-red-500/50'}`}>
                            ${((trade.amount * trade.profit) / 100).toFixed(2)}
                        </span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          
          {filteredTrades.length === 0 && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 text-center"
            >
              <div className="w-20 h-20 bg-white/[0.02] rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5 relative">
                <div className="absolute inset-0 bg-cyan-500/5 rounded-full blur-xl" />
                <Activity className="text-neutral-700 w-10 h-10 relative z-10" />
              </div>
              <h4 className="text-white font-bold mb-2">
                {recentTrades.length === 0 ? 'لا توجد عمليات نشطة' : 'لا توجد نتائج تطابق الفلاتر'}
              </h4>
              <p className="text-neutral-500 text-sm max-w-xs mx-auto">
                {recentTrades.length === 0 
                  ? 'قم بتفعيل نظام التداول الآلي للبدء في رؤية عمليات الذكاء الاصطناعي هنا.'
                  : 'حاول تغيير الفلاتر المحددة للبحث عن عمليات أخرى.'}
              </p>
              {recentTrades.length === 0 ? (
                <button 
                  onClick={handleStartTrading}
                  disabled={isStarting}
                  className="mt-8 px-8 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white text-xs font-bold border border-white/5 transition-all flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isStarting && <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
                  ابدأ التداول الآن
                </button>
              ) : (
                <button 
                  onClick={() => { setStatusFilter('all'); setTypeFilter('all'); }}
                  className="mt-8 px-8 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white text-xs font-bold border border-white/5 transition-all"
                >
                  إلغاء جميع الفلاتر
                </button>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 group">
      <div className="w-1 h-1 rounded-full bg-cyan-500/50 group-hover:bg-cyan-500 transition-colors" />
      <span className="text-[11px] text-neutral-400 group-hover:text-neutral-300 transition-colors">{text}</span>
    </div>
  );
}

function StatCard({ title, value, icon, trend, positive, subtext, glowColor, isCounter }: { 
  title: string, value: string, icon: React.ReactNode, trend?: string, positive?: boolean, subtext?: string, glowColor: string, isCounter?: boolean
}) {
  const glowClasses: Record<string, string> = {
    cyan: 'bg-cyan-500/5 border-cyan-500/10 shadow-[0_0_40px_rgba(6,182,212,0.05)]',
    emerald: 'bg-emerald-500/5 border-emerald-500/10 shadow-[0_0_40px_rgba(16,185,129,0.05)]',
    purple: 'bg-purple-500/5 border-purple-500/10 shadow-[0_0_40px_rgba(168,85,247,0.05)]',
    neutral: 'bg-neutral-900 border-white/5 shadow-none'
  };

  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.02 }}
      className={`relative p-6 rounded-[2rem] border transition-all group overflow-hidden ${glowClasses[glowColor]}`}
    >
      <div className="absolute -right-4 -top-4 w-20 h-20 bg-current opacity-[0.03] rounded-full blur-2xl transition-opacity group-hover:opacity-[0.08]" />
      
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] text-neutral-500 font-bold uppercase tracking-widest">{title}</span>
        <div className="p-2.5 bg-white/5 rounded-2xl transition-all group-hover:bg-white/10">
          {icon}
        </div>
      </div>
      
      <div className="space-y-1">
        <h4 className={`text-2xl font-black text-white tracking-tight leading-none ${isCounter ? 'text-3xl text-cyan-400 font-mono drop-shadow-[0_0_10px_rgba(6,182,212,0.3)]' : ''}`}>{value}</h4>
        <div className="flex items-center gap-2">
          {trend && (
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${positive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
              {trend}
            </span>
          )}
          {subtext && <span className="text-[10px] text-neutral-500 leading-none">{subtext}</span>}
        </div>
      </div>

      {isCounter && (
        <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
          <div className="flex justify-between items-center text-[9px] font-black uppercase text-neutral-500 tracking-tighter">
            <span>تحميل الطاقة الذكية</span>
            <span className="text-cyan-400 animate-pulse">92%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
             <motion.div 
               initial={{ width: '40%' }}
               animate={{ width: '92%' }}
               transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse', ease: "easeInOut" }}
               className="h-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-cyan-600 bg-[length:200%_100%] animate-gradient-x"
             />
          </div>
        </div>
      )}
    </motion.div>
  );
}
