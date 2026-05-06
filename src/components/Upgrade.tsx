import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Zap, Crown, Check, ArrowRight, Star } from 'lucide-react';
import { INVESTMENT_LEVELS } from '../constants';
import { UserStats } from '../types';

interface UpgradeProps {
  stats: UserStats;
  onUpgrade: (levelId: string) => void;
}

export default function Upgrade({ stats, onUpgrade }: UpgradeProps) {
  return (
    <div className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="text-center space-y-4 pt-8">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 mb-4"
        >
          <Star className="text-cyan-400 w-6 h-6 fill-cyan-400" />
        </motion.div>
        <h2 className="text-4xl font-black text-white tracking-tight">ارتقِ بتداولاتك لمستوى جديد</h2>
        <p className="text-neutral-500 max-w-xl mx-auto text-sm leading-relaxed">
          اختر المستوى الذي يناسب طموحاتك الاستثمارية. كلما ارتفع مستواك، زادت قوة خوارزميات الذكاء الاصطناعي وانخفضت العمولات.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        {INVESTMENT_LEVELS.map((level, idx) => {
          const isCurrent = stats.level === level.name;
          const isPro = level.id === 'pro';
          const isWhale = level.id === 'whale';

          return (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative bg-[#0d121b] border rounded-[3rem] p-10 flex flex-col transition-all duration-500 group ${
                isCurrent 
                  ? 'border-cyan-500/50 shadow-2xl shadow-cyan-500/10' 
                  : isPro 
                    ? 'border-white/10 hover:border-cyan-500/30' 
                    : 'border-white/5 hover:border-amber-500/30'
              }`}
            >
              {isPro && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cyan-500 text-black text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-cyan-500/20">
                  الأكثر طلباً
                </div>
              )}
              {isWhale && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-amber-500/20">
                  باقة النخبة
                </div>
              )}

              <div className="mb-8">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-inner ${
                  idx === 0 ? 'bg-neutral-800' : idx === 1 ? 'bg-cyan-500/20' : 'bg-amber-500/20'
                }`}>
                  {idx === 0 && <Zap className="text-neutral-400" />}
                  {idx === 1 && <ShieldCheck className="text-cyan-400" />}
                  {idx === 2 && <Crown className="text-amber-400" />}
                </div>
                <h3 className="text-2xl font-black text-white mb-2">{level.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">${level.minDeposit}</span>
                  <span className="text-neutral-500 text-xs">كأدنى رصيد</span>
                </div>
              </div>

              <div className="space-y-5 mb-12 flex-1">
                <div className="flex items-center gap-3 text-sm text-neutral-400">
                  <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                    <Check size={12} className="text-emerald-400" />
                  </div>
                  <span>الربح المتوقع: <b className="text-white">{level.expectedMonthlyReturn}</b></span>
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-400">
                  <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                    <Check size={12} className="text-emerald-400" />
                  </div>
                  <span>الدعم الفني: <b className="text-white">{level.support}</b></span>
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-400">
                  <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                    <Check size={12} className="text-emerald-400" />
                  </div>
                  <span>تداولات متزامنة: <b className="text-white">{level.maxActiveTrades}</b></span>
                </div>
                {idx > 0 && (
                  <div className="flex items-center gap-3 text-sm text-neutral-400">
                    <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                      <Check size={12} className="text-cyan-400" />
                    </div>
                    <span>تحليل متقدم بالذكاء الاصطناعي</span>
                  </div>
                )}
                {idx === 2 && (
                  <div className="flex items-center gap-3 text-sm text-neutral-400">
                    <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                      <Check size={12} className="text-amber-400" />
                    </div>
                    <span>مدير حساب خاص (VIP)</span>
                  </div>
                )}
              </div>

              <button
                disabled={isCurrent}
                onClick={() => onUpgrade(level.id)}
                className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all flex items-center justify-center gap-3 active:scale-[0.98] ${
                  isCurrent 
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default' 
                    : isPro 
                      ? 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-xl shadow-cyan-500/20' 
                      : 'bg-white text-black hover:bg-neutral-200 shadow-xl shadow-white/10'
                }`}
              >
                {isCurrent ? (
                  <>
                    <Check size={18} />
                    مستواك الحالي
                  </>
                ) : (
                  <>
                    ترقية الآن
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Comparison Section (Simplified) */}
      <div className="max-w-4xl mx-auto bg-black/40 border border-white/5 rounded-[3rem] p-12 overflow-hidden relative">
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4">
               <h4 className="text-xl font-bold text-white">لماذا الترقية؟</h4>
               <p className="text-neutral-500 text-sm max-w-md leading-loose">
                 الترقية ليست مجرد تغيير مسمى، بل هي وصول لخوارزميات تداول ذات مخاطرة مدروسة وعائد أعلى، بالإضافة إلى أولوية في عمليات السحب ودعم مباشر.
               </p>
            </div>
            <div className="flex gap-4">
                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 text-center">
                    <p className="text-xs text-neutral-500 font-bold mb-1 uppercase">متوسط الربح</p>
                    <p className="text-2xl font-black text-cyan-400">+18%</p>
                </div>
                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 text-center">
                    <p className="text-xs text-neutral-500 font-bold mb-1 uppercase">عمولات</p>
                    <p className="text-2xl font-black text-emerald-400">-40%</p>
                </div>
            </div>
         </div>
         <Star className="absolute -bottom-10 -left-10 w-48 h-48 text-cyan-500/5 rotate-12" />
      </div>
    </div>
  );
}
