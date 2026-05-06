import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HelpCircle, 
  MessageSquare, 
  FileText, 
  Search, 
  ChevronDown, 
  ExternalLink,
  ShieldCheck,
  Zap,
  Clock,
  ArrowRight
} from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

const FAQS: FAQ[] = [
  {
    category: 'الحساب والأمان',
    question: 'كيف يمكنني تفعيل ميزة التحقق بخطوتين (2FA)؟',
    answer: 'يمكنك تفعيل التحقق بخطوتين من خلال قسم الإعدادات الأمنية في حسابك. سيطلب منك النظام إدخال رمز إضافي عند إجراء أي عملية سحب لضمان حماية أموالك.'
  },
  {
    category: 'الإيداع والسحب',
    question: 'كم يستغرق معالجة طلب سحب الأرباح؟',
    answer: 'تتم معالجة معظم طلبات السحب خلال 15-60 دقيقة في أوقات العمل الرسمية. قد تستغرق العمليات البنكية وقتاً أطول حسب البنك المستخدم.'
  },
  {
    category: 'الإيداع والسحب',
    question: 'ما هو الحد الأدنى للإيداع في المنصة؟',
    answer: 'الحد الأدنى للإيداع للبدء في الاستثمار هو 100 دولار عبر وسائل الدفع المتاحة لضمان فتح أول باقة استثمارية ذكية.'
  },
  {
    category: 'التداول والذكاء الاصطناعي',
    question: 'كيف يعمل نظام التداول الآلي؟',
    answer: 'يعتمد نظامنا على خوارزميات الذكاء الاصطناعي لتحليل الأسواق العالمية وفتح صفقات بناءً على مؤشرات تقنية دقيقة لتقليل المخاطر وتحقيق عوائد مستقرة.'
  },
  {
    category: 'التداول والذكاء الاصطناعي',
    question: 'هل يمكنني تغيير مستوى المخاطرة؟',
    answer: 'نعم، يمكنك التحكم بالكامل في إعدادات إدارة المخاطر من خلال قسم "إدارة المخاطر" في لوحة التحكم الخاصة بك.'
  }
];

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('الكل');

  const categories = ['الكل', ...Array.from(new Set(FAQS.map(f => f.category)))];

  const filteredFaqs = FAQS.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'الكل' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 pb-20">
      <div className="relative overflow-hidden bg-gradient-to-br from-cyan-600/10 to-blue-600/10 border border-white/5 rounded-[2.5rem] p-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
            <HelpCircle className="text-cyan-400 w-8 h-8" />
            مركز المساعدة والدعم
          </h2>
          <p className="text-neutral-400 text-sm mb-8">
            نحن هنا لمساعدتك في كل خطوة من رحلتك الاستثمارية. ابحث عن الإجابات أو تواصل مع فريق الدعم الفني.
          </p>

          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 w-5 h-5" />
            <input 
              type="text"
              placeholder="ابحث عن سؤالك هنا..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pr-12 pl-4 text-white placeholder:text-neutral-600 focus:outline-none focus:border-cyan-500/50 transition-all text-sm"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeCategory === cat 
                    ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' 
                    : 'bg-white/5 text-neutral-500 hover:text-white border border-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredFaqs.map((faq, idx) => (
              <motion.div 
                key={idx}
                layout
                className="bg-[#0a0d14] border border-white/5 rounded-2xl overflow-hidden"
              >
                <button 
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full p-5 flex items-center justify-between text-right hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                      <FileText size={16} />
                    </div>
                    <span className="text-sm font-bold text-white">{faq.question}</span>
                  </div>
                  <ChevronDown 
                    className={`text-neutral-500 transition-transform duration-300 ${openFaqIndex === idx ? 'rotate-180' : ''}`} 
                    size={20} 
                  />
                </button>
                <AnimatePresence>
                  {openFaqIndex === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="p-5 pt-0 text-xs text-neutral-400 leading-relaxed italic border-t border-white/5">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 pr-2">
            <MessageSquare size={18} className="text-cyan-400" />
            تواصل مباشر
          </h3>
          
          <div className="space-y-4">
            <ContactCard 
              icon={<ShieldCheck className="text-emerald-400" />}
              title="الدعم الفني المباشر"
              desc="متاح 24/7 عبر الوتساب والتليجرام"
              action="تحدث الآن"
              color="emerald"
            />
            <ContactCard 
              icon={<Zap className="text-amber-400" />}
              title="شكاوى واقتراحات"
              desc="نصل إليك خلال ساعة واحدة كحد أقصى"
              action="إرسال تذكرة"
              color="amber"
            />
            <ContactCard 
              icon={<Clock className="text-cyan-400" />}
              title="دليل المستخدم"
              desc="شروحات فيديو لكافة ميزات المنصة"
              action="عرض الشروحات"
              color="cyan"
            />
          </div>

          <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/5 rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-full bg-cyan-500/0 group-hover:bg-cyan-500/[0.02] transition-colors" />
            <h4 className="text-sm font-black text-white mb-2 relative z-10">انضم لمجتمع المستثمرين</h4>
            <p className="text-[10px] text-neutral-500 mb-4 leading-relaxed relative z-10">تابع التوصيات والتحليلات اليومية عبر قنواتنا الرسمية.</p>
            <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 relative z-10">
              قناة التليجرام <ExternalLink size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactCard({ icon, title, desc, action, color }: { icon: React.ReactNode, title: string, desc: string, action: string, color: string }) {
  return (
    <div className="bg-[#0a0d14] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.03] transition-all group cursor-pointer">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="text-[13px] font-bold text-white mb-1">{title}</h4>
          <p className="text-[10px] text-neutral-500 mb-3">{desc}</p>
          <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider group-hover:gap-2 transition-all">
            <span className={`text-${color}-400`}>{action}</span>
            <ArrowRight size={12} className={`text-${color}-400`} />
          </div>
        </div>
      </div>
    </div>
  );
}
