import React from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  PlayCircle, 
  GraduationCap, 
  TrendingUp, 
  ShieldCheck, 
  BrainCircuit,
  ArrowRight,
  Clock,
  BarChart3,
  Video
} from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  description: string;
  category: 'ai' | 'market' | 'risk';
  type: 'article' | 'video' | 'tutorial';
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

const RESOURCES: Resource[] = [
  {
    id: '1',
    title: 'كيف يعمل التداول بالذكاء الاصطناعي؟',
    description: 'دليل شامل يشرح كيفية قيام خوارزمياتنا بتحليل آلاف نقاط البيانات لاتخاذ قرارات التداول.',
    category: 'ai',
    type: 'article',
    duration: '10 دقائق',
    difficulty: 'Beginner'
  },
  {
    id: '2',
    title: 'أساسيات إدارة المخاطر في عام 2026',
    description: 'تعلم كيف تحمي رأس مالك وتستخدم أدوات وقف الخسارة الآلية بشكل فعال.',
    category: 'risk',
    type: 'video',
    duration: '15 دقيقة',
    difficulty: 'Intermediate'
  },
  {
    id: '3',
    title: 'استراتيجيات التداول عالي التردد (HFT)',
    description: 'نظرة متعمقة على استراتيجيات التنفيذ السريع وكيفية استغلال فروق الأسعار البسيطة.',
    category: 'ai',
    type: 'article',
    duration: '25 دقيقة',
    difficulty: 'Advanced'
  },
  {
    id: '4',
    title: 'تحليل الرسوم البيانية الفني vs الأساسي',
    description: 'أيهما الأفضل لاتخاذ القرار؟ وكيف يدمج الذكاء الاصطناعي بينهما.',
    category: 'market',
    type: 'tutorial',
    duration: '12 دقيقة',
    difficulty: 'Beginner'
  }
];

export default function Education() {
  return (
    <div className="space-y-10 pb-16" id="education-hub">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <GraduationCap className="text-cyan-400 w-8 h-8" />
            أكاديمية التداول الذكي
          </h2>
          <p className="text-neutral-500 text-sm mt-2 max-w-xl">
            تعلم أسرار الأسواق المالية واحترف استراتيجيات الذكاء الاصطناعي من خلال مواردنا التعليمية الحصرية.
          </p>
        </div>
        
        <div className="flex gap-3">
          <SkillBadge icon={<BrainCircuit size={14}/>} label="AI Tech" />
          <SkillBadge icon={<BarChart3 size={14}/>} label="Markets" />
          <SkillBadge icon={<ShieldCheck size={14}/>} label="Security" />
        </div>
      </div>

      {/* Featured Course Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative group overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-cyan-900/40 via-[#0d121b] to-black border border-white/10 p-1 bg-white/[0.02]"
      >
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1611974717482-58d0423488bc?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-10 group-hover:scale-105 transition-transform duration-700" />
        <div className="relative z-10 p-10 flex flex-col md:flex-row gap-10 items-center">
          <div className="flex-1 space-y-6 text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500 text-black rounded-full text-[10px] font-black uppercase tracking-widest">
              الدورة التدريبية الأساسية
            </div>
            <h3 className="text-3xl md:text-5xl font-black text-white leading-tight">احصل على شهادة مستثمر <span className="text-cyan-400">ذكي</span></h3>
            <p className="text-neutral-400 text-lg leading-relaxed">برنامج مكثف لمدة 7 أيام يغطي كل شيء من فتح أول صفقة حتى إدارة محافظ الـ Million Dollar.</p>
            <button className="flex items-center gap-3 bg-white text-black px-8 py-4 rounded-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-2xl">
              ابدأ التعلم الآن
              <PlayCircle size={20} />
            </button>
          </div>
          <div className="w-full md:w-1/3 aspect-video bg-black/50 backdrop-blur-xl border border-white/10 rounded-[2rem] flex items-center justify-center group/play cursor-pointer relative overflow-hidden">
             <div className="absolute inset-0 bg-cyan-500/10 group-hover/play:bg-cyan-500/20 transition-colors" />
             <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-2xl relative z-10 group-hover/play:scale-110 transition-transform">
                <PlayCircle className="text-black w-8 h-8 ml-1" />
             </div>
          </div>
        </div>
      </motion.div>

      {/* Grid of Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {RESOURCES.map((res, idx) => (
          <motion.div
            key={res.id}
            initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group bg-[#0d121b] border border-white/5 rounded-[2.5rem] p-8 hover:border-cyan-500/30 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl ${
                  res.type === 'video' ? 'bg-purple-500/10 text-purple-400' : 
                  res.type === 'tutorial' ? 'bg-amber-500/10 text-amber-400' : 'bg-cyan-500/10 text-cyan-400'
                }`}>
                  {res.type === 'video' ? <Video size={20} /> : <BookOpen size={20} />}
                </div>
                <div className="flex flex-col items-end gap-1">
                   <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{res.difficulty}</span>
                   <div className="flex gap-0.5">
                     {[1,2,3].map(s => (
                       <div key={s} className={`w-1 h-3 rounded-full ${s === 1 ? 'bg-cyan-500' : s === 2 && res.difficulty !== 'Beginner' ? 'bg-cyan-500' : s === 3 && res.difficulty === 'Advanced' ? 'bg-cyan-500' : 'bg-white/5'}`} />
                     ))}
                   </div>
                </div>
              </div>

              <h4 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{res.title}</h4>
              <p className="text-neutral-500 text-sm leading-relaxed mb-6">{res.description}</p>
            </div>

            <div className="flex items-center justify-between border-t border-white/5 pt-6 mt-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-neutral-500">
                  <Clock size={12} />
                  <span className="text-[10px] font-bold uppercase">{res.duration}</span>
                </div>
                <div className="flex items-center gap-1.5 text-neutral-500">
                  <TrendingUp size={12} />
                  <span className="text-[10px] font-bold uppercase">{res.category}</span>
                </div>
              </div>
              <ArrowRight size={20} className="text-neutral-700 group-hover:text-white transition-colors group-hover:translate-x-[-4px]" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Core AI Strategies Section */}
      <div className="space-y-8 pt-8">
        <div className="border-r-4 border-cyan-500 pr-6">
          <h3 className="text-2xl font-bold text-white uppercase tracking-tight">خوارزميات التنبؤ الأساسية</h3>
          <p className="text-neutral-500 text-sm mt-1">كيف يرى الذكاء الاصطناعي الخاص بنا فرص الربح في السوق؟</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <StrategyCard 
            title="تتبع الاتجاه (Trend Following)"
            description="التعرف على الأنماط التصاعدية أو التنازلية القوية والدخول مع 'الزخم' لضمان أعلى احتمالية ربح."
            diagram={<TrendDiagram />}
            color="cyan"
          />
          <StrategyCard 
            title="الارتداد للمعدل (Mean Reversion)"
            description="الكشف عن الحالات التي يبتعد فيها السعر كثيراً عن متوسطه الحقيقي نتاج 'عاطفة' المتداولين وتوقع عودته."
            diagram={<ReversionDiagram />}
            color="emerald"
          />
          <StrategyCard 
            title="المراجحة الذكية (Arbitrage)"
            description="استغلال فروقات الأسعار البسيطة جداً بين منصات التداول المختلفة في أجزاء من الثانية."
            diagram={<ArbitrageDiagram />}
            color="amber"
          />
        </div>
      </div>

      {/* Recommended Strategy section */}
      <div className="bg-[#0a0d14] border border-white/5 rounded-[2.5rem] p-10 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-emerald-500/5 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center shrink-0 border border-emerald-500/20">
            <ShieldCheck className="text-emerald-400 w-10 h-10" />
          </div>
          <div className="flex-1 text-right md:text-right">
             <h3 className="text-2xl font-bold text-white mb-1">دليل الحماية من التقلبات</h3>
             <p className="text-neutral-500 text-sm">اكتشف كيف يتعامل المحترفون مع هبوط الأسواق المفاجئ وكيف تخرج دائماً رابحاً.</p>
          </div>
          <button className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-xs font-bold transition-all">
            قراءة الدليل الكامل
          </button>
        </div>
      </div>
    </div>
  );
}

function SkillBadge({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl flex items-center gap-2 hover:bg-white/10 transition-all cursor-default">
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{label}</span>
    </div>
  );
}

function StrategyCard({ title, description, diagram, color }: { title: string, description: string, diagram: React.ReactNode, color: 'cyan' | 'emerald' | 'amber' }) {
  const colorMap = {
    cyan: 'border-cyan-500/20 bg-cyan-500/5 text-cyan-400',
    emerald: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400',
    amber: 'border-amber-500/20 bg-amber-500/5 text-amber-400'
  };

  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className={`p-8 rounded-[2.5rem] border ${colorMap[color]} group transition-all h-full flex flex-col`}
    >
      <div className="mb-8 p-6 bg-black/40 rounded-3xl border border-white/5 overflow-hidden">
        {diagram}
      </div>
      <h4 className="text-lg font-bold text-white mb-3 group-hover:text-inherit transition-colors">{title}</h4>
      <p className="text-neutral-500 text-xs leading-relaxed flex-1">{description}</p>
    </motion.div>
  );
}

function TrendDiagram() {
  return (
    <div className="h-24 w-full flex items-end gap-1 relative">
      {[40, 55, 45, 65, 85, 75, 100].map((h, i) => (
        <motion.div 
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${h}%` }}
          transition={{ delay: i * 0.1, duration: 1 }}
          className="flex-1 bg-cyan-500/40 rounded-t-lg relative group-hover:bg-cyan-500/60 transition-colors"
        >
          {i === 6 && <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-cyan-400 rounded-full blur-[4px] animate-pulse" />}
        </motion.div>
      ))}
      <div className="absolute inset-0 border-b border-white/10" />
      <div className="absolute top-0 right-0 p-1">
        <TrendingUp className="text-cyan-400/30 w-12 h-12" />
      </div>
    </div>
  );
}

function ReversionDiagram() {
  return (
    <div className="h-24 w-full flex items-center relative gap-0.5">
      <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/10 z-0" />
      {[0, 30, 45, 20, -10, -40, -20, 0, 30, 10, -10].map((v, i) => (
        <motion.div 
          key={i}
          animate={{ y: [0, v, 0] }}
          transition={{ repeat: Infinity, duration: 4, delay: i * 0.2 }}
          className="flex-1 h-3 bg-emerald-500/40 rounded-full z-10"
        />
      ))}
      <div className="absolute top-1 right-2 text-[8px] text-emerald-400 font-black uppercase">MEAN LINE</div>
    </div>
  );
}

function ArbitrageDiagram() {
  return (
    <div className="h-24 w-full flex flex-col justify-center gap-4 px-2">
      <div className="h-3 flex gap-2 items-center">
         <div className="w-2 h-2 rounded-full bg-white/20" />
         <div className="flex-1 h-[2px] bg-white/10 relative">
            <motion.div 
              animate={{ left: ['0%', '100%'] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute top-1/2 -translate-y-1/2 w-4 h-1 bg-amber-500 shadow-[0_0_10px_#f59e0b]" 
            />
         </div>
         <div className="text-[10px] font-bold text-neutral-600">EXCHANGE A</div>
      </div>
      <div className="h-3 flex gap-2 items-center">
         <div className="w-2 h-2 rounded-full bg-white/20" />
         <div className="flex-1 h-[2px] bg-white/10 relative">
            <motion.div 
              animate={{ left: ['0%', '100%'] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.1 }}
              className="absolute top-1/2 -translate-y-1/2 w-4 h-1 bg-amber-500 opacity-40 shadow-[0_0_10px_#f59e0b]" 
            />
         </div>
         <div className="text-[10px] font-bold text-neutral-600">EXCHANGE B</div>
      </div>
      <div className="absolute top-0 right-0 p-1 opacity-20">
        <BrainCircuit className="text-amber-400 w-12 h-12" />
      </div>
    </div>
  );
}
