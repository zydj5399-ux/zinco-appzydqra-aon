import { motion } from 'motion/react';
import { Shield, Bell, Info, ShieldAlert, Cpu } from 'lucide-react';
import { RiskSettings } from '../types';

interface Props {
  settings: RiskSettings;
  onUpdate: (settings: Partial<RiskSettings>) => void;
}

export default function RiskManagement({ settings, onUpdate }: Props) {
  return (
    <div className="space-y-8" id="risk-management-container">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Shield className="text-cyan-400 w-7 h-7" />
            إدارة المخاطر المتقدمة
          </h2>
          <p className="text-neutral-500 text-xs mt-1">قم بتخصيص خوارزمية الحماية لضمان أمان استثماراتك</p>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${settings.stopLossEnabled ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'bg-red-500/10 text-red-500 border-red-500/30'}`}>
          {settings.stopLossEnabled ? 'الحماية مفعلة' : 'الحماية معطلة'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Stop Loss Control */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0d121b] border border-white/5 p-8 rounded-[2rem] space-y-6 relative overflow-hidden"
          id="stop-loss-settings"
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center justify-between relative z-10">
            <h3 className="text-lg font-bold text-white flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              أمر وقف الخسارة
            </h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.stopLossEnabled}
                onChange={(e) => onUpdate({ stopLossEnabled: e.target.checked })}
                className="sr-only peer" 
              />
              <div className="w-12 h-6 bg-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-black after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white/20 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500 peer-checked:after:bg-black peer-checked:after:opacity-100"></div>
            </label>
          </div>

          <p className="text-neutral-500 text-sm leading-relaxed relative z-10">
            يحدد الحد الأقصى للخسارة المقبولة لكل صفقة قبل أن يتدخل النظام لإغلاق المركز.
          </p>

          <div className="space-y-5 pt-4 relative z-10">
            <div className="flex justify-between items-end">
              <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">عتبة الخسارة القصوى:</span>
              <span className="text-2xl font-bold text-cyan-400 font-mono tracking-tight leading-none">-{settings.stopLossThreshold}%</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="50" 
              step="1"
              value={settings.stopLossThreshold}
              onChange={(e) => onUpdate({ stopLossThreshold: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-[9px] text-neutral-600 uppercase tracking-widest font-bold">
              <span>محافظ جداً (1%)</span>
              <span>مخاطرة عالية (50%)</span>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 group transition-colors hover:bg-white/[0.08] relative z-10">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="flex-1">
              <span className="text-xs font-bold text-white block mb-0.5">التعديل التلقائي بالذكاء الاصطناعي</span>
              <span className="text-[10px] text-neutral-500 block leading-tight">الذكاء الاصطناعي يحلل التقلبات ويحرك وقف الخسارة لتأمين الأرباح.</span>
            </div>
            <input 
              type="checkbox" 
              checked={settings.automaticStopLoss}
              onChange={(e) => onUpdate({ automaticStopLoss: e.target.checked })}
              className="w-5 h-5 rounded-lg border-white/10 bg-white/5 text-cyan-500 focus:ring-cyan-500 transition-all cursor-pointer"
            />
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#0d121b] border border-white/5 p-8 rounded-[2rem] space-y-6"
          id="notification-settings"
        >
          <h3 className="text-lg font-bold text-white flex items-center gap-3">
            <Bell className="w-5 h-5 text-cyan-400" />
            التنبيهات الفورية الذكية
          </h3>
          <p className="text-neutral-500 text-sm leading-relaxed">
            كيف ترغب في تلقي تحديثات النظام حول عمليات تداول الذكاء الاصطناعي؟
          </p>

          <div className="grid grid-cols-1 gap-3 pt-2">
            {(['silent', 'normal', 'urgent'] as const).map((level) => (
              <button
                key={level}
                onClick={() => onUpdate({ notificationLevel: level })}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  settings.notificationLevel === level 
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-white shadow-[0_5px_15px_rgba(6,182,212,0.1)]' 
                    : 'bg-white/5 border-white/5 text-neutral-500 hover:border-white/10 hover:text-neutral-300'
                }`}
              >
                <div className="flex items-center gap-3">
                   <div className={`w-2 h-2 rounded-full ${settings.notificationLevel === level ? 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'bg-neutral-800'}`} />
                   <span className="text-sm font-medium">
                    {level === 'silent' && 'صامت (سجل العمليات فقط)'}
                    {level === 'normal' && 'عادي (إشعارات الهاتف)'}
                    {level === 'urgent' && 'عاجل (تنبيهات فورية ومكالمات)'}
                  </span>
                </div>
                {settings.notificationLevel === level && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
              </button>
            ))}
          </div>

          <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
             <p className="text-[10px] text-amber-500 leading-relaxed font-medium">
                * ملاحظة: الإشعارات العاجلة قد تتطلب صلاحيات وصول إضافية لنظام التشغيل لضمان استجابتك السريعة.
             </p>
          </div>
        </motion.div>
      </div>

      {/* Strategy Explanation */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-l from-cyan-900/10 to-transparent border border-white/5 p-8 rounded-[2rem] relative overflow-hidden group"
        id="strategy-explanation"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <Info size={180} />
        </div>
        <div className="relative z-10 space-y-6">
          <h3 className="text-cyan-400 text-lg font-bold flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-400/10 flex items-center justify-center">
               <Info className="w-5 h-5 text-cyan-400" />
            </div>
            فلسفة الحماية والربح المضاعف
          </h3>
          <div className="text-neutral-400 text-sm leading-relaxed space-y-6 max-w-4xl">
            <p>
              نظام "ZincoTrade AI" لا يكتفي بالتداول، بل يهدف لتحقيق معادلة (100 دولار ← 200 دولار) من خلال تقليل الخسائر الفادحة. إدارة المخاطر هي العمود الفقري لهذا النجاح.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 bg-[#0a0d14] rounded-2xl border border-white/5 transition-transform hover:-translate-y-1">
                <span className="text-cyan-400 font-bold block mb-2 text-sm">وقف الخسارة المحكم (1-5%):</span>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  مثالي للمتداولين الحذرين. يحمي رأس مالك بقوة، لكنه قد يغلق صفقات رابحة بسبب "الضجيج" السعري البسيط. يركز على الاستقرار الطويل الأمد.
                </p>
              </div>
              <div className="p-5 bg-[#0a0d14] rounded-2xl border border-white/5 transition-transform hover:-translate-y-1">
                <span className="text-amber-400 font-bold block mb-2 text-sm">وقف الخسارة الجريء (10-20%):</span>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  يمنح الخوارزمية مساحة للتعامل مع "التصحيحات" السعرية قبل الصعود. هذا يرفع من احتمال تحقيق أرباح ضخمة، ولكنه يعني أن رصيدك قد يتراجع بنسبة أكبر في حال الفشل.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/5">
               <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
               <p className="text-[11px] text-neutral-500 italic">
                تذكر: الذكاء الاصطناعي لدينا يفضل دائماً وقف الخسارة المتحرك (Trailing Stop) لتأمين الأرباح بمجرد بدء السعر في الصعود.
               </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
