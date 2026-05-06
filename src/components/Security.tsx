import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  Smartphone, 
  ShieldAlert, 
  CheckCircle2,
  AlertTriangle,
  Fingerprint
} from 'lucide-react';
import { UserStats } from '../types';

interface Props {
  stats: UserStats;
  onUpdateSecurity: (enabled: boolean) => Promise<void>;
}

export default function Security({ stats, onUpdateSecurity }: Props) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  const handleToggle2FA = async () => {
    setIsUpdating(true);
    try {
      await onUpdateSecurity(!stats.twoFactorEnabled);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <ShieldCheck className="text-cyan-400 w-7 h-7" />
          مركز الأمان والخصوصية
        </h2>
        <p className="text-neutral-500 text-xs mt-1">قم بتأمين حسابك وحماية استثماراتك باستخدام أحدث تقنيات الأمان</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <motion.div 
            className={`bg-[#0a0d14] border rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden transition-colors ${stats.twoFactorEnabled ? 'border-emerald-500/20' : 'border-white/5'}`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl" />
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-8">
                <div className={`p-4 rounded-2xl ${stats.twoFactorEnabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-neutral-500'}`}>
                  <Smartphone size={32} />
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${stats.twoFactorEnabled ? 'bg-emerald-500 text-black' : 'bg-white/10 text-neutral-500'}`}>
                  {stats.twoFactorEnabled ? 'فعال' : 'غير مفعل'}
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">التحقق بخطوتين (2FA)</h3>
              <p className="text-neutral-400 text-xs mb-8 leading-relaxed italic">
                إضافة طبقة أمان إضافية لحماية عمليات السحب والدخول. عند التفعيل، سيطلب منك النظام إدخال رمز أمان يتم إنشاؤه عبر هاتفك.
              </p>

              <button 
                onClick={handleToggle2FA}
                disabled={isUpdating}
                className={`w-full py-4 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                  stats.twoFactorEnabled 
                    ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20' 
                    : 'bg-cyan-500 text-black hover:scale-[1.02] shadow-lg shadow-cyan-500/20'
                }`}
              >
                {isUpdating ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {stats.twoFactorEnabled ? <Lock size={16} /> : <ShieldCheck size={16} />}
                    {stats.twoFactorEnabled ? 'إيقاف التحقق بخطوتين' : 'تفعيل الحماية المتقدمة'}
                  </>
                )}
              </button>
            </div>
          </motion.div>

          <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 space-y-4">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                   <ShieldAlert size={20} />
                </div>
                <div>
                   <h4 className="text-sm font-bold text-white">تأمين عمليات السحب</h4>
                   <p className="text-[10px] text-neutral-500">سيتم طلب التحقق الإضافي عند سحب أي رصيد من المحفظة.</p>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                   <LogOut size={20} />
                </div>
                <div>
                   <h4 className="text-sm font-bold text-white">إدارة الجلسات النشطة</h4>
                   <p className="text-[10px] text-neutral-500">يتم تشفير كافة الجلسات باستخدام بروتوكول AES-256 المتطور.</p>
                </div>
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#0a0d14] border border-white/5 rounded-[2.5rem] p-8">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Key className="text-cyan-400" size={20} />
              كلمة مرور النظام
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest pr-2">كلمة المرور الحالية</label>
                <div className="relative">
                  <input 
                    type="password" 
                    value="********" 
                    readOnly
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-mono text-sm focus:outline-none"
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={16} />
                </div>
              </div>
              
              <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-xs font-bold hover:bg-white/10 transition-all">
                تحديث كلمة المرور
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-600/10 to-transparent border border-cyan-500/10 rounded-[2.5rem] p-8">
             <div className="flex items-center gap-3 mb-4">
                <Fingerprint className="text-cyan-400" size={24} />
                <h3 className="text-lg font-bold text-white">البصمة الرقمية والـ FaceID</h3>
             </div>
             <p className="text-[11px] text-neutral-400 leading-relaxed mb-6">
                يمكنك استخدام تقنيات التحقق البيومترية المتاحة في جهازك لتسجيل الدخول السريع والآمن.
             </p>
             <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
                <span className="text-xs text-neutral-300 font-bold">تفعيل الدخول البيومتري</span>
                <div className="w-12 h-6 bg-cyan-500 rounded-full relative cursor-pointer opacity-50">
                   <div className="absolute left-1 top-1 w-4 h-4 bg-black rounded-full" />
                </div>
             </div>
          </div>
        </div>
      </div>
      
      {/* Security Logs */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-bold text-white">سجل النشاطات الأمنية</h3>
          <div className="h-[1px] flex-1 bg-white/5" />
        </div>
        <div className="bg-[#0a0d14] border border-white/5 rounded-[2.5rem] overflow-hidden divide-y divide-white/5">
            <SecurityLogItem 
              icon={<CheckCircle2 className="text-emerald-400" />}
              title="دخول ناجح للحساب"
              desc="تم تسجيل الدخول من متصفح Chrome - بغداد، العراق"
              time="اليوم، 10:45 ص"
            />
            <SecurityLogItem 
              icon={<ShieldCheck className="text-cyan-400" />}
              title="تفعيل الحماية المتقدمة"
              desc="تم تمكين خدمة مراقبة الأداء التلقائي"
              time="أمس، 02:15 م"
            />
            <SecurityLogItem 
              icon={<AlertTriangle className="text-amber-400" />}
              title="محاولة سحب"
              desc="تم طلب سحب أرباح بقيمة $120.50"
              time="2 مايو، 09:30 م"
            />
        </div>
      </div>
    </div>
  );
}

function SecurityLogItem({ icon, title, desc, time }: { icon: React.ReactNode, title: string, desc: string, time: string }) {
  return (
    <div className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
      <div className="flex items-center gap-5">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div>
          <span className="text-sm font-bold text-white block">{title}</span>
          <span className="text-[10px] text-neutral-500 font-mono italic">{desc}</span>
        </div>
      </div>
      <div className="text-right">
        <span className="text-[10px] text-neutral-600 font-bold uppercase">{time}</span>
      </div>
    </div>
  );
}

function LogOut({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
