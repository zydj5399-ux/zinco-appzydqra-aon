import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wallet as WalletIcon, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  PlusCircle, 
  ShieldCheck,
  Zap,
  TrendingUp,
  Cpu,
  QrCode,
  Clock
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { UserStats, InvestmentLevel } from '../types';
import { INVESTMENT_LEVELS } from '../constants';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';

interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  method: string;
  status: 'pending' | 'success';
  createdAt: any;
}

interface Props {
  stats: UserStats;
  onWithdraw: (amount: number) => Promise<boolean>;
  onDeposit: (amount: number) => Promise<boolean | void>;
}

export default function Wallet({ stats, onWithdraw, onDeposit }: Props) {
  const { user } = useAuth();
  const [activeMode, setActiveMode] = useState<'deposit' | 'withdraw'>('deposit');
  const [paymentMethod, setPaymentMethod] = useState<'qr_deposit' | 'binance' | 'zain' | 'asia' | 'bank'>('qr_deposit');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [transactionProof, setTransactionProof] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [adminAccounts, setAdminAccounts] = useState<{zainCash?: string, asiaHawala?: string, bankIban?: string, creditCard?: string, binanceId?: string}>({
    creditCard: '',
    binanceId: ''
  });
  const [amount, setAmount] = useState<string>('100');
  const [status, setStatus] = useState<'idle' | 'confirming' | '2fa_verify' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!user) return;

    // Fetch Admin Accounts (ZainCash, AsiaHawala, etc)
    const settingsRef = doc(db, 'platform_settings', 'accounts');
    const unsubscribeSettings = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        setAdminAccounts(docSnap.data() as any);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'platform_settings/accounts');
    });

    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeTrans = onSnapshot(q, (snapshot) => {
      const transData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
      setTransactions(transData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'transactions');
    });

    return () => {
      unsubscribeSettings();
      unsubscribeTrans();
    };
  }, [user]);

  const logTransaction = async (type: 'deposit' | 'withdrawal', val: number) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || 'Unknown',
        type,
        amount: val,
        method: PAYMENT_METHODS.find(p => p.id === paymentMethod)?.name || 'Unknown',
        status: type === 'deposit' ? 'success' : 'pending',
        createdAt: serverTimestamp(),
        fullName: fullName || 'N/A',
        phone: phone || 'N/A',
        cardNumber: cardNumber ? `**** **** **** ${cardNumber.slice(-4)}` : 'N/A'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'transactions');
    }
  };

  const PAYMENT_METHODS = [
    { id: 'qr_deposit', name: 'إيداع عبر رمز QR', sub: 'مسح الكود المباشر', color: 'text-cyan-400', bg: 'bg-cyan-500/10', mode: 'deposit' },
    { id: 'binance', name: 'Binance Pay', sub: 'إيداع USDT مباشر', color: 'text-[#F3BA2F]', bg: 'bg-[#F3BA2F]/10', mode: 'deposit' },
    { id: 'zain', name: 'Zain Cash', sub: 'سحب زين كاش', color: 'text-[#ff0000]', bg: 'bg-[#ff0000]/10', mode: 'withdraw' },
    { id: 'asia', name: 'AsiaCell', sub: 'سحب آسيا حوالة', color: 'text-[#d71921]', bg: 'bg-[#d71921]/10', mode: 'withdraw' },
    { id: 'bank', name: 'Bank Account', sub: 'حساب بنكي', color: 'text-amber-500', bg: 'bg-amber-500/10', mode: 'withdraw' },
  ] as const;

  const currentLevel = INVESTMENT_LEVELS.find(l => parseFloat(amount) >= l.minAmount && parseFloat(amount) <= l.maxAmount) || INVESTMENT_LEVELS[0];

  const handleAction = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setErrorMessage(activeMode === 'deposit' ? 'يرجى إدخال مبلغ إيداع صحيح' : 'يرجى إدخال مبلغ سحب صحيح');
      setStatus('error');
      return;
    }

    if (activeMode === 'deposit' && val < 100) {
      setErrorMessage('الحد الأدنى للإيداع هو 100 دولار');
      setStatus('error');
      return;
    }

    if (activeMode === 'withdraw') {
      if (val < 10) {
        setErrorMessage('الحد الأدنى للسحب هو 10 دولارات');
        setStatus('error');
        return;
      }
      if (val > stats.balance) {
        setErrorMessage('الرصيد غير كافٍ. رصيدك المتاح: $' + stats.balance);
        setStatus('error');
        return;
      }
      if (paymentMethod === 'qr_deposit') {
         setErrorMessage('يرجى اختيار وسيلة سحب صالحة');
         setStatus('error');
         return;
      }
    }

    if (!fullName || fullName.length < 3) {
      setErrorMessage('يرجى إدخال الاسم الكامل الثلاثي');
      setStatus('error');
      return;
    }

    if (activeMode === 'deposit' && !transactionProof) {
      setErrorMessage('يرجى إدخال رقم العملية أو إثبات التحويل');
      setStatus('error');
      return;
    }

    if (activeMode === 'withdraw') {
      if (!phone) {
        setErrorMessage('يرجى إدخال رقم الهاتف أو البطاقة لاستلام المبلغ');
        setStatus('error');
        return;
      }
      
      if (paymentMethod === 'bank') {
        if (phone.length !== 10) {
          setErrorMessage('رقم البطاقة المصرفية يجب أن يتكون من 10 أرقام بالضبط');
          setStatus('error');
          return;
        }
      } else if (paymentMethod === 'zain' || paymentMethod === 'asia') {
        if (phone.length !== 11 || !phone.startsWith('07')) {
          setErrorMessage('رقم الهاتف يجب أن يتكون من 11 رقماً ويبدأ بـ 07');
          setStatus('error');
          return;
        }
      }
    }

    setStatus('confirming');
  };

  const startWithdrawFlow = () => {
    if (stats.twoFactorEnabled) {
      setStatus('2fa_verify');
      setTwoFactorCode('');
    } else {
      executeWithdraw(parseFloat(amount));
    }
  };

  const handle2FAVerification = () => {
    // In a real app, we would verify the code with the backend
    // For this demo, any 6-digit code starting with 1 to 9 will work
    if (twoFactorCode.length === 6) {
      executeWithdraw(parseFloat(amount));
    } else {
      setErrorMessage('رمز التحقق غير صحيح، يرجى إدخال 6 أرقام');
      setStatus('error');
      // Briefly show error then go back to 2FA
      setTimeout(() => setStatus('2fa_verify'), 2000);
    }
  };

  const executeDeposit = async () => {
    setStatus('processing');
    const val = parseFloat(amount);
    try {
      await addDoc(collection(db, 'transactions'), {
        userId: user?.uid,
        userEmail: user?.email,
        userName: user?.displayName || 'Unknown',
        type: 'deposit',
        amount: val,
        method: PAYMENT_METHODS.find(p => p.id === paymentMethod)?.name || 'Unknown',
        status: 'pending',
        proofId: transactionProof,
        createdAt: serverTimestamp(),
        fullName: fullName,
        phone: phone,
        processedAt: null
      });
      setStatus('success');
      setAmount('100');
      setTransactionProof('');
      setPhone('');
    } catch (error: any) {
      setErrorMessage(error.message || 'فشلت معالجة الطلب. يرجى مراجعة الدعم');
      setStatus('error');
    }
  };

  const executeWithdraw = async (val: number) => {
    setStatus('processing');
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      await logTransaction('withdrawal', val);
      const success = await onWithdraw(val);
      if (success) {
        setStatus('success');
        setAmount('100');
        setPhone('');
      } else {
        setErrorMessage('حدث خطأ أثناء معالجة الطلب. يرجى التواصل مع الدعم');
        setStatus('error');
      }
    } catch (error) {
      setErrorMessage('فشل تسجيل العملية في السجلات');
      setStatus('error');
    }
  };

  return (
    <div className="space-y-8" id="wallet-container">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <WalletIcon className="text-cyan-400 w-7 h-7" />
            المحفظة والحساب المالي
          </h2>
          <p className="text-neutral-500 text-xs mt-1">إدارة رصيدك وعمليات السحب والإيداع بكل أمان</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left balance stats */}
        <div className="space-y-4">
          <BalanceRow label="المحفظة المتاحة" value={stats.balance} sub="جاهز للتداول" color="text-white" />
          <BalanceRow label="الأرباح السنوية" value={stats.totalProfit} sub="+24% سنوي" color="text-emerald-400" />
          <BalanceRow label="المبلغ المستثمر" value={stats.totalInvested} sub="ضمن عقود ذكية" color="text-cyan-400" />
        </div>

        {/* Right main action card */}
        <motion.div 
          layout
          className="bg-[#0a0d14] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden flex flex-col gap-6"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl" />
          
          <div className="flex bg-white/5 p-1.5 rounded-2xl relative z-10 self-start">
            <button 
              onClick={() => { setActiveMode('deposit'); setPaymentMethod('qr_deposit'); setStatus('idle'); }}
              className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeMode === 'deposit' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'text-neutral-500 hover:text-white'}`}
            >
              إيداع أموال
            </button>
            <button 
              onClick={() => { setActiveMode('withdraw'); setPaymentMethod('zain'); setStatus('idle'); }}
              className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeMode === 'withdraw' ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-neutral-500 hover:text-white'}`}
            >
              سحب أرباح
            </button>
          </div>

          {/* Payment Method Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PAYMENT_METHODS.filter(p => p.mode === activeMode).map((method) => (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id as any)}
                className={`p-3 rounded-2xl border transition-all text-right flex flex-col gap-1 ${
                  paymentMethod === method.id 
                    ? 'border-cyan-500 bg-cyan-500/5' 
                    : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'
                }`}
              >
                <span className={`text-[10px] font-bold ${method.color}`}>{method.name}</span>
                <span className="text-[8px] text-neutral-500 italic">{method.sub}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center py-10 space-y-6 text-center"
              >
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
                  <CheckCircle2 size={48} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {activeMode === 'deposit' ? 'تم استلام طلب الإيداع بنجاح' : 'تم استلام طلب السحب'}
                  </h3>
                  <p className="text-neutral-400 text-xs px-10 leading-relaxed italic">
                    {activeMode === 'deposit' 
                      ? 'سيقوم فريق التدقيق بمراجعة التحويل خلال 15-30 دقيقة. ستتلقى إشعاراً فور تفعيل المبلغ في محفظتك.'
                      : 'تم توجيه طلبك لنظام الدفع السريع. سيتم التحقق من البيانات وإرسال المبلغ لمحفظتك قريباً.'}
                  </p>
                </div>

                <div className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-6 text-right space-y-4">
                    <div className="flex items-center justify-between pointer-events-none">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                         <ShieldCheck size={16} />
                      </div>
                      <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest italic">رصيد آمن وموثق</span>
                    </div>
                                        <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-[9px] text-neutral-600 block uppercase font-black">المبلغ</span>
                        <span className="text-xs text-emerald-400 font-bold font-mono">${parseFloat(amount).toLocaleString()}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] text-neutral-600 block uppercase font-black">الوسيلة</span>
                        <span className="text-xs text-white font-bold">QR مباشر</span>
                      </div>
                      <div className="space-y-1 text-left">
                        <span className="text-[9px] text-neutral-600 block uppercase font-black">الحالة</span>
                        <span className="text-xs text-amber-500 font-bold">قيد المراجعة</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <p className="text-[8px] text-neutral-600 italic">ملاحظة: هذا الإيصال تم توليده آلياً بواسطة نظام "Zinco AI" الآمن. يرجى الاحتفاظ به كمرجع للعملية.</p>
                    </div>
                </div>

                <button onClick={() => setStatus('idle')} className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-xs hover:bg-white/10 transition-all font-bold uppercase tracking-widest">إغلاق وتحديث المحفظة</button>
              </motion.div>
            ) : status === 'confirming' ? (
              <motion.div 
                key="confirming"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                  <ShieldCheck className={activeMode === 'withdraw' ? 'text-amber-400' : 'text-cyan-400'} />
                  <h3 className="text-lg font-bold text-white">
                    {activeMode === 'deposit' ? 'تأكيد تفاصيل الإيداع' : 'تأكيد طلب السحب الفوري'}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <ConfirmItem 
                    label={activeMode === 'deposit' ? 'المبلغ المودع' : 'المبلغ المراد سحبه'} 
                    value={`$${amount}`} 
                    highlight={activeMode === 'withdraw'}
                  />
                  <ConfirmItem 
                    label="وسيلة العملية" 
                    value={PAYMENT_METHODS.find(p => p.id === paymentMethod)?.name || 'Unknown'}
                    highlight={activeMode === 'deposit'}
                  />
                  <ConfirmItem 
                    label="الاسم الكامل" 
                    value={fullName} 
                  />
                  {activeMode === 'deposit' ? (
                    <>
                      <ConfirmItem label="مستوى الاستثمار" value={currentLevel.name} />
                      <ConfirmItem label="الربح المتوقع" value={`$${Math.floor(parseFloat(amount) * currentLevel.monthlyProfitRatio)}`} />
                      {transactionProof && <ConfirmItem label="رقم العملية" value={transactionProof} />}
                    </>
                  ) : (
                    <>
                      <ConfirmItem label="رقم/محفظة المستلم" value={phone} />
                      <ConfirmItem label="الرسوم" value="0.00% (مجاني)" />
                    </>
                  )}
                </div>

                <div className={`${activeMode === 'withdraw' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-cyan-500/5 border-cyan-500/20'} border p-4 rounded-2xl flex flex-col gap-3 shadow-xl`}>
                   <div className="flex items-start gap-3">
                     <AlertCircle className={`${activeMode === 'withdraw' ? 'text-amber-400' : 'text-cyan-400'} w-5 h-5 mt-0.5 shrink-0`} />
                     <div className="space-y-1">
                        <p className={`text-xs font-bold ${activeMode === 'withdraw' ? 'text-white' : 'text-cyan-400'}`}>
                          {activeMode === 'withdraw' ? 'تنبيه الأمان للسحب' : 'معلومات الاستثمار والتحقق'}
                        </p>
                        <p className="text-[11px] text-neutral-400 leading-relaxed italic">
                          {activeMode === 'withdraw' 
                            ? `أنت على وشك سحب مبلغ $${amount} إلى الحساب (${phone}). يرجى التأكد من البيانات.`
                            : `سيتم معالجة الطلب يدوياً بعد التحقق من إثبات التحويل. يرجى التأكد من دقة البيانات.`}
                        </p>
                      </div>
                    </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setStatus('idle')}
                    className="flex-1 py-4 rounded-2xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all text-xs"
                  >
                    تعديل
                  </button>
                  <button 
                    onClick={() => activeMode === 'deposit' ? executeDeposit() : startWithdrawFlow()}
                    disabled={status === 'processing'}
                    className="flex-[2] py-4 rounded-2xl bg-cyan-500 text-black font-extrabold hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 text-xs"
                  >
                    {status === 'processing' ? (
                       <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                      <>
                        <Zap size={16} />
                        تأكيد نهائي
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ) : status === '2fa_verify' ? (
              <motion.div 
                key="2fa_verify"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="space-y-6 flex flex-col items-center py-6"
              >
                <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-2">
                  <ShieldCheck size={32} />
                </div>
                <div className="text-center space-y-2">
                   <h3 className="text-xl font-bold text-white">التحقق بخطوتين مطلوب</h3>
                   <p className="text-xs text-neutral-500 px-6 italic">لحماية أموالك، يرجى إدخال رمز التحقق المكون من 6 أرقام من تطبيق الأمان الخاص بك.</p>
                </div>

                <div className="w-full space-y-4">
                  <input 
                    type="text"
                    maxLength={6}
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white text-center font-mono text-3xl tracking-[0.5em] focus:outline-none focus:border-cyan-500/50 transition-all"
                  />
                  
                  <button 
                    onClick={handle2FAVerification}
                    disabled={twoFactorCode.length !== 6}
                    className="w-full py-4 bg-cyan-500 text-black font-black rounded-2xl shadow-lg shadow-cyan-500/20 hover:brightness-110 active:scale-95 transition-all text-xs uppercase tracking-widest disabled:opacity-50"
                  >
                    تأكيد الرمز ومعالجة السحب
                  </button>

                  <button onClick={() => setStatus('confirming')} className="w-full text-neutral-500 text-[10px] hover:text-white transition-colors">إلغاء والعودة للتعديل</button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="idle"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-6"
              >
                {activeMode === 'deposit' && (
                  <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${paymentMethod === 'binance' ? 'bg-[#F3BA2F]/20' : 'bg-cyan-500/20'}`}>
                      <QrCode className={paymentMethod === 'binance' ? 'text-[#F3BA2F]' : 'text-cyan-400'} size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">
                        {paymentMethod === 'binance' ? 'إيداع عبر Binance Pay' : 'إيداع عبر رمز QR المباشر'}
                      </h4>
                      <p className="text-[10px] text-neutral-500">
                        {paymentMethod === 'binance' ? 'إيداع عملة USDT المستقرة' : 'طريقة الإيداع المعتمدة حالياً'}
                      </p>
                    </div>
                  </div>
                )}

                {activeMode === 'deposit' && (paymentMethod === 'qr_deposit' || paymentMethod === 'binance') && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`${paymentMethod === 'binance' ? 'bg-[#F3BA2F]/10 border-[#F3BA2F]/20' : 'bg-cyan-500/10 border-cyan-500/20'} border rounded-3xl p-6 flex flex-col items-center gap-6`}
                  >
                    <div className="flex flex-col items-center gap-2 text-center px-4">
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${paymentMethod === 'binance' ? 'text-[#F3BA2F]' : 'text-cyan-400'}`}>
                        {paymentMethod === 'binance' ? 'قم بمسح Binance Pay ID' : 'قم بمسح رمز QR لإرسال الاستثمار'}
                      </span>
                      {paymentMethod === 'binance' && (
                         <span className="text-xl font-black text-white font-mono bg-black/40 px-4 py-2 rounded-xl border border-white/5">
                            {adminAccounts.binanceId || '654321098'}
                         </span>
                      )}
                    </div>

                    <div className={`bg-white p-4 rounded-3xl shadow-2xl group relative lg:hover:scale-105 transition-transform duration-500 ${paymentMethod === 'binance' ? 'shadow-[#F3BA2F]/20' : 'shadow-cyan-500/20'}`}>
                      <QRCodeSVG 
                        value={paymentMethod === 'binance' ? (adminAccounts.binanceId || '654321098') : (adminAccounts.creditCard || '7498327209')} 
                        size={180}
                        level="H"
                        includeMargin={false}
                      />
                      <div className="absolute inset-0 bg-transparent group-hover:bg-black/5 transition-all rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                         <div className="bg-white p-3 rounded-full shadow-lg">
                           <QrCode size={32} className={paymentMethod === 'binance' ? 'text-[#F3BA2F]' : 'text-cyan-600'} />
                         </div>
                      </div>
                    </div>

                    <div className="text-center space-y-1">
                      <p className="text-xs text-neutral-300 font-medium">حول المبلغ المطلوب أولاً</p>
                      <p className="text-[10px] text-neutral-500 italic">ثم أدخل تفاصيل التحويل أدناه لتأكيد الإيداع</p>
                    </div>
                  </motion.div>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest pr-2">الاسم الكامل (الثلاثي)</label>
                    <input 
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="ادخل اسمك الكامل"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-sans text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
                    />
                  </div>

                  {activeMode === 'withdraw' && (
                    <div className="space-y-2">
                    <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest pr-2">
                        {paymentMethod === 'bank' ? 'رقم البطاقة المصرفية' : 'رقم الهاتف / المحفظة'}
                      </label>
                      <input 
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          if (paymentMethod === 'bank') {
                            setPhone(val.slice(0, 10));
                          } else if (paymentMethod === 'zain' || paymentMethod === 'asia') {
                            setPhone(val.slice(0, 11));
                          } else {
                            setPhone(val);
                          }
                          if (status === 'error') setStatus('idle');
                        }}
                        placeholder={paymentMethod === 'bank' ? '1234567890' : '07XXXXXXXXX'}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-mono text-xl focus:outline-none focus:border-cyan-500/50 transition-all"
                      />
                    </div>
                  )}

                  {activeMode === 'deposit' && (
                    <div className="space-y-2">
                      <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest pr-2">رقم عملية التحويل / إثبات الدفع</label>
                      <input 
                        type="text"
                        value={transactionProof}
                        onChange={(e) => setTransactionProof(e.target.value)}
                        placeholder="ادخل رقم الحوالة أو معرف المعاملة"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-mono text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between items-end pr-2">
                      <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">{activeMode === 'deposit' ? 'اختر مبلغ الإيداع' : 'أدخل مبلغ السحب'}</label>
                      <span className="text-2xl font-bold text-cyan-400 font-mono">${amount}</span>
                    </div>
                    
                    {activeMode === 'deposit' ? (
                      <div className="space-y-4">
                        <input 
                          type="range"
                          min="100"
                          max="800"
                          step="10"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full h-2 bg-white/5 rounded-full appearance-none cursor-pointer accent-cyan-500"
                        />
                        <div className="flex justify-between text-[9px] text-neutral-600 font-bold uppercase tracking-[0.2em]">
                          <span>البواية الذكية ($100+)</span>
                          <span>الاحتراف المتقدم ($400+)</span>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <input 
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-mono text-xl focus:outline-none focus:border-cyan-500/50 transition-all"
                        />
                        <button onClick={() => setAmount(stats.balance.toString())} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-cyan-500/10 text-cyan-400 rounded-lg text-[10px] font-bold border border-cyan-500/20">MAX</button>
                      </div>
                    )}
                  </div>
                </div>

                {status === 'error' && (
                  <p className="text-red-400 text-[10px] font-bold flex items-center gap-1 bg-red-500/5 p-2 rounded-lg border border-red-500/10">
                    <AlertCircle size={14} />
                    {errorMessage}
                  </p>
                )}

                <button 
                  onClick={handleAction}
                  disabled={status === 'processing'}
                  className={`w-full py-5 rounded-[1.5rem] font-bold text-sm tracking-wide transition-all shadow-xl flex items-center justify-center gap-3 ${
                    activeMode === 'deposit' 
                      ? 'bg-cyan-500 text-black hover:scale-[1.02] shadow-cyan-500/20' 
                      : 'bg-white text-black hover:scale-[1.02] shadow-white/10'
                  }`}
                >
                  {status === 'processing' ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : activeMode === 'deposit' ? <PlusCircle size={18} /> : <Send size={18} />}
                  {activeMode === 'deposit' ? 'متابعة الإيداع' : 'تأكيد السحب الفوري'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* History Grid */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-bold text-white">السجلات المالية الأخيرة</h3>
          <div className="h-[1px] flex-1 bg-white/5" />
        </div>
        <div className="bg-[#0a0d14] border border-white/5 rounded-[2.5rem] overflow-hidden divide-y divide-white/5">
            {transactions.length > 0 ? (
              transactions.map((t) => (
                <TransactionItem 
                  key={t.id}
                  type={t.type === 'deposit' ? 'deposit' : 'withdraw'} 
                  label={t.type === 'deposit' ? `إيداع عبر ${t.method}` : `سحب عبر ${t.method}`}
                  amount={Number(t.amount || 0)} 
                  date={String(t.createdAt?.toDate ? t.createdAt.toDate().toLocaleString('ar-EG') : 'الآن')} 
                  status={t.status === 'pending' ? 'قيد المراجعة' : 'مكتمل'} 
                  statusType={t.status}
                />
              ))
            ) : (
              <div className="py-20 text-center space-y-4 opacity-30">
                <Clock size={40} className="mx-auto text-neutral-500" />
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">لا توجد عمليات مسجلة حالياً</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

function BalanceRow({ label, value, sub, color }: { label: string, value: number, sub: string, color: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/[0.08] transition-colors group">
      <div>
        <span className="text-[10px] text-neutral-500 block mb-0.5">{label}</span>
        <span className={`text-lg font-bold ${color}`}>${(value || 0).toLocaleString()}</span>
      </div>
      <div className="text-right">
        <span className="text-[9px] px-2 py-1 bg-white/10 rounded-lg text-white font-bold group-hover:bg-cyan-500 group-hover:text-black transition-all">
          {sub}
        </span>
      </div>
    </div>
  );
}

const TransactionItem: React.FC<{ type: 'deposit' | 'withdraw', label: string, amount: number, date: string, status: string, statusType?: string }> = ({ type, label, amount, date, status, statusType }) => {
  return (
    <div className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
      <div className="flex items-center gap-5">
        <div className={`p-3.5 rounded-2xl transition-all ${type === 'deposit' ? 'bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20' : 'bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20'}`}>
          {type === 'deposit' ? <PlusCircle className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
        </div>
        <div>
          <span className="text-sm font-bold text-white block">{label}</span>
          <span className="text-[10px] text-neutral-500 font-mono italic">{date}</span>
        </div>
      </div>
      <div className="text-right">
        <span className={`text-sm font-bold block mb-1 ${type === 'deposit' ? 'text-emerald-400' : 'text-neutral-400'}`}>
          {type === 'deposit' ? '+' : '-'}${(amount || 0).toLocaleString()}
        </span>
        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${statusType === 'pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-white/5 text-neutral-600'}`}>
          {status}
        </span>
      </div>
    </div>
  );
}

function ConfirmItem({ label, value, highlight }: { label: string, value: string, highlight?: boolean }) {
  return (
    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
      <span className="text-[9px] text-neutral-500 block font-bold uppercase tracking-wider mb-1">{label}</span>
      <span className={`text-lg font-bold ${highlight ? 'text-cyan-400' : 'text-white'}`}>{value}</span>
    </div>
  );
}
