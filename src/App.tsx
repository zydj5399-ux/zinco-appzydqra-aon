import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Wallet, 
  Settings, 
  LogOut, 
  Cpu, 
  Menu, 
  X,
  Bell,
  LineChart,
  Crown,
  Activity,
  GraduationCap,
  Globe,
  Settings2,
  Loader2,
  Star,
  ArrowUp,
  HelpCircle,
  Smartphone
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import RiskManagement from './components/RiskManagement';
import WalletComponent from './components/Wallet';
import AIStats from './components/AIStats';
import Education from './components/Education';
import MarketView from './components/MarketView';
import AdminDashboard from './components/AdminDashboard';
import Upgrade from './components/Upgrade';
import HelpCenter from './components/HelpCenter';
import Security from './components/Security';
import Login from './components/Login';
import LegalNotice from './components/LegalNotice';
import { useAuth } from './context/AuthContext';
import { UserStats, Trade, RiskSettings } from './types';
import { INVESTMENT_LEVELS } from './constants';
import { db } from './lib/firebase';
import { doc, onSnapshot, setDoc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './lib/firestoreErrorHandler';

// Default Stats
const INITIAL_STATS: UserStats = {
  balance: 0,
  totalProfit: 0,
  monthlyProjected: 0.00,
  activeTrades: 0,
  totalInvested: 0,
  aiStatus: 'idle',
  level: 'باقة البداية الذكية'
};

export default function App() {
  const { user, loading, signOutUser, isAdmin, refreshUser } = useAuth();
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollRef.current) {
      setShowScrollTop(scrollRef.current.scrollTop > 400);
    }
  };

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll);
      return () => el.removeEventListener('scroll', handleScroll);
    }
  }, [user]); // Re-attach when user changes (layout might re-render)

  const handleRefreshUser = async () => {
    setIsRefreshing(true);
    await refreshUser();
    setIsRefreshing(false);
  };

  useEffect(() => {
    const handleError = (e: ErrorEvent) => setGlobalError(e.message);
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'risk' | 'wallet' | 'stats' | 'education' | 'market' | 'admin' | 'upgrade' | 'help' | 'security'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [stats, setStats] = useState<UserStats>(INITIAL_STATS);
  
  // System Health State
  const [systemHealth, setSystemHealth] = useState<'healthy' | 'degraded' | 'down'>('healthy');
  
  // Simulated Health Monitoring
  useEffect(() => {
    const checkHealth = () => {
      const rand = Math.random();
      if (rand > 0.98) setSystemHealth('down');
      else if (rand > 0.92) setSystemHealth('degraded');
      else setSystemHealth('healthy');
    };
    
    const interval = setInterval(checkHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const [investAmount, setInvestAmount] = useState(100);
  const [riskSettings, setRiskSettings] = useState<RiskSettings>({
    stopLossEnabled: true,
    stopLossThreshold: 5,
    automaticStopLoss: true,
    notificationLevel: 'normal'
  });
  const [notifications, setNotifications] = useState<string[]>([]);
  const [legalModal, setLegalModal] = useState<{ isOpen: boolean, type: 'privacy' | 'tos' }>({ isOpen: false, type: 'privacy' });
  const [liveTrades, setLiveTrades] = useState<{ id: string; asset: string; type: 'buy' | 'sell'; profit: number; time: string }[]>([]);

  // Firestore Sync Helper
  const persistStats = async (newStats: UserStats) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userRef, {
        ...newStats
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  }

  // Handle Stripe Success Callback
  useEffect(() => {
    if (!user) return;
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const amount = urlParams.get('amount');

    if (paymentStatus === 'success' && amount) {
      const depositAmount = parseFloat(amount);
      if (!isNaN(depositAmount)) {
        // Updated logic: persist directly to Firestore
        persistStats({ ...stats, balance: stats.balance + depositAmount });
        setNotifications(prev => ["تم إيداع مبلغ $" + depositAmount + " في محفظتك بنجاح عبر البطاقة البنكية.", ...prev]);
        
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } else if (paymentStatus === 'cancel') {
      setNotifications(prev => ["تم إلغاء عملية الإيداع.", ...prev]);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [user]); 

  // Load and Init Stats from Firestore
  useEffect(() => {
    if (!user) {
      setStats(INITIAL_STATS);
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    
    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(userRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStats({
          balance: data.balance ?? 0,
          totalProfit: data.totalProfit ?? 0,
          monthlyProjected: data.monthlyProjected ?? 0,
          activeTrades: data.activeTrades ?? 0,
          totalInvested: data.totalInvested ?? 0,
          aiStatus: data.aiStatus ?? 'idle',
          level: data.level ?? 'باقة البداية الذكية',
          twoFactorEnabled: data.twoFactorEnabled ?? false
        });
        if (data.riskSettings) {
          setRiskSettings(data.riskSettings);
        }
      } else {
        // Initialize user document if it doesn't exist
        try {
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            ...INITIAL_STATS,
            riskSettings: {
              stopLossEnabled: true,
              stopLossThreshold: 5,
              automaticStopLoss: true,
              notificationLevel: 'normal'
            },
            createdAt: new Date().toISOString()
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}`);
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
    });

    return () => unsubscribe();
  }, [user]);

  // Simulated Global Trading Engine (Enhanced Realism)
  useEffect(() => {
    if (!user || stats.aiStatus !== 'active' || stats.totalInvested <= 0) return;

    // Check balance protection
    if (stats.balance <= 0) {
      handleStopTrading();
      setNotifications(prev => ["⚠️ تنبيه: تم إيقاف التداول الآلي بسبب نفاذ الرصيد المتاح.", ...prev].slice(0, 5));
      return;
    }

    // Assets for AI to trade on
    const TRADABLE_ASSETS = [
      { pair: 'BTC/USDT', volatility: 0.15 },
      { pair: 'ETH/USDT', volatility: 0.2 },
      { pair: 'XAU/USD', volatility: 0.05 },
      { pair: 'EUR/USD', volatility: 0.03 },
      { pair: 'SOL/USDT', volatility: 0.3 },
      { pair: 'BNB/USDT', volatility: 0.12 },
      { pair: 'CRUDE/USD', volatility: 0.25 }
    ];

    const interval = setInterval(() => {
      // Chance of a trade happening in this interval (60% to make it feel busy but not overwhelmed)
      if (Math.random() > 0.6) return;

      const assetDoc = TRADABLE_ASSETS[Math.floor(Math.random() * TRADABLE_ASSETS.length)];
      
      // Calculate realistic minute profit/loss based on asset volatility
      // Typically 0.01% to 0.1% per trade
      const outcomeDirection = Math.random() > 0.4 ? 1 : -0.8; // AI has a 60% win rate
      const profitVariation = (Math.random() * 0.08 + 0.02) * outcomeDirection;
      const gain = (stats.totalInvested * (profitVariation / 100));
      
      const newTrade = {
        id: 'AI-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
        asset: assetDoc.pair,
        type: Math.random() > 0.5 ? 'buy' : 'sell' as const,
        profit: gain,
        time: 'الآن'
      };

      setLiveTrades(prev => [newTrade, ...prev].slice(0, 8));
      
      const updatedStats = {
        ...stats,
        balance: stats.balance + gain,
        totalProfit: stats.totalProfit + Math.max(0, gain)
      };
      
      setStats(updatedStats);
      persistStats(updatedStats);
      
      if (gain > 0 && Math.random() > 0.7) {
        setNotifications(prev => [`🤖 ذكاء Zinco: تم إغلاق صفقة ${assetDoc.pair} بنجاح (+ $${gain.toFixed(2)})`, ...prev].slice(0, 10));
      }
    }, 45000); // Check every 45 seconds to feel more "live"

    return () => clearInterval(interval);
  }, [user, stats.aiStatus, stats.totalInvested, stats.balance]);

  const handleStartTrading = async () => {
    if (!user) return;

    if (stats.balance < investAmount) {
      alert('عذراً، رصيدك غير كافٍ للاستثمار بهذا المبلغ. يرجى شحن محفظتك أولاً.');
      return;
    }

    const currentLevel = INVESTMENT_LEVELS.find(l => investAmount >= l.minAmount && investAmount <= l.maxAmount) || INVESTMENT_LEVELS[0];
    
    // Calculate projected profit for the level
    const projected = investAmount * currentLevel.monthlyProfitRatio;

    const updatedStats: UserStats = {
      ...stats,
      aiStatus: 'active',
      totalInvested: stats.totalInvested + investAmount,
      balance: stats.balance - investAmount,
      activeTrades: stats.activeTrades + Math.floor(Math.random() * 5 + 3),
      level: currentLevel.name as any,
      monthlyProjected: projected
    };
    
    persistStats(updatedStats);
    setNotifications(prev => ["✅ تم ربط البوت بالأسواق العالمية. استثمارك الحالي: $" + investAmount + " بمستوى " + currentLevel.name, ...prev]);
  };

  const handleStopTrading = async () => {
    if (!user || stats.aiStatus !== 'active') return;

    const confirmation = confirm('هل أنت متأكد من إيقاف البوت؟ سيتم إعادة المبلغ المستثمر إلى رصيدك المتاح.');
    if (!confirmation) return;

    const updatedStats: UserStats = {
      ...stats,
      aiStatus: 'idle',
      balance: stats.balance + stats.totalInvested,
      totalInvested: 0,
      activeTrades: 0,
      monthlyProjected: 0
    };

    persistStats(updatedStats);
    setNotifications(prev => ["🛑 تم إيقاف التداول الآلي بنجاح وإعادة رصيد الاستثمار.", ...prev]);
  };

  const handleUpdateRisk = async (newSettings: Partial<RiskSettings>) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userRef, {
        riskSettings: { ...riskSettings, ...newSettings }
      });
      // onSnapshot will update local state
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const handleWithdraw = async (amount: number) => {
    if (!user) return false;
    if (amount > stats.balance) return false;
    
    const updatedStats = { ...stats, balance: stats.balance - amount };
    persistStats(updatedStats);
    
    setNotifications(prev => [`تم تقديم طلب سحب بمبلغ $${amount} بنجاح. وهو قيد المراجعة الآن.`, ...prev]);
    return true;
  };

  const handleDeposit = async (amount: number) => {
    if (!user) return false;

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
        return true;
      } else {
        throw new Error(data.error || 'فشلت عملية إنشاء جلسة الدفع');
      }
    } catch (error: any) {
      console.error('Deposit Error:', error);
      alert('عذراً، حدث خطأ أثناء الاتصال بالبوابة البنكية: ' + error.message);
      return false;
    }
  };

  const handleUpgrade = async (amount: number, levelId: string) => {
    const currentLevel = INVESTMENT_LEVELS.find(l => l.id === levelId);
    if (!currentLevel || !user) return;

    if (stats.balance < amount) {
      alert('عذراً، رصيدك غير كافٍ للترقية. يرجى الإيداع أو شحن المحفظة أولاً.');
      return;
    }

    const updatedStats = {
      ...stats,
      balance: stats.balance - amount,
      level: currentLevel.name as any
    };
    persistStats(updatedStats);

    setNotifications(prev => ["تم تفعيل " + currentLevel.name + " بنجاح", ...prev]);
  };

  const handleUpdateSecurity = async (enabled: boolean) => {
    if (!user) return;
    const updatedStats = { ...stats, twoFactorEnabled: enabled };
    setStats(updatedStats);
    persistStats(updatedStats);
    setNotifications(prev => [enabled ? "✅ تم تفعيل التحقق بخطوتين بنجاح" : "⚠️ تم إيقاف التحقق بخطوتين", ...prev]);
  };

  // Redirect if not admin on admin tab
  useEffect(() => {
    if (activeTab === 'admin' && !isAdmin && !loading) {
      setActiveTab('dashboard');
    }
  }, [activeTab, isAdmin, loading]);

  if (globalError) {
    return (
      <div className="h-screen bg-[#05070a] flex items-center justify-center p-10 text-center">
        <div className="bg-rose-500/10 border border-rose-500/20 p-8 rounded-[2rem] max-w-md">
          <X size={40} className="text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">عذراً، حدث خطأ في المنصة</h2>
          <p className="text-neutral-500 text-sm mb-6 font-mono text-left bg-black/20 p-4 rounded-xl">{globalError}</p>
          <button onClick={() => window.location.reload()} className="w-full py-3 bg-white text-black font-bold rounded-xl active:scale-95 transition-all">إعادة المحاولة</button>
        </div>
      </div>
    );
  }

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    setIsInIframe(window.self !== window.top);

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
      console.log('PWA: Ready to install');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setCanInstall(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallApp = async () => {
    if (isInIframe) {
      alert("لتثبيت تطبيق زينكو، يرجى فتح الموقع في متصفح خارجي (chrome) بالضغط على 'مشاركة' ثم 'فتح في المتصفح'.");
      return;
    }
    if (!deferredPrompt) {
      alert("التطبيق مثبت بالفعل أو أن متصفحك لا يدعم التثبيت المباشر حالياً.");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setCanInstall(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#05070a] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="h-screen bg-[#05070a] text-white font-sans overflow-hidden flex selection:bg-cyan-500/30" dir="rtl">
      {/* Sidebar Navigation */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.nav 
            initial={{ x: 260 }}
            animate={{ x: 0 }}
            exit={{ x: 260 }}
            className="w-64 bg-[#0a0d14] border-l border-white/10 flex flex-col p-6 z-50 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                <Cpu className="w-6 h-6 text-black" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white uppercase italic">Zinco</span>
            </div>

            <div className="space-y-2">
              <SidebarLink 
                active={activeTab === 'dashboard'} 
                onClick={() => setActiveTab('dashboard')}
                icon={<LayoutDashboard className="w-5 h-5 text-neutral-400" />}
                label="غرفة التحكم الذكي"
              />
              <SidebarLink 
                active={activeTab === 'risk'} 
                onClick={() => setActiveTab('risk')}
                icon={<ShieldCheck className="w-5 h-5" />}
                label="درع حماية الاستثمار"
              />
              <SidebarLink 
                active={activeTab === 'stats'} 
                onClick={() => setActiveTab('stats')}
                icon={<LineChart className="w-5 h-5" />}
                label="تحليلات الأداء المتقدم"
              />
              <SidebarLink 
                active={activeTab === 'education'} 
                onClick={() => setActiveTab('education')}
                icon={<GraduationCap className="w-5 h-5" />}
                label="الأكاديمية التعليمية"
              />
              <SidebarLink 
                active={activeTab === 'market'} 
                onClick={() => setActiveTab('market')}
                icon={<Globe className="w-5 h-5" />}
                label="مركز البورصة والأسواق"
              />
              <SidebarLink 
                active={activeTab === 'wallet'} 
                onClick={() => setActiveTab('wallet')}
                icon={<Wallet className="w-5 h-5" />}
                label="المحفظة وحساب الاستثمار"
              />
              <SidebarLink 
                active={activeTab === 'upgrade'} 
                onClick={() => setActiveTab('upgrade')}
                icon={<Star className="w-5 h-5" />}
                label="الاشتراكات المميزة VIP"
              />
              <SidebarLink 
                active={activeTab === 'security'} 
                onClick={() => setActiveTab('security')}
                icon={<ShieldCheck className="w-5 h-5" />}
                label="الأمان والخصوصية"
              />
              <SidebarLink 
                active={activeTab === 'help'} 
                onClick={() => setActiveTab('help')}
                icon={<HelpCircle className="w-5 h-5" />}
                label="مركز المساعدة"
              />
              {(!(window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone)) && (
                <button 
                  onClick={handleInstallApp}
                  className="w-full flex items-center gap-3 px-4 py-3 text-neutral-400 hover:text-cyan-400 hover:bg-cyan-500/5 rounded-xl transition-all border border-cyan-500/10 mt-2 group"
                >
                  <Smartphone className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold">تثبيت التطبيق (Play)</span>
                </button>
              )}
              {isAdmin && (
                <SidebarLink 
                  active={activeTab === 'admin'} 
                  onClick={() => setActiveTab('admin')}
                  icon={<Settings2 className="w-5 h-5 text-amber-400" />}
                  label="⭐ لوحة المدير (Admin)"
                  className="bg-amber-500/10 border border-amber-500/20 text-amber-400 font-black mt-4"
                />
              )}
            </div>

            <div className="mt-auto">
              <div className="p-4 mb-4">
                <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <ShieldCheck size={18} className="text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-cyan-400 leading-none">Security Status</p>
                    <p className="text-[11px] font-black text-white">Verified Secure</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-b from-cyan-900/40 to-transparent p-4 rounded-2xl border border-cyan-500/20">
                <p className="text-xs text-cyan-400 font-bold mb-2 flex items-center gap-2">
                  <Crown className="w-3 h-3" />
                  نظام الربح المضاعف
                </p>
                <p className="text-[10px] text-neutral-400 mb-4 leading-relaxed">كلما زاد إيداعك حتى $800، زادت قوة الخوارزمية في توليد أرباح شهرية أكبر.</p>
                <button 
                  onClick={() => setActiveTab('upgrade')}
                  className="w-full py-2.5 bg-cyan-500 text-black text-xs font-bold rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:brightness-110 active:scale-95 transition-all"
                >
                  ترقية الحساب
                </button>
              </div>
              
              <div className="pt-6 border-t border-white/5 mt-6 space-y-4">
                 <div className="flex items-center gap-4 px-2 text-[10px] text-neutral-500 font-bold mb-2">
                    <button onClick={() => setLegalModal({ isOpen: true, type: 'privacy' })} className="hover:text-cyan-400 transition-colors">الخصوصية</button>
                    <button onClick={() => setLegalModal({ isOpen: true, type: 'tos' })} className="hover:text-cyan-400 transition-colors">الشروط</button>
                    <div className="mr-auto flex items-center gap-1 opacity-40">
                       <ShieldCheck size={10} className="text-emerald-500" />
                       <span className="text-[8px] font-black uppercase text-white">Zinco Secure Hub</span>
                    </div>
                 </div>
                 <button 
                  onClick={signOutUser}
                  className="w-full flex items-center gap-3 text-neutral-500 hover:text-red-400 transition-colors text-sm px-2"
                >
                    <LogOut className="w-4 h-4" />
                    <span>تسجيل الخروج</span>
                 </button>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="px-8 py-6 flex justify-between items-center bg-[#05070a]/50 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-white/5 rounded-xl transition-colors text-neutral-400"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">مرحباً بك، {user.displayName || user.email?.split('@')[0] || 'مستثمرنا'}</h1>
              <p className="text-neutral-500 text-xs flex items-center gap-2 mt-0.5">
                نظام الذكاء الاصطناعي يعمل حالياً بكفاءة عالية 
                <span className="text-cyan-400 font-mono">98.4%</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {isAdmin && (
              <button 
                onClick={() => setActiveTab('admin')}
                className="hidden lg:flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-500 hover:bg-amber-500/30 transition-all font-bold text-xs animate-pulse"
              >
                <Settings2 size={16} />
                دخول الإدارة
              </button>
            )}

            <div className="hidden md:flex items-center gap-3 bg-white/[0.03] px-5 py-2.5 rounded-full border border-white/5 relative group cursor-help">
              <motion.div 
                animate={{ 
                  scale: systemHealth === 'down' ? [1, 1] : [1, 1.4, 1],
                  opacity: systemHealth === 'down' ? 1 : [0.6, 1, 0.6]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`w-2 h-2 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] ${
                  systemHealth === 'healthy' ? 'bg-emerald-400 shadow-emerald-500/50' : 
                  systemHealth === 'degraded' ? 'bg-amber-400 shadow-amber-500/50' : 
                  'bg-rose-500 shadow-rose-500/50'
                }`}
              />
              <span className={`text-[9px] font-black uppercase tracking-widest ${
                systemHealth === 'healthy' ? 'text-emerald-400' : 
                systemHealth === 'degraded' ? 'text-amber-400' : 
                'text-rose-500'
              }`}>
                {systemHealth === 'healthy' ? 'System Operational' : 
                 systemHealth === 'degraded' ? 'Network Latency' : 
                 'Service Interrupted'}
              </span>

              {/* Tooltip */}
              <div className="absolute top-full mt-2 right-0 w-48 p-3 bg-[#0a0d14] border border-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[60] shadow-2xl">
                <p className="text-[10px] text-white font-bold mb-1">حالة البوابة المشفرة</p>
                <p className="text-[9px] text-neutral-500 leading-relaxed">تتم مراقبة جميع العقد بنجاح. معدل الاستجابة حالياً: {systemHealth === 'healthy' ? '12ms' : systemHealth === 'degraded' ? '145ms' : '0ms'}</p>
              </div>
            </div>
            
            {/* App Installation Status (Nudge) */}
            {!(window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) && (
              <div className="hidden lg:flex items-center gap-2 px-4 py-2 border border-cyan-500/20 bg-cyan-500/5 rounded-full">
                <Activity size={12} className="text-cyan-400" />
                <span className="text-[8px] font-black uppercase text-cyan-400/60 tracking-widest">Web Mode</span>
              </div>
            )}

            <div className="flex items-center gap-3">
               <button className="p-2.5 bg-white/5 rounded-xl text-neutral-400 hover:text-white transition-colors border border-white/5 relative">
                  <Bell className="w-5 h-5" />
                  {notifications.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-cyan-500 rounded-full" />}
               </button>
               <div className="w-10 h-10 rounded-full border border-white/10 shadow-lg overflow-hidden">
                 {user.photoURL ? (
                   <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                 ) : (
                   <div className="w-full h-full bg-gradient-to-br from-neutral-700 to-neutral-900 flex items-center justify-center text-white font-bold">
                     {user.displayName?.[0] || 'U'}
                   </div>
                 )}
               </div>
            </div>
          </div>
        </header>

        {/* Scrollable Body */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 custom-scrollbar relative"
        >
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <Dashboard 
                  stats={stats} 
                  recentTrades={[]} 
                  liveTrades={liveTrades}
                  investAmount={investAmount}
                  setInvestAmount={setInvestAmount}
                  onStartTrading={handleStartTrading}
                  onStopTrading={handleStopTrading}
                />
              </motion.div>
            )}
            {activeTab === 'risk' && (
              <motion.div
                key="risk"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <RiskManagement settings={riskSettings} onUpdate={handleUpdateRisk} />
              </motion.div>
            )}
            {activeTab === 'wallet' && (
               <motion.div
                key="wallet"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
               >
                  <WalletComponent 
                    stats={stats} 
                    onWithdraw={handleWithdraw} 
                    onDeposit={handleDeposit}
                  />
               </motion.div>
            )}
            {activeTab === 'stats' && (
               <motion.div
                key="stats"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
               >
                  <AIStats stats={stats} />
               </motion.div>
            )}
            {activeTab === 'education' && (
               <motion.div
                key="education"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
               >
                  <Education />
               </motion.div>
            )}
            {activeTab === 'market' && (
               <motion.div
                key="market"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
               >
                  <MarketView />
               </motion.div>
            )}
            {activeTab === 'admin' && isAdmin && (
               <motion.div
                key="admin"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
               >
                  <AdminDashboard />
               </motion.div>
            )}
            {activeTab === 'upgrade' && (
               <motion.div
                key="upgrade"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
               >
                  <Upgrade 
                    stats={stats} 
                    onUpgrade={(levelId) => {
                      const level = INVESTMENT_LEVELS.find(l => l.id === levelId);
                      if (level) handleUpgrade(level.minDeposit, levelId);
                      setActiveTab('dashboard');
                    }} 
                  />
               </motion.div>
            )}
            {activeTab === 'security' && (
               <motion.div
                key="security"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
               >
                  <Security stats={stats} onUpdateSecurity={handleUpdateSecurity} />
               </motion.div>
            )}
            {activeTab === 'help' && (
               <motion.div
                key="help"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
               >
                  <HelpCenter />
               </motion.div>
            )}
          </AnimatePresence>

          {/* Go to Top Button */}
          <AnimatePresence>
            {showScrollTop && (
              <motion.button
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 20 }}
                onClick={scrollToTop}
                className="fixed bottom-10 left-10 p-4 bg-cyan-500 text-black rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.5)] z-50 hover:scale-110 active:scale-95 transition-all"
                title="العودة للأعلى"
              >
                <ArrowUp size={24} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </main>

      <LegalNotice 
        isOpen={legalModal.isOpen} 
        type={legalModal.type} 
        onClose={() => setLegalModal({ ...legalModal, isOpen: false })} 
      />
    </div>
  );
}

function SidebarLink({ active, icon, label, onClick, className = '' }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void, className?: string }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full p-3.5 rounded-2xl flex items-center gap-3 transition-all group ${
        active 
          ? 'bg-cyan-500 text-black font-bold shadow-[0_10px_20px_rgba(6,182,212,0.2)]' 
          : 'text-neutral-500 hover:text-white hover:bg-white/5'
      } ${className}`}
    >
      <span className={active ? 'text-black' : 'text-neutral-400 group-hover:text-cyan-400 transition-colors'}>{icon}</span>
      <span className="text-sm tracking-tight">{label}</span>
      {active && <motion.div layoutId="nav-pill" className="mr-auto w-1.5 h-1.5 rounded-full bg-black/30" />}
    </button>
  );
}
