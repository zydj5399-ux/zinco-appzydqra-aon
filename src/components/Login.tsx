import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, LogIn, ShieldCheck, Zap, Mail, ArrowRight, 
  Loader2, CheckCircle2, Lock, UserPlus, Smartphone, Hash, RefreshCcw 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { RecaptchaVerifier, ConfirmationResult } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function Login() {
  const { emailLogin, googleLogin, phoneLogin, emailSignUp, forgotPassword } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'phone'>('login');
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    setIsInIframe(window.self !== window.top);
  }, []);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (mode === 'signup' && !name)) return;
    
    setStatus('loading');
    setErrorMsg('');
    
    try {
      if (mode === 'login') {
        setStatus('loading');
        await emailLogin(email, password, rememberMe);
      } else if (mode === 'signup') {
        if (password !== confirmPassword) {
          setStatus('error');
          setErrorMsg('كلمات المرور غير متطابقة. يرجى التأكد والمحاولة مرة أخرى.');
          return;
        }
        setStatus('loading');
        await emailSignUp(email, password, name, rememberMe);
        setStatus('success'); 
      }
    } catch (error: any) {
      console.error('Login Error:', error.code, error.message);
      setStatus('error');
      
      const errorCode = error.code;
      if (errorCode === 'auth/invalid-credential') {
        setErrorMsg('البيانات غير صحيحة. يرجى التأكد من البريد وكلمة المرور.');
      } else if (errorCode === 'auth/user-not-found') {
        setErrorMsg('هذا الحساب غير موجود. يرجى التسجيل أولاً.');
      } else if (errorCode === 'auth/wrong-password') {
        setErrorMsg('كلمة المرور غير صحيحة.');
      } else if (errorCode === 'auth/email-already-in-use') {
        setErrorMsg('هذا البريد الإلكتروني مستخدم بالفعل.');
      } else if (errorCode === 'auth/invalid-email') {
        setErrorMsg('تنسيق البريد الإلكتروني غير صحيح.');
      } else if (errorCode === 'auth/weak-password') {
        setErrorMsg('كلمة المرور ضعيفة جداً (6 أحرف على الأقل).');
      } else if (errorCode === 'auth/network-request-failed') {
        setErrorMsg('خطأ في الاتصال بالشبكة. يرجى التأكد من الإنترنت.');
      } else if (errorCode === 'auth/too-many-requests') {
        setErrorMsg('تم حظر المحاولات مؤقتاً لكثرة الطلبات. حاول لاحقاً.');
      } else {
        setErrorMsg('فشلت العملية. يرجى التأكد من البيانات والمحاولة لاحقاً.');
      }
    }
  };

  const handleGoogleLogin = async () => {
    setStatus('loading');
    setErrorMsg('');
    try {
      await googleLogin();
    } catch (error: any) {
      console.error('Google Login Error:', error.code, error.message);
      setStatus('error');
      
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
        setErrorMsg('تم حظر تسجيل الدخول. يرجى فتح الموقع في متصفح خارجي (Chrome) للمتابعة.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        setErrorMsg('تم إغلاق نافذة تسجيل الدخول قبل اكتمال العملية.');
      } else if (error.code === 'auth/network-request-failed') {
        setErrorMsg('خطأ في الاتصال. يرجى التحقق من الشبكة.');
      } else {
        setErrorMsg('فشل تسجيل الدخول عبر جوجل. يرجى فتح الموقع في متصفح خارجي أو السماح بالنوافذ المنبثقة.');
      }
    }
  };

  const setupRecaptcha = () => {
    if ((window as any).recaptchaVerifier) return (window as any).recaptchaVerifier;
    
    (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible'
    });
    return (window as any).recaptchaVerifier;
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    
    setStatus('loading');
    setErrorMsg('');
    
    try {
      const appVerifier = setupRecaptcha();
      const result = await phoneLogin(phoneNumber, appVerifier);
      setConfirmationResult(result);
      setShowOtpInput(true);
      setStatus('idle');
    } catch (error: any) {
      console.error('Phone Auth Error:', error);
      setStatus('error');
      setErrorMsg('حدث خطأ أثناء إرسال الكود. تأكد من صحة الرقم (مثال: +964...) والمحاولة لاحقاً.');
      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.clear();
        (window as any).recaptchaVerifier = null;
      }
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || !confirmationResult) return;

    setStatus('loading');
    setErrorMsg('');
    try {
      await confirmationResult.confirm(verificationCode);
      // User is logged in automatically via AuthContext observer
    } catch (error: any) {
      console.error('OTP Error:', error);
      setStatus('error');
      setErrorMsg('كود التحقق غير صحيح. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setErrorMsg('');
    try {
      await new Promise(r => setTimeout(r, 1000));
      await forgotPassword(email);
      setStatus('success');
    } catch (error: any) {
      setStatus('error');
      setErrorMsg('حدث خطأ ما، يرجى المحاولة لاحقاً');
    }
  };

  return (
    <div className="h-screen bg-[#05070a] flex items-center justify-center p-6" dir="rtl">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-[#0a0d14] border border-white/5 rounded-[2.5rem] p-10 relative z-10 shadow-2xl overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {status === 'success' && mode === 'signup' ? (
            <motion.div
              key="signup-success"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6 text-center"
            >
              <div className="flex justify-center flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                  <CheckCircle2 size={32} className="text-emerald-400" />
                </div>
                <h2 className="text-2xl font-black text-white">تم إنشاء الحساب!</h2>
                <p className="text-neutral-400 text-sm mt-2 leading-relaxed">
                  تم إنشاء هويتك المشفرة بنجاح على هذا الجهاز. يمكنك الآن البدء في استخدام المنصة فوراً.
                </p>
              </div>
              <button 
                onClick={() => { setMode('login'); setStatus('idle'); }}
                className="w-full py-4 bg-cyan-500 text-black rounded-xl text-xs font-black uppercase tracking-widest hover:bg-cyan-400 transition-all"
              >
                الدخول للمنصة الآن
              </button>
            </motion.div>
          ) : mode === 'login' || mode === 'signup' || mode === 'phone' ? (
            <motion.div
              key="auth"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div id="recaptcha-container"></div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.4)] mb-4">
                  <Cpu className="w-8 h-8 text-black" />
                </div>
                <h1 className="text-2xl font-black text-white mb-1">ZINCO</h1>
                <p className="text-neutral-500 text-xs">
                  {mode === 'login' ? 'سجل دخولك لبدء التداول' : 
                   mode === 'signup' ? 'أنشئ حساباً جديداً مجاناً' : 
                   'تسجيل الدخول عبر الهاتف'}
                </p>
              </div>

              {isInIframe && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 space-y-2">
                  <p className="text-[10px] text-amber-400 font-bold leading-tight">
                    لتجربة أفضل وتجنب مشاكل تسجيل الدخول، يرجى فتح الموقع في متصفح خارجي.
                  </p>
                  <button 
                    onClick={() => window.open(window.location.href, '_blank')}
                    className="w-full py-2 bg-amber-500 text-black text-[10px] font-black rounded-lg hover:bg-amber-400 transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowRight size={14} className="rotate-180" />
                    فتح في Chrome الآن
                  </button>
                </div>
              )}

              <div className="space-y-4">
                {mode !== 'phone' && (
                  <button 
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={status === 'loading'}
                    className="w-full py-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                    المتابعة عبر جوجل
                  </button>
                )}

                {mode === 'login' && (
                  <button 
                    type="button"
                    onClick={() => setMode('phone')}
                    className="w-full py-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    <Smartphone className="w-5 h-5 text-cyan-400" />
                    الدخول عبر رقم الهاتف
                  </button>
                )}

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/5"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-bold">
                    <span className="bg-[#0a0d14] px-4 text-neutral-600">
                      {mode === 'phone' ? 'بيانات الهاتف' : 'أو عبر البريد الإلكتروني'}
                    </span>
                  </div>
                </div>

                {mode === 'phone' ? (
                  <div className="space-y-4">
                    {!showOtpInput ? (
                      <form onSubmit={handlePhoneSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mr-2">رقم الهاتف (مع رمز الدولة)</label>
                          <div className="relative">
                            <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={16} />
                            <input 
                              type="tel"
                              required
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              placeholder="+964 770 000 0000"
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 pl-12 text-white font-mono text-xs outline-none focus:border-cyan-500/50 transition-all text-left"
                            />
                          </div>
                        </div>
                        <button 
                          type="submit"
                          disabled={status === 'loading'}
                          className="w-full py-4 bg-cyan-500 text-black font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-3 hover:bg-cyan-400 transition-all active:scale-[0.98] shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                        >
                          {status === 'loading' ? <Loader2 className="animate-spin" size={18} /> : 'إرسال كود التحقق'}
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setMode('login')}
                          className="w-full text-[10px] text-neutral-500 hover:text-white font-bold"
                        >
                          العودة للطرق الأخرى
                        </button>
                      </form>
                    ) : (
                      <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mr-2">كود التحقق (OTP)</label>
                          <div className="relative">
                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={16} />
                            <input 
                              type="text"
                              required
                              value={verificationCode}
                              onChange={(e) => setVerificationCode(e.target.value)}
                              placeholder="000000"
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 pl-12 text-white font-mono text-xs outline-none focus:border-cyan-500/50 transition-all text-center tracking-[0.5em]"
                            />
                          </div>
                        </div>
                        <button 
                          type="submit"
                          disabled={status === 'loading'}
                          className="w-full py-4 bg-emerald-500 text-black font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-3 hover:bg-emerald-400 transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                        >
                          {status === 'loading' ? <Loader2 className="animate-spin" size={18} /> : 'تأكيد الرمز والدخول'}
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setShowOtpInput(false)}
                          className="w-full flex items-center justify-center gap-2 text-[10px] text-neutral-500 hover:text-white font-bold"
                        >
                          <RefreshCcw size={12} />
                          تغيير رقم الهاتف
                        </button>
                      </form>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {mode === 'signup' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-1.5"
                    >
                      <label className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mr-2">الاسم الكامل</label>
                      <div className="relative">
                        <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={16} />
                        <input 
                          type="text"
                          name="name"
                          id="name"
                          required={mode === 'signup'}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="اسم المستثمر"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 pl-12 text-white font-bold text-xs outline-none focus:border-cyan-500/50 transition-all text-right"
                        />
                      </div>
                    </motion.div>
                  )}

                  {mode === 'signup' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-1.5"
                    >
                      <label className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mr-2">رمز الإحالة (اختياري)</label>
                      <div className="relative">
                        <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/50" size={16} />
                        <input 
                          type="text"
                          name="referral"
                          id="referral"
                          value={referralCode}
                          onChange={(e) => setReferralCode(e.target.value)}
                          placeholder="مثلاً: ZINCO-2026"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 pl-12 text-white font-mono text-xs outline-none focus:border-amber-500/30 transition-all text-left"
                        />
                      </div>
                    </motion.div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mr-2">البريد الإلكتروني</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={16} />
                      <input 
                        type="email"
                        name="email"
                        id="email"
                        autoComplete="username email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@email.com"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 pl-12 text-white font-mono text-xs outline-none focus:border-cyan-500/50 transition-all text-left"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mr-2">كلمة المرور</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={16} />
                      <input 
                        type="password"
                        name="password"
                        id="password"
                        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 pl-12 text-white font-mono text-xs outline-none focus:border-cyan-500/50 transition-all text-left"
                      />
                    </div>
                  </div>

                  {mode === 'signup' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-1.5"
                    >
                      <label className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mr-2">تأكيد كلمة المرور</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={16} />
                        <input 
                          type="password"
                          name="confirmPassword"
                          id="confirmPassword"
                          autoComplete="new-password"
                          required={mode === 'signup'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 pl-12 text-white font-mono text-xs outline-none focus:border-cyan-500/50 transition-all text-left"
                        />
                      </div>
                    </motion.div>
                  )}
                  
                  <div className="flex items-center justify-between px-1">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative w-4 h-4">
                        <input 
                          type="checkbox" 
                          className="peer sr-only"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <div className="w-full h-full bg-white/5 border border-white/10 rounded peer-checked:bg-cyan-500 peer-checked:border-cyan-500 transition-all flex items-center justify-center">
                          <CheckCircle2 size={10} className="text-black scale-0 peer-checked:scale-100 transition-transform" />
                        </div>
                      </div>
                      <span className="text-[10px] text-neutral-500 font-bold group-hover:text-neutral-400 transition-colors">تذكرني</span>
                    </label>
                    <button 
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[10px] text-neutral-500 hover:text-cyan-400 font-bold transition-colors"
                    >
                      نسيت كلمة المرور؟
                    </button>
                  </div>

                {status === 'error' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                      <p className="text-[10px] text-rose-400 font-bold leading-relaxed">{errorMsg}</p>
                    </div>
                    {errorMsg.includes('متصفح خارجي') && (
                      <button 
                        type="button"
                        onClick={() => window.open(window.location.href, '_blank')}
                        className="w-full py-3 bg-white/10 text-white text-[10px] font-black rounded-xl border border-white/10 hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                      >
                        <ArrowRight size={14} className="rotate-180" />
                        فتح في متصفح Chrome مباشرة
                      </button>
                    )}
                  </div>
                )}

                  <button 
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full py-4 bg-cyan-500 text-black font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-3 hover:bg-cyan-400 transition-all active:scale-[0.98] shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                  >
                    {status === 'loading' ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <>
                        {mode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
                        {mode === 'login' ? 'دخول' : 'إنشاء حساب'}
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center px-1">
                    <button 
                      type="button"
                      onClick={() => {
                        setMode(mode === 'login' ? 'signup' : 'login');
                        setShowOtpInput(false);
                        setConfirmationResult(null);
                      }}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold transition-colors"
                    >
                      {mode === 'login' || mode === 'phone' ? 'ليس لديك حساب؟ اضغط هنا' : 'لديك حساب بالفعل؟ سجل دخولك'}
                    </button>
                  </div>
                </form>
              )}
            </div>

              <div className="pt-4 flex flex-col items-center gap-3">
                 <div className="flex items-center gap-4 text-[10px] text-neutral-600 font-bold">
                    <button type="button" className="hover:text-cyan-400 transition-colors">سياسة الخصوصية</button>
                    <div className="w-1 h-1 rounded-full bg-neutral-800" />
                    <button type="button" className="hover:text-cyan-400 transition-colors">شروط الاستخدام</button>
                 </div>
                 <div className="flex items-center gap-2 opacity-40">
                    <ShieldCheck size={12} className="text-emerald-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-white">ZincoTrade Secure Identity</span>
                 </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="forgot"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              <div>
                <button 
                  onClick={() => { setMode('login'); setStatus('idle'); }}
                  className="flex items-center gap-2 text-neutral-500 hover:text-white text-xs font-bold transition-colors mb-6 group"
                >
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  العودة لتسجيل الدخول
                </button>
                <h2 className="text-2xl font-black text-white mb-2">استعادة كلمة المرور</h2>
                <p className="text-neutral-500 text-sm">أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.</p>
              </div>

              {status === 'success' ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center space-y-4">
                  <div className="flex justify-center">
                    <CheckCircle2 size={40} className="text-emerald-400" />
                  </div>
                  <p className="text-sm font-bold text-white">تم إرسال الرابط بنجاح!</p>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    يرجى التحقق من صندوق الوارد في بريدك الإلكتروني (وتفقد ملف الرسائل غير المرغوب فيها أيضاً).
                  </p>
                  <button 
                    onClick={() => setMode('login')}
                    className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all mt-4"
                  >
                    العودة لتسجيل الدخول
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mr-2">البريد الإلكتروني</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={18} />
                      <input 
                        type="email"
                        name="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@email.com"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 pl-12 text-white font-mono text-sm outline-none focus:border-cyan-500/50 transition-all text-left"
                      />
                    </div>
                  </div>

                  {status === 'error' && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                      <p className="text-[10px] text-rose-400 font-bold leading-relaxed">{errorMsg}</p>
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full py-5 bg-cyan-500 text-black font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 hover:bg-cyan-400 transition-all active:scale-[0.98] shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status === 'loading' ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      'إرسال رابط الاستعادة'
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
