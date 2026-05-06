import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Settings, 
  ShieldAlert, 
  ShieldCheck,
  Clock, 
  CheckCircle2, 
  XCircle,
  Activity,
  CreditCard,
  Percent,
  Download,
  Smartphone,
  Globe,
  Terminal,
  FileText,
  User as UserIcon,
  Search,
  QrCode
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  updateDoc, 
  getDoc,
  orderBy,
  limit,
  Timestamp,
  increment,
  serverTimestamp
} from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';

const REVENUE_DATA = [
  { day: 'Sat', amount: 4200 },
  { day: 'Sun', amount: 5100 },
  { day: 'Mon', amount: 4800 },
  { day: 'Tue', amount: 7200 },
  { day: 'Wed', amount: 6500 },
  { day: 'Thu', amount: 8900 },
  { day: 'Fri', amount: 10500 },
];

const SYSTEM_LOGS = [
  { id: 1, timestamp: '2026-05-05 10:45:12', level: 'INFO', message: 'خوارزمية الذكاء الاصطناعي قامت بتحديث توقعات السوق لزوج BTC/USDT' },
  { id: 2, timestamp: '2026-05-05 10:42:05', level: 'WARNING', message: 'محاولة تسجيل دخول فاشلة متكررة من IP: 192.168.1.45' },
  { id: 3, timestamp: '2026-05-05 10:40:00', level: 'SUCCESS', message: 'تمت معالجة طلب سحب برقم W-9021 بنجاح' },
  { id: 4, timestamp: '2026-05-05 10:35:55', level: 'INFO', message: 'مستخدم جديد (زيدان محمود) قام بالتسجيل في المنصة' },
  { id: 5, timestamp: '2026-05-05 10:30:10', level: 'ERROR', message: 'فشل في الاتصال بمزود بيانات Binance API - محاولة إعادة الاتصال...' },
];

// Local Storage Keys
const STATS_KEY = 'zincotrade_v2_stats';
const TRANS_KEY = 'zincotrade_v2_trans';

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'finance' | 'settings' | 'logs'>('overview');
  const [platformWithdrawMethod, setPlatformWithdrawMethod] = useState<'bank' | 'zain' | 'asia'>('bank');
  const [platformWithdrawAmount, setPlatformWithdrawAmount] = useState('1000');
  const [platformWithdrawCard, setPlatformWithdrawCard] = useState('');
  const [realPendingTransactions, setRealPendingTransactions] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDeposits: 0,
    pendingTransactions: 0,
    platformRevenue: 84230
  });
  const [loading, setLoading] = useState(false);
  const [adminAccounts, setAdminAccounts] = useState({ zainCash: '', asiaHawala: '', bankIban: '', creditCard: '', binanceId: '' });

  useEffect(() => {
    if (!isAdmin) return;

    setLoading(true);

    // Load Admin Accounts
    const settingsRef = doc(db, 'platform_settings', 'accounts');
    const unsubscribeAccounts = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        setAdminAccounts(docSnap.data() as any);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'platform_settings/accounts');
    });

    // 1. Listen for ALL Users
    const usersUnsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAllUsers(usersData);
      setStats(prev => ({ ...prev, totalUsers: usersData.length }));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });

    // 2. Listen for ALL Transactions
    const transUnsubscribe = onSnapshot(query(collection(db, 'transactions'), orderBy('createdAt', 'desc')), (snapshot) => {
      const transData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      const pending = transData.filter((t: any) => t.status === 'pending');
      setRealPendingTransactions(pending);
      
      const completedDeps = transData.filter((t: any) => t.status === 'success' && t.type === 'deposit');
      const totalDep = completedDeps.reduce((acc: number, t: any) => acc + (t.amount || 0), 0);

      setStats(prev => ({
        ...prev,
        totalDeposits: totalDep,
        pendingTransactions: pending.length
      }));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'transactions');
    });

    // 3. Listen for Platform Stats
    const statsRef = doc(db, 'platform_settings', 'stats');
    const unsubscribeStats = onSnapshot(statsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStats(prev => ({
          ...prev,
          platformRevenue: data.platformRevenue || 84230,
          totalDeposits: data.totalDeposits || prev.totalDeposits
        }));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'platform_settings/stats');
    });

    return () => {
      usersUnsubscribe();
      transUnsubscribe();
      unsubscribeAccounts();
      unsubscribeStats();
    };
  }, [isAdmin]);

  const handleUpdateStatus = async (transaction: any, newStatus: 'completed' | 'rejected') => {
    if (!isAdmin) return;

    try {
      const transRef = doc(db, 'transactions', transaction.id);
      const targetStatus = newStatus === 'completed' ? 'success' : 'rejected';
      
      await updateDoc(transRef, {
        status: targetStatus,
        processedAt: serverTimestamp()
      });

      // If deposit is completed, update user balance
      if (newStatus === 'completed' && transaction.type === 'deposit') {
        const userRef = doc(db, 'users', transaction.userId);
        await updateDoc(userRef, {
          balance: increment(Number(transaction.amount))
        });
        
        // Update platform revenue (assume 5% commission on deposits for simulation or just add to pool)
        const settingsRef = doc(db, 'platform_settings', 'stats');
        await updateDoc(settingsRef, {
          platformRevenue: increment(Number(transaction.amount) * 0.05),
          totalDeposits: increment(Number(transaction.amount))
        }).catch(async () => {
          // If stats doc doesn't exist
          const { setDoc } = await import('firebase/firestore');
          await setDoc(settingsRef, { 
             platformRevenue: 84230 + (Number(transaction.amount) * 0.05),
             totalDeposits: Number(transaction.amount) 
          });
        });
      }

      // If withdrawal is rejected, refund the user
      if (newStatus === 'rejected' && (transaction.type === 'withdraw' || transaction.type === 'withdrawal')) {
        const userRef = doc(db, 'users', transaction.userId);
        await updateDoc(userRef, {
          balance: increment(Number(transaction.amount))
        });
      }

      alert("تم تحديث الحالة ومعالجة الرصيد للمستخدم بنجاح");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `transactions/${transaction.id}`);
    }
  };

  const handleUpdateAccounts = async () => {
    try {
      const { setDoc } = await import('firebase/firestore');
      const settingsRef = doc(db, 'platform_settings', 'accounts');
      await setDoc(settingsRef, adminAccounts, { merge: true });
      alert("تم تحديث حسابات الإيداع للمستخدمين بنجاح");
    } catch (error: any) {
      handleFirestoreError(error, OperationType.WRITE, 'platform_settings/accounts');
    }
  };

  const handlePlatformWithdraw = () => {
    const val = Number(platformWithdrawAmount);
    if (!val || val <= 0 || val > stats.platformRevenue) {
      alert("يرجى إدخال مبلغ سحب صحيح ضمن الرصيد المتاح");
      return;
    }
    if (platformWithdrawMethod === 'bank' && platformWithdrawCard.length !== 10) {
      alert("يرجى إدخال رقم البطاقة المصرفية المكون من 10 أرقام للسحب");
      return;
    }
    if ((platformWithdrawMethod === 'zain' || platformWithdrawMethod === 'asia') && (platformWithdrawCard.length !== 11)) {
        alert("يرجى إدخال رقم الهاتف المكون من 11 رقماً");
        return;
    }
    
    alert(`تم إرسال طلب سحب مبلغ $${val} بنجاح إلى ${platformWithdrawMethod === 'bank' ? 'البطاقة المصرفية' : 'المحفظة'}`);
    setStats(prev => ({ ...prev, platformRevenue: prev.platformRevenue - val }));
  };

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-700">
      {/* Admin Header and Tabs */}
      <div className="bg-[#0d121b] border border-white/5 rounded-[2.5rem] overflow-hidden">
        <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black text-white flex items-center gap-4">
               <ShieldAlert className="text-rose-500 w-9 h-9" />
               لوحة التحكم الإدارية
            </h2>
            <p className="text-neutral-500 text-sm mt-1">أهلاً بك يا مدير النظام، إحصائيات المنصة تحت تصرفك الآن.</p>
          </div>

          <div className="flex items-center gap-3">
             <div className="flex flex-col items-end mr-4">
                <span className="text-xs font-bold text-emerald-400">System: Operational</span>
                <span className="text-[10px] text-neutral-600 font-mono">V 4.0.2-STABLE</span>
             </div>
             <button 
               onClick={() => setActiveTab('finance')}
               className="px-6 py-3 bg-emerald-500 text-black font-black text-[11px] rounded-2xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
             >
               <Download size={16} />
               سحب أرباح المنصة
             </button>
             <button onClick={() => setActiveTab('settings')} className="p-4 bg-white/5 border border-white/10 rounded-2xl text-neutral-400 hover:text-white transition-all">
               <Settings size={20} />
             </button>
          </div>
        </div>

        <div className="px-8 pb-4 flex gap-4 overflow-x-auto border-t border-white/5 pt-4 bg-white/[0.01]">
          {[
            { id: 'overview', label: 'نظرة عامة', icon: Activity },
            { id: 'users', label: 'المستخدمين', icon: Users },
            { id: 'finance', label: 'المعاملات المالية', icon: DollarSign },
            { id: 'logs', label: 'سجلات النظام', icon: Terminal },
            { id: 'settings', label: 'إعدادات المنصة', icon: Settings },
            { id: 'compliance', label: 'التوافق والتحقق', icon: ShieldCheck },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' 
                  : 'text-neutral-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="إجمالي الأرباح" value={`$${stats.platformRevenue.toLocaleString()}`} change="+5.4%" isUpIcon={<DollarSign />} color="cyan" />
            <StatCard title="إجمالي الودائع" value={`$${stats.totalDeposits.toLocaleString()}`} change="+2.1%" isUpIcon={<CreditCard />} color="emerald" />
            <StatCard title="إجمالي المستخدمين" value={stats.totalUsers.toString()} change={`+${stats.totalUsers}`} isUpIcon={<Users />} color="blue" />
            <StatCard title="طلبات معلقة" value={stats.pendingTransactions.toString()} change="High" isUpIcon={<Clock />} color="rose" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-[#0d121b] border border-white/5 rounded-[2.5rem] p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-white font-bold flex items-center gap-3">
                  <Activity className="text-cyan-400" />
                  نمو أرباح المنصة (العمولات)
                </h3>
              </div>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={REVENUE_DATA}>
                    <defs>
                      <linearGradient id="adminRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#404040', fontSize: 10 }} />
                    <YAxis hide />
                    <Tooltip 
                       contentStyle={{ backgroundColor: '#0d121b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                       itemStyle={{ color: '#06b6d4' }}
                    />
                    <Area type="monotone" dataKey="amount" stroke="#06b6d4" strokeWidth={4} fillOpacity={1} fill="url(#adminRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[#0d121b] border border-white/5 rounded-[2.5rem] p-8 space-y-6">
              <h3 className="text-white font-bold flex items-center gap-3">
                  <Clock className="text-amber-400" />
                  الطلبات المعلقة ({realPendingTransactions.length})
              </h3>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {realPendingTransactions.length > 0 ? (
                    realPendingTransactions.map(w => (
                      <div key={w.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl group hover:border-white/10 transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase ${w.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
                            {w.type === 'deposit' ? 'إيداع' : 'سحب'}
                          </span>
                          <span className="text-emerald-400 font-black font-mono">${(Number(w.amount) || 0).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-white font-bold">{w.userName || w.userEmail}</p>
                        <p className="text-[10px] text-neutral-500 mb-2">{w.method} • {w.createdAt?.toDate ? w.createdAt.toDate().toLocaleString('ar-EG') : 'الآن'}</p>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleUpdateStatus(w, 'completed')}
                            className="flex-1 py-1.5 bg-emerald-500 text-black text-[9px] font-black uppercase rounded-lg hover:bg-emerald-400 transition-all"
                          >
                            موافقة
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(w, 'rejected')}
                            className="flex-1 py-1.5 bg-rose-500/10 text-rose-500 text-[9px] font-black uppercase rounded-lg border border-rose-500/20 hover:bg-rose-500 hover:text-black transition-all"
                          >
                            رفض
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 opacity-30">
                      <CheckCircle2 className="mx-auto mb-2 text-neutral-500" />
                      <p className="text-xs">لا توجد طلبات معلقة حالياً</p>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-[#0d121b] border border-white/5 rounded-[3rem] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
             <h3 className="text-white font-bold flex items-center gap-3">
                <Users className="text-blue-400" />
                إدارة جميع المستخدمين ({allUsers.length})
             </h3>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-right">
                <thead>
                  <tr className="bg-white/[0.02]">
                    <th className="px-8 py-5 text-[10px] text-neutral-500 font-bold uppercase tracking-widest">المستخدم</th>
                    <th className="px-8 py-5 text-[10px] text-neutral-500 font-bold uppercase tracking-widest">المستوى</th>
                    <th className="px-8 py-5 text-[10px] text-neutral-500 font-bold uppercase tracking-widest">الرصيد</th>
                    <th className="px-8 py-5 text-[10px] text-neutral-500 font-bold uppercase tracking-widest text-left">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {allUsers.map((user, i) => (
                    <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center text-white font-bold text-xs uppercase">
                             {(user.displayName || user.email)?.[0]}
                           </div>
                           <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-black text-white">{user.displayName || user.email?.split('@')[0] || 'مستثمر مجهول'}</p>
                                {user.emailVerified ? (
                                  <ShieldCheck size={12} className="text-emerald-500" />
                                ) : (
                                  <ShieldAlert size={12} className="text-rose-500" />
                                )}
                              </div>
                              <p className="text-[10px] text-neutral-600 font-mono tracking-tighter">{user.email}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase bg-cyan-500/10 text-cyan-400">
                          {user.level || 'باقة البداية الذكية'}
                        </span>
                      </td>
                      <td className="px-8 py-6 font-mono font-bold text-neutral-200">${(user.balance || 0).toLocaleString()}</td>
                      <td className="px-8 py-6 text-left">
                         <div className="flex items-center justify-end gap-3">
                            <button className="p-2 border border-white/5 rounded-lg text-neutral-500 hover:text-white transition-all"><Settings size={14} /></button>
                            <button className="p-2 border border-rose-500/10 rounded-lg text-rose-500 hover:bg-rose-500 hover:text-black transition-all"><XCircle size={14} /></button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        </div>
      )}

      {activeTab === 'finance' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           {/* Pending Transactions Table */}
           <div className="bg-[#0d121b] border border-white/5 rounded-[3rem] overflow-hidden">
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                 <h3 className="text-white font-bold flex items-center gap-3">
                    <DollarSign className="text-emerald-400" />
                    جميع العمليات المعلقة بالتفصيل
                 </h3>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-right">
                    <thead>
                      <tr className="bg-white/[0.02]">
                        <th className="px-6 py-4 text-[10px] text-neutral-500 font-bold uppercase">المستخدم</th>
                        <th className="px-6 py-4 text-[10px] text-neutral-500 font-bold uppercase">النوع</th>
                        <th className="px-6 py-4 text-[10px] text-neutral-500 font-bold uppercase">المبلغ</th>
                        <th className="px-6 py-4 text-[10px] text-neutral-500 font-bold uppercase">الوسيلة</th>
                        <th className="px-6 py-4 text-[10px] text-neutral-500 font-bold uppercase">المستلم/الإثبات</th>
                        <th className="px-6 py-4 text-[10px] text-neutral-500 font-bold uppercase text-center">الإجراء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {realPendingTransactions.length > 0 ? (
                        realPendingTransactions.map((w) => (
                          <tr key={w.id} className="hover:bg-white/[0.01]">
                            <td className="px-6 py-5">
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-white">{w.userName || 'Unnamed'}</span>
                                <span className="text-[10px] text-neutral-500 font-mono">{w.userEmail}</span>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase ${w.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
                                {w.type === 'deposit' ? 'إيداع' : 'سحب'}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-emerald-400 font-black font-mono">${(Number(w.amount) || 0).toLocaleString()}</td>
                            <td className="px-6 py-5 text-[10px] font-bold text-neutral-400">{w.method}</td>
                            <td className="px-6 py-5 text-[10px] font-mono text-neutral-500 break-all max-w-[240px]">
                               {w.fullName && <p className="text-white font-bold mb-1">{w.fullName}</p>}
                               {w.phone ? (
                                 <div className="space-y-1">
                                   <p className="text-cyan-400 font-black tracking-widest">{w.phone}</p>
                                   <p className="text-[9px] opacity-60">
                                     {w.method?.includes('بنكي') || w.method?.includes('Bank') ? 'رقم البطاقة (10 أرقام)' : 'رقم المحفظة'}
                                   </p>
                                 </div>
                               ) : (
                                 <div className="space-y-1">
                                   <p className="text-white font-bold">{w.cardNumber || '-'}</p>
                                   <p className="text-neutral-500">EXP: {w.expiryDate || '-'} | CVV: {w.cvv || '-'}</p>
                                 </div>
                               )}
                            </td>
                            <td className="px-6 py-5">
                               <div className="flex items-center justify-center gap-2">
                                  <button 
                                    onClick={() => handleUpdateStatus(w, 'completed')}
                                    className="p-2 bg-emerald-500 text-black rounded-lg hover:bg-emerald-400 transition-all">
                                     <CheckCircle2 size={16} />
                                  </button>
                                  <button 
                                    onClick={() => handleUpdateStatus(w, 'rejected')}
                                    className="p-2 bg-rose-500/10 text-rose-500 rounded-lg border border-rose-500/20 hover:bg-rose-500 hover:text-black transition-all">
                                     <XCircle size={16} />
                                  </button>
                               </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-20 text-center text-neutral-500 text-xs italic">لا توجد عمليات معلقة حالياً</td>
                        </tr>
                      )}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* Platform Profits Withdrawal Section */}
           <div id="platform-withdrawal" className="bg-emerald-500/5 border border-emerald-500/20 rounded-[3rem] p-10 mt-12 relative overflow-hidden">
             <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                   <div>
                      <h3 className="text-2xl font-black text-white flex items-center gap-3">
                         <Download className="text-emerald-500" />
                         سحب أرباح المنصة المجمعة
                      </h3>
                      <p className="text-neutral-400 text-sm mt-2">
                        يمكنك سحب العمولات ورسوم الأداء المحققة من تداولات المستخدمين إلى محفظتك الخاصة.
                      </p>
                   </div>
                   
                   <div className="p-6 bg-black/40 rounded-3xl border border-white/5">
                      <div className="flex justify-between items-center mb-4">
                         <span className="text-neutral-500 text-xs font-bold">الرصيد القابل للسحب (المنصة)</span>
                         <span className="text-emerald-500 font-black font-mono text-xl">$84,230.50</span>
                      </div>
                      <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                         <div className="h-full bg-emerald-500 w-[75%]" />
                      </div>
                      <p className="text-[10px] text-neutral-600 mt-3 italic">سيتم اقتطاع رسوم إرسال الشبكة من المبلغ المسحوب.</p>
                   </div>
                </div>

                <div className="bg-[#0a0d14] p-8 rounded-3xl border border-white/5 space-y-6">
                   <div className="space-y-4">
                      <label className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mr-2">وسيلة سحب المنصة</label>
                      <div className="grid grid-cols-3 gap-3">
                         {[
                           { id: 'bank', label: 'Bank Card', icon: CreditCard },
                           { id: 'zain', label: 'Zain Cash', icon: Smartphone },
                           { id: 'asia', label: 'AsiaCell', icon: Smartphone },
                         ].map((m) => (
                           <button
                             key={m.id}
                             onClick={() => setPlatformWithdrawMethod(m.id as any)}
                             className={`p-3 rounded-xl border text-[10px] font-bold transition-all flex flex-col items-center gap-2 ${
                                platformWithdrawMethod === m.id 
                                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                                  : 'bg-white/5 border-white/5 text-neutral-500 hover:text-white'
                             }`}
                           >
                             <m.icon size={14} />
                             {m.label}
                           </button>
                         ))}
                      </div>
                   </div>

                   <div className="space-y-4">
                      <div className="space-y-2">
                         <label className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mr-2">
                           {platformWithdrawMethod === 'bank' ? 'رقم البطاقة المصرفية (10 أرقام)' : 'رقم المحفظة'}
                         </label>
                         <input 
                           type="text" 
                           value={platformWithdrawCard}
                           onChange={(e) => {
                               const val = e.target.value.replace(/\D/g, '');
                               if (platformWithdrawMethod === 'bank') setPlatformWithdrawCard(val.slice(0, 10));
                               else setPlatformWithdrawCard(val.slice(0, 11));
                           }}
                           placeholder={platformWithdrawMethod === 'bank' ? '1234567890' : '07XXXXXXXXX'}
                           className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-mono font-bold outline-none focus:border-emerald-500/50 transition-all"
                         />
                      </div>

                      <div className="space-y-2">
                         <label className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mr-2">مبلغ السحب (USD)</label>
                         <input 
                           type="number" 
                           value={platformWithdrawAmount}
                           onChange={(e) => setPlatformWithdrawAmount(e.target.value)}
                           placeholder="0.00" 
                           className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-mono font-bold outline-none focus:border-emerald-500/50 transition-all"
                         />
                      </div>
                   </div>
                   
                   <button 
                     onClick={handlePlatformWithdraw}
                     className="w-full py-5 bg-emerald-500 text-black font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
                   >
                      تأكيد سحب الأموال إلى {platformWithdrawMethod === 'bank' ? 'البطاقة' : 'المحفظة'}
                   </button>
                </div>
             </div>
             <Download className="absolute -bottom-20 -right-20 w-80 h-80 text-emerald-500/5 rotate-12" />
           </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-[#0d121b] border border-white/5 rounded-[3rem] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
             <h3 className="text-white font-bold flex items-center gap-3">
                <Terminal className="text-cyan-400" />
                سجلات أحداث النظام
             </h3>
             <div className="flex gap-2">
               <button className="px-4 py-2 bg-white/5 rounded-xl text-[10px] text-neutral-400 hover:text-white transition-all">تحميل السجلات (JSON)</button>
               <button className="px-4 py-2 bg-rose-500/10 text-rose-500 rounded-xl text-[10px] font-black hover:bg-rose-500 hover:text-black transition-all">مسح السجلات القديمة</button>
             </div>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-right">
                <thead>
                  <tr className="bg-white/[0.02]">
                    <th className="px-8 py-5 text-[10px] text-neutral-500 font-bold uppercase tracking-widest">التوقيت</th>
                    <th className="px-8 py-5 text-[10px] text-neutral-500 font-bold uppercase tracking-widest">المستوى</th>
                    <th className="px-8 py-5 text-[10px] text-neutral-500 font-bold uppercase tracking-widest">الرسالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {SYSTEM_LOGS.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="px-8 py-6">
                        <span className="text-[11px] font-mono text-neutral-500">{log.timestamp}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                          log.level === 'INFO' ? 'bg-blue-500/10 text-blue-400' : 
                          log.level === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400' :
                          log.level === 'WARNING' ? 'bg-amber-500/10 text-amber-400' :
                          'bg-rose-500/10 text-rose-400'
                        }`}>
                          {log.level}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-xs text-neutral-300 group-hover:text-white transition-colors">{log.message}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-[#0d121b] border border-white/5 p-10 rounded-[3rem] space-y-8">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <ShieldAlert className="text-rose-500" />
                إعدادات حماية المنصة
              </h3>
              <p className="text-neutral-500 text-xs mt-1">إدارة القيود المالية والأمان العام للمنصة</p>
            </div>

            <div className="space-y-6">
               <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-xs font-bold text-neutral-300">الرافعة المالية القصوى</span>
                  <select className="bg-neutral-900 text-white text-xs border border-white/10 rounded-lg px-3 py-1.5 outline-none font-bold">
                    <option>1:100</option>
                    <option>1:500</option>
                    <option>1:1000</option>
                  </select>
               </div>
               <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-xs font-bold text-neutral-300">حد السحب اليومي للمبتدئين</span>
                  <input type="text" defaultValue="$1,000" className="w-24 bg-neutral-900 text-white text-xs border border-white/10 rounded-lg px-3 py-1.5 text-center font-bold" />
               </div>
               <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-xs font-bold text-neutral-300">تفعيل سحب تلقائي للبطاقات</span>
                  <div className="w-10 h-6 bg-cyan-500 rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-black rounded-full" />
                  </div>
               </div>
            </div>
            
            <button className="w-full py-4 bg-rose-500 text-black font-black uppercase tracking-widest rounded-2xl hover:bg-rose-400 transition-all shadow-lg shadow-rose-500/20">حفظ التغييرات الأمنية</button>
          </div>

          <div className="bg-[#0d121b] border border-white/5 p-10 rounded-[3rem] space-y-8 md:col-span-2">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <Smartphone className="text-emerald-500" />
                حسابات الإيداع (للمستخدمين)
              </h3>
              <p className="text-neutral-500 text-xs mt-1">المحفظة وأرقام الهواتف التي سيحول إليها المستخدمون أموالهم</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="space-y-2">
                  <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block pr-2">رقم زين كاش (ZainCash)</label>
                  <input 
                    type="text" 
                    value={adminAccounts.zainCash}
                    onChange={(e) => setAdminAccounts({...adminAccounts, zainCash: e.target.value})}
                    placeholder="078XXXXXXXX"
                    className="w-full bg-neutral-900 text-white text-sm border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-emerald-500/50" 
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block pr-2">رقم آسيا حوالة (AsiaHawala)</label>
                  <input 
                    type="text" 
                    value={adminAccounts.asiaHawala}
                    onChange={(e) => setAdminAccounts({...adminAccounts, asiaHawala: e.target.value})}
                    placeholder="077XXXXXXXX"
                    className="w-full bg-neutral-900 text-white text-sm border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-emerald-500/50" 
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block pr-2">الآيبان البنكي (Bank IBAN)</label>
                  <input 
                    type="text" 
                    value={adminAccounts.bankIban}
                    onChange={(e) => setAdminAccounts({...adminAccounts, bankIban: e.target.value})}
                    placeholder="IQXX XXXX XXXX XXXX"
                    className="w-full bg-neutral-900 text-white text-sm border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-emerald-500/50" 
                    />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block pr-2">رقم البطاقة المصرفية (Bank Card)</label>
                  <input 
                    type="text" 
                    value={adminAccounts.creditCard}
                    onChange={(e) => setAdminAccounts({...adminAccounts, creditCard: e.target.value})}
                    placeholder="7498327209"
                    className="w-full bg-neutral-900 text-white text-sm border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-emerald-500/50" 
                    />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block pr-2">معرف باينانس (Binance Pay ID)</label>
                  <input 
                    type="text" 
                    value={adminAccounts.binanceId}
                    onChange={(e) => setAdminAccounts({...adminAccounts, binanceId: e.target.value})}
                    placeholder="654321098"
                    className="w-full bg-neutral-900 text-white text-sm border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-emerald-500/50" 
                    />
               </div>
            </div>

            <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center gap-4">
              <QrCode className="text-emerald-500 shrink-0" size={24} />
              <p className="text-[11px] text-neutral-400 italic">
                <strong>ملاحظة الذكاء الاصطناعي:</strong> سيقوم النظام تلقائياً بتوليد <strong>كود QR</strong> للمستخدمين بناءً على الأرقام التي تدخلها أعلاه لتسهيل عملية المسح والتحويل الفوري.
              </p>
            </div>
            
            <button 
              onClick={handleUpdateAccounts}
              className="w-full py-4 bg-emerald-500 text-black font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
            >
              حفظ وتحديث حسابات الإيداع للمستخدمين
            </button>
          </div>
        </div>
      )}

      {activeTab === 'compliance' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="bg-[#0b0e14] border border-white/5 p-10 rounded-[3rem] relative overflow-hidden">
              <div className="relative z-10">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-cyan-500/20 rounded-2xl">
                       <Globe className="text-cyan-400 w-8 h-8" />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-white">حالة التحقق من Google</h3>
                       <p className="text-neutral-500 text-sm">اجعل منصتك معتمدة رسمياً وموثوقة لمستخدمي Google</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-6">
                       <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl">
                          <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                             <CheckCircle2 size={18} className="text-emerald-500" />
                             المتطلبات التقنية الحالية
                          </h4>
                          <ul className="space-y-4">
                             <li className="flex items-start gap-3">
                                <div className="mt-1 flex-shrink-0 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                                <div className="text-xs">
                                   <p className="text-white font-bold">تكامل Firebase Auth</p>
                                   <p className="text-neutral-500">مفعل ويعمل وفق معايير Google Identity.</p>
                                </div>
                             </li>
                             <li className="flex items-start gap-3">
                                <div className="mt-1 flex-shrink-0 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                                <div className="text-xs">
                                   <p className="text-white font-bold">سياسة الخصوصية (Privacy Policy)</p>
                                   <p className="text-neutral-500">تم إنشاء المستندات القانونية وإدراجها في شاشة الدخول.</p>
                                </div>
                             </li>
                             <li className="flex items-start gap-3">
                                <div className="mt-1 flex-shrink-0 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                                <div className="text-xs">
                                   <p className="text-white font-bold">استخدام HTTPS / SSL</p>
                                   <p className="text-neutral-500">النظام مشفر بالكامل وآمن للتوصيل الخارجي.</p>
                                </div>
                             </li>
                          </ul>
                       </div>

                       <div className="bg-rose-500/5 border border-rose-500/20 p-6 rounded-3xl">
                          <h4 className="text-rose-400 font-bold mb-4 flex items-center gap-2">
                             <Clock size={18} />
                             خطوات متبقية (تتطلب تدخل يدوي)
                          </h4>
                          <div className="space-y-4 text-xs">
                             <div className="p-4 bg-black/40 rounded-2xl border border-rose-500/10">
                                <p className="text-white font-bold mb-1">1. ربط النطاق الخاص (Custom Domain)</p>
                                <p className="text-neutral-500 leading-relaxed">جوجل لا توافق على التطبيقات التي تعمل على نطاقات الاستضافة المجانية أو المؤقتة. يجب ربط .com أو .net خاص بك.</p>
                             </div>
                             <div className="p-4 bg-black/40 rounded-2xl border border-rose-500/10">
                                <p className="text-white font-bold mb-1">2. تقديم طلب التحقق (Brand Verification)</p>
                                <p className="text-neutral-500 leading-relaxed">يجب الدخول إلى Google Cloud Console ورفع فيديو يوضح كيفية استخدام تطبيقك لبيانات المستخدم.</p>
                             </div>
                          </div>
                          <button className="w-full mt-4 py-3 bg-rose-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-rose-400 transition-all text-[10px]">
                             زيارة Google Cloud Console لمتابعة التحقق
                          </button>
                       </div>
                    </div>

                    <div className="bg-cyan-500/5 border border-cyan-500/20 p-8 rounded-[2rem]">
                       <h4 className="text-cyan-400 font-bold mb-6 flex items-center gap-2 text-lg">
                          <ShieldAlert size={20} />
                          نصائح "جوجل" للأمان
                       </h4>
                       <div className="grid grid-cols-1 gap-4">
                          {[
                             { title: 'تقليل الصلاحيات (Scopes)', desc: 'لا تطلب صلاحيات إضافية لا يحتاجها التطبيق فعلياً.' },
                             { title: 'شفافية البيانات', desc: 'أخبر المستخدمين بوضوح لماذا تجمع بياناتهم وكيف ستحميها.' },
                             { title: 'الأمان المادي', desc: 'تأكد من أن خوادمك في مناطق تدعمها Google Cloud لضمان السرعة والأمان.' },
                             { title: 'الدعم الفني', desc: 'وفر بريداً إلكترونياً للدعم الفني (Support Email) مرتبطاً بنطاقك.' },
                          ].map((item, idx) => (
                             <div key={idx} className="flex gap-4 items-center p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                                <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center font-bold text-cyan-400 text-xs">
                                   {idx + 1}
                                </div>
                                <div>
                                   <p className="text-white font-bold text-xs">{item.title}</p>
                                   <p className="text-[10px] text-neutral-500">{item.desc}</p>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
              <Globe className="absolute -bottom-20 -left-20 w-80 h-80 text-cyan-500/5 rotate-12" />
           </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, change, isUpIcon, color }: { title: string, value: string, change: string, isUpIcon: any, color: 'cyan' | 'emerald' | 'blue' | 'rose' }) {
  const colors = {
    cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    rose: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
  };

  return (
    <div className={`p-6 rounded-[2rem] border ${colors[color]} backdrop-blur-sm group hover:scale-[1.02] transition-all`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl bg-white/5`}>
          {React.cloneElement(isUpIcon, { size: 20 })}
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Revenue Stat</span>
      </div>
      <h3 className="text-neutral-500 text-xs font-bold mb-1">{title}</h3>
      <div className="flex items-end gap-3 font-mono">
        <span className="text-3xl font-black text-white">{value}</span>
        <span className="text-[10px] mb-1.5 font-bold">{change}</span>
      </div>
    </div>
  );
}
